import StudyStreak from "@/components/gamification/StudyStreak";
import BadgeDisplay from "@/components/gamification/BadgeDisplay";
import PageTransition from "@/components/layout/PageTransition";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Star, BookOpen, Users, DollarSign, Clock, Calendar, Target, TrendingUp, Award, Search, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [isTutor, setIsTutor] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user data and role from database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching user data...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session:', session);
        
        if (session?.user) {
          console.log('User found, fetching profile...');
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          console.log('Profile data:', profile);
          console.log('Profile error:', error);
          
          if (profile) {
            setIsTutor(profile.is_tutor || false);
            setUser({
              id: session.user.id,
              email: session.user.email,
              display_name: profile.display_name,
              avatar_url: profile.avatar_url,
              is_tutor: profile.is_tutor,
              venmo_handle: profile.venmo_handle,
              bio: profile.bio,
              campus: profile.campus,
              major: profile.major,
              year: profile.year
            });
          } else {
            console.log('No profile found, using user data only');
            setUser({
              id: session.user.id,
              email: session.user.email,
              display_name: session.user.user_metadata?.full_name || session.user.email,
              avatar_url: session.user.user_metadata?.avatar_url || '',
              is_tutor: false
            });
          }
        } else {
          console.log('No session found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle role switching
  const handleRoleSwitch = async (newRole: boolean) => {
    if (!user) {
      console.log('No user found for role switch');
      return;
    }

    console.log('Switching role to:', newRole ? 'tutor' : 'student');
    console.log('Current user:', user);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_tutor: newRole })
        .eq('user_id', user.id)
        .select();

      console.log('Update result:', { data, error });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      setIsTutor(newRole);
      toast({
        title: `Switched to ${newRole ? 'Tutor' : 'Student'} mode`,
        description: `You're now viewing the ${newRole ? 'tutor' : 'student'} interface.`,
      });
    } catch (error: any) {
      console.error('Role switch error:', error);
      toast({
        title: "Error switching roles",
        description: error.message || "Failed to update role. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!user) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
        </div>
      </PageTransition>
    );
  }

  // Mock additional data - in real app would come from database
  const mockData = {
    major: "Computer Science",
    year: "Junior",
    // Student stats
    sessionsAttended: 18,
    subjectsStudied: 4,
    hoursLearned: 45,
    // Tutor stats
    sessionsTaught: 24,
    studentsHelped: 12,
    hoursTeaching: 68,
    earnings: 1420,
    rating: 4.8
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
    <PageTransition>
      <div className="min-h-screen bg-background pb-20"> {/* Added bottom padding for navigation */}
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
        
        {/* Role Toggle */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center gap-3 p-3 bg-card/50 rounded-lg border border-border/50">
            <Label htmlFor="role-toggle" className={`text-sm font-medium ${!isTutor ? 'text-primary' : 'text-muted-foreground'}`}>
              📚 Student
            </Label>
            <Switch
              id="role-toggle"
              checked={isTutor}
              onCheckedChange={handleRoleSwitch}
            />
            <Label htmlFor="role-toggle" className={`text-sm font-medium ${isTutor ? 'text-primary' : 'text-muted-foreground'}`}>
              🧠 Tutor
            </Label>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* User Info Card */}
        <Card className="glass-card">
          <CardContent className="p-6">
             <div className="flex items-start gap-4">
               <Avatar className="w-16 h-16">
                 <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.display_name || "User"} />
                 <AvatarFallback className="text-lg bg-primary/20 text-primary">
                   {(user.display_name || user.email || "U").split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                 </AvatarFallback>
               </Avatar>
              
               <div className="flex-1 space-y-2">
                 <div>
                   <h2 className="text-xl font-bold">{user.display_name || "User"}</h2>
                   <p className="text-sm text-muted-foreground">{user.email}</p>
                 </div>
                 
                 <div className="flex flex-wrap gap-2">
                   <Badge variant="outline" className="text-xs">
                     📚 {mockData.major}
                   </Badge>
                   <Badge variant="outline" className="text-xs">
                     🎓 {mockData.year}
                   </Badge>
                   <Badge variant="secondary" className="text-xs">
                     {isTutor ? 'Tutor' : 'Student'}
                   </Badge>
                 </div>
               </div>
            </div>
            
            {isTutor ? (
              /* Tutor Stats */
               <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-border/50">
                 <div className="text-center">
                   <div className="text-lg font-bold text-primary">{mockData.sessionsTaught}</div>
                   <div className="text-xs text-muted-foreground">Sessions</div>
                 </div>
                 <div className="text-center">
                   <div className="flex items-center justify-center gap-1">
                     <Star className="w-3 h-3 fill-current text-yellow-500" />
                     <span className="text-lg font-bold">{mockData.rating}</span>
                   </div>
                   <div className="text-xs text-muted-foreground">Rating</div>
                 </div>
                 <div className="text-center">
                   <div className="text-lg font-bold text-accent">{mockData.studentsHelped}</div>
                   <div className="text-xs text-muted-foreground">Students</div>
                 </div>
                 <div className="text-center">
                   <div className="text-lg font-bold text-green-500">${mockData.earnings}</div>
                   <div className="text-xs text-muted-foreground">Earned</div>
                 </div>
               </div>
            ) : (
              /* Student Stats */
               <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border/50">
                 <div className="text-center">
                   <div className="text-lg font-bold text-primary">{mockData.sessionsAttended}</div>
                   <div className="text-xs text-muted-foreground">Sessions</div>
                 </div>
                 <div className="text-center">
                   <div className="text-lg font-bold text-accent">{mockData.subjectsStudied}</div>
                   <div className="text-xs text-muted-foreground">Subjects</div>
                 </div>
                 <div className="text-center">
                   <div className="text-lg font-bold text-blue-500">{mockData.hoursLearned}h</div>
                   <div className="text-xs text-muted-foreground">Learned</div>
                 </div>
               </div>
            )}
          </CardContent>
        </Card>

        {isTutor ? (
          /* TUTOR INTERFACE */
          <>
            {/* Teaching Overview */}
            <Card className="glass-card border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Award className="w-5 h-5" />
                  Teaching Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <div className="flex items-center gap-2 text-sm">
                       <Clock className="w-4 h-4 text-muted-foreground" />
                       <span>Hours Teaching: <strong>{mockData.hoursTeaching}</strong></span>
                     </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span>This Month: <strong>12 sessions</strong></span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span>Success Rate: <strong>94%</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="w-4 h-4 text-muted-foreground" />
                      <span>Response Time: <strong>5 min</strong></span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tutor Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-16 flex-col gap-2 border-purple-200 hover:border-purple-300">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm">Set Availability</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2 border-green-200 hover:border-green-300">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm">Earnings</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2 border-blue-200 hover:border-blue-300">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="text-sm">My Subjects</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2 border-orange-200 hover:border-orange-300">
                <Users className="w-5 h-5 text-orange-600" />
                <span className="text-sm">Students</span>
              </Button>
            </div>

            {/* Tutor Achievements */}
            <Card className="glass-card border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                  <span className="text-lg">🏆</span>
                  Teaching Achievements
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

            {/* Tutor Coming Soon */}
            <div className="text-center space-y-2 py-8">
              <span className="text-4xl">👨‍🏫</span>
              <h3 className="text-lg font-semibold">Tutor Dashboard Expanding!</h3>
              <p className="text-muted-foreground text-sm">
                Student feedback, advanced scheduling, and payment tracking
              </p>
            </div>
          </>
        ) : (
          /* STUDENT INTERFACE */
          <>
            {/* Study Progress */}
            <StudyStreak />

            {/* Learning Path */}
            <Card className="glass-card border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Target className="w-5 h-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Calculus II</span>
                    <span className="text-xs text-muted-foreground">85% complete</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Organic Chemistry</span>
                    <span className="text-xs text-muted-foreground">62% complete</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-16 flex-col gap-2 border-blue-200 hover:border-blue-300">
                <Search className="w-5 h-5 text-blue-600" />
                <span className="text-sm">Find Tutors</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2 border-green-200 hover:border-green-300">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="text-sm">My Sessions</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2 border-purple-200 hover:border-purple-300">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span className="text-sm">Study Materials</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2 border-orange-200 hover:border-orange-300">
                <Users className="w-5 h-5 text-orange-600" />
                <span className="text-sm">Study Groups</span>
              </Button>
            </div>

            {/* Student Achievements */}
            <Card className="glass-card border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <span className="text-lg">🎯</span>
                  Learning Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BadgeDisplay 
                  badges={userBadges.filter(badge => ['Help Hero', 'Top-Rated'].includes(badge.name))}
                  showDescription={true}
                  size="md"
                  maxDisplay={4}
                />
              </CardContent>
            </Card>

            {/* Student Coming Soon */}
            <div className="text-center space-y-2 py-8">
              <span className="text-4xl">🎓</span>
              <h3 className="text-lg font-semibold">Student Hub Growing!</h3>
              <p className="text-muted-foreground text-sm">
                Study plans, grade tracking, and personalized recommendations
              </p>
            </div>
          </>
        )}
      </div>
      </div>
    </PageTransition>
  );
};

export default Profile;