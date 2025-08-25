import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStartConversation = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const startConversationWithTutor = async (tutorId: string, initialMessage?: string) => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to start a conversation",
          variant: "destructive",
        });
        return false;
      }

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id, status')
        .or(`and(participant1_id.eq.${session.user.id},participant2_id.eq.${tutorId}),and(participant1_id.eq.${tutorId},participant2_id.eq.${session.user.id})`)
        .maybeSingle();

      let conversationId = existingConversation?.id;

      if (existingConversation) {
        // If conversation exists and is accepted, navigate to it
        if (existingConversation.status === 'accepted') {
          navigate(`/chat/${tutorId}`);
          return true;
        }
        // If conversation is pending, inform user
        if (existingConversation.status === 'pending') {
          toast({
            title: "Message request pending",
            description: "Your message request is waiting for the tutor's response",
          });
          return true;
        }
        // If declined, allow creating a new conversation
        conversationId = existingConversation.id;
      }

      if (!conversationId) {
        // Create new conversation
        const { data: newConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert({
            participant1_id: session.user.id,
            participant2_id: tutorId,
            status: 'pending'
          })
          .select('id')
          .single();

        if (conversationError) throw conversationError;
        conversationId = newConversation.id;
      }

      // Send initial message if provided
      if (initialMessage && conversationId) {
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: session.user.id,
            content: initialMessage
          });

        if (messageError) throw messageError;

        // Update conversation's last_message_at
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId);
      }

      toast({
        title: "Message request sent!",
        description: "The tutor will be notified of your message request",
      });

      return true;
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    startConversationWithTutor,
    loading
  };
};