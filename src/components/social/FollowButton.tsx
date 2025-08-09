import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FollowButtonProps {
  targetUserId: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  showText?: boolean;
}

const FollowButton = ({ 
  targetUserId, 
  size = "default", 
  variant = "default",
  showText = true 
}: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId && targetUserId) {
      checkFollowStatus();
    }
  }, [currentUserId, targetUserId]);

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const checkFollowStatus = async () => {
    if (!currentUserId || currentUserId === targetUserId) return;

    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error);
        return;
      }

      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const toggleFollow = async () => {
    if (!currentUserId || currentUserId === targetUserId || isLoading) return;

    setIsLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId);

        if (error) throw error;

        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: "You've unfollowed this user.",
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: currentUserId,
            following_id: targetUserId
          });

        if (error) throw error;

        setIsFollowing(true);
        toast({
          title: "Following!",
          description: "You're now following this user.",
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show follow button for own profile or if not logged in
  if (!currentUserId || currentUserId === targetUserId) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={toggleFollow}
      disabled={isLoading}
      className="btn-smooth"
    >
      {isLoading ? (
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-muted border-t-current" />
      ) : (
        <>
          {isFollowing ? (
            <UserMinus className="w-4 h-4 mr-2" />
          ) : (
            <UserPlus className="w-4 h-4 mr-2" />
          )}
          {showText && (isFollowing ? "Unfollow" : "Follow")}
        </>
      )}
    </Button>
  );
};

export default FollowButton;