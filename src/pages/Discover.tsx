import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpCircle, Search, X, User } from "lucide-react";
import SwipeView from "@/components/discovery/SwipeView";
import AIMatchmaking from "@/components/discovery/AIMatchmaking";
import SmartMatchingCard from "@/components/ai-agent/SmartMatchingCard";
import PageTransition from "@/components/layout/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSmartMatching } from "@/hooks/useSmartMatching";

const Discover = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const { matchedTutors, showRecommendation } = useSmartMatching(user?.id);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

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
    const calendlyUrl = `https://calendly.com/campus-connect-tutor/${tutorId}`;
    window.open(calendlyUrl, '_blank');
    toast({
      title: "Opening calendar...",
      description: "Book a session with your selected tutor",
    });
  };

  const handleViewProfile = (tutorId: string) => {
    navigate(`/tutor/${tutorId}`);
  };

  const handleViewLikedTutors = (likedTutorIds: string[]) => {
    navigate('/liked-tutors', { state: { likedTutorIds } });
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20"> {/* Added bottom padding for navigation */}
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
        <div className="p-4 space-y-4">
          {/* Top bar with title and profile */}
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Discover Tutors ✨
              </h1>
              <p className="text-sm text-muted-foreground">
                Swipe to find your perfect study buddy
              </p>
            </div>
            
            {/* Profile Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="btn-smooth hover:bg-muted/50"
            >
              <User className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by course (e.g., ECON 203, CS 101)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 glass-card border-border/20"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Smart Recommendations - show if user completed onboarding */}
        {user && !searchQuery && showRecommendation && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3">🎯 Recommended for You</h3>
            <div className="space-y-2">
              {matchedTutors.map(tutor => (
                <SmartMatchingCard
                  key={tutor.id}
                  tutor={tutor}
                  onChat={handleChat}
                  onBook={handleBook}
                />
              ))}
            </div>
          </div>
        )}

        {/* AI Matchmaking - Only show if user is authenticated and no search query */}
        {user && !searchQuery && (
          <AIMatchmaking
            studentId={user.id}
            className={searchQuery || "Organic Chemistry"}
            onChat={handleChat}
            onBook={handleBook}
          />
        )}

        {/* Swipe Interface */}
        <SwipeView
          onTutorMatch={handleTutorMatch}
          onChat={handleChat}
          onBook={handleBook}
          onViewProfile={handleViewProfile}
          onViewLikedTutors={handleViewLikedTutors}
          searchQuery={searchQuery}
        />
      </div>

      {/* Floating Support Button */}
      <Button
        onClick={() => navigate('/support')}
        className="fixed bottom-24 left-4 z-50 h-14 w-14 rounded-full shadow-lg bg-gradient-primary hover:bg-gradient-primary/90 text-white"
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