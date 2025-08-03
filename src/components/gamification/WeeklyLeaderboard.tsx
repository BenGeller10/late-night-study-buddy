import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  rank: number;
  tutor_name: string;
  tutor_avatar?: string;
  sessions_count: number;
  rating: number;
  badges: string[];
}

const WeeklyLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Get weekly session data - would need proper query in real app
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // For now, use mock data since we don't have profiles/sessions set up yet
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          rank: 1,
          tutor_name: "Alex Chen",
          tutor_avatar: "/placeholder.svg",
          sessions_count: 12,
          rating: 4.9,
          badges: ["🏆", "⭐", "👑"]
        },
        {
          rank: 2,
          tutor_name: "Sarah Martinez",
          tutor_avatar: "/placeholder.svg",
          sessions_count: 10,
          rating: 4.8,
          badges: ["🏆", "⭐"]
        },
        {
          rank: 3,
          tutor_name: "Jordan Kim",
          tutor_avatar: "/placeholder.svg",
          sessions_count: 8,
          rating: 4.7,
          badges: ["🦉", "⭐"]
        },
        {
          rank: 4,
          tutor_name: "Maya Patel",
          tutor_avatar: "/placeholder.svg",
          sessions_count: 7,
          rating: 4.9,
          badges: ["👑", "⭐"]
        },
        {
          rank: 5,
          tutor_name: "Chris Thompson",
          tutor_avatar: "/placeholder.svg",
          sessions_count: 6,
          rating: 4.6,
          badges: ["🏆"]
        }
      ];

      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 2: return <Trophy className="w-4 h-4 text-gray-400" />;
      case 3: return <Trophy className="w-4 h-4 text-amber-600" />;
      default: return <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{rank}</div>;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1: return 'default';
      case 2: return 'secondary';
      case 3: return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Weekly Champions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted/50 rounded-full animate-pulse" />
                <div className="flex-1 h-4 bg-muted/50 rounded animate-pulse" />
                <div className="w-16 h-4 bg-muted/50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          Weekly Champions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div 
              key={entry.rank}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(entry.rank)}
                </div>
                
                <Avatar className="w-8 h-8">
                  <AvatarImage src={entry.tutor_avatar} alt={entry.tutor_name} />
                  <AvatarFallback className="text-xs bg-primary/20 text-primary">
                    {entry.tutor_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {entry.tutor_name}
                    </span>
                    <div className="flex gap-1">
                      {entry.badges.slice(0, 2).map((badge, i) => (
                        <span key={i} className="text-sm">{badge}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 fill-current text-yellow-500" />
                    {entry.rating}
                  </div>
                </div>
              </div>
              
              <Badge variant={getRankBadgeVariant(entry.rank)} className="text-xs">
                {entry.sessions_count} sessions
              </Badge>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Top tutors by sessions completed this week
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyLeaderboard;