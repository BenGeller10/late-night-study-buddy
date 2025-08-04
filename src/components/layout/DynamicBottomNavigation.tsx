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
  Clock,
  BarChart3,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const DynamicBottomNavigation = () => {
  const location = useLocation();
  const [isTutor, setIsTutor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
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

    // Listen for profile changes to update navigation immediately
    const profileSubscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          // Re-fetch role when profile is updated
          fetchUserRole();
        }
      )
      .subscribe();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchUserRole();
      } else {
        setIsTutor(false);
        setIsLoading(false);
      }
    });

    fetchUserRole();

    return () => {
      subscription.unsubscribe();
      profileSubscription.unsubscribe();
    };
  }, []);
  
  // Don't show bottom nav on onboarding pages (index route) or while loading
  if (location.pathname === "/" || isLoading) {
    return null;
  }

  // Student navigation items
  const studentNavItems = [
    {
      to: "/home",
      icon: Search,
      label: "Find Tutors",
      activeColor: "text-blue-500"
    },
    {
      to: "/study-groups", 
      icon: Users,
      label: "Study Groups",
      activeColor: "text-purple-500"
    },
    {
      to: "/chat",
      icon: MessageCircle,
      label: "Messages",
      activeColor: "text-green-500"
    },
    {
      to: "/support",
      icon: HelpCircle,
      label: "Support",
      activeColor: "text-orange-500"
    }
  ];

  // Tutor navigation items
  const tutorNavItems = [
    {
      to: "/liked-students",
      icon: Heart,
      label: "Matches",
      activeColor: "text-pink-500"
    },
    {
      to: "/bookings",
      icon: Calendar,
      label: "Bookings",
      activeColor: "text-blue-500"
    },
    {
      to: "/set-availability",
      icon: Clock,
      label: "Schedule",
      activeColor: "text-purple-500"
    },
    {
      to: "/chat",
      icon: MessageCircle,
      label: "Messages",
      activeColor: "text-green-500"
    },
    {
      to: "/support",
      icon: HelpCircle,
      label: "Support",
      activeColor: "text-orange-500"
    }
  ];

  const navItems = isTutor ? tutorNavItems : studentNavItems;

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