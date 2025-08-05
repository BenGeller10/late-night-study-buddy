import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeScreen from "./onboarding/WelcomeScreen";
import EmailVerification from "./onboarding/EmailVerification";
import ScheduleUpload from "./onboarding/ScheduleUpload";
import ProfileCreation from "./onboarding/ProfileCreation";
import TutorProfile from "./onboarding/TutorProfile";
import RoleSelection from "./onboarding/RoleSelection";
import CollegeQuestionPopup from "./ai-agent/CollegeQuestionPopup";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCollegeAgent } from "@/hooks/useCollegeAgent";

type AppState = 'welcome' | 'email-verification' | 'role-selection' | 'schedule-upload' | 'profile-creation' | 'tutor-profile' | 'main-app';
type UserRole = 'student' | 'tutor' | null;

const CampusConnectApp = () => {
  const navigate = useNavigate();
  const [appState, setAppState] = useState<AppState>('welcome');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [scheduleData, setScheduleData] = useState<string>('');
  const [profileData, setProfileData] = useState<{ fullName: string; password: string } | null>(null);
  const [user, setUser] = useState<any>(null);
  const { showQuestionPopup, closeQuestionPopup } = useCollegeAgent(user?.id);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Set dark mode on component mount for campus vibes
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleSignUp = () => {
    setAppState('email-verification');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleEmailVerification = (email: string) => {
    setUserEmail(email);
    setAppState('role-selection');
  };

  const handleScheduleUpload = (schedule: string) => {
    setScheduleData(schedule);
    setAppState('profile-creation');
  };

  const handleRoleSelection = (role: UserRole) => {
    setUserRole(role);
    if (role === 'student') {
      setAppState('schedule-upload');
    } else if (role === 'tutor') {
      setAppState('tutor-profile');
    }
  };

  const handleTutorProfile = (tutorData: any) => {
    setProfileData({
      fullName: tutorData.fullName,
      password: tutorData.password
    });
    setScheduleData(tutorData.scheduleData);
    
    // Redirect to auth page with tutor data
    navigate('/auth', { 
      state: { 
        email: userEmail,
        fullName: tutorData.fullName,
        password: tutorData.password,
        scheduleData: tutorData.scheduleData,
        userRole: 'tutor',
        tutorData: tutorData,
        fromOnboarding: true
      }
    });
  };

  const handleProfileCreation = (profile: { fullName: string; password: string }) => {
    setProfileData(profile);
    // For students, redirect to auth after profile creation
    navigate('/auth', { 
      state: { 
        email: userEmail,
        fullName: profile.fullName,
        password: profile.password,
        scheduleData: scheduleData,
        userRole: 'student',
        fromOnboarding: true
      }
    });
  };

  const handleBackToWelcome = () => {
    setAppState('welcome');
  };

  const handleBackToEmail = () => {
    setAppState('email-verification');
  };

  const handleBackToRole = () => {
    setAppState('role-selection');
  };

  const handleBackToSchedule = () => {
    setAppState('schedule-upload');
  };

  if (appState === 'welcome') {
    return <WelcomeScreen onSignUp={handleSignUp} onSignIn={handleSignIn} />;
  }

  if (appState === 'email-verification') {
    return <EmailVerification onNext={handleEmailVerification} onBack={handleBackToWelcome} />;
  }

  if (appState === 'role-selection') {
    return <RoleSelection onSelectRole={handleRoleSelection} />;
  }

  if (appState === 'schedule-upload') {
    return <ScheduleUpload onNext={handleScheduleUpload} onBack={handleBackToRole} />;
  }

  if (appState === 'profile-creation') {
    return (
      <ProfileCreation 
        email={userEmail}
        scheduleData={scheduleData}
        onNext={handleProfileCreation} 
        onBack={handleBackToSchedule} 
      />
    );
  }

  if (appState === 'tutor-profile') {
    return (
      <TutorProfile 
        email={userEmail}
        fullName=""
        password=""
        onNext={handleTutorProfile} 
        onBack={handleBackToRole} 
      />
    );
  }

  // Main App Interface - Onboarding Complete Screen
  return (
    <>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto animate-bounce-in">
            <span className="text-3xl">🎓</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Welcome to Campus Connect! ✨
            </h1>
            <p className="text-muted-foreground">
              You're all set! Use the navigation below to explore.
            </p>
          </div>
          
          <div className="glass-card p-4 rounded-2xl space-y-3">
            <h3 className="font-semibold">Quick Tips:</h3>
            <div className="space-y-2 text-sm text-muted-foreground text-left">
              <div className="flex items-start gap-2">
                <span>💫</span>
                <span>Swipe through tutors on <strong>Discover</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span>🔥</span>
                <span>Check campus trends and leaderboards</span>
              </div>
              <div className="flex items-start gap-2">
                <span>💬</span>
                <span>Chat with matched tutors (coming soon)</span>
              </div>
              <div className="flex items-start gap-2">
                <span>🏆</span>
                <span>Build your profile and earn badges</span>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Ready to join Campus Connect?
          </p>
          
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/auth')}
              className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90"
            >
              Sign Up
            </Button>
            <Button
              onClick={() => navigate('/auth')}
              variant="outline"
              className="flex-1"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* AI Agent College Questions Popup */}
      {user && (
        <CollegeQuestionPopup
          isOpen={showQuestionPopup}
          onClose={closeQuestionPopup}
          userId={user.id}
        />
      )}
    </>
  );
};

export default CampusConnectApp;