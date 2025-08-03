import { Button } from "@/components/ui/button";
import { CheckCircle, MessageCircle } from "lucide-react";

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorName: string;
  onStartChat: () => void;
}

const BookingSuccessModal = ({
  isOpen,
  onClose,
  tutorName,
  onStartChat
}: BookingSuccessModalProps) => {
  if (!isOpen) return null;

  const tutorFirstName = tutorName.split(' ')[0];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in">
      <div className="glass-card rounded-3xl shadow-2xl w-full max-w-md text-foreground flex flex-col items-center text-center p-6 animate-bounce-in">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-success mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl font-bold mb-2">Session booked! 🎉</h2>
          <p className="text-muted-foreground">
            Your tutor {tutorFirstName} is ready to help you crush it. You got this! ✨
          </p>
        </div>

        <div className="space-y-3 w-full">
          <Button
            onClick={onStartChat}
            className="w-full btn-haptic font-bold"
            size="lg"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Start chatting with {tutorFirstName}
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full btn-smooth"
            size="lg"
          >
            Sweet, I'm ready!
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          🔔 You'll get a reminder before your session starts
        </p>
      </div>
    </div>
  );
};

export default BookingSuccessModal;