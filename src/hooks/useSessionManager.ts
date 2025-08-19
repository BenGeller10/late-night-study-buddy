import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface SessionState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

export const useSessionManager = () => {
  const [sessionState, setSessionState] = useState<SessionState>({
    user: null,
    session: null,
    loading: true,
    initialized: false
  });

  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session initialization error:', error);
        }

        if (mounted) {
          setSessionState({
            user: session?.user || null,
            session: session || null,
            loading: false,
            initialized: true
          });
        }
      } catch (error) {
        console.error('Session fetch error:', error);
        if (mounted) {
          setSessionState(prev => ({
            ...prev,
            loading: false,
            initialized: true
          }));
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            setSessionState({
              user: session?.user || null,
              session: session || null,
              loading: false,
              initialized: true
            });
            break;
          
          case 'SIGNED_OUT':
            setSessionState({
              user: null,
              session: null,
              loading: false,
              initialized: true
            });
            break;
          
          case 'TOKEN_REFRESHED':
            setSessionState(prev => ({
              ...prev,
              user: session?.user || null,
              session: session || null,
              loading: false
            }));
            break;
          
          default:
            setSessionState(prev => ({
              ...prev,
              user: session?.user || null,
              session: session || null,
              loading: false,
              initialized: true
            }));
        }
      }
    );

    initializeSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setSessionState(prev => ({ ...prev, loading: true }));
      
      // Clean up local storage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;

      // Force redirect to ensure clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even if sign out fails
      window.location.href = '/auth';
    }
  };

  return {
    ...sessionState,
    signOut,
    isAuthenticated: !!sessionState.user && !!sessionState.session
  };
};

export default useSessionManager;