import StudyStreak from "@/components/gamification/StudyStreak";
import BadgeDisplay from "@/components/gamification/BadgeDisplay";
import PageTransition from "@/components/layout/PageTransition";
import SettingsDialog from "@/components/settings/SettingsDialog";
import MySessions from "@/pages/profile/MySessions";
import StudyMaterials from "@/pages/profile/StudyMaterials";
import StudyGroups from "@/pages/profile/StudyGroups";
import Earnings from "@/pages/profile/Earnings";
import MySubjects from "@/pages/profile/MySubjects";
import Students from "@/pages/profile/Students";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Settings, Star, BookOpen, Users, DollarSign, Clock, Calendar, Target, TrendingUp, Award, Search, MessageCircle, FileText, GraduationCap, Calendar as CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type SubPage = 'hub' | 'my-sessions' | 'study-materials' | 'study-groups' | 'earnings' | 'my-subjects' | 'students' | 'set-availability';

const Profile = () => {
  const [currentPage, setCurrentPage] = useState<SubPage>('hub');
  const [isTutor, setIsTutor] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
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
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleRoleSwitch = async (newRole: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_tutor: newRole })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsTutor(newRole);
      setUser({ ...user, is_tutor: newRole });
      toast({
        title: `Switched to ${newRole ? 'Tutor' : 'Student'} mode`,
        description: `You're now viewing the ${newRole ? 'tutor' : 'student'} interface.`,
      });
    } catch (error: any) {
      toast({
        title: "Error switching roles",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleNavigation = (page: SubPage) => {
    if (page === 'set-availability') {
      navigate('/set-availability');
      return;
    }
    setCurrentPage(page);
  };

  const handleBackToHub = () => {
    setCurrentPage('hub');
  };

  // Render sub-pages
  if (currentPage !== 'hub') {
    switch (currentPage) {
      case 'my-sessions':
        return <MySessions user={user} onBack={handleBackToHub} />;
      case 'study-materials':
        return <StudyMaterials user={user} onBack={handleBackToHub} />;
      case 'study-groups':
        return <StudyGroups user={user} onBack={handleBackToHub} />;
      case 'earnings':
        return <Earnings user={user} onBack={handleBackToHub} />;
      case 'my-subjects':
        return <MySubjects user={user} onBack={handleBackToHub} />;
      case 'students':
        return <Students user={user} onBack={handleBackToHub} />;
      default:
        return null;
    }
  }

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

  const mockData = {
    major: user?.major || "Computer Science",
    year: user?.year || "Junior",
    sessionsAttended: 18,
    subjectsStudied: 4,
    hoursLearned: 45,
    sessionsTaught: 24,
    studentsHelped: 12,
    hoursTeaching: 68,
    earnings: 1420,
    rating: 4.8
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20 animate-fade-in">
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
            <SettingsDialog user={user} onUserUpdate={setUser} />
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
            <>
              {/* Tutor Navigation Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-sky-200 hover:border-sky-300 hover-scale"
                  onClick={() => handleNavigation('set-availability')}
                >
                  <CalendarIcon className="w-6 h-6 text-sky-600" />
                  <span className="text-sm font-medium">Set Availability</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-green-200 hover:border-green-300 hover-scale"
                  onClick={() => handleNavigation('earnings')}
                >
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium">Earnings</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-blue-200 hover:border-blue-300 hover-scale"
                  onClick={() => handleNavigation('my-subjects')}
                >
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium">My Subjects</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-orange-200 hover:border-orange-300 hover-scale"
                  onClick={() => handleNavigation('students')}
                >
                  <Users className="w-6 h-6 text-orange-600" />
                  <span className="text-sm font-medium">Students</span>
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Learning Progress */}
              <Card className="glass-card border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
                    <GraduationCap className="w-5 h-5" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Calculus II</span>
                      <span className="text-muted-foreground">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Student Navigation Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-blue-200 hover:border-blue-300 hover-scale"
                  onClick={() => navigate('/discover')}
                >
                  <Search className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium">Find Tutors</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-green-200 hover:border-green-300 hover-scale"
                  onClick={() => handleNavigation('my-sessions')}
                >
                  <Calendar className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium">My Sessions</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-orange-200 hover:border-orange-300 hover-scale"
                  onClick={() => handleNavigation('study-materials')}
                >
                  <FileText className="w-6 h-6 text-orange-600" />
                  <span className="text-sm font-medium">Study Materials</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-purple-200 hover:border-purple-300 hover-scale"
                  onClick={() => handleNavigation('study-groups')}
                >
                  <Users className="w-6 h-6 text-purple-600" />
                  <span className="text-sm font-medium">Study Groups</span>
                </Button>
              </div>
            </>
          )}

          <StudyStreak />
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;