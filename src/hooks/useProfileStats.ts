import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileStats {
  // Student stats
  sessionsAttended: number;
  subjectsStudied: number;
  hoursLearned: number;
  
  // Tutor stats
  sessionsTaught: number;
  studentsHelped: number;
  hoursTeaching: number;
  earnings: number;
  rating: number;
  
  // Progress tracking
  currentSubject?: string;
  currentProgress?: number;
}

export const useProfileStats = (userId: string | null, isTutor: boolean) => {
  const [stats, setStats] = useState<ProfileStats>({
    sessionsAttended: 0,
    subjectsStudied: 0,
    hoursLearned: 0,
    sessionsTaught: 0,
    studentsHelped: 0,
    hoursTeaching: 0,
    earnings: 0,
    rating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        if (isTutor) {
          // Fetch tutor statistics
          const { data: tutorSessions, error: tutorError } = await supabase
            .from('sessions')
            .select('id, duration_minutes, total_amount, student_rating, student_id')
            .eq('tutor_id', userId)
            .eq('status', 'completed');

          if (tutorError) throw tutorError;

          // Calculate tutor stats
          const sessionsTaught = tutorSessions?.length || 0;
          const studentsHelped = new Set(tutorSessions?.map(s => s.student_id)).size || 0;
          const hoursTeaching = Math.round((tutorSessions?.reduce((total, session) => 
            total + (session.duration_minutes || 60), 0) || 0) / 60);
          const earnings = tutorSessions?.reduce((total, session) => 
            total + (Number(session.total_amount) || 0), 0) || 0;
          
          // Calculate average rating
          const ratingsData = tutorSessions?.filter(s => s.student_rating) || [];
          const averageRating = ratingsData.length > 0 
            ? ratingsData.reduce((sum, s) => sum + s.student_rating, 0) / ratingsData.length 
            : 0;

          setStats(prev => ({
            ...prev,
            sessionsTaught,
            studentsHelped,
            hoursTeaching,
            earnings: Math.round(earnings),
            rating: Math.round(averageRating * 10) / 10
          }));
        } else {
          // Fetch student statistics
          const { data: studentSessions, error: studentError } = await supabase
            .from('sessions')
            .select('id, duration_minutes, subject_id')
            .eq('student_id', userId)
            .eq('status', 'completed');

          if (studentError) throw studentError;

          // Calculate student stats
          const sessionsAttended = studentSessions?.length || 0;
          const subjectsStudied = new Set(studentSessions?.map(s => s.subject_id)).size || 0;
          const hoursLearned = Math.round((studentSessions?.reduce((total, session) => 
            total + (session.duration_minutes || 60), 0) || 0) / 60);

          // Get current subject progress (most recent subject)
          if (studentSessions && studentSessions.length > 0) {
            const recentSession = studentSessions[studentSessions.length - 1];
            const { data: subjectData } = await supabase
              .from('subjects')
              .select('name')
              .eq('id', recentSession.subject_id)
              .single();
            
            // Calculate progress for the most recent subject (percentage based on sessions)
            const subjectSessions = studentSessions.filter(s => s.subject_id === recentSession.subject_id);
            const progress = Math.min(85, subjectSessions.length * 15); // Cap at 85%
            
            setStats(prev => ({
              ...prev,
              sessionsAttended,
              subjectsStudied,
              hoursLearned,
              currentSubject: subjectData?.name || 'Current Subject',
              currentProgress: progress
            }));
          } else {
            setStats(prev => ({
              ...prev,
              sessionsAttended,
              subjectsStudied, 
              hoursLearned
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching profile stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, isTutor]);

  return { stats, loading };
};