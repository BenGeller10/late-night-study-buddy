import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AppStats {
  activeTutors: number;
  sessionsBooked: number;
  averageRating: number;
}

export const useAppStats = () => {
  const [stats, setStats] = useState<AppStats>({
    activeTutors: 0,
    sessionsBooked: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Get active tutors count
      const { count: tutorCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_tutor', true);

      // Get total sessions count
      const { count: sessionCount } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true });

      // Get average rating from completed sessions
      const { data: ratingData } = await supabase
        .from('sessions')
        .select('student_rating, tutor_rating')
        .not('student_rating', 'is', null)
        .not('tutor_rating', 'is', null);

      let averageRating = 0;
      if (ratingData && ratingData.length > 0) {
        const allRatings = ratingData.flatMap(session => [
          session.student_rating,
          session.tutor_rating
        ]).filter(rating => rating !== null);
        
        if (allRatings.length > 0) {
          averageRating = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;
        }
      }

      setStats({
        activeTutors: tutorCount || 0,
        sessionsBooked: sessionCount || 0,
        averageRating: averageRating
      });
    } catch (error) {
      console.error('Error fetching app stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscriptions for live updates
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => fetchStats()
      )
      .subscribe();

    const sessionsChannel = supabase
      .channel('sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions'
        },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(sessionsChannel);
    };
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatRating = (rating: number): string => {
    return rating > 0 ? rating.toFixed(1) : '5.0';
  };

  return {
    stats,
    loading,
    formatNumber,
    formatRating
  };
};