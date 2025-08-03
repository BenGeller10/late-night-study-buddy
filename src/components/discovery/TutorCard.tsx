import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

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
  onBook: (tutor: any) => void;
  onViewProfile: () => void;
}

const TutorCard = ({ tutor, onSwipeRight, onSwipeLeft, onChat, onBook, onViewProfile }: TutorCardProps) => {
  const [isAnimating, setIsAnimating] = useState<'left' | 'right' | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

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
    }`}>
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
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm animate-fade-in-up">
              ⭐ {tutor.rating} ({tutor.totalSessions})
            </Badge>
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

          {/* View Profile Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="btn-smooth text-xs"
              onClick={onViewProfile}
            >
              <Eye className="w-3 h-3 mr-1" />
              View Full Profile
            </Button>
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
              variant="secondary"
              size="lg"
              className="flex-1 btn-haptic font-medium bg-gradient-accent text-accent-foreground hover:shadow-glow"
              onClick={onChat}
            >
              💬 Let's Chat!
            </Button>
            <Button
              variant="campus"
              size="lg"
              className="flex-1 btn-haptic font-medium"
              onClick={() => onBook(tutor)}
            >
              📅 Book Sesh
            </Button>
          </div>
        </div>

      </div>

      {/* Swipe Controls */}
      <div className="flex justify-center gap-8 mt-8">
        <Button
          variant="outline"
          size="icon"
          className="w-16 h-16 rounded-full border-2 btn-haptic hover:border-destructive hover:text-destructive hover:shadow-lg"
          onClick={() => handleSwipe('left')}
          disabled={isAnimating !== null}
          aria-label="Nah, keep looking"
        >
          <span className="text-2xl">👎</span>
        </Button>
        
        <Button
          variant="campus"
          size="icon"
          className="w-16 h-16 rounded-full btn-haptic hover:scale-110 shadow-glow"
          onClick={() => handleSwipe('right')}
          disabled={isAnimating !== null}
          aria-label="I'm interested!"
        >
          <span className="text-2xl">💖</span>
        </Button>
      </div>
    </div>
  );
};

export default TutorCard;