import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import StudentHome from "@/components/home/StudentHome";
import MySessions from "@/pages/MySessions";
import StudyGroups from "@/pages/StudyGroups";
import Support from "@/pages/Support";
import Profile from "@/pages/Profile";
import Chat from "@/pages/Chat";
import GroupChatInterface from "@/components/chat/GroupChatInterface";
import MessagingPage from "@/components/chat/MessagingPage";
import TutorProfile from "@/pages/TutorProfile";
import LikedTutors from "@/pages/LikedTutors";
import { Link } from "react-router-dom";
import { 
  Search, 
  Calendar, 
  Users, 
  MessageCircle,
  HelpCircle,
  User as UserIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentInterfaceProps {
  user: User;
  onRoleSwitch: (isTutor: boolean) => void;
}

const StudentInterface = ({ user, onRoleSwitch }: StudentInterfaceProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Student-specific navigation (StudyBuddy)
  const studentNavItems = [
    {
      to: "/home",
      icon: Search,
      label: "Find a Tutor",
      activeColor: "text-blue-500"
    },
    {
      to: "/my-sessions", 
      icon: Calendar,
      label: "My Sessions",
      activeColor: "text-purple-500"
    },
    {
      to: "/chat",
      icon: MessageCircle,
      label: "Messages",
      activeColor: "text-pink-500"
    },
    {
      to: "/study-groups", 
      icon: Users,
      label: "Study Groups",
      activeColor: "text-green-500"
    },
    {
      to: "/support",
      icon: HelpCircle,
      label: "Support",
      activeColor: "text-orange-500"
    }
  ];

  // Redirect to student home if on root
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/home');
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Student Routes */}
      <Routes>
        <Route path="/home" element={<StudentHome user={user} onRoleSwitch={onRoleSwitch} />} />
        <Route path="/my-sessions" element={<MySessions />} />
        <Route path="/study-groups" element={<StudyGroups />} />
        <Route path="/support" element={<Support />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:tutorId" element={<Chat />} />
        <Route path="/chat/conversation/:conversationId" element={<MessagingPage />} />
        <Route path="/chat/group/:groupId" element={<GroupChatInterface />} />
        <Route path="/tutor/:tutorId" element={<TutorProfile />} />
        <Route path="/liked-tutors" element={<LikedTutors />} />
        <Route path="*" element={<StudentHome user={user} onRoleSwitch={onRoleSwitch} />} />
      </Routes>
      
      {/* Student Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/30">
        <div className="flex justify-around items-center py-2 px-4 max-w-lg mx-auto">
          {studentNavItems.map(({ to, icon: Icon, label, activeColor }) => {
            const isActive = location.pathname === to;
            
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
                  "hover:bg-muted/50 active:scale-95",
                  isActive && "bg-muted/30 scale-105"
                )}
              >
                <Icon 
                  className={cn(
                    "w-6 h-6 transition-all duration-200",
                    isActive ? `${activeColor} scale-110` : "text-muted-foreground"
                  )}
                />
                <span 
                  className={cn(
                    "text-xs font-medium transition-colors duration-200",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
        
        {/* Safe area for devices with home indicator */}
        <div className="h-safe-bottom" />
      </div>
    </div>
  );
};

export default StudentInterface;