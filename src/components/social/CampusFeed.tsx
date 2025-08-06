import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share, Plus, Clock, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface CampusPost {
  id: string;
  content: string;
  image_url?: string;
  post_type: 'post' | 'story';
  created_at: string;
  expires_at?: string;
  user: {
    username: string;
    display_name: string;
    avatar_url: string;
    is_tutor: boolean;
  };
  reactions: { emoji: string; count: number }[];
  user_reaction?: string;
}

interface CampusFeedProps {
  userId: string;
}

const reactionEmojis = ['🔥', '😂', '😳', '💯', '👀', '✨'];

const CampusFeed = ({ userId }: CampusFeedProps) => {
  const [posts, setPosts] = useState<CampusPost[]>([]);
  const [stories, setStories] = useState<CampusPost[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('campus_posts')
        .select(`
          *,
          profiles!campus_posts_user_id_fkey (
            username,
            display_name,
            avatar_url,
            is_tutor
          )
        `)
        .eq('post_type', 'post')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch reactions for each post
      const postsWithReactions = await Promise.all(
        (data || []).map(async (post) => {
          const { data: reactions } = await supabase
            .from('post_reactions')
            .select('emoji, user_id')
            .eq('post_id', post.id);

          // Group reactions by emoji
          const reactionCounts = reactions?.reduce((acc, reaction) => {
            acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {};

          // Check if current user reacted
          const userReaction = reactions?.find(r => r.user_id === userId)?.emoji;

          return {
            ...post,
            user: post.profiles,
            reactions: Object.entries(reactionCounts).map(([emoji, count]) => ({
              emoji,
              count
            })),
            user_reaction: userReaction
          };
        })
      );

      setPosts(postsWithReactions as CampusPost[]);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchStories = async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('campus_posts')
        .select(`
          *,
          profiles!campus_posts_user_id_fkey (
            username,
            display_name,
            avatar_url,
            is_tutor
          )
        `)
        .eq('post_type', 'story')
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setStories(data?.map(story => ({ 
        ...story, 
        user: story.profiles,
        reactions: [],
        post_type: story.post_type as 'story'
      })) || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchStories();
  }, [userId]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    setIsPosting(true);
    try {
      const { error } = await supabase
        .from('campus_posts')
        .insert({
          user_id: userId,
          content: newPostContent.trim(),
          post_type: 'post'
        });

      if (error) throw error;

      setNewPostContent("");
      setShowNewPost(false);
      fetchPosts();
      
      toast({
        title: "Posted! 🚀",
        description: "Your post is now live on the campus feed!"
      });
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Oops! 😅",
        description: "Couldn't post right now. Try again?",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleReaction = async (postId: string, emoji: string) => {
    try {
      // Check if user already reacted with this emoji
      const existingReaction = posts.find(p => p.id === postId)?.user_reaction;
      
      if (existingReaction === emoji) {
        // Remove reaction
        await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
          .eq('emoji', emoji);
      } else {
        // Remove existing reaction if any, then add new one
        await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
          
        await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: userId,
            emoji
          });
      }

      fetchPosts(); // Refresh to show updated reactions
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stories Section */}
      {stories.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Campus Stories (24h)
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {stories.map((story) => (
              <div key={story.id} className="flex-shrink-0">
                <div className="text-center space-y-1">
                  <Avatar className="w-16 h-16 ring-2 ring-primary">
                    <AvatarImage src={story.user.avatar_url} />
                    <AvatarFallback>{story.user.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-muted-foreground max-w-16 truncate">
                    {story.user.username}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Post Section */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          {!showNewPost ? (
            <Button
              onClick={() => setShowNewPost(true)}
              className="w-full justify-start gap-2 h-12 bg-muted hover:bg-muted/80"
              variant="ghost"
            >
              <Plus className="w-5 h-5" />
              What's happening on campus?
            </Button>
          ) : (
            <div className="space-y-3">
              <Textarea
                placeholder="Share what's on your mind..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="border-primary/20 focus:border-primary resize-none"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowNewPost(false);
                    setNewPostContent("");
                  }}
                  disabled={isPosting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={isPosting || !newPostContent.trim()}
                  className="bg-gradient-primary hover:bg-gradient-primary/90"
                >
                  {isPosting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="border-border/20 hover:border-primary/20 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.user.avatar_url} />
                  <AvatarFallback>{post.user.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{post.user.display_name}</span>
                    <span className="text-sm text-muted-foreground">@{post.user.username}</span>
                    {post.user.is_tutor && (
                      <Badge variant="secondary" className="text-xs">Tutor</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
              
              {/* Reactions */}
              <div className="flex items-center gap-4 pt-3 border-t border-border/20">
                <div className="flex items-center gap-1">
                  {reactionEmojis.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(post.id, emoji)}
                      className={`h-8 w-8 p-0 hover:bg-primary/10 ${
                        post.user_reaction === emoji ? 'bg-primary/20' : ''
                      }`}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
                
                {/* Reaction counts */}
                {post.reactions.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {post.reactions.map((reaction) => (
                      <span key={reaction.emoji} className="flex items-center gap-1">
                        {reaction.emoji} {reaction.count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {posts.length === 0 && (
          <Card className="border-dashed border-border/50">
            <CardContent className="p-8 text-center">
              <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Campus feed is quiet...</h3>
              <p className="text-muted-foreground mb-4">Be the first to share what's happening!</p>
              <Button onClick={() => setShowNewPost(true)} className="bg-gradient-primary">
                Create First Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CampusFeed;