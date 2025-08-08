
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, DollarSign, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [tutorSubjects, setTutorSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
  ];

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
      fetchTutorSubjects();
    }
  }, [isOpen, tutor.id]);

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setSubjects(data);
    }
  };

  const fetchTutorSubjects = async () => {
    const { data, error } = await supabase
      .from('tutor_subjects')
      .select(`
        *,
        subject:subjects(*)
      `)
      .eq('tutor_id', tutor.id);
    
    if (!error && data) {
      setTutorSubjects(data);
    }
  };

  const calculateTotalAmount = () => {
    if (tutor.isFree) return 0;
    
    const selectedTutorSubject = tutorSubjects.find(ts => ts.subject_id === subject);
    const rate = selectedTutorSubject?.hourly_rate || tutor.hourlyRate || 25;
    return (rate * duration) / 60;
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !subject) {
      toast({
        title: "Missing Information",
        description: "Please select a date, time, and subject for your session.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to book a session.",
          variant: "destructive",
        });
        return;
      }

      // Create scheduled datetime
      const [hours, minutes] = selectedTime.split(':');
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const sessionData = {
        student_id: user.id,
        tutor_id: tutor.id,
        subject_id: subject,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: duration,
        total_amount: calculateTotalAmount(),
        location: location.trim() || 'Online',
        notes: notes.trim() || null,
        status: 'pending_payment',
        payment_status: 'pending'
      };

      const { data, error } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('Booking error:', error);
        toast({
          title: "Booking Failed",
          description: "There was an error booking your session. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Session Booked!",
        description: `Your session with ${tutor.name} has been booked for ${format(scheduledAt, 'MMM dd, yyyy at h:mm a')}.`,
      });

      setIsOpen(false);
      onBookingSuccess?.(data.id);
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedTime("");
      setSubject("");
      setLocation("");
      setNotes("");
      setDuration(60);

    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "There was an unexpected error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = calculateTotalAmount();

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
              <div>Book a Session</div>
              <div className="text-sm font-normal text-muted-foreground">with {tutor.name}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Select Date</Label>
            <div className="border rounded-lg p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                className="w-full"
              />
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Select Time</Label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                  className="text-sm"
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          {/* Subject Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a subject" />
              </SelectTrigger>
              <SelectContent>
                {tutorSubjects.map((ts) => (
                  <SelectItem key={ts.id} value={ts.subject_id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{ts.subject.code} - {ts.subject.name}</span>
                      {!tutor.isFree && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          ${ts.hourly_rate}/hr
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Duration</Label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 60, 90, 120].map((minutes) => (
                <Button
                  key={minutes}
                  variant={duration === minutes ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDuration(minutes)}
                >
                  {minutes} min
                </Button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label htmlFor="location" className="text-base font-medium">Location</Label>
            <Input
              id="location"
              placeholder="Library, Online, Coffee shop, etc."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-base font-medium">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any specific topics you'd like to cover or questions you have..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Pricing Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Duration:</span>
              <span>{duration} minutes</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Rate:</span>
              <span>
                {tutor.isFree ? (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                    Free
                  </Badge>
                ) : (
                  `$${tutorSubjects.find(ts => ts.subject_id === subject)?.hourly_rate || tutor.hourlyRate || 25}/hr`
                )}
              </span>
            </div>
            <div className="flex items-center justify-between font-medium text-base border-t pt-2">
              <span>Total:</span>
              <span>
                {tutor.isFree ? (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                    Free!
                  </Badge>
                ) : (
                  `$${totalAmount.toFixed(2)}`
                )}
              </span>
            </div>
          </div>

          {/* Book Button */}
          <Button
            onClick={handleBooking}
            disabled={!selectedDate || !selectedTime || !subject || isLoading}
            className="w-full"
            size="lg"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            {isLoading ? "Booking..." : `Book Session${!tutor.isFree ? ` for $${totalAmount.toFixed(2)}` : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
