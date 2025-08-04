import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart, 
  TrendingUp, 
  MessageCircle, 
  User, 
  HelpCircle,
  Search,
  Bell,
  Calendar,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

const DynamicBottomNavigation = () => {
  const location = useLocation();
  const [isTutor, setIsTutor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Don't show bottom nav on onboarding pages (index route)
  if (location.pathname === "/") {
    return null;
  }

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await (supabase as any)
            .from('profiles')
            .select('is_tutor')
            .eq('user_id', session.user.id)
            .single();
          
          setIsTutor(profile?.is_tutor || false);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchUserRole();
      } else {
        setIsTutor(false);
        setIsLoading(false);
      }
    });

    fetchUserRole();

    return () => subscription.unsubscribe();
  }, []);

  // Student navigation items
  const studentNavItems = [
    {
      to: "/home",
      icon: Search,
      label: "Find Tutors",
      activeColor: "text-blue-500"
    },
    {
      to: "/trends", 
      icon: TrendingUp,
      label: "Hot Topics",
      activeColor: "text-orange-500"
    },
    {
      to: "/chat",
      icon: MessageCircle,
      label: "Messages",
      activeColor: "text-green-500"
    },
    {
      to: "/profile",
      icon: User,
      label: "Profile",
      activeColor: "text-purple-500"
    }
  ];

  // Tutor navigation items
  const tutorNavItems = [
    {
      to: "/home",
      icon: Bell,
      label: "Requests",
      activeColor: "text-orange-500"
    },
    {
      to: "/chat",
      icon: MessageCircle,
      label: "Messages",
      activeColor: "text-green-500"
    },
    {
      to: "/trends",
      icon: BarChart3,
      label: "Analytics",
      activeColor: "text-blue-500"
    },
    {
      to: "/profile",
      icon: User,
      label: "Profile",
      activeColor: "text-purple-500"
    }
  ];

  const navItems = isTutor ? tutorNavItems : studentNavItems;

  if (isLoading) {
    return null; // Don't show navigation while loading
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/30 transition-all duration-500">
      <div className="flex justify-around items-center py-2 px-4 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label, activeColor }) => {
          const isActive = location.pathname === to;
          
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
                "hover:bg-muted/50 active:scale-95 interactive",
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
  );
};

export default DynamicBottomNavigation;