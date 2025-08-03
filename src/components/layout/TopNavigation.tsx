import { Link, useLocation } from "react-router-dom";
import { Heart, TrendingUp, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TopNavigation = () => {
  const location = useLocation();
  
  // Don't show top nav on onboarding pages (index route)
  if (location.pathname === "/") {
    return null;
  }

  const navItems = [
    {
      to: "/discover",
      icon: Heart,
      label: "Find",
      activeColor: "text-primary"
    },
    {
      to: "/trends", 
      icon: TrendingUp,
      label: "Trends",
      activeColor: "text-accent"
    },
    {
      to: "/chat",
      icon: MessageCircle,
      label: "Chat",
      activeColor: "text-primary"
    },
    {
      to: "/profile",
      icon: User,
      label: "Profile",
      activeColor: "text-accent"
    }
  ];

  return (
    <div className="fixed top-0 right-4 z-40 mt-4">
      <div className="flex gap-2 glass-card p-2 rounded-2xl">
        {navItems.map(({ to, icon: Icon, label, activeColor }) => {
          const isActive = location.pathname === to;
          
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
                "hover:bg-primary/10 active:scale-95 interactive min-w-[50px]",
                isActive && "bg-primary/20 scale-105"
              )}
              title={label}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 transition-all duration-200",
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
    </div>
  );
};

export default TopNavigation;