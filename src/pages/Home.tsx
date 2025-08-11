
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import StudentHome from "@/components/home/StudentHome";
import TutorHome from "@/components/home/TutorHome";
import PageTransition from "@/components/layout/PageTransition";
import EnhancedOnboarding from "@/components/onboarding/EnhancedOnboarding";
import UsernameSetup from "@/components/username/UsernameSetup";
import EmptyStateView from "@/components/home/EmptyStateView";
import { useToast } from "@/hooks/use-toast";
import { useCleanUserInit } from "@/hooks/useCleanUserInit";
import { useCollegeAgent } from "@/hooks/useCollegeAgent";

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isTutor, setIsTutor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);
  const { toast } = useToast();

  const { needsUsername, needsPersonalization, isOnboardingComplete, completePersonalizationStep } = useCleanUserInit();
  const { showQuestionPopup, closeQuestionPopup } = useCollegeAgent(user?.id || null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    };

    const fetchUserProfile = async (userId: string) => {
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        
        setProfile(profileData);
        setIsTutor(profileData?.is_tutor || false);

        // Check if user needs username setup
        if (profileData && !profileData.username && profileData.completed_intro_questions) {
          setShowUsernameSetup(true);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
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
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setIsTutor(false);
      }
    });

    getSession();

    return () => subscription.unsubscribe();
  }, [toast]);

  const handleRoleSwitch = async (newRole: boolean) => {
    if (!user) return;

    // Check GPA requirement for tutors
    if (newRole && (!profile?.gpa || profile.gpa < 3.6)) {
      toast({
        title: "GPA Requirement",
        description: "You need a GPA of 3.6 or higher to become a tutor. Update your profile first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_tutor: newRole })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsTutor(newRole);
      setProfile(prev => ({ ...prev, is_tutor: newRole }));
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

  const handleOnboardingComplete = async (data: any) => {
    try {
      await completePersonalizationStep();
      setProfile(prev => ({ ...prev, ...data }));
      
      // Check if username setup is needed
      if (!data.username) {
        setShowUsernameSetup(true);
      }
      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return false;
    }
  };

  const handleUsernameComplete = (username: string) => {
    setProfile(prev => ({ ...prev, username }));
    setShowUsernameSetup(false);
  };

  const handleEmptyStateAction = (action: string) => {
    switch (action) {
      case 'find-tutors':
        window.location.href = '/discover';
        break;
      case 'study-groups':
        window.location.href = '/study-groups';
        break;
      case 'study-materials':
        window.location.href = '/profile';
        break;
      case 'create-story':
        window.location.href = '/campus-feed';
        break;
      case 'setup-subjects':
        window.location.href = '/profile';
        break;
      case 'set-availability':
        window.location.href = '/set-availability';
        break;
      case 'find-students':
        window.location.href = '/discover';
        break;
      case 'complete-profile':
        window.location.href = '/profile';
        break;
      default:
        break;
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

  // Show onboarding for new users
  if (!isOnboardingComplete && user.email) {
    return (
      <PageTransition>
        <EnhancedOnboarding 
          onComplete={handleOnboardingComplete}
          userEmail={user.email}
        />
      </PageTransition>
    );
  }

  // Show username setup if needed
  if (showUsernameSetup && user.id) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background p-4 flex items-center justify-center">
          <UsernameSetup
            userId={user.id}
            onComplete={handleUsernameComplete}
            currentUsername={profile?.username || ''}
          />
        </div>
      </PageTransition>
    );
  }

  // Show empty state for new users with minimal data
  if (profile && (!profile.followers_count && !profile.following_count && profile.completed_intro_questions)) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <EmptyStateView
            userType={isTutor ? 'tutor' : 'student'}
            onAction={handleEmptyStateAction}
          />
        </div>
      </PageTransition>
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
