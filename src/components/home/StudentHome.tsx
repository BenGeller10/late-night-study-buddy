import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, User as UserIcon, MessageCircle, BookOpen, TrendingUp, Heart, Clock, Zap } from "lucide-react";
import SwipeView from "@/components/discovery/SwipeView";

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

  const quickActions = [
    {
      icon: Search,
      label: "Find Tutors",
      action: () => navigate('/discover'),
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      icon: MessageCircle,
      label: "Messages",
      action: () => navigate('/chat'),
      color: "text-green-500", 
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      icon: BookOpen,
      label: "Study Groups",
      action: () => console.log('Study groups'),
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      icon: TrendingUp,
      label: "Hot Topics",
      action: () => navigate('/trends'),
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
        <div className="p-4 space-y-4">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">
                Hey there, {user.user_metadata?.full_name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-sm text-muted-foreground">
                Ready to learn something new?
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRoleSwitch(true)}
                className="text-xs"
              >
                Switch to Tutor
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/profile')}
              >
                <UserIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="What do you want to learn? (e.g., CALC 2, Organic Chem)"
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

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`h-16 flex-col gap-2 ${action.bgColor} border-border/20 hover:scale-105 transition-all`}
                  onClick={action.action}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-blue-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AC</span>
                </div>
                <div>
                  <p className="font-medium">Session with Alex Chen</p>
                  <p className="text-sm text-muted-foreground">Calculus II • 2 days ago</p>
                </div>
              </div>
              <Badge variant="secondary">Completed</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">SJ</span>
                </div>
                <div>
                  <p className="font-medium">Study Group: Physics Lab</p>
                  <p className="text-sm text-muted-foreground">5 students • 4 days ago</p>
                </div>
              </div>
              <Badge variant="secondary">Joined</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Discover New Tutors Section */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5 text-pink-500" />
              Discover New Tutors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <SwipeView
                onTutorMatch={handleTutorMatch}
                onChat={handleChat}
                onBook={handleBook}
                onViewProfile={handleViewProfile}
                onViewLikedTutors={handleViewLikedTutors}
                searchQuery={searchQuery}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentHome;