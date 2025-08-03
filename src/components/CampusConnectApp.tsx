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

  // Main App Interface
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="glass-card mx-4 mt-4 p-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-lg">🎓</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">Campus Connect</h1>
              <p className="text-xs text-muted-foreground">
                {userRole === 'student' ? 'Find your tutor' : 'Help students ace it'} ✨
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {userRole === 'student' ? '📚 Student' : '🧠 Tutor'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center my-4">
        <div className="glass-card p-2 rounded-2xl">
          <div className="flex space-x-2">
            <Button
              variant={currentView === 'swipe' ? 'campus' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('swipe')}
              className="rounded-xl"
            >
              💫 Discover
            </Button>
            <Button
              variant={currentView === 'search' ? 'campus' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('search')}
              className="rounded-xl"
            >
              🔍 Search
            </Button>
            <Button
              variant={currentView === 'chat' ? 'campus' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('chat')}
              className="rounded-xl"
            >
              💬 Chats
            </Button>
            <Button
              variant={currentView === 'profile' ? 'campus' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('profile')}
              className="rounded-xl"
            >
              👤 Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {currentView === 'swipe' && (
          <div className="space-y-4 px-4">
            {/* Gamification Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <HotTopicsFeed />
              <WeeklyLeaderboard />
            </div>
            
            {/* Main Swipe Interface */}
            <SwipeView
              onTutorMatch={handleTutorMatch}
              onChat={handleChat}
              onBook={handleBook}
            />
          </div>
        )}
        
        {currentView === 'search' && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center space-y-4">
              <span className="text-6xl">🔍</span>
              <h3 className="text-xl font-semibold">Search Coming Soon!</h3>
              <p className="text-muted-foreground">
                Quick search for specific classes and subjects
              </p>
            </div>
          </div>
        )}

        {currentView === 'chat' && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center space-y-4">
              <span className="text-6xl">💬</span>
              <h3 className="text-xl font-semibold">Messages Coming Soon!</h3>
              <p className="text-muted-foreground">
                GroupMe-style chat with your tutors
              </p>
            </div>
          </div>
        )}

        {currentView === 'profile' && (
          <div className="space-y-4 p-4">
            {/* Study Streak Widget */}
            <StudyStreak />
            
            {/* User Badges */}
            <div className="glass-card p-4 rounded-2xl">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-lg">🏆</span>
                Your Achievements
              </h3>
              <BadgeDisplay 
                badges={[
                  {
                    id: '1',
                    name: 'Help Hero',
                    description: 'Completed 10 free tutoring sessions',
                    emoji: '👑',
                    type: 'achievement',
                    rarity: 'epic',
                    earned_at: '2024-01-15'
                  },
                  {
                    id: '2',
                    name: 'Course Master',
                    description: 'Helped 5 students pass finals in CALC 251',
                    emoji: '🏆',
                    type: 'achievement',
                    rarity: 'legendary',
                    earned_at: '2024-01-20'
                  },
                  {
                    id: '3',
                    name: 'Top-Rated',
                    description: 'Received 5-star reviews from 10 different students',
                    emoji: '⭐',
                    type: 'rating',
                    rarity: 'rare',
                    earned_at: '2024-01-10'
                  }
                ]}
                showDescription={true}
                size="md"
              />
            </div>
            
            <div className="text-center space-y-2 py-8">
              <span className="text-4xl">🚧</span>
              <h3 className="text-lg font-semibold">More Profile Features Coming Soon!</h3>
              <p className="text-muted-foreground text-sm">
                Settings, stats, and more customization options
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Safe Area */}
      <div className="h-6" />
    </div>
  );
};

export default CampusConnectApp;