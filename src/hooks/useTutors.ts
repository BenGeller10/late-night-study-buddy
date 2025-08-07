
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Tutor {
  id: string;
  user_id: string;
  name: string;
  profilePicture: string;
  classes: string[];
  tutorStyle: string;
  hourlyRate: number;
  isFree: boolean;
  rating: number;
  totalSessions: number;
  bio?: string;
  experience?: string;
  major?: string;
  venmo_handle?: string;
  subjects?: Array<{
    id: string;
    name: string;
    code: string;
    hourly_rate: number;
  }>;
}

export const useTutors = (searchQuery?: string) => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      
      // Fetch tutors with their profiles and subjects
      let query = supabase
        .from('profiles')
        .select(`
          *,
          tutor_subjects (
            id,
            hourly_rate,
            subjects (
              id,
              name,
              code
            )
          )
        `)
        .eq('is_tutor', true);

      const { data: tutorProfiles, error } = await query;

      if (error) {
        throw error;
      }

      if (!tutorProfiles) {
        setTutors([]);
        return;
      }

      // Transform the data to match our Tutor interface
      const transformedTutors: Tutor[] = tutorProfiles.map((profile) => {
        const subjects = profile.tutor_subjects?.map((ts: any) => ({
          id: ts.subjects?.id || '',
          name: ts.subjects?.name || '',
          code: ts.subjects?.code || '',
          hourly_rate: ts.hourly_rate || 0
        })) || [];

        const classes = subjects.map(s => s.code).filter(Boolean);
        
        // Calculate average hourly rate
        const rates = subjects.map(s => s.hourly_rate).filter(r => r > 0);
        const avgRate = rates.length > 0 ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;

        return {
          id: profile.user_id,
          user_id: profile.user_id,
          name: profile.display_name || 'Anonymous Tutor',
          profilePicture: profile.avatar_url || '/placeholder.svg',
          classes,
          tutorStyle: profile.bio || "I'm here to help you succeed in your studies! 📚",
          hourlyRate: avgRate,
          isFree: avgRate === 0,
          rating: 4.8, // Default rating - could be calculated from session feedback
          totalSessions: 25, // Default - could be calculated from sessions table
          bio: profile.bio,
          experience: profile.experience,
          major: profile.major,
          venmo_handle: profile.venmo_handle,
          subjects
        };
      });

      // Filter by search query if provided
      let filteredTutors = transformedTutors;
      if (searchQuery && searchQuery.trim()) {
        filteredTutors = transformedTutors.filter(tutor => 
          tutor.classes.some(className => 
            className.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tutor.major?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setTutors(filteredTutors);
    } catch (err) {
      console.error('Error fetching tutors:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tutors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, [searchQuery]);

  return { tutors, loading, error, refetch: fetchTutors };
};
