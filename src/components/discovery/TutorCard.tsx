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
}

const TutorCard = ({ tutor, onSwipeRight, onSwipeLeft, onChat, onBook }: TutorCardProps) => {
  const [isAnimating, setIsAnimating] = useState<'left' | 'right' | null>(null);

  const handleSwipe = (direction: 'left' | 'right') => {
    setIsAnimating(direction);
    setTimeout(() => {
      if (direction === 'right') {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    }, 300);
  };

  return (
    <div className={`relative w-full max-w-sm mx-auto ${
      isAnimating === 'right' ? 'animate-swipe-right' : 
      isAnimating === 'left' ? 'animate-swipe-left' : ''
    }`}>
      <div className="glass-card rounded-3xl overflow-hidden shadow-card">
        {/* Profile Image */}
        <div className="relative aspect-[4/3] bg-gradient-card">
          <img
            src={tutor.profilePicture}
            alt={tutor.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
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
          <div className="flex flex-wrap gap-2">
            {tutor.classes.slice(0, 3).map((className, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {className}
              </Badge>
            ))}
            {tutor.classes.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tutor.classes.length - 3} more
              </Badge>
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
              className="flex-1"
              onClick={onChat}
            >
              💬 Chat
            </Button>
            <Button
              variant="campus"
              size="lg"
              className="flex-1"
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
          className="w-14 h-14 rounded-full border-2"
          onClick={() => handleSwipe('left')}
        >
          <span className="text-xl">👎</span>
        </Button>
        <Button
          variant="campus"
          size="icon"
          className="w-14 h-14 rounded-full"
          onClick={() => handleSwipe('right')}
        >
          <span className="text-xl">👍</span>
        </Button>
      </div>
    </div>
  );
};

export default TutorCard;