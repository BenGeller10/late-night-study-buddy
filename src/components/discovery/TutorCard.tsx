import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Star, Loader2 } from "lucide-react";
import { useCalendly } from "@/hooks/useCalendly";
import { addSession } from "@/data/sessions";
import { useToast } from "@/hooks/use-toast";

interface TutorCardProps {
  tutor: {
    id: string;
    name: string;
    profilePicture: string;
    classes: string[];
    tutorStyle: string;
    hourlyRate: number;
    isFree: boolean;
    rating: number;
    totalSessions: number;
  };
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onChat: () => void;
  onBook: () => void;
  onViewProfile: () => void;
  className?: string;
}

const TutorCard = ({ tutor, onSwipeRight, onSwipeLeft, onChat, onBook, onViewProfile, className }: TutorCardProps) => {
  const [isAnimating, setIsAnimating] = useState<'left' | 'right' | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const { toast } = useToast();

  const { openCalendly, isReady: isCalendlyReady, isLoading: isCalendlyLoading } = useCalendly((event) => {
    // Handle successful booking
    const newSession = {
      id: `session_${Date.now()}`,
      tutorId: tutor.id,
      tutorName: tutor.name,
      tutorAvatar: tutor.profilePicture,
      subject: tutor.classes[0] || "General Tutoring",
      start: event.payload?.event_start_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      durationMins: 30,
      location: "Zoom" as const,
      price: tutor.hourlyRate,
      status: "upcoming" as const,
      zoomLink: "https://zoom.us/j/meeting-room",
      notes: "Scheduled via Calendly"
    };
    
    addSession(newSession);
    
    toast({
      title: "Session booked! 🎉",
      description: `Your session with ${tutor.name} has been scheduled successfully.`,
    });
  });

  const handleBooking = () => {
    if (!isCalendlyReady) {
      toast({
        title: "Calendly is loading...",
        description: "Please wait a moment and try again.",
      });
      return;
    }

    // Open Calendly with tutoring session URL
    openCalendly({
      url: `https://calendly.com/campus-connect-demo/tutoring-session?hide_gdpr_banner=1&background_color=0F1115&text_color=FFFFFF&primary_color=6C5CE7&prefill_name=${encodeURIComponent(tutor.name)}`
    });
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    setIsAnimating(direction);
    // Haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Immediately call the swipe handler for instant response
    setTimeout(() => {
      if (direction === 'right') {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
      setIsAnimating(null);
    }, 300);
  };

  return (
    <div className={`relative w-full max-w-sm mx-auto transition-all duration-300 ${
      isAnimating === 'right' ? 'animate-swipe-right' : 
      isAnimating === 'left' ? 'animate-swipe-left' : 'animate-fade-in-up'
    } ${className || ''}`}>
      <div className="glass-card rounded-3xl overflow-hidden shadow-card hover:shadow-glow transition-all duration-300">
        {/* Profile Image */}
        <div className="relative aspect-[4/3] bg-gradient-card overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton" />
          )}
          <img
            src={tutor.profilePicture}
            alt={tutor.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="btn-smooth text-xs bg-background/80 backdrop-blur-sm"
              onClick={onViewProfile}
            >
              <Eye className="w-3 h-3 mr-1" />
              Profile
            </Button>
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
              <DialogTrigger asChild>
                <Badge 
                  variant="secondary" 
                  className="bg-background/80 backdrop-blur-sm animate-fade-in-up cursor-pointer hover:bg-background/90 transition-colors"
                >
                  ⭐ {tutor.rating} ({tutor.totalSessions})
                </Badge>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Leave a Review for {tutor.name}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Star Rating */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-8 h-8 cursor-pointer transition-colors ${
                            star <= (hoverRating || reviewRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground hover:text-yellow-400'
                          }`}
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Review Text */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Review</label>
                    <Textarea
                      placeholder="Share your experience with this tutor..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="min-h-24"
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setReviewDialogOpen(false);
                        setReviewRating(0);
                        setReviewText("");
                        setHoverRating(0);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="campus"
                      onClick={() => {
                        // Handle review submission here
                        console.log('Review submitted:', { rating: reviewRating, text: reviewText });
                        setReviewDialogOpen(false);
                        setReviewRating(0);
                        setReviewText("");
                        setHoverRating(0);
                      }}
                      disabled={reviewRating === 0}
                      className="flex-1"
                    >
                      Submit Review
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {tutor.isFree && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-success text-success-foreground">
                Free Help! 🆓
              </Badge>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">{tutor.name}</h3>
            <div className="text-right">
              {tutor.isFree ? (
                <div className="text-success font-semibold">Free</div>
              ) : (
                <div className="text-primary font-semibold">${tutor.hourlyRate}/hr</div>
              )}
            </div>
          </div>

          {/* Classes */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {tutor.classes.slice(0, 3).map((className, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs"
                >
                  {className}
                </Badge>
              ))}
              {tutor.classes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tutor.classes.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Tutor Style */}
          <p className="text-muted-foreground text-sm leading-relaxed">
            {tutor.tutorStyle}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              size="lg"
              className="flex-1 btn-smooth"
              onClick={onChat}
            >
              💬 Chat
            </Button>
            <Button
              onClick={handleBooking}
              disabled={!isCalendlyReady || isCalendlyLoading}
              variant="campus"
              size="lg"
              className="flex-1 btn-smooth"
            >
              {isCalendlyLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                "📅 "
              )}
              Book • ${tutor.hourlyRate}/hr
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TutorCard;