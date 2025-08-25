import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RealSession {
  id: string;
  student_id: string;
  tutor_id: string;
  subject_id: string;
  scheduled_at: string | null;
  duration_minutes: number | null;
  total_amount: number | null;
  status: string;
  location: string | null;
  notes: string | null;
  payment_method: string | null;
  payment_status: string | null;
  created_at: string;
  updated_at: string;
  // Related data
  student_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  tutor_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  subject?: {
    name: string;
    code: string;
  };
}

export const useRealSessions = (userId?: string) => {
  const [sessions, setSessions] = useState<RealSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      if (!userId) {
        setSessions([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          *,
          student_profile:profiles!student_id(display_name, avatar_url),
          tutor_profile:profiles!tutor_id(display_name, avatar_url),
          subject:subjects(name, code)
        `)
        .or(`student_id.eq.${userId},tutor_id.eq.${userId}`)
        .order('scheduled_at', { ascending: false });

      if (sessionError) throw sessionError;

      setSessions(sessionData || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [userId]);

  return { sessions, loading, error, refetch: fetchSessions };
};