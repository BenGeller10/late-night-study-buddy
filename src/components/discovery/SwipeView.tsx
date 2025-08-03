import { useState } from "react";
import TutorCard from "./TutorCard";

// Mock data for demo
const mockTutors = [
  {
    id: "1",
    name: "Sarah Chen",
    profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    classes: ["ECON 203", "ECON 101", "MATH 115"],
    tutorStyle: "I'll draw everything on a virtual whiteboard so it makes sense. I got you. 📝✨",
    hourlyRate: 25,
    isFree: false,
    rating: 4.9,
    totalSessions: 47
  },
  {
    id: "2", 
    name: "Marcus Williams",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    classes: ["CS 101", "CS 150", "MATH 120"],
    tutorStyle: "Think of me as a study buddy who already took the class. No pressure. 🤝",
    hourlyRate: 0,
    isFree: true,
    rating: 4.7,
    totalSessions: 23
  },
  {
    id: "3",
    name: "Emma Rodriguez", 
    profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    classes: ["CHEM 201", "CHEM 101", "BIO 150"],
    tutorStyle: "Lab work can be confusing but I break it down step by step. We'll ace this together! 🧪💪",
    hourlyRate: 30,
    isFree: false,
    rating: 5.0,
    totalSessions: 31
  }
];

interface SwipeViewProps {
  onTutorMatch: (tutorId: string) => void;
  onChat: (tutorId: string) => void;
  onBook: (tutorId: string) => void;
}

const SwipeView = ({ onTutorMatch, onChat, onBook }: SwipeViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedTutors, setSavedTutors] = useState<string[]>([]);

  const currentTutor = mockTutors[currentIndex];

  const handleSwipeRight = () => {
    if (currentTutor) {
      setSavedTutors(prev => [...prev, currentTutor.id]);
      onTutorMatch(currentTutor.id);
    }
    nextTutor();
  };

  const handleSwipeLeft = () => {
    nextTutor();
  };

  const nextTutor = () => {
    if (currentIndex < mockTutors.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Reset to beginning or show "no more tutors" message
      setCurrentIndex(0);
    }
  };

  if (!currentTutor) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-6">
        <div className="space-y-4">
          <span className="text-6xl">🎉</span>
          <h3 className="text-xl font-semibold">You've seen all available tutors!</h3>
          <p className="text-muted-foreground">Check back later for new tutors or try searching for specific classes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <TutorCard
          tutor={currentTutor}
          onSwipeRight={handleSwipeRight}
          onSwipeLeft={handleSwipeLeft}
          onChat={() => onChat(currentTutor.id)}
          onBook={() => onBook(currentTutor.id)}
        />
      </div>
      
      {/* Progress Indicator */}
      <div className="flex gap-2 mt-6">
        {mockTutors.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index <= currentIndex ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Saved Count */}
      {savedTutors.length > 0 && (
        <div className="mt-4 text-center">
          <div className="text-sm text-muted-foreground">
            💾 Saved {savedTutors.length} tutor{savedTutors.length > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeView;