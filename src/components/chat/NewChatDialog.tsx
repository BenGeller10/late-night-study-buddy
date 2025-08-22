import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewChatDialogProps {
  onConversationCreated: (participantId: string) => void;
}

const NewChatDialog = ({ onConversationCreated }: NewChatDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const findUserByEmail = async (searchTerm: string) => {
    try {
      // Search by multiple criteria: display_name, username, or exact email match
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, is_tutor, username')
        .or(`display_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);

      if (error) {
        console.error('Error searching for user:', error);
        return null;
      }

      if (profiles && profiles.length > 0) {
        // If multiple matches, prefer exact username match first
        const exactUsernameMatch = profiles.find(p => 
          p.username?.toLowerCase() === searchTerm.toLowerCase()
        );
        
        if (exactUsernameMatch) {
          return exactUsernameMatch;
        }

        // Then prefer exact display name match
        const exactDisplayMatch = profiles.find(p => 
          p.display_name?.toLowerCase() === searchTerm.toLowerCase()
        );
        
        if (exactDisplayMatch) {
          return exactDisplayMatch;
        }

        // Otherwise return first match
        return profiles[0];
      }

      return null;
    } catch (error) {
      console.error('Error in findUserByEmail:', error);
      return null;
    }
  };

  const createConversation = async (otherUserId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${session.user.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${session.user.id})`)
        .maybeSingle();

      if (existingConversation) {
        return otherUserId; // Return the other user's ID for navigation
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          participant1_id: session.user.id,
          participant2_id: otherUserId
        })
        .select('id')
        .single();

      if (error) throw error;

      return otherUserId; // Return the other user's ID for navigation
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const handleCreateChat = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username or name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Find user by username/name
      const user = await findUserByEmail(searchTerm.trim());
      
      if (!user) {
        toast({
          title: "User not found",
          description: "No user found with that username or name",
          variant: "destructive",
        });
        return;
      }

      // Check if user is trying to message themselves
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && user.user_id === session.user.id) {
        toast({
          title: "Error",
          description: "You cannot start a conversation with yourself",
          variant: "destructive",
        });
        return;
      }

      // Create conversation
      const participantId = await createConversation(user.user_id);
      
      if (participantId) {
        toast({
          title: "Success",
          description: `Started conversation with ${user.display_name}`,
        });
        
        setIsOpen(false);
        setSearchTerm('');
        onConversationCreated(participantId);
      } else {
        toast({
          title: "Error",
          description: "Failed to create conversation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in handleCreateChat:', error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="searchTerm">Username or Name</Label>
            <Input
              id="searchTerm"
              type="text"
              placeholder="Enter username or display name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateChat();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Enter the username or display name of the person you want to chat with. Try searching for other users who have signed up for the app.
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateChat}
              disabled={isLoading || !searchTerm.trim()}
              className="bg-sky-500 hover:bg-sky-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Start Chat'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;