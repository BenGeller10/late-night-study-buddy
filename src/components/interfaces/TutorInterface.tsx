import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import TutorHome from "@/components/home/TutorHome";
import LikedStudents from "@/pages/LikedStudents";
import Bookings from "@/pages/Bookings";
import SetAvailability from "@/pages/SetAvailability";
import Support from "@/pages/Support";
import Profile from "@/pages/Profile";
import Chat from "@/pages/Chat";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Calendar, 
  Clock, 
  HelpCircle,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TutorInterfaceProps {
  user: User;
  onRoleSwitch: (isTutor: boolean) => void;
}

const TutorInterface = ({ user, onRoleSwitch }: TutorInterfaceProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Tutor-specific navigation (TutorPro)
  const tutorNavItems = [
    {
      to: "/liked-students",
      icon: Heart,
      label: "Clients",
      activeColor: "text-blue-600"
    },
    {
      to: "/chat",
      icon: MessageCircle,
      label: "Messages",
      activeColor: "text-blue-500"
    },
    {
      to: "/bookings",
      icon: Calendar,
      label: "Business",
      activeColor: "text-blue-400"
    },
    {
      to: "/set-availability",
      icon: Clock,
      label: "Hours",
      activeColor: "text-slate-600"
    },
    {
      to: "/support",
      icon: HelpCircle,
      label: "Support",
      activeColor: "text-slate-500"
    }
  ];

  // Redirect to tutor dashboard if on root
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/home') {
      navigate('/liked-students');
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-800">
      {/* Tutor Routes */}
      <Routes>
        <Route path="/liked-students" element={<LikedStudents />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/set-availability" element={<SetAvailability />} />
        <Route path="/support" element={<Support />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:studentId" element={<Chat />} />
        <Route path="*" element={<LikedStudents />} />
      </Routes>
      
      {/* Tutor Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-700/90 backdrop-blur-xl border-t border-gray-600">
        <div className="flex justify-around items-center py-2 px-4 max-w-lg mx-auto">
          {tutorNavItems.map(({ to, icon: Icon, label, activeColor }) => {
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

export default TutorInterface;