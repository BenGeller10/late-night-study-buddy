import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  other_participant: {
    id: string;
    display_name: string;
    avatar_url: string;
    is_tutor: boolean;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    };

    getCurrentUser();
  }, []);

  const fetchConversations = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Fetch conversations where current user is a participant
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          participant1_id,
          participant2_id,
          last_message_at,
          status,
          created_at
        `)
        .or(`participant1_id.eq.${currentUser.id},participant2_id.eq.${currentUser.id}`)
        .order('last_message_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      // For each conversation, get the other participant's profile and last message
      const conversationsWithDetails = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const otherParticipantId = conv.participant1_id === currentUser.id 
            ? conv.participant2_id 
            : conv.participant1_id;

          // Get other participant's profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, user_id, display_name, avatar_url, is_tutor')
            .eq('user_id', otherParticipantId)
            .maybeSingle();

          // Get last message
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...conv,
            status: conv.status as 'pending' | 'accepted' | 'declined' | 'blocked',
            other_participant: profileData || {
              id: otherParticipantId,
              display_name: 'Unknown User',
              avatar_url: '',
              is_tutor: false
            },
            last_message: lastMessageData
          } as Conversation;
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);

  const createConversation = async (otherParticipantId: string) => {
    if (!currentUser) return null;

    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${currentUser.id},participant2_id.eq.${otherParticipantId}),and(participant1_id.eq.${otherParticipantId},participant2_id.eq.${currentUser.id})`)
        .maybeSingle();

      if (existingConversation) {
        return existingConversation.id;
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          participant1_id: currentUser.id,
          participant2_id: otherParticipantId
        })
        .select('id')
        .single();

      if (error) throw error;

      // Refresh conversations list
      await fetchConversations();
      
      return newConversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const acceptConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'accepted' })
        .eq('id', conversationId);

      if (error) throw error;
      await fetchConversations();
      return true;
    } catch (error) {
      console.error('Error accepting conversation:', error);
      return false;
    }
  };

  const declineConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'declined' })
        .eq('id', conversationId);

      if (error) throw error;
      await fetchConversations();
      return true;
    } catch (error) {
      console.error('Error declining conversation:', error);
      return false;
    }
  };

  return {
    conversations,
    loading,
    currentUser,
    refetchConversations: fetchConversations,
    createConversation,
    acceptConversation,
    declineConversation
  };
};

export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || !conversationId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: session.user.id,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      setMessages(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchMessages();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return {
    messages,
    loading,
    sendMessage,
    refetchMessages: fetchMessages
  };
};