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
      try {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          // User is authenticated, redirect to home
          navigate('/home');
          return;
        }

        // Check if user has completed onboarding
        const hasCompletedOnboarding = localStorage.getItem('campus-connect-onboarded');
        
        if (hasCompletedOnboarding === 'true' && mounted) {
          // Has onboarding but no session, redirect to auth
          navigate('/auth');
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session && mounted) {
        navigate('/home');
      } else if (event === 'SIGNED_OUT' && mounted) {
        setIsCheckingAuth(false);
      }
    });

    checkAuthAndRedirect();

    return () => {
      mounted = false;
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
