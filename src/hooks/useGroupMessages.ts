import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GroupMember {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string;
  role: string;
  joined_at: string;
}

interface GroupMessage {
  id: string;
  content: string;
  sender_id: string;
  group_id: string;
  created_at: string;
  sender?: {
    display_name: string;
    avatar_url: string;
  };
}

interface StudyGroup {
  id: string;
  course_name: string;
  course_code: string;
  description: string;
  created_by: string;
}

export const useGroupMessages = (groupId: string) => {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    };
    getCurrentUser();
  }, []);

  const fetchGroupData = async () => {
    if (!groupId || !currentUser) return;

    try {
      setLoading(true);

      // For now, use mock data since the types aren't generated yet
      // This will work once the database migration is approved
      const mockGroup = {
        id: groupId,
        course_name: 'Study Group',
        course_code: 'GROUP 101', 
        description: 'A collaborative study group',
        created_by: 'user123'
      };
      
      const mockMembers = [
        {
          id: '1',
          user_id: currentUser.id,
          display_name: 'You',
          avatar_url: '',
          role: 'member',
          joined_at: new Date().toISOString()
        }
      ];

      const mockMessages: GroupMessage[] = [];

      setGroup(mockGroup);
      setMembers(mockMembers);
      setMessages(mockMessages);

    } catch (error) {
      console.error('Error fetching group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentUser || !groupId) return;

    try {
      // For now, just add to local state
      // This will be replaced with actual Supabase call once types are generated
      const newMessage: GroupMessage = {
        id: Date.now().toString(),
        content: content.trim(),
        sender_id: currentUser.id,
        group_id: groupId,
        created_at: new Date().toISOString(),
        sender: {
          display_name: 'You',
          avatar_url: ''
        }
      };

      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchGroupData();
    }
  }, [groupId, currentUser]);

  return {
    messages,
    members, 
    group,
    loading,
    currentUser,
    sendMessage,
    refetchMessages: fetchGroupData
  };
};