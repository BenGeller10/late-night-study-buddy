import { Link, useLocation } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const FloatingActionButton = () => {
  const location = useLocation();
  
  // Don't show on onboarding pages (index route)
  if (location.pathname === "/") {
    return null;
  }

  const isActive = location.pathname === "/support";

  return (
    <Link
      to="/support"
      className={cn(
        "fixed top-4 right-4 z-50",
        "w-12 h-12 rounded-full",
        "bg-primary/90 hover:bg-primary backdrop-blur-sm",
        "flex items-center justify-center",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-300 hover:scale-110 active:scale-95",
        "border border-primary-foreground/10",
        isActive && "bg-primary shadow-glow scale-110"
      )}
      aria-label="Get Help"
    >
      <HelpCircle 
        className={cn(
          "w-6 h-6 transition-all duration-200",
          "text-primary-foreground"
        )}
      />
    </Link>
  );
};

export default FloatingActionButton;