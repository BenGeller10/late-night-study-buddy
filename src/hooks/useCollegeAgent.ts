import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCollegeAgent = (userId: string | null) => {
  const [showQuestionPopup, setShowQuestionPopup] = useState(false);
  const [hasCompletedIntro, setHasCompletedIntro] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const checkUserProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('completed_intro_questions')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error checking profile:', error);
          return;
        }

        const hasCompleted = profile?.completed_intro_questions || false;
        setHasCompletedIntro(hasCompleted);

        // Show popup after a delay if user hasn't completed intro questions
        if (!hasCompleted) {
          const timer = setTimeout(() => {
            setShowQuestionPopup(true);
          }, 3000); // Wait 3 seconds after login

          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Error in useCollegeAgent:', error);
      }
    };

    checkUserProfile();
  }, [userId]);

  const closeQuestionPopup = () => {
    setShowQuestionPopup(false);
    setHasCompletedIntro(true);
  };

  // Randomly show follow-up questions for engaged users
  const triggerRandomQuestion = () => {
    if (hasCompletedIntro && Math.random() > 0.95) { // 5% chance
      setShowQuestionPopup(true);
    }
  };

  return {
    showQuestionPopup,
    closeQuestionPopup,
    triggerRandomQuestion,
    hasCompletedIntro
  };
};