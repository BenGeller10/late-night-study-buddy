import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserPlus, UserMinus, Edit, Check, X, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FollowUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  is_tutor: boolean;
}

interface Profile {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  gpa: number;
  show_gpa: boolean;
  is_tutor: boolean;
  followers_count: number;
  following_count: number;
  graduation_year: number;
}

interface SocialProfileProps {
  userId: string;
  viewingUserId?: string; // If viewing another user's profile
}

const SocialProfile = ({ userId, viewingUserId }: SocialProfileProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const { toast } = useToast();

  const targetUserId = viewingUserId || userId; // User being viewed
  const isOwnProfile = !viewingUserId || viewingUserId === userId;

  useEffect(() => {
    fetchProfile();
    if (!isOwnProfile) {
      checkFollowingStatus();
    }
  }, [targetUserId, userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error) throw error;
      setProfile(data);
      setEditedUsername(data.username || "");
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const checkFollowingStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', userId)
        .eq('following_id', targetUserId)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      // Not following if no record found
      setIsFollowing(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          profiles!user_follows_follower_id_fkey (
            user_id,
            username,
            display_name,
            avatar_url,
            is_tutor
          )
        `)
        .eq('following_id', targetUserId);

      if (error) throw error;
      setFollowers(data?.map(item => item.profiles).filter(Boolean) || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          profiles!user_follows_following_id_fkey (
            user_id,
            username,
            display_name,
            avatar_url,
            is_tutor
          )
        `)
        .eq('follower_id', targetUserId);

      if (error) throw error;
      setFollowing(data?.map(item => item.profiles).filter(Boolean) || []);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', userId)
          .eq('following_id', targetUserId);
        
        setIsFollowing(false);
        toast({ title: "Unfollowed!", description: "You're no longer following this user." });
      } else {
        // Follow
        await supabase
          .from('user_follows')
          .insert({
            follower_id: userId,
            following_id: targetUserId
          });
        
        setIsFollowing(true);
        toast({ title: "Following! 👋", description: "You're now following this user." });
      }
      
      fetchProfile(); // Refresh to update counts
    } catch (error: any) {
      console.error('Error handling follow:', error);
      toast({
        title: "Oops! 😅",
        description: "Something went wrong. Try again?",
        variant: "destructive"
      });
    }
  };

  const handleSaveUsername = async () => {
    if (!editedUsername.trim() || editedUsername.length < 8) {
      toast({
        title: "Username too short! 📏",
        description: "Usernames must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: editedUsername.trim() })
        .eq('user_id', userId);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Username taken! 😬",
            description: "Someone beat you to it. Try another one?",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      setIsEditing(false);
      fetchProfile();
      toast({
        title: "Username updated! ✨",
        description: "Looking good with that new handle!"
      });
    } catch (error: any) {
      console.error('Error updating username:', error);
      toast({
        title: "Couldn't update! 😅",
        description: "Try again in a moment.",
        variant: "destructive"
      });
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-lg">
                  {profile.display_name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div>
                  <h2 className="text-xl font-bold">{profile.display_name}</h2>
                  
                  {/* Username editing */}
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">@</span>
                        <Input
                          value={editedUsername}
                          onChange={(e) => setEditedUsername(e.target.value)}
                          className="h-7 w-32 text-sm"
                          placeholder="username"
                        />
                        <Button size="sm" variant="ghost" onClick={handleSaveUsername}>
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          @{profile.username || "not-set"}
                        </span>
                        {isOwnProfile && (
                          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex gap-2">
                  {profile.is_tutor && (
                    <Badge className="bg-gradient-primary text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Tutor
                    </Badge>
                  )}
                  {profile.graduation_year && (
                    <Badge variant="secondary">
                      Class of {profile.graduation_year}
                    </Badge>
                  )}
                  {profile.show_gpa && profile.gpa && (
                    <Badge variant="outline">
                      {profile.gpa.toFixed(2)} GPA
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Follow button for other profiles */}
            {!isOwnProfile && (
              <Button
                onClick={handleFollow}
                variant={isFollowing ? "outline" : "default"}
                className={isFollowing ? "" : "bg-gradient-primary hover:bg-gradient-primary/90"}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Bio */}
          {profile.bio && (
            <p className="text-muted-foreground mb-4">{profile.bio}</p>
          )}

          {/* Social stats */}
          <div className="flex gap-6">
            <Dialog open={showFollowers} onOpenChange={setShowFollowers}>
              <DialogTrigger asChild>
                <button 
                  className="text-left hover:text-primary transition-colors"
                  onClick={fetchFollowers}
                >
                  <div className="font-bold">{profile.followers_count}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Followers</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {followers.map((follower) => (
                    <div key={follower.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <Avatar>
                        <AvatarImage src={follower.avatar_url} />
                        <AvatarFallback>{follower.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{follower.display_name}</div>
                        <div className="text-sm text-muted-foreground">@{follower.username}</div>
                      </div>
                      {follower.is_tutor && (
                        <Badge variant="secondary" className="text-xs">Tutor</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showFollowing} onOpenChange={setShowFollowing}>
              <DialogTrigger asChild>
                <button 
                  className="text-left hover:text-primary transition-colors"
                  onClick={fetchFollowing}
                >
                  <div className="font-bold">{profile.following_count}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Following</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {following.map((followed) => (
                    <div key={followed.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <Avatar>
                        <AvatarImage src={followed.avatar_url} />
                        <AvatarFallback>{followed.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{followed.display_name}</div>
                        <div className="text-sm text-muted-foreground">@{followed.username}</div>
                      </div>
                      {followed.is_tutor && (
                        <Badge variant="secondary" className="text-xs">Tutor</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialProfile;