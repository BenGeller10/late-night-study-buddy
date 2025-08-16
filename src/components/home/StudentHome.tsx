
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, User as UserIcon } from "lucide-react";
import SwipeView from "@/components/discovery/SwipeView";
import { motion } from "framer-motion";
import { mockSessions } from "@/data/mockSessions";
import { mockConversations } from "@/data/mockConversations";

interface StudentHomeProps {
  user: User;
  onRoleSwitch: (isTutor: boolean) => void;
}

const StudentHome = ({ user, onRoleSwitch }: StudentHomeProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleTutorMatch = (tutorId: string) => {
    console.log('Matched with tutor:', tutorId);
  };

  const handleChat = (tutorId: string) => {
    navigate(`/chat/${tutorId}`);
  };

  const handleBook = (tutorId: string) => {
    console.log('Booking session with tutor:', tutorId);
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-sm">
        <div className="p-4 space-y-4">
          {/* Top bar with title and profile */}
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-blue-600">
                Campus Connect ✨
              </h1>
              <p className="text-sm text-muted-foreground">
                Find your perfect study partner
              </p>
            </div>
            
            {/* Profile Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="btn-smooth hover:bg-muted/50"
            >
              <UserIcon className="h-6 w-6" />
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

      {/* Main Swipe Interface */}
      <div className="p-4">

        {/* Main Swipe Interface */}
        <SwipeView
          onTutorMatch={handleTutorMatch}
          onChat={handleChat}
          onBook={handleBook}
          onViewProfile={handleViewProfile}
          onViewLikedTutors={handleViewLikedTutors}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};

export default StudentHome;
