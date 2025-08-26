import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Flame, Zap, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface StudyStreakProps {
  userId?: string;
  compact?: boolean;
}

const StudyStreak = ({ userId, compact = false }: StudyStreakProps) => {
  const { toast } = useToast();
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    weeklyGoal: 2,
    completedThisWeek: 0,
    isOnFire: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [weekCalendar, setWeekCalendar] = useState<Array<{date: string, completed: boolean}>>([]);

  // Helper functions for streak calculations
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Adjust to start from Sunday
    return new Date(d.setDate(diff));
  };

  const getWeekKey = (date: Date): string => {
    const weekStart = getWeekStart(date);
    return weekStart.toISOString().split('T')[0];
  };

  const calculateWeeklyBookings = (sessions: Array<{scheduled_at: string}>): Record<string, number> => {
    const weeklyBookings: Record<string, number> = {};
    
    sessions.forEach(session => {
      const sessionDate = new Date(session.scheduled_at);
      const weekKey = getWeekKey(sessionDate);
      weeklyBookings[weekKey] = (weeklyBookings[weekKey] || 0) + 1;
    });
    
    return weeklyBookings;
  };

  const calculateCurrentStreak = (weeklyBookings: Record<string, number>): number => {
    const sortedWeeks = Object.keys(weeklyBookings).sort().reverse();
    let streak = 0;
    const currentWeek = getWeekKey(new Date());
    
    for (const week of sortedWeeks) {
      if (weeklyBookings[week] >= 1) { // At least 1 session per week counts as streak
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateLongestStreak = (weeklyBookings: Record<string, number>): number => {
    const sortedWeeks = Object.keys(weeklyBookings).sort();
    let longestStreak = 0;
    let currentStreak = 0;
    
    for (const week of sortedWeeks) {
      if (weeklyBookings[week] >= 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return longestStreak;
  };

  const getThisWeekBookings = (sessions: Array<{scheduled_at: string}>): number => {
    const currentWeek = getWeekKey(new Date());
    return sessions.filter(session => 
      getWeekKey(new Date(session.scheduled_at)) === currentWeek
    ).length;
  };

  const generateWeekCalendar = (sessions: Array<{scheduled_at: string}>) => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const startOfWeek = getWeekStart(today);
    
    const calendar = daysOfWeek.map((dayName, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      
      // Check if there's a session on this day
      const hasSession = sessions.some(session => {
        const sessionDate = new Date(session.scheduled_at);
        return sessionDate.toDateString() === date.toDateString();
      });
      
      return {
        date: dayName,
        completed: hasSession
      };
    });
    
    setWeekCalendar(calendar);
  };

  const updateStreakInDatabase = async (userId: string, currentStreak: number, longestStreak: number): Promise<void> => {
    try {
      const { error } = await supabase
        .from('study_streaks')
        .upsert({
          user_id: userId,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_session_week: getWeekKey(new Date()),
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
    } catch (error) {
      console.error('Error updating streak in database:', error);
    }
  };

  useEffect(() => {
    const fetchStreakData = async () => {
      if (!userId) return;
      
      try {
        // Fetch sessions data to calculate streak based on actual bookings
        const { data: sessions, error } = await supabase
          .from('sessions')
          .select('scheduled_at, status')
          .eq('student_id', userId)
          .in('status', ['confirmed', 'completed'])
          .order('scheduled_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching sessions data:', error);
          return;
        }
        
        if (!sessions || sessions.length === 0) {
          // No sessions booked yet - show empty state
          setStreakData({
            currentStreak: 0,
            longestStreak: 0,
            weeklyGoal: 2,
            completedThisWeek: 0,
            isOnFire: false
          });
          
          // Generate empty calendar
          const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const emptyCalendar = daysOfWeek.map(day => ({ date: day, completed: false }));
          setWeekCalendar(emptyCalendar);
          
          setIsLoading(false);
          return;
        }

        // Calculate streak based on weekly bookings
        const now = new Date();
        const weeklyBookings = calculateWeeklyBookings(sessions);
        const currentStreak = calculateCurrentStreak(weeklyBookings);
        const longestStreak = calculateLongestStreak(weeklyBookings);
        const thisWeekBookings = getThisWeekBookings(sessions);
        
        setStreakData({
          currentStreak,
          longestStreak,
          weeklyGoal: 2,
          completedThisWeek: thisWeekBookings,
          isOnFire: currentStreak >= 3
        });

        // Generate calendar based on actual sessions
        generateWeekCalendar(sessions);

        // Update the database with calculated streak
        await updateStreakInDatabase(userId, currentStreak, longestStreak);
        
      } catch (error) {
        console.error('Error fetching streak data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreakData();
  }, [userId]);

  const resetStreak = async () => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('study_streaks')
        .update({
          current_streak: 0,
          last_session_week: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (error) throw error;
      
      setStreakData(prev => ({
        ...prev,
        currentStreak: 0,
        isOnFire: false
      }));
      
      toast({
        title: "Streak Reset",
        description: "Your study streak has been reset to 0.",
      });
    } catch (error) {
      console.error('Error resetting streak:', error);
      toast({
        title: "Error",
        description: "Failed to reset streak. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStreakMessage = () => {
    if (streakData.currentStreak === 0) {
      return "Book your first session! 📅";
    } else if (streakData.currentStreak >= 7) {
      return "Incredible dedication! 🔥";
    } else if (streakData.currentStreak >= 3) {
      return "Great consistency! 💪";
    } else if (streakData.currentStreak >= 1) {
      return "Keep booking! 📚";
    } else {
      return "Ready to start? ✨";
    }
  };

  const getStreakColor = () => {
    if (streakData.currentStreak >= 7) return "text-orange-500";
    if (streakData.currentStreak >= 3) return "text-accent";
    if (streakData.currentStreak >= 1) return "text-primary";
    return "text-muted-foreground";
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Flame className={cn("w-4 h-4", getStreakColor())} />
          <span className="font-bold text-sm">{streakData.currentStreak}</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {streakData.completedThisWeek}/{streakData.weeklyGoal} this week
        </Badge>
      </div>
    );
  }

  return (
    <Card className="glass-card hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className={cn("w-5 h-5", getStreakColor())} />
              <span className="font-semibold">Booking Streak</span>
            </div>
            {streakData.isOnFire && (
              <Badge className="bg-gradient-primary text-xs animate-bounce-in">
                On Fire! 🔥
              </Badge>
            )}
          </div>

          {/* Main Streak Display */}
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {streakData.currentStreak}
            </div>
            <p className="text-sm text-muted-foreground">
              {streakData.currentStreak === 1 ? 'week' : 'weeks'} of sessions
            </p>
            <p className="text-xs font-medium">{getStreakMessage()}</p>
          </div>

          {/* Week Calendar */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              Sessions this week
            </div>
            <div className="flex gap-1 justify-between">
              {weekCalendar.map((day, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div className="text-xs text-muted-foreground">{day.date}</div>
                  <div 
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all",
                      day.completed 
                        ? "bg-primary border-primary" 
                        : "border-muted-foreground/30"
                    )}
                  >
                    {day.completed && (
                      <div className="w-full h-full flex items-center justify-center">
                        <Zap className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Weekly goal</span>
              <span className="font-medium">
                {streakData.completedThisWeek}/{streakData.weeklyGoal}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, (streakData.completedThisWeek / streakData.weeklyGoal) * 100)}%` 
                }}
              />
            </div>
          </div>

          {/* Best Streak */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Best streak</span>
              <span className="font-medium">{streakData.longestStreak} weeks</span>
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-2 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={resetStreak}
              className="w-full text-xs gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Streak
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyStreak;