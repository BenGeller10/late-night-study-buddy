import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyStreakProps {
  userId?: string;
  compact?: boolean;
}

const StudyStreak = ({ userId, compact = false }: StudyStreakProps) => {
  const [streakData, setStreakData] = useState({
    currentStreak: 3,
    longestStreak: 7,
    weeklyGoal: 2,
    completedThisWeek: 3,
    isOnFire: true
  });

  // Mock streak calendar data (last 7 days)
  const streakCalendar = [
    { date: 'Mon', completed: true },
    { date: 'Tue', completed: true },
    { date: 'Wed', completed: false },
    { date: 'Thu', completed: true },
    { date: 'Fri', completed: true },
    { date: 'Sat', completed: true },
    { date: 'Sun', completed: false }
  ];

  const getStreakMessage = () => {
    if (streakData.currentStreak >= 7) {
      return "You're on fire! 🔥";
    } else if (streakData.currentStreak >= 3) {
      return "Great momentum! 💪";
    } else if (streakData.currentStreak >= 1) {
      return "Keep it going! 📚";
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className={cn("w-5 h-5", getStreakColor())} />
              <span className="font-semibold">Study Streak</span>
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
              {streakData.currentStreak === 1 ? 'week' : 'weeks'} in a row
            </p>
            <p className="text-xs font-medium">{getStreakMessage()}</p>
          </div>

          {/* Week Calendar */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              This week
            </div>
            <div className="flex gap-1 justify-between">
              {streakCalendar.map((day, index) => (
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
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyStreak;