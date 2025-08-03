import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BookingDetails {
  tutorId: string;
  tutorName: string;
  tutorVenmoHandle: string;
  className: string;
  time: string;
  location: string;
  cost: number;
  duration: number;
}

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: BookingDetails;
  onSuccess: () => void;
}

const BookingConfirmationModal = ({
  isOpen,
  onClose,
  bookingDetails,
  onSuccess
}: BookingConfirmationModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleVenmoPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create session record in database
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Create a fake subject_id for now (in real app, you'd get this from booking details)
      const { data: subjects } = await supabase.from('subjects').select('id').limit(1);
      const subjectId = subjects?.[0]?.id || 'temp-subject-id';

      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          tutor_id: bookingDetails.tutorId,
          student_id: user.user.id,
          subject_id: subjectId,
          scheduled_at: new Date(bookingDetails.time).toISOString(),
          duration_minutes: bookingDetails.duration,
          total_amount: bookingDetails.cost,
          location: bookingDetails.location,
          payment_method: 'venmo',
          payment_status: 'pending',
          status: 'pending_payment'
        });

      if (sessionError) throw sessionError;

      // Generate contextual Venmo note based on class
      const venmoNote = getVenmoNote(bookingDetails.className);
      
      // Create Venmo deep link
      const venmoUrl = `https://venmo.com/${bookingDetails.tutorVenmoHandle}?txn=pay&amount=${bookingDetails.cost}&note=${encodeURIComponent(venmoNote)}`;
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      
      // Open Venmo app
      window.open(venmoUrl, '_blank');
      
      // Show success after a short delay (simulating payment flow)
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const getVenmoNote = (className: string): string => {
    const notes: { [key: string]: string } = {
      'CALC': 'Thanks for the help with Calc! 🙏',
      'MATH': 'Math tutoring sesh. You rock! 📐',
      'CHEM': 'Chemistry help - you saved my GPA! 🧪',
      'PHYS': 'Physics tutoring. Mind = blown! ⚡',
      'CS': 'Coding help. You\'re a legend! 💻',
      'ECON': 'Econ tutoring session. Thanks! 📈',
      'BIO': 'Bio help - future doctor here! 🔬',
      'HIST': 'History tutoring sesh. Thanks! 🏛️',
      'ENG': 'English tutoring. Word wizard! 📚'
    };
    
    // Find matching note based on class prefix
    const matchingKey = Object.keys(notes).find(key => 
      className.toUpperCase().includes(key)
    );
    
    return matchingKey ? notes[matchingKey] : 'Tutoring session. You rock! 🙏';
  };

  const tutorFirstName = bookingDetails.tutorName.split(' ')[0];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in">
      <div className="glass-card rounded-3xl shadow-2xl w-full max-w-md text-foreground flex flex-col gap-6 p-6 animate-bounce-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Book a sesh with {tutorFirstName}! 📚</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="btn-smooth"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">When</p>
              <p className="text-sm text-muted-foreground">{bookingDetails.time}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Where</p>
              <p className="text-sm text-muted-foreground">{bookingDetails.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
            <DollarSign className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium">Cost</p>
              <p className="text-sm text-muted-foreground">{bookingDetails.duration} minutes</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center my-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-success mb-2">
              ${bookingDetails.cost}.00
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {bookingDetails.className}
            </Badge>
          </div>
        </div>

        <Button
          onClick={handleVenmoPayment}
          disabled={isProcessing}
          className="w-full p-4 rounded-xl text-white font-bold bg-[#3D95CE] hover:bg-[#2E7AB8] btn-haptic transition-all duration-200"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Opening Venmo...
            </div>
          ) : (
            <>💳 Venmo {tutorFirstName}</>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          This will open Venmo with payment details pre-filled. Complete the payment in the Venmo app.
        </p>

        <Button
          variant="ghost"
          onClick={onClose}
          className="text-muted-foreground mt-2"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;