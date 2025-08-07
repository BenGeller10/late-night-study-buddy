
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCleanUserInit = (userId: string | null) => {
  const [isNewUser, setIsNewUser] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const checkUserStatus = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error checking user profile:', error);
          setIsLoading(false);
          return;
        }

        // Check if user needs onboarding
        const needsSetup = !profile?.completed_intro_questions || 
                          !profile?.username ||
                          (profile?.followers_count === null || profile?.following_count === null);
        
        setNeedsOnboarding(needsSetup);
        setIsNewUser(needsSetup);
        setIsLoading(false);

        // Initialize clean stats if needed
        if (needsSetup) {
          await initializeCleanStats(userId);
        }
      } catch (error) {
        console.error('Error in useCleanUserInit:', error);
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [userId]);

  const initializeCleanStats = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          followers_count: 0,
          following_count: 0,
          completed_intro_questions: false,
          study_preferences: {},
          personality_traits: {}
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error initializing clean stats:', error);
      }
    } catch (error) {
      console.error('Error in initializeCleanStats:', error);
    }
  };

  const completeOnboarding = async (updates: any) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          completed_intro_questions: true
        })
        .eq('user_id', userId);

      if (error) throw error;

      setNeedsOnboarding(false);
      setIsNewUser(false);
      
      toast({
        title: "Welcome to Campus Connect! 🎉",
        description: "Your profile is all set up. Let's find you some amazing tutors!",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Setup Error",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    isNewUser,
    needsOnboarding,
    isLoading,
    completeOnboarding
  };
};
