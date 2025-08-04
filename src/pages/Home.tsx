import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import StudentHome from "@/components/home/StudentHome";
import TutorHome from "@/components/home/TutorHome";
import PageTransition from "@/components/layout/PageTransition";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isTutor, setIsTutor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserRole(session.user.id);
      }
      setIsLoading(false);
    };

    const fetchUserRole = async (userId: string) => {
      try {
        const { data: profile, error } = await (supabase as any)
          .from('profiles')
          .select('is_tutor')
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        setIsTutor(profile?.is_tutor || false);
      } catch (error) {
        console.error('Error fetching user role:', error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive"
        });
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserRole(session.user.id);
      } else {
        setUser(null);
        setIsTutor(false);
      }
    });

    getSession();

    return () => subscription.unsubscribe();
  }, [toast]);

  const handleRoleSwitch = async (newRole: boolean) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ is_tutor: newRole })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsTutor(newRole);
      toast({
        title: "Success",
        description: `Switched to ${newRole ? 'Tutor' : 'Student'} mode`,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error", 
        description: "Failed to update role",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Welcome to Campus Connect</h1>
          <p className="text-muted-foreground">Please sign in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="transition-all duration-500 ease-in-out">
        {isTutor ? (
          <TutorHome user={user} onRoleSwitch={handleRoleSwitch} />
        ) : (
          <StudentHome user={user} onRoleSwitch={handleRoleSwitch} />
        )}
      </div>
    </PageTransition>
  );
};

export default Home;