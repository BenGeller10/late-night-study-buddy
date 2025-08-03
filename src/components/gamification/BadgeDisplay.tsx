import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BadgeData {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: 'achievement' | 'streak' | 'rating' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at?: string;
}

interface BadgeDisplayProps {
  badges: BadgeData[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

const BadgeDisplay = ({ badges, maxDisplay = 3, size = 'md', showDescription = false }: BadgeDisplayProps) => {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-sm px-3 py-2';
      default: return 'text-xs px-2.5 py-1.5';
    }
  };

  const getRarityVariant = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'default';
      case 'epic': return 'secondary';
      case 'rare': return 'outline';
      default: return 'secondary';
    }
  };

  if (badges.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        No badges earned yet
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {displayBadges.map((badge) => (
        <div key={badge.id} className="relative group">
          <Badge 
            variant={getRarityVariant(badge.rarity)}
            className={cn(
              getSizeClasses(),
              "animate-bounce-in cursor-pointer transition-all hover:scale-105",
              badge.rarity === 'legendary' && "bg-gradient-primary border-primary/50",
              badge.rarity === 'epic' && "border-accent/50 bg-accent/10"
            )}
          >
            <span className="mr-1">{badge.emoji}</span>
            {badge.name}
          </Badge>
          
          {showDescription && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 w-48 text-sm">
              <p className="font-medium">{badge.name}</p>
              <p className="text-muted-foreground text-xs mt-1">{badge.description}</p>
              {badge.earned_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Earned {new Date(badge.earned_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <Badge variant="outline" className={cn(getSizeClasses(), "text-muted-foreground")}>
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
};

export default BadgeDisplay;