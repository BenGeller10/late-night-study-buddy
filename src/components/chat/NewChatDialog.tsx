import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import EnhancedUserSearch from '@/components/users/EnhancedUserSearch';

interface NewChatDialogProps {
  onConversationCreated: (participantId: string) => void;
}

const NewChatDialog = ({ onConversationCreated }: NewChatDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const createConversation = async (otherUserId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    setIsLoading(true);

    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${session.user.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${session.user.id})`)
        .maybeSingle();

      if (existingConversation) {
        toast({
          title: 'Success',
          description: 'Conversation found',
        });
        setIsOpen(false);
        navigate(`/chat/conversation/${existingConversation.id}?otherUserId=${otherUserId}`);
        return;
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

      toast({
        title: 'Success',
        description: 'Started new conversation',
      });
      
      setIsOpen(false);
      navigate(`/chat/conversation/${newConversation.id}?otherUserId=${otherUserId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create conversation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    createConversation(userId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <EnhancedUserSearch
            onUserSelect={handleUserSelect}
            placeholder="Search for users to message..."
            excludeCurrentUser={true}
          />
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Type at least 2 characters to search for users by name, username, major, or campus
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;