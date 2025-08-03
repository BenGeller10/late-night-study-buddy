import { useState, useEffect } from "react";
import WelcomeScreen from "./onboarding/WelcomeScreen";
import RoleSelection from "./onboarding/RoleSelection";
import SwipeView from "./discovery/SwipeView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HotTopicsFeed from "./gamification/HotTopicsFeed";
import WeeklyLeaderboard from "./gamification/WeeklyLeaderboard";
import StudyStreak from "./gamification/StudyStreak";
import BadgeDisplay from "./gamification/BadgeDisplay";

type AppState = 'welcome' | 'role-selection' | 'main-app';
type UserRole = 'student' | 'tutor' | null;

const CampusConnectApp = () => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [currentView, setCurrentView] = useState<'swipe' | 'search' | 'chat' | 'profile'>('swipe');

  // Set dark mode on component mount for campus vibes
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleEmailVerification = (email: string) => {
    setUserEmail(email);
    setAppState('role-selection');
  };

  const handleRoleSelection = (role: UserRole) => {
    setUserRole(role);
    setAppState('main-app');
    // Mark onboarding as complete
    localStorage.setItem('campus-connect-onboarded', 'true');
  };

  const handleTutorMatch = (tutorId: string) => {
    console.log('Matched with tutor:', tutorId);
    // Handle tutor match logic
  };

  const handleChat = (tutorId: string) => {
    console.log('Starting chat with tutor:', tutorId);
    setCurrentView('chat');
  };

  const handleBook = (tutorId: string) => {
    console.log('Booking session with tutor:', tutorId);
    // Handle booking logic
  };

  if (appState === 'welcome') {
    return <WelcomeScreen onNext={handleEmailVerification} />;
  }

  if (appState === 'role-selection') {
    return <RoleSelection onSelectRole={handleRoleSelection} />;
  }

  // Main App Interface - Onboarding Complete Screen
  return (
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
          Tap the navigation icons below to get started
        </p>
      </div>
    </div>
  );
};

export default CampusConnectApp;