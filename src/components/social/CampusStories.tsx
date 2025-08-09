import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Story {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  expires_at: string;
  view_count: number;
  user_id: string;
  profiles: {
    display_name: string;
    username: string;
    avatar_url: string;
  };
}

const CampusStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStoryContent, setNewStoryContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      // First get stories
      const { data: storiesData, error: storiesError } = await supabase
        .from('campus_stories')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (storiesError) throw storiesError;

      // Then get profiles for each story
      if (storiesData && storiesData.length > 0) {
        const userIds = storiesData.map(story => story.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, display_name, username, avatar_url')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        // Combine stories with profiles
        const storiesWithProfiles = storiesData.map(story => ({
          ...story,
          profiles: profilesData?.find(profile => profile.user_id === story.user_id) || {
            display_name: 'Unknown User',
            username: 'unknown',
            avatar_url: '/placeholder.svg'
          }
        }));

        setStories(storiesWithProfiles);
      } else {
        setStories([]);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStory = async () => {
    if (!newStoryContent.trim()) return;

    setIsPosting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('campus_stories')
        .insert({
          user_id: user.id,
          content: newStoryContent.trim(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        });

      if (error) throw error;

      toast({
        title: "Story Posted! 🎉",
        description: "Your story is now live for 24 hours.",
      });

      setNewStoryContent("");
      setShowCreateDialog(false);
      fetchStories();
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: "Error",
        description: "Failed to post story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const viewStory = async (storyId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Record the view
      await supabase
        .from('story_views')
        .upsert({
          story_id: storyId,
          viewer_id: user.id
        });

      // Update view count
      await supabase
        .from('campus_stories')
        .update({ view_count: stories.find(s => s.id === storyId)?.view_count + 1 || 1 })
        .eq('id', storyId);

      // Refresh stories to update view count
      fetchStories();
    } catch (error) {
      console.error('Error recording story view:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-20 h-20 rounded-full skeleton" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full skeleton" />
                <div className="space-y-1">
                  <div className="w-24 h-4 skeleton" />
                  <div className="w-16 h-3 skeleton" />
                </div>
              </div>
              <div className="w-full h-16 skeleton rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Story Highlights */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Campus Stories</h2>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="campus">
                <Plus className="w-4 h-4 mr-1" />
                Add Story
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Your Campus Story</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="What's happening on campus? Share your thoughts, achievements, or just your vibe... ✨"
                    value={newStoryContent}
                    onChange={(e) => setNewStoryContent(e.target.value)}
                    rows={4}
                    maxLength={280}
                  />
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Story expires in 24 hours</span>
                    <span>{newStoryContent.length}/280</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={createStory}
                    disabled={!newStoryContent.trim() || isPosting}
                    className="flex-1"
                  >
                    {isPosting ? "Posting..." : "Post Story"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Story Ring Preview */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {stories.slice(0, 10).map((story) => (
            <button
              key={story.id}
              onClick={() => viewStory(story.id)}
              className="flex-shrink-0 text-center space-y-1"
            >
              <div className="w-16 h-16 rounded-full border-2 border-primary p-0.5">
                <img
                  src={story.profiles.avatar_url || '/placeholder.svg'}
                  alt={story.profiles.display_name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="text-xs font-medium truncate max-w-16 block">
                @{story.profiles.username}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Stories Feed */}
      <div className="space-y-4">
        <h3 className="font-medium text-muted-foreground">Recent Stories</h3>
        {stories.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold">No stories yet</h3>
              <p className="text-sm text-muted-foreground">
                Be the first to share what's happening on campus!
              </p>
            </div>
          </Card>
        ) : (
          stories.map((story) => (
            <Card key={story.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={story.profiles.avatar_url || '/placeholder.svg'}
                    alt={story.profiles.display_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{story.profiles.display_name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{story.profiles.username} • {formatDistanceToNow(new Date(story.created_at))} ago
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  {story.view_count}
                </Badge>
              </div>
              
              <p className="text-sm leading-relaxed">{story.content}</p>
              
              {story.image_url && (
                <img
                  src={story.image_url}
                  alt="Story content"
                  className="w-full rounded-lg object-cover max-h-64"
                />
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CampusStories;