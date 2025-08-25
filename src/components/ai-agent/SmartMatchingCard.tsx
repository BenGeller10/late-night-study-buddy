import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageCircle, Calendar, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatDialog from "@/components/chat/ChatDialog";

interface MatchedTutor {
  id: string;
  name: string;
  profilePicture: string;
  major: string;
  rating: number;
  hourlyRate: number;
  matchReason: string;
  subjects: string[];
  availability: string;
}

interface SmartMatchingCardProps {
  tutor: MatchedTutor;
  onChat: (tutorId: string) => void;
  onBook: (tutorId: string) => void;
}

const SmartMatchingCard = ({ tutor, onChat, onBook }: SmartMatchingCardProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  if (!isVisible) return null;

  const handleViewProfile = () => {
    navigate(`/tutor-profile/${tutor.id}`);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Perfect Match Found!</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            ×
          </Button>
        </div>

        <div className="flex gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={tutor.profilePicture} alt={tutor.name} />
            <AvatarFallback>{tutor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{tutor.name}</h3>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground">{tutor.rating}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-2">{tutor.major}</p>
            
            <p className="text-xs font-medium text-primary mb-2">{tutor.matchReason}</p>

            <div className="flex flex-wrap gap-1 mb-3">
              {tutor.subjects.slice(0, 2).map((subject, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                  {subject}
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <ChatDialog
                tutor={{
                  id: tutor.id,
                  name: tutor.name,
                  profilePicture: tutor.profilePicture,
                  classes: tutor.subjects,
                  subjects: tutor.subjects.map((subject, index) => ({
                    id: `subject-${index}`,
                    name: subject,
                    code: subject.toUpperCase().replace(/\s+/g, ''),
                    hourly_rate: tutor.hourlyRate
                  }))
                }}
                triggerButton={
                  <Button 
                    size="sm" 
                    className="flex-1 h-8 text-xs"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Message
                  </Button>
                }
              />
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onBook(tutor.id)}
                className="flex-1 h-8 text-xs"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Book
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleViewProfile}
                className="h-8 text-xs px-2"
              >
                View
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartMatchingCard;