import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import StudentInterface from "@/components/interfaces/StudentInterface";
import TutorInterface from "@/components/interfaces/TutorInterface";
import PageTransition from "@/components/layout/PageTransition";
import { useToast } from "@/hooks/use-toast";

const AppShell = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isTutor, setIsTutor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          navigate('/');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          navigate('/');
          return;
        }

        setUser(session.user);
        setIsTutor(profile?.is_tutor || false);
      } catch (error) {
        console.error('Error in session check:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/');
      } else {
        getSession();
      }
    });

    getSession();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleRoleSwitch = async (newRole: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_tutor: newRole })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsTutor(newRole);
      toast({
        title: `Switched to ${newRole ? 'Tutor' : 'Student'} mode`,
        description: `Welcome to your ${newRole ? 'tutor' : 'student'} dashboard!`,
      });
    } catch (error: any) {
      toast({
        title: "Error switching roles",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Campus Connect...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!user) {
    return null; // Will redirect to home
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {isTutor ? (
          <TutorInterface user={user} onRoleSwitch={handleRoleSwitch} />
        ) : (
          <StudentInterface user={user} onRoleSwitch={handleRoleSwitch} />
        )}
      </div>
    </PageTransition>
  );
};

export default AppShell;