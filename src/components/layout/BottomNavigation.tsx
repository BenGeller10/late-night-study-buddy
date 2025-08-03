import { Link, useLocation } from "react-router-dom";
import { Heart, TrendingUp, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNavigation = () => {
  const location = useLocation();
  
  // Don't show bottom nav on onboarding pages (index route)
  if (location.pathname === "/") {
    return null;
  }

  const navItems = [
    {
      to: "/discover",
      icon: Heart,
      label: "Discover",
      activeColor: "text-pink-500"
    },
    {
      to: "/trends", 
      icon: TrendingUp,
      label: "Trends",
      activeColor: "text-orange-500"
    },
    {
      to: "/chat",
      icon: MessageCircle,
      label: "Chat",
      activeColor: "text-blue-500"
    },
    {
      to: "/profile",
      icon: User,
      label: "Profile",
      activeColor: "text-purple-500"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/20">
      <div className="flex justify-around items-center py-2 px-4 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label, activeColor }) => {
          const isActive = location.pathname === to;
          
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
                "hover:bg-muted/50 active:scale-95",
                isActive && "bg-muted/30"
              )}
            >
              <Icon 
                className={cn(
                  "w-6 h-6 transition-colors",
                  isActive ? activeColor : "text-muted-foreground"
                )}
              />
              <span 
                className={cn(
                  "text-xs font-medium transition-colors",
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
  );
};

export default BottomNavigation;