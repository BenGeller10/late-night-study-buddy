import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TutorListItemProps {
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
  onChat: () => void;
  onBook: () => void;
  className?: string;
}

const TutorListItem = ({ tutor, onChat, onBook, className }: TutorListItemProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className={`glass-card rounded-2xl overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 ${className}`}>
      <div className="flex gap-4 p-4">
        {/* Profile Image */}
        <div className="relative w-20 h-20 bg-gradient-card rounded-xl overflow-hidden flex-shrink-0">
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
        </div>

        {/* Profile Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold">{tutor.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  ⭐ {tutor.rating} ({tutor.totalSessions})
                </Badge>
                {tutor.isFree && (
                  <Badge className="bg-success text-success-foreground text-xs">
                    Free! 🆓
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              {tutor.isFree ? (
                <div className="text-success font-semibold text-sm">Free</div>
              ) : (
                <div className="text-primary font-semibold text-sm">${tutor.hourlyRate}/hr</div>
              )}
            </div>
          </div>

          {/* Classes */}
          <div className="flex flex-wrap gap-1">
            {tutor.classes.slice(0, 3).map((className, index) => (
              <Badge key={index} variant="outline" className="text-xs h-6 px-2">
                {className}
              </Badge>
            ))}
            {tutor.classes.length > 3 && (
              <Badge variant="outline" className="text-xs h-6 px-2">
                +{tutor.classes.length - 3}
              </Badge>
            )}
          </div>

          {/* Tutor Style */}
          <p className="text-muted-foreground text-sm line-clamp-2">
            {tutor.tutorStyle}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 btn-smooth"
              onClick={onChat}
            >
              💬 Chat
            </Button>
            <Button
              variant="campus"
              size="sm"
              className="flex-1 btn-smooth"
              onClick={onBook}
            >
              📅 Book
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorListItem;