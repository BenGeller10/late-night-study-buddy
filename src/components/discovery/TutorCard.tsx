import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  onSeeMoreForClass?: (className: string) => void;
  moreTutorsAvailable?: number;
}

const TutorCard = ({ tutor, onSwipeRight, onSwipeLeft, onChat, onBook, onSeeMoreForClass, moreTutorsAvailable = 0 }: TutorCardProps) => {
  const [isAnimating, setIsAnimating] = useState<'left' | 'right' | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleSwipe = (direction: 'left' | 'right') => {
    setIsAnimating(direction);
    // Haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    setTimeout(() => {
      if (direction === 'right') {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
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

          {/* Classes */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {tutor.classes.slice(0, 3).map((className, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => onSeeMoreForClass?.(className)}
                >
                  {className}
                  {moreTutorsAvailable > 0 && (
                    <span className="ml-1 text-primary">+</span>
                  )}
                </Button>
              ))}
              {tutor.classes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tutor.classes.length - 3} more
                </Badge>
              )}
            </div>
            
            {moreTutorsAvailable > 0 && onSeeMoreForClass && (
              <p className="text-xs text-muted-foreground">
                💡 Tap a class to see {moreTutorsAvailable} more tutor{moreTutorsAvailable > 1 ? 's' : ''}
              </p>
            )}
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
              variant="campus"
              size="lg"
              className="flex-1 btn-smooth animate-pulse-glow"
              onClick={onBook}
            >
              📅 Book
            </Button>
          </div>
        </div>

        {/* Swipe Indicators */}
        <div className="absolute inset-x-4 bottom-20 flex justify-between pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
            <span className="text-2xl">👎</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
            <span className="text-2xl">👍</span>
          </div>
        </div>
      </div>

      {/* Swipe Controls */}
      <div className="flex justify-center gap-6 mt-6">
        <Button
          variant="outline"
          size="icon"
          className="w-14 h-14 rounded-full border-2 btn-smooth hover:border-destructive hover:text-destructive"
          onClick={() => handleSwipe('left')}
          disabled={isAnimating !== null}
        >
          <span className="text-xl">👎</span>
        </Button>
        
        {/* See More Button (when not interested) */}
        {moreTutorsAvailable > 0 && onSeeMoreForClass && (
          <Button
            variant="secondary"
            className="px-6 h-14 rounded-full text-sm btn-smooth"
            onClick={() => onSeeMoreForClass(tutor.classes[0])}
            disabled={isAnimating !== null}
          >
            See More for<br />{tutor.classes[0]}
          </Button>
        )}
        
        <Button
          variant="campus"
          size="icon"
          className="w-14 h-14 rounded-full btn-smooth hover:scale-110"
          onClick={() => handleSwipe('right')}
          disabled={isAnimating !== null}
        >
          <span className="text-xl">👍</span>
        </Button>
      </div>
    </div>
  );
};

export default TutorCard;