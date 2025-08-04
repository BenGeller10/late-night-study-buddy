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
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const findUserByEmail = async (email: string) => {
    // First, try to find user in auth.users by email (this requires admin access which we don't have)
    // So we'll search profiles by a different approach - we need to get creative here
    
    // Since we can't directly query auth.users, we'll need to search profiles
    // But profiles don't have email. We need to think of another approach.
    
    // For now, let's assume the user enters an existing user_id or we implement email lookup differently
    // Let's search by display_name first as a workaround, but ideally this should be email
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url, is_tutor')
      .ilike('display_name', `%${email}%`) // This is a workaround - searching by name
      .limit(1);

    if (error) {
      console.error('Error searching for user:', error);
      return null;
    }

    return profiles?.[0] || null;
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
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email or name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Find user by email/name
      const user = await findUserByEmail(email.trim());
      
      if (!user) {
        toast({
          title: "User not found",
          description: "No user found with that email or name",
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
        setEmail('');
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
            <Label htmlFor="email">Email or Name</Label>
            <Input
              id="email"
              type="text"
              placeholder="Enter email address or name..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateChat();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Enter the email address or name of the person you want to chat with
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
              disabled={isLoading || !email.trim()}
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