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

    // Set up auth state listener FIRST to prevent missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.id);

        // Handle different auth events - synchronous updates only
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

          case 'USER_UPDATED':
            setSessionState(prev => ({
              ...prev,
              user: session?.user || null,
              session: session || null
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

    // THEN check for existing session
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error && error.message !== 'Invalid Refresh Token: Refresh Token Not Found') {
          console.error('Session initialization error:', error);
          // Clear any corrupted session data
          localStorage.removeItem('supabase.auth.token');
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
              localStorage.removeItem(key);
            }
          });
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