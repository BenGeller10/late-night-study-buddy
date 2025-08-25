
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, ExternalLink, CreditCard, Clock, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InlineWidget } from "react-calendly";
import { supabase } from "@/integrations/supabase/client";
import { createGoogleCalendarUrl, createOutlookCalendarUrl, downloadCalendarEvent, CalendarEvent } from "@/lib/calendar-utils";

interface BookingDialogProps {
  tutor: {
    id: string;
    name: string;
    profilePicture: string;
    hourlyRate?: number;
    isFree?: boolean;
    subjects?: Array<{
      id: string;
      name: string;
      code: string;
      hourly_rate: number;
    }>;
  };
  triggerButton: React.ReactNode;
  onBookingSuccess?: (sessionId: string) => void;
}

const BookingDialog = ({ tutor, triggerButton, onBookingSuccess }: BookingDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<string>('60');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const { toast } = useToast();
  
  // This is a placeholder URL - in production, you'd have each tutor's individual Calendly URL
  const calendlyUrl = `https://calendly.com/campus-connect-tutor-${tutor.id}`;
  
  // For demo purposes, we'll use a working demo Calendly URL
  const demoCalendlyUrl = "https://calendly.com/acmeinc/30min";

  // Generate time slots for the next 7 days
  const getAvailableSlots = () => {
    const slots = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends for demo
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate hourly slots from 9 AM to 5 PM
      for (let hour = 9; hour <= 17; hour++) {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        slots.push({
          date: dateStr,
          time: timeStr,
          datetime: new Date(`${dateStr}T${timeStr}:00`),
          label: `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
        });
      }
    }
    
    return slots;
  };

  const availableSlots = getAvailableSlots();

const handleCalendlyClick = () => {
    setShowCalendly(true);
  };

  const handleDirectBooking = () => {
    setShowBookingForm(true);
  };

  const [availableSubjects, setAvailableSubjects] = useState<Array<{
    id: string;
    name: string;
    code: string;
  }>>([]);

  // Load subjects from database
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const { data: subjects, error } = await supabase
          .from('subjects')
          .select('id, name, code')
          .order('name');
        
        if (error) throw error;
        setAvailableSubjects(subjects || []);
      } catch (error) {
        console.error('Error loading subjects:', error);
      }
    };

    loadSubjects();
  }, []);

  const createSession = async () => {
    if (!selectedDate || !selectedTime || !selectedSubject) {
      toast({
        title: "Missing Information",
        description: "Please select a subject, date, and time.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingSession(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in to book a session");

      const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`);
      const selectedSubjectData = availableSubjects.find(s => s.id === selectedSubject);
      const hourlyRate = tutor.subjects?.find(s => s.id === selectedSubject)?.hourly_rate || tutor.hourlyRate || 25;
      const durationMinutes = parseInt(duration);
      const totalAmount = (hourlyRate * durationMinutes) / 60;

      // Create session in database
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          student_id: user.id,
          tutor_id: tutor.id,
          subject_id: selectedSubject,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: durationMinutes,
          total_amount: totalAmount,
          status: 'pending_payment',
          location: 'Online'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create payment session
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment-session', {
        body: {
          session_id: sessionData.id,
          tutor_id: tutor.id,
          amount: totalAmount,
          subject: selectedSubjectData?.name || 'General Tutoring',
          duration_minutes: durationMinutes,
          scheduled_at: scheduledAt.toISOString()
        }
      });

      if (paymentError) throw paymentError;

      // Create calendar event for adding to personal calendar
      const calendarEvent: CalendarEvent = {
        title: `Tutoring Session - ${selectedSubjectData?.name || 'General'}`,
        description: `Tutoring session with ${tutor.name}\nSubject: ${selectedSubjectData?.name || 'General Tutoring'}\nDuration: ${durationMinutes} minutes\n\nJoin link will be provided via email.`,
        start: scheduledAt,
        end: new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000),
        location: 'Online (Zoom link will be provided)'
      };

      toast({
        title: "Session Created! 📅",
        description: "Redirecting to payment. After payment, you can add this to your calendar!",
      });

      // Redirect to Stripe checkout
      window.open(paymentData.checkout_url, '_blank');
      
      // Store calendar event in localStorage for post-payment calendar addition
      localStorage.setItem('pendingCalendarEvent', JSON.stringify(calendarEvent));
      
      setIsOpen(false);
      onBookingSuccess?.(sessionData.id);

    } catch (error: any) {
      console.error('Error creating session:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  useEffect(() => {
    const handleCalendlyMessage = (e: MessageEvent) => {
      if (e.data.event && e.data.event.indexOf('calendly') === 0) {
        if (e.data.event === 'calendly.event_scheduled') {
          toast({
            title: "Session Scheduled! 🎉",
            description: `Your session with ${tutor.name} has been scheduled successfully.`,
          });
          setIsOpen(false);
          setShowCalendly(false);
          onBookingSuccess?.('calendly-booking');
        }
      }
    };

    window.addEventListener('message', handleCalendlyMessage);
    return () => window.removeEventListener('message', handleCalendlyMessage);
  }, [tutor.name, toast, onBookingSuccess]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img
              src={tutor.profilePicture}
              alt={tutor.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div>📅 Book a Session</div>
              <div className="text-sm font-normal text-muted-foreground">with {tutor.name} • Google Calendar Ready</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!showCalendly && !showBookingForm ? (
            <>
              {/* Tutor Info */}
              <div className="text-center space-y-3">
                <p className="text-muted-foreground">
                  Schedule your session with {tutor.name}
                </p>
                {tutor.hourlyRate && !tutor.isFree && (
                  <div className="text-lg font-semibold text-primary">
                    ${tutor.hourlyRate}/hour
                  </div>
                )}
                {tutor.isFree && (
                  <Badge className="bg-success text-success-foreground">
                    Free Session! 🎉
                  </Badge>
                )}
                {tutor.subjects && tutor.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {tutor.subjects.slice(0, 3).map((subject) => (
                      <Badge key={subject.id} variant="secondary" className="text-xs">
                        {subject.name} - ${subject.hourly_rate}/hr
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleDirectBooking}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Book & Pay Now
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleCalendlyClick}
                  className="w-full"
                  size="lg"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Use Calendar Widget
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => window.open(demoCalendlyUrl, '_blank')}
                  className="w-full"
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>

              {/* Info */}
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-center">
                <p className="text-muted-foreground">
                  📅 <strong>Google Calendar Integration:</strong> After booking and payment, you'll receive calendar invites and can easily add this session to Google Calendar, Outlook, or Apple Calendar.
                </p>
                <p className="text-muted-foreground mt-2">
                  🔒 <strong>Secure Payment:</strong> All payments are processed securely through Stripe.
                </p>
              </div>
            </>
          ) : showBookingForm ? (
            <>
              {/* Direct Booking Form */}
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="font-semibold">Book Your Session</h3>
                  <p className="text-sm text-muted-foreground">Select your preferences and pay securely</p>
                </div>

                {/* Subject Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{subject.code} - {subject.name}</span>
                            <span className="text-muted-foreground ml-2">${tutor.hourlyRate || 25}/hr</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date and Time Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration</label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time Slot</label>
                    <Select value={`${selectedDate}_${selectedTime}`} onValueChange={(value) => {
                      const [date, time] = value.split('_');
                      setSelectedDate(date);
                      setSelectedTime(time);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSlots.slice(0, 15).map((slot) => (
                          <SelectItem key={`${slot.date}_${slot.time}`} value={`${slot.date}_${slot.time}`}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Price Summary */}
                {selectedSubject && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Total Cost</span>
                      </div>
                      <div className="text-right">
                        {(() => {
                          const subject = tutor.subjects?.find(s => s.id === selectedSubject);
                          const hourlyRate = subject?.hourly_rate || tutor.hourlyRate || 25;
                          const durationMinutes = parseInt(duration);
                          const totalAmount = (hourlyRate * durationMinutes) / 60;
                          return (
                            <div>
                              <div className="font-semibold text-primary">${totalAmount.toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground">
                                ${hourlyRate}/hr × {durationMinutes}min
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={createSession}
                    disabled={!selectedSubject || !selectedDate || !selectedTime || isCreatingSession}
                    className="flex-1"
                  >
                    {isCreatingSession ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Book & Pay
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-[600px]">
              <InlineWidget
                url={demoCalendlyUrl}
                styles={{
                  height: '100%',
                  width: '100%',
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
