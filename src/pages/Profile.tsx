import StudyStreak from "@/components/gamification/StudyStreak";
import BadgeDisplay from "@/components/gamification/BadgeDisplay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Star, BookOpen, Users } from "lucide-react";

const Profile = () => {
  // Mock user data - would come from auth/database in real app
  const user = {
    name: "Alex Chen",
    email: "alex.chen@university.edu",
    avatar: "/placeholder.svg",
    major: "Computer Science",
    year: "Junior",
    role: "Student & Tutor",
    rating: 4.8,
    totalSessions: 24,
    studentsHelped: 12
  };

  const userBadges = [
    {
      id: '1',
      name: 'Help Hero',
      description: 'Completed 10 free tutoring sessions',
      emoji: '👑',
      type: 'achievement' as const,
      rarity: 'epic' as const,
      earned_at: '2024-01-15'
    },
    {
      id: '2',
      name: 'Course Master',
      description: 'Helped 5 students pass finals in CALC 251',
      emoji: '🏆',
      type: 'achievement' as const,
      rarity: 'legendary' as const,
      earned_at: '2024-01-20'
    },
    {
      id: '3',
      name: 'Top-Rated',
      description: 'Received 5-star reviews from 10 different students',
      emoji: '⭐',
      type: 'rating' as const,
      rarity: 'rare' as const,
      earned_at: '2024-01-10'
    },
    {
      id: '4',
      name: 'Late-Night Lifesaver',
      description: 'Helped students during late-night study sessions',
      emoji: '🦉',
      type: 'special' as const,
      rarity: 'rare' as const,
      earned_at: '2024-01-05'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Your campus persona
            </p>
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* User Info Card */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg bg-primary/20 text-primary">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div>
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    📚 {user.major}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    🎓 {user.year}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border/50">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{user.totalSessions}</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 fill-current text-yellow-500" />
                  <span className="text-lg font-bold">{user.rating}</span>
                </div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-accent">{user.studentsHelped}</div>
                <div className="text-xs text-muted-foreground">Helped</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Streak */}
        <StudyStreak />
        
        {/* Achievements */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeDisplay 
              badges={userBadges}
              showDescription={true}
              size="md"
              maxDisplay={6}
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-16 flex-col gap-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm">My Classes</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Users className="w-5 h-5" />
            <span className="text-sm">Study Groups</span>
          </Button>
        </div>

        {/* Coming Soon */}
        <div className="text-center space-y-2 py-8">
          <span className="text-4xl">🚧</span>
          <h3 className="text-lg font-semibold">More Features Coming Soon!</h3>
          <p className="text-muted-foreground text-sm">
            Detailed analytics, custom themes, and advanced settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;