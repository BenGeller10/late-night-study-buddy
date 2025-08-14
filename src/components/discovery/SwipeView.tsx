
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, RotateCcw, Users } from "lucide-react";
import TutorCard from "./TutorCard";
import { useTutors, type Tutor } from "@/hooks/useTutors";

interface SwipeViewProps {
  onTutorMatch: (tutorId: string) => void;
  onChat: (tutorId: string) => void;
  onBook: (tutorId: string) => void;
  onViewProfile: (tutorId: string) => void;
  onViewLikedTutors: (likedTutorIds: string[]) => void;
  searchQuery?: string;
}

const SwipeView = ({ 
  onTutorMatch, 
  onChat, 
  onBook, 
  onViewProfile, 
  onViewLikedTutors,
  searchQuery 
}: SwipeViewProps) => {
  const { tutors, loading, error } = useTutors(searchQuery);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedTutors, setLikedTutors] = useState<string[]>([]);

  const currentTutor = tutors[currentIndex];

  const handleLike = () => {
    if (currentTutor) {
      setLikedTutors(prev => [...prev, currentTutor.id]);
      onTutorMatch(currentTutor.id);
      nextTutor();
    }
  };

  const handlePass = () => {
    nextTutor();
  };

  const nextTutor = () => {
    if (currentIndex < tutors.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reset to beginning or handle end of tutors
      setCurrentIndex(0);
    }
  };

  const resetStack = () => {
    setCurrentIndex(0);
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Finding amazing tutors for you...</p>
        <p className="text-xs text-muted-foreground mt-2">This may take a moment ✨</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">Error loading tutors: {error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (tutors.length === 0) {
    return (
      <div className="text-center p-8 space-y-4">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold">No tutors found</h3>
        <p className="text-muted-foreground">
          {searchQuery 
            ? `No tutors found for "${searchQuery}". Try a different search term.`
            : "No tutors are available right now. Check back later!"
          }
        </p>
        {searchQuery && (
          <Button onClick={() => window.location.reload()} variant="outline">
            Clear Search
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Swipe Card */}
      <div className="relative h-[500px] mx-auto max-w-sm">
        {currentTutor ? (
          <TutorCard
            key={currentTutor.id}
            tutor={currentTutor}
            onSwipeRight={handleLike}
            onSwipeLeft={handlePass}
            onChat={() => onChat(currentTutor.id)}
            onBook={() => onBook(currentTutor.id)}
            onViewProfile={() => onViewProfile(currentTutor.id)}
            className="absolute inset-0"
          />
        ) : (
          <div className="absolute inset-0 glass-card rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold mb-2">You've seen all tutors!</h3>
              <p className="text-muted-foreground mb-4">
                Great job exploring! Reset to see them again.
              </p>
              <Button onClick={resetStack} variant="campus">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Stack
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          className="h-14 w-14 rounded-full btn-smooth"
          onClick={handlePass}
          disabled={!currentTutor}
        >
          ❌
        </Button>
        <Button
          variant="campus"
          size="lg"
          className="h-14 w-14 rounded-full btn-smooth"
          onClick={handleLike}
          disabled={!currentTutor}
        >
          ❤️
        </Button>
      </div>

      {/* Stats */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} of {tutors.length} tutors
          {searchQuery && ` for "${searchQuery}"`}
        </p>
        
        {likedTutors.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewLikedTutors(likedTutors)}
            className="text-primary"
          >
            <Heart className="w-4 h-4 mr-1 fill-current" />
            View {likedTutors.length} liked tutor{likedTutors.length !== 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetStack}
          className="btn-smooth"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewLikedTutors(likedTutors)}
          className="btn-smooth"
          disabled={likedTutors.length === 0}
        >
          <Users className="w-4 h-4 mr-1" />
          Liked ({likedTutors.length})
        </Button>
      </div>
    </div>
  );
};

export default SwipeView;
