import { Link, useLocation } from "react-router-dom";
import { Heart, TrendingUp, MessageCircle, User, HelpCircle } from "lucide-react";
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
      activeColor: "text-blue"
    },
    {
      to: "/profile",
      icon: User,
      label: "Profile", 
      activeColor: "text-success"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border-light shadow-2xl">
      <div className="flex justify-around items-center px-2 py-1 max-w-lg mx-auto" 
           style={{ paddingBottom: 'calc(0.25rem + var(--safe-bottom, 0px))' }}>
        {navItems.map(({ to, icon: Icon, label, activeColor }) => {
          const isActive = location.pathname === to;
          
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-200 min-h-[44px] min-w-[44px] flex-1 max-w-[80px]",
                "hover:bg-muted/50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
                isActive && "bg-primary/10 scale-105 shadow-sm"
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 transition-all duration-200",
                  isActive ? `${activeColor} scale-110` : "text-muted-foreground"
                )}
              />
              <span 
                className={cn(
                  "text-xs font-medium transition-colors duration-200 leading-none",
                  isActive ? activeColor : "text-muted-foreground"
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

export default BottomNavigation;