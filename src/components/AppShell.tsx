import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import StudentInterface from "@/components/interfaces/StudentInterface";
import TutorInterface from "@/components/interfaces/TutorInterface";
import PageTransition from "@/components/layout/PageTransition";
import { useToast } from "@/hooks/use-toast";
import useSessionManager from "@/hooks/useSessionManager";
import ErrorBoundary from "./ErrorBoundary";

const AppShell = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, isAuthenticated } = useSessionManager();
  const [isTutor, setIsTutor] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (user && isAuthenticated) {
      fetchUserProfile();
    }
  }, [loading, isAuthenticated, user, navigate]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive"
        });
        return;
      }

      setIsTutor(profile?.is_tutor || false);
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setProfileLoading(false);
    }
  };

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

  if (loading || profileLoading) {
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

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  return (
    <ErrorBoundary>
      <PageTransition>
        <div className="min-h-screen bg-background">
          {isTutor ? (
            <TutorInterface user={user} onRoleSwitch={handleRoleSwitch} />
          ) : (
            <StudentInterface user={user} onRoleSwitch={handleRoleSwitch} />
          )}
        </div>
      </PageTransition>
    </ErrorBoundary>
  );
};

export default AppShell;