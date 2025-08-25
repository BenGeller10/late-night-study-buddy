
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
      
      // Query real tutors from database
      let query = supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          display_name,
          avatar_url,
          bio,
          experience,
          major,
          followers_count,
          tutor_subjects!inner (
            hourly_rate,
            subjects (
              id,
              name,
              code
            )
          )
        `)
        .eq('is_tutor', true);

      const { data: tutorProfiles, error: profileError } = await query;
      
      if (profileError) throw profileError;

      // Transform database data to Tutor interface
      const transformedTutors: Tutor[] = (tutorProfiles || []).map(profile => {
        const subjects = profile.tutor_subjects?.map(ts => ({
          id: ts.subjects?.id || '',
          name: ts.subjects?.name || '',
          code: ts.subjects?.code || '', 
          hourly_rate: ts.hourly_rate || 30
        })) || [];

        const avgRate = subjects.length > 0 
          ? subjects.reduce((sum, s) => sum + s.hourly_rate, 0) / subjects.length 
          : 30;

        return {
          id: profile.id,
          user_id: profile.user_id,
          name: profile.display_name || 'Tutor',
          profilePicture: profile.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616c367fb0c?w=400&h=400&fit=crop&crop=face',
          classes: subjects.map(s => s.code),
          tutorStyle: profile.bio || 'Experienced tutor ready to help you succeed!',
          hourlyRate: Math.round(avgRate),
          isFree: false,
          rating: 4.8, // Default rating - you can add ratings table later
          totalSessions: 50, // Default - you can calculate from sessions table later
          bio: profile.bio || '',
          experience: profile.experience || '',
          major: profile.major || '',
          subjects: subjects
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
          tutor.major?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tutor.subjects?.some(subject => 
            subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subject.code.toLowerCase().includes(searchQuery.toLowerCase())
          )
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
