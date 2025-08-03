import { useState, useEffect } from "react";
import TutorCard from "./TutorCard";
import { TutorCardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Mock data for demo - expanded with more tutors for same classes
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
  },
  // Additional tutors for same classes
  {
    id: "4",
    name: "Alex Kim",
    profilePicture: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=400&fit=crop&crop=face",
    classes: ["ECON 203", "ECON 101", "STAT 200"],
    tutorStyle: "Economics doesn't have to be boring! I use real-world examples to make it click. 📊🌍",
    hourlyRate: 20,
    isFree: false,
    rating: 4.8,
    totalSessions: 35
  },
  {
    id: "5",
    name: "Jordan Parker",
    profilePicture: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=400&fit=crop&crop=face",
    classes: ["CS 101", "CS 150", "CS 200"],
    tutorStyle: "Coding is like solving puzzles. I'll help you see the patterns and logic. 🧩💻",
    hourlyRate: 0,
    isFree: true,
    rating: 4.6,
    totalSessions: 18
  },
  {
    id: "6",
    name: "Maya Patel",
    profilePicture: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face",
    classes: ["CHEM 201", "CHEM 101", "CHEM 301"],
    tutorStyle: "Chemistry is everywhere! I make it relatable with everyday examples. ⚗️✨",
    hourlyRate: 28,
    isFree: false,
    rating: 4.9,
    totalSessions: 42
  },
  {
    id: "7",
    name: "David Chen",
    profilePicture: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop&crop=face",
    classes: ["ECON 203", "ECON 301", "MATH 115"],
    tutorStyle: "Got an econ final coming up? I've helped 20+ students ace theirs. Let's do this! 🎯📈",
    hourlyRate: 35,
    isFree: false,
    rating: 5.0,
    totalSessions: 56
  }
];

interface SwipeViewProps {
  onTutorMatch: (tutorId: string) => void;
  onChat: (tutorId: string) => void;
  onBook: (tutorId: string) => void;
  onViewProfile: (tutorId: string) => void;
  onViewLikedTutors: (likedTutorIds: string[]) => void;
  searchQuery?: string;
}

const SwipeView = ({ onTutorMatch, onChat, onBook, onViewProfile, onViewLikedTutors, searchQuery = "" }: SwipeViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedTutors, setSavedTutors] = useState<string[]>([]);
  const [skippedTutors, setSkippedTutors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Simulate loading initial data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter tutors based on search query
  const filteredTutors = searchQuery 
    ? mockTutors.filter(tutor => 
        tutor.classes.some(className => 
          className.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : mockTutors;

  const currentTutor = filteredTutors[currentIndex];

  // Get other tutors for the same classes as current tutor
  const getMoreTutorsForClasses = (classes: string[]) => {
    return filteredTutors.filter(tutor => 
      tutor.id !== currentTutor?.id && 
      tutor.classes.some(tutorClass => classes.includes(tutorClass))
    );
  };

  // Reset to beginning when search query changes
  useEffect(() => {
    setCurrentIndex(0);
    setSavedTutors([]);
    setSkippedTutors([]);
  }, [searchQuery]);

  const handleSwipeRight = () => {
    if (currentTutor && !isTransitioning) {
      setIsTransitioning(true);
      setSavedTutors(prev => [...prev, currentTutor.id]);
      onTutorMatch(currentTutor.id);
      
      // Instant transition to next tutor like dating apps
      setTimeout(() => {
        nextTutor();
        setIsTransitioning(false);
      }, 250);
    }
  };

  const handleSwipeLeft = () => {
    if (currentTutor && !isTransitioning) {
      setIsTransitioning(true);
      setSkippedTutors(prev => [...prev, currentTutor.id]);
      
      // Instant transition to next tutor like dating apps
      setTimeout(() => {
        nextTutor();
        setIsTransitioning(false);
      }, 250);
    }
  };


  const nextTutor = () => {
    if (currentIndex < filteredTutors.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // End of tutors - show completion message
      setCurrentIndex(-1); // Use -1 to indicate end state
    }
  };

  // Show loading skeleton initially
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <TutorCardSkeleton />
        </div>
        <div className="flex gap-2 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Show completion screen when all tutors are viewed
  if (currentIndex === -1) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-6">
        <div className="space-y-6">
          <span className="text-6xl">🎉</span>
          <h3 className="text-xl font-semibold">
            {searchQuery 
              ? `You've seen all tutors for "${searchQuery}"!` 
              : "You've seen all available tutors!"
            }
          </h3>
          <p className="text-muted-foreground">
            {savedTutors.length > 0 
              ? `You liked ${savedTutors.length} tutor${savedTutors.length > 1 ? 's' : ''}. Ready to view their full profiles?`
              : searchQuery 
                ? "No tutors caught your eye? Try a different search or clear the search to see all tutors."
                : "No tutors caught your eye? Try again later or search for specific classes."
            }
          </p>
          {savedTutors.length > 0 && (
            <Button
              onClick={() => onViewLikedTutors(savedTutors)}
              className="btn-smooth"
              size="lg"
            >
              View Liked Tutors ({savedTutors.length})
            </Button>
          )}
          <Button
            onClick={() => {
              setCurrentIndex(0);
              setSavedTutors([]);
              setSkippedTutors([]);
            }}
            variant="outline"
            className="btn-smooth"
          >
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  if (!currentTutor) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-6">
        <div className="space-y-4">
          <span className="text-6xl">🔍</span>
          <h3 className="text-xl font-semibold">
            {searchQuery ? `No tutors found for "${searchQuery}"` : "No tutors available"}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery 
              ? "Try searching for a different course or clear the search to see all tutors."
              : "Check back later for new tutors or try searching for specific classes."
            }
          </p>
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
          onViewProfile={() => onViewProfile(currentTutor.id)}
        />
      </div>
      
      {/* Progress Indicator */}
      <div className="flex gap-2 mt-6">
        {filteredTutors.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index <= currentIndex ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="mt-4 text-center space-y-1">
        {searchQuery && (
          <div className="text-xs text-muted-foreground">
            📚 {filteredTutors.length} tutor{filteredTutors.length !== 1 ? 's' : ''} found for "{searchQuery}"
          </div>
        )}
        {savedTutors.length > 0 && (
          <div className="text-sm text-muted-foreground">
            💾 Saved {savedTutors.length} tutor{savedTutors.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwipeView;