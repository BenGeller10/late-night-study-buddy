import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Star, CreditCard, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BookingDialog from "@/components/booking/BookingDialog";
import ChatDialog from "@/components/chat/ChatDialog";

interface TutorCardProps {
  tutor: {
    id: string;
    user_id?: string;
    name: string;
    profilePicture: string;
    classes: string[];
    tutorStyle: string;
    hourlyRate: number;
    isFree: boolean;
    rating: number;
    totalSessions: number;
    subjects?: Array<{
      id: string;
      name: string;
      code: string;
      hourly_rate: number;
    }>;
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

  const handleBookingSuccess = (sessionId: string) => {
      toast({
        title: "You're booked for today at 3:00 PM! 🎉",
        description: "Session confirmed with Sarah Chen. Check your email for the Zoom link!",
      });
    onBook(); // Call the original onBook callback
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
      <div className="card-elevated card-interactive hover:shadow-glow transition-all duration-200 rounded-2xl overflow-hidden">
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
          
          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-background/90 backdrop-blur-md border-border-light hover:bg-background transition-all duration-200"
              onClick={onViewProfile}
            >
              <Eye className="w-3 h-3 mr-1" />
              Profile
            </Button>
          </div>
          
          {/* Rating badge - better positioning */}
          <div className="absolute top-3 left-3">
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
              <DialogTrigger asChild>
                <Badge 
                  variant="secondary" 
                  className="bg-background/90 backdrop-blur-md border-border-light cursor-pointer hover:bg-background/95 transition-all duration-200 shadow-sm"
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
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-success/90 text-success-foreground backdrop-blur-md shadow-sm">
                Free Help! 🆓
              </Badge>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold leading-tight">{tutor.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span>Next Available</span>
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  Today 2PM
                </Badge>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              {tutor.isFree ? (
                <div className="text-success font-bold text-lg">Free</div>
              ) : (
                <div className="text-primary font-bold text-lg">${tutor.hourlyRate}/hr</div>
              )}
            </div>
          </div>

          {/* Subjects as clean chips */}
          <div className="flex flex-wrap gap-1.5">
            {tutor.classes.slice(0, 3).map((className, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-2.5 py-1 rounded-full border-border-light hover:border-primary/50 transition-colors"
              >
                {className}
              </Badge>
            ))}
            {tutor.classes.length > 3 && (
              <Badge variant="outline" className="text-xs px-2.5 py-1 rounded-full border-border-light">
                +{tutor.classes.length - 3}
              </Badge>
            )}
          </div>

          {/* Tutor Style */}
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
            {tutor.tutorStyle}
          </p>

          {/* Action Buttons with better hierarchy */}
          <div className="flex gap-2.5 pt-2">
            <ChatDialog
              tutor={{
                id: tutor.id,
                name: tutor.name,
                profilePicture: tutor.profilePicture,
                classes: tutor.classes,
                subjects: tutor.subjects
              }}
              triggerButton={
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 rounded-xl border-border-light hover:border-primary/50"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              }
            />
            <BookingDialog
              tutor={{
                id: tutor.id,
                name: tutor.name,
                profilePicture: tutor.profilePicture,
                hourlyRate: tutor.hourlyRate,
                isFree: tutor.isFree,
                subjects: tutor.subjects
              }}
              triggerButton={
                <Button
                  variant="default"
                  size="lg"
                  className="flex-[2] rounded-xl"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {tutor.isFree ? 'Book Free' : `Book • $${tutor.hourlyRate}`}
                </Button>
              }
              onBookingSuccess={handleBookingSuccess}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default TutorCard;