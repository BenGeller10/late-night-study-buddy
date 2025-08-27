import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CampusConnectApp from "@/components/CampusConnectApp";

const Index = () => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuthAndRedirect = async () => {
      console.log('Starting auth check...');
      try {
        // Check current session with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 5000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        console.log('Session check result:', !!session?.user);
        
        if (session?.user && mounted) {
          console.log('User authenticated, redirecting to home');
          navigate('/home');
          return;
        }

        // Check if user has completed onboarding
        const hasCompletedOnboarding = localStorage.getItem('campus-connect-onboarded');
        console.log('Onboarding status:', hasCompletedOnboarding);
        
        if (hasCompletedOnboarding === 'true' && mounted) {
          console.log('Has onboarding, redirecting to auth');
          navigate('/auth');
          return;
        }

        console.log('No auth, showing onboarding');
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        if (mounted) {
          console.log('Setting isCheckingAuth to false');
          setIsCheckingAuth(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, !!session?.user);
      if (event === 'SIGNED_IN' && session && mounted) {
        navigate('/home');
      } else if (event === 'SIGNED_OUT' && mounted) {
        setIsCheckingAuth(false);
      }
    });

    // Add timeout fallback
    const fallbackTimeout = setTimeout(() => {
      if (mounted) {
        console.log('Fallback timeout triggered');
        setIsCheckingAuth(false);
      }
    }, 3000);

    checkAuthAndRedirect();

    return () => {
      mounted = false;
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <CampusConnectApp />;
};

export default Index;
