import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import EnhancedSwipeView from "@/components/discovery/EnhancedSwipeView";
import PageTransition from "@/components/layout/PageTransition";
import { soundEffects } from "@/lib/sounds";

const Discover = () => {
  const navigate = useNavigate();

  const handleTutorMatch = (tutorId: string) => {
    console.log('Matched with tutor:', tutorId);
    // Handle tutor match logic - could navigate to chat or show success animation
  };

  const handleChat = (tutorId: string) => {
    console.log('Starting chat with tutor:', tutorId);
    // Navigate to chat with specific tutor
    navigate(`/chat/${tutorId}`);
  };

  const handleBook = (tutorId: string) => {
    console.log('Booking session with tutor:', tutorId);
    // Handle booking logic - could open booking modal or navigate to booking page
  };

  const handleViewProfile = (tutorId: string) => {
    navigate(`/tutor/${tutorId}`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20"> {/* Added bottom padding for navigation */}
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
          <div className="text-center">
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Find Your Study Buddy ✨
            </h1>
            <p className="text-sm text-muted-foreground">
              Swipe to discover amazing tutors
            </p>
          </div>
      </div>

      {/* Main Swipe Interface */}
      <div className="p-4">
        <EnhancedSwipeView
          onTutorMatch={handleTutorMatch}
          onChat={handleChat}
          onBook={handleBook}
          onViewProfile={handleViewProfile}
        />
      </div>

      {/* Floating Support Button */}
      <Button
        onClick={() => {
          soundEffects.playMessage();
          navigate('/support');
        }}
        className="fixed bottom-24 left-4 z-50 h-14 w-14 rounded-full shadow-lg bg-gradient-primary hover:bg-gradient-primary/90 text-white transition-all hover:scale-110 active:scale-95"
        size="icon"
        aria-label="Get Support"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
      </div>
    </PageTransition>
  );
};

export default Discover;