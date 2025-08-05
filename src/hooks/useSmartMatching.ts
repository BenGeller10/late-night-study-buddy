import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MatchedTutor {
  id: string;
  name: string;
  profilePicture: string;
  major: string;
  rating: number;
  hourlyRate: number;
  matchReason: string;
  subjects: string[];
  availability: string;
}

interface UserProfile {
  major_passion?: string;
  favorite_study_spot?: string;
  semester_goal?: string;
  stress_relief?: string;
  dream_career?: string;
  major?: string;
  completed_intro_questions?: boolean;
}

export const useSmartMatching = (userId: string | null) => {
  const [matchedTutors, setMatchedTutors] = useState<MatchedTutor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const mockTutors = [
    {
      id: "1",
      name: "Sarah Chen",
      profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face",
      major: "Chemistry",
      rating: 4.9,
      hourlyRate: 25,
      subjects: ["Organic Chemistry", "General Chemistry"],
      availability: "Late nights",
      keywords: ["organic chem", "chemistry", "night", "late"]
    },
    {
      id: "2", 
      name: "Marcus Johnson",
      profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      major: "Economics",
      rating: 4.8,
      hourlyRate: 30,
      subjects: ["Macroeconomics", "Microeconomics"],
      availability: "Afternoons",
      keywords: ["econ", "economics", "business", "finance"]
    },
    {
      id: "3",
      name: "Emily Rodriguez", 
      profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      major: "Mathematics",
      rating: 4.7,
      hourlyRate: 28,
      subjects: ["Calculus", "Statistics"],
      availability: "Mornings",
      keywords: ["calc", "calculus", "math", "statistics"]
    }
  ];

  const generateMatchReason = (tutor: any, userProfile: UserProfile): string => {
    const reasons = [];
    
    if (userProfile.major_passion && tutor.keywords.some((keyword: string) => 
      userProfile.major_passion!.toLowerCase().includes(keyword))) {
      reasons.push("shares your passion for this subject");
    }
    
    if (userProfile.stress_relief && userProfile.stress_relief.toLowerCase().includes("night") && 
        tutor.availability.toLowerCase().includes("night")) {
      reasons.push("available during your preferred study times");
    }
    
    if (userProfile.semester_goal && tutor.subjects.some((subject: string) =>
      userProfile.semester_goal!.toLowerCase().includes(subject.toLowerCase()))) {
      reasons.push("specializes in your goal subject");
    }

    if (reasons.length === 0) {
      return "highly rated and matches your academic needs";
    }
    
    return `🔥 ${reasons[0]}`;
  };

  const findMatches = async () => {
    if (!userId) return;

    setIsLoading(true);
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('major_passion, favorite_study_spot, semester_goal, stress_relief, dream_career, major, completed_intro_questions')
        .eq('user_id', userId)
        .single();

      if (error || !profile?.completed_intro_questions) {
        setIsLoading(false);
        return;
      }

      // Smart matching logic
      const matches = mockTutors
        .filter(tutor => {
          // Match based on keywords from user responses
          const userText = [
            profile.major_passion,
            profile.semester_goal,
            profile.dream_career,
            profile.major
          ].filter(Boolean).join(' ').toLowerCase();

          return tutor.keywords.some(keyword => userText.includes(keyword));
        })
        .slice(0, 2) // Limit to top 2 matches
        .map(tutor => ({
          ...tutor,
          matchReason: generateMatchReason(tutor, profile)
        }));

      setMatchedTutors(matches);
      setShowRecommendation(matches.length > 0);
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      findMatches();
    }
  }, [userId]);

  return {
    matchedTutors,
    isLoading,
    showRecommendation,
    findMatches,
    hideRecommendation: () => setShowRecommendation(false)
  };
};