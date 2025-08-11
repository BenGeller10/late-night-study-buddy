
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InlineWidget } from "react-calendly";

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
  const { toast } = useToast();
  
  // This is a placeholder URL - in production, you'd have each tutor's individual Calendly URL
  const calendlyUrl = `https://calendly.com/campus-connect-tutor-${tutor.id}`;
  
  // For demo purposes, we'll use a generic Calendly URL
  const demoCalendlyUrl = "https://calendly.com/your-tutor-name/tutoring-session";

  const handleCalendlyClick = () => {
    setShowCalendly(true);
  };

  useEffect(() => {
    const handleCalendlyMessage = (e: MessageEvent) => {
      if (e.data.event && e.data.event.indexOf('calendly') === 0) {
        if (e.data.event === 'calendly.event_scheduled') {
          toast({
            title: "Session Scheduled!",
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
              <div>Book a Session</div>
              <div className="text-sm font-normal text-muted-foreground">with {tutor.name}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!showCalendly ? (
            <>
              {/* Tutor Info */}
              <div className="text-center space-y-3">
                <p className="text-muted-foreground">
                  Schedule your session with {tutor.name} using their personal calendar
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
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleCalendlyClick}
                  className="w-full"
                  size="lg"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Open Scheduling Calendar
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.open(demoCalendlyUrl, '_blank')}
                  className="w-full"
                  size="lg"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>

              {/* Info */}
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-center">
                <p className="text-muted-foreground">
                  You'll be able to select your preferred time slot and add session details directly in the calendar.
                </p>
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
