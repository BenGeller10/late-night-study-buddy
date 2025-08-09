import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface UserProfile {
  username: string | null;
  onboarding_completed: boolean;
  study_preferences_completed: boolean;
  role_preference: string;
  followers_count: number;
  following_count: number;
}

export const useCleanUserInit = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [needsPersonalization, setNeedsPersonalization] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await checkUserProfile(session.user);
        } else {
          setUser(null);
          setProfile(null);
          setNeedsUsername(false);
          setNeedsPersonalization(false);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserProfile = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          username,
          onboarding_completed,
          study_preferences_completed,
          role_preference,
          followers_count,
          following_count
        `)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(profile);

      // Determine what onboarding steps are needed
      if (!profile.username) {
        setNeedsUsername(true);
      } else if (!profile.study_preferences_completed) {
        setNeedsPersonalization(true);
      } else {
        // Mark onboarding as completed if all steps are done
        if (!profile.onboarding_completed) {
          await supabase
            .from('profiles')
            .update({ onboarding_completed: true })
            .eq('user_id', user.id);
        }
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
    }
  };

  const completeUsernameStep = async (username: string) => {
    if (!user) return;

    // Update local state
    setProfile(prev => prev ? { ...prev, username } : null);
    setNeedsUsername(false);

    // Check if we need personalization next
    if (profile && !profile.study_preferences_completed) {
      setNeedsPersonalization(true);
    }
  };

  const completePersonalizationStep = async () => {
    if (!user) return;

    // Update local state
    setProfile(prev => prev ? { ...prev, study_preferences_completed: true } : null);
    setNeedsPersonalization(false);

    // Mark onboarding as completed
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('user_id', user.id);
  };

  const isOnboardingComplete = profile?.onboarding_completed || 
    (profile?.username && profile?.study_preferences_completed);

  return {
    user,
    profile,
    loading,
    needsUsername,
    needsPersonalization,
    isOnboardingComplete,
    completeUsernameStep,
    completePersonalizationStep,
    refetchProfile: () => user && checkUserProfile(user)
  };
};