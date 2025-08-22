import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Star, Loader2, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  const handleBooking = async () => {
    setIsBooking(true);
    
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session?.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to book a session.",
          variant: "destructive"
        });
        return;
      }

      // Create a session record first
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      const subject = tutor.subjects?.[0] || { id: 'general', name: 'General Tutoring', code: 'GEN' };
      
      const { data: newSession, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          student_id: session.user.id,
          tutor_id: tutor.user_id || tutor.id,
          subject_id: subject.id,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: 60,
          total_amount: tutor.hourlyRate,
          status: 'pending_payment',
          location: 'Online (Zoom)',
          notes: `Session for ${subject.name}`,
          payment_method: 'stripe',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        throw new Error('Failed to create session');
      }

      // Create Stripe payment session
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment-session', {
        body: {
          session_id: newSession.id,
          tutor_id: tutor.user_id || tutor.id,
          amount: tutor.hourlyRate,
          subject: subject.name,
          duration_minutes: 60,
          scheduled_at: scheduledAt.toISOString()
        }
      });

      if (paymentError) {
        console.error('Payment creation error:', paymentError);
        throw new Error('Failed to create payment session');
      }

      toast({
        title: "Redirecting to payment...",
        description: "You'll be redirected to complete your booking payment.",
      });

      // Redirect to Stripe Checkout
      if (paymentData.checkout_url) {
        window.open(paymentData.checkout_url, '_blank');
      } else {
        throw new Error('No payment URL received');
      }

    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking failed",
        description: error.message || "There was an error booking your session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
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
              disabled={isBooking}
              variant="campus"
              size="lg"
              className="flex-1 btn-smooth"
            >
              {isBooking ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              {isBooking ? 'Processing...' : `Book • $${tutor.hourlyRate}/hr`}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TutorCard;