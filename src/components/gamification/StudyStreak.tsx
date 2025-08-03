import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface StudyStreakProps {
  userId: string;
  compact?: boolean;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_session_week: string | null;
}

const StudyStreak = ({ userId, compact = false }: StudyStreakProps) => {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreakData();
  }, [userId]);

  const fetchStreakData = async () => {
    try {
      const { data, error } = await supabase
        .from('study_streaks')
        .select('current_streak, longest_streak, last_session_week')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setStreakData(data || { current_streak: 0, longest_streak: 0, last_session_week: null });
    } catch (error) {
      console.error('Error fetching streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakMessage = () => {
    const current = streakData?.current_streak || 0;
    if (current >= 7) {
      return "You're on fire! 🔥";
    } else if (current >= 3) {
      return "Great momentum! 💪";
    } else if (current >= 1) {
      return "Keep it going! 📚";
    } else {
      return "Ready to start? ✨";
    }
  };

  const getStreakColor = () => {
    const current = streakData?.current_streak || 0;
    if (current >= 7) return "text-orange-500";
    if (current >= 3) return "text-primary";
    if (current >= 1) return "text-blue-500";
    return "text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="w-full h-16 bg-muted rounded-lg animate-pulse" />
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Flame className={cn("w-4 h-4", getStreakColor())} />
          <span className="font-bold text-sm">{streakData?.current_streak || 0}</span>
        </div>
        <Badge variant="outline" className="text-xs">
          week streak
        </Badge>
      </div>
    );
  }

  return (
    <Card className="glass-card hover:shadow-lg transition-all duration-300 animate-fade-in">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className={cn("w-5 h-5", getStreakColor())} />
              <span className="font-semibold">Study Streak</span>
            </div>
            {(streakData?.current_streak || 0) >= 3 && (
              <Badge className="bg-gradient-primary text-xs animate-bounce-in">
                On Fire! 🔥
              </Badge>
            )}
          </div>

          {/* Main Streak Display */}
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {streakData?.current_streak || 0}
            </div>
            <p className="text-sm text-muted-foreground">
              {(streakData?.current_streak || 0) === 1 ? 'week' : 'weeks'} in a row
            </p>
            <p className="text-xs font-medium">{getStreakMessage()}</p>
          </div>

          {/* Last Session */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              Last session
            </div>
            <p className="text-sm">
              {streakData?.last_session_week 
                ? new Date(streakData.last_session_week).toLocaleDateString()
                : 'No sessions yet'
              }
            </p>
          </div>

          {/* Best Streak */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Best streak</span>
              <span className="font-medium">{streakData?.longest_streak || 0} weeks</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyStreak;