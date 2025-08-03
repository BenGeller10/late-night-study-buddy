import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at?: string;
}

interface BadgeDisplayProps {
  userId: string;
  limit?: number;
  showAll?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const BadgeDisplay = ({ userId, limit = 3, showAll = false, size = 'md' }: BadgeDisplayProps) => {
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserBadges();
  }, [userId]);

  const fetchUserBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          earned_at,
          badges (
            id,
            name,
            description,
            icon
          )
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      const badgeList = data?.map(item => ({
        id: item.badges.id,
        name: item.badges.name,
        description: item.badges.description,
        icon: item.badges.icon,
        earned_at: item.earned_at
      })) || [];

      setBadges(showAll ? badgeList : badgeList.slice(0, limit));
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-sm px-3 py-2';
      default: return 'text-xs px-2.5 py-1.5';
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-10 h-10 bg-muted rounded-full animate-pulse" />
        ))}
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No badges earned yet!</p>
        <p className="text-xs text-muted-foreground">Complete sessions to earn badges 🎯</p>
      </div>
    );
  }

  if (showAll) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {badges.map((badge) => (
          <Card key={badge.id} className="p-4 text-center hover:bg-muted/50 transition-colors animate-fade-in">
            <div className="text-3xl mb-2">{badge.icon}</div>
            <h4 className="font-semibold text-sm">{badge.name}</h4>
            <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
            {badge.earned_at && (
              <p className="text-xs text-primary mt-2">
                Earned {new Date(badge.earned_at).toLocaleDateString()}
              </p>
            )}
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {badges.map((badge) => (
        <Badge 
          key={badge.id} 
          variant="secondary" 
          className={cn(
            getSizeClasses(),
            "animate-fade-in cursor-pointer transition-all hover:scale-105",
            "bg-gradient-primary/10 text-primary border-primary/20 hover:bg-gradient-primary/20"
          )}
          title={`${badge.name}: ${badge.description}`}
        >
          <span className="text-sm mr-1">{badge.icon}</span>
          <span className="hidden sm:inline">{badge.name}</span>
        </Badge>
      ))}
      {badges.length >= limit && !showAll && (
        <Badge variant="outline" className={cn(getSizeClasses(), "text-muted-foreground")}>
          +{badges.length - limit} more
        </Badge>
      )}
    </div>
  );
};

export default BadgeDisplay;