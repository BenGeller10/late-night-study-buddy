import SwipeView from "@/components/discovery/SwipeView";

const Discover = () => {
  const handleTutorMatch = (tutorId: string) => {
    console.log('Matched with tutor:', tutorId);
    // Handle tutor match logic - could navigate to chat or show success animation
  };

  const handleChat = (tutorId: string) => {
    console.log('Starting chat with tutor:', tutorId);
    // Navigate to chat with specific tutor
  };

  const handleBook = (tutorId: string) => {
    console.log('Booking session with tutor:', tutorId);
    // Handle booking logic - could open booking modal or navigate to booking page
  };

  return (
    <div className="min-h-screen bg-background pb-20"> {/* Added bottom padding for navigation */}
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
        <div className="p-4">
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Discover Tutors ✨
          </h1>
          <p className="text-sm text-muted-foreground">
            Swipe to find your perfect study buddy
          </p>
        </div>
      </div>

      {/* Main Swipe Interface */}
      <div className="p-4">
        <SwipeView
          onTutorMatch={handleTutorMatch}
          onChat={handleChat}
          onBook={handleBook}
        />
      </div>
    </div>
  );
};

export default Discover;