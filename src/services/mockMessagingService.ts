import { 
  User, 
  Conversation, 
  ConversationMember, 
  Message, 
  MessageReaction, 
  TypingIndicator,
  MessageEvent,
  MessagingService 
} from '@/types/messaging';

// Mock data
const mockUsers: User[] = [
  { id: '1', name: 'Sarah Chen', username: 'sarahc', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: '2', name: 'Alex Rivera', username: 'alexr', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: '3', name: 'Jordan Kim', username: 'jordank', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan' },
  { id: '4', name: 'Taylor Swift', username: 'taylorswift', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor' },
  { id: '5', name: 'Study Group', username: 'studygroup', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Group' },
];

const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    type: 'dm',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-25T14:30:00Z'),
    lastMessagePreview: 'Thanks for the calculus help! 📚'
  },
  {
    id: 'conv-2', 
    type: 'dm',
    createdAt: new Date('2024-01-20T15:30:00Z'),
    updatedAt: new Date('2024-01-25T16:45:00Z'),
    lastMessagePreview: 'Let me know when you want to study physics together'
  },
  {
    id: 'conv-3',
    type: 'group',
    title: 'CS 101 Study Group',
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-25T18:20:00Z'),
    lastMessagePreview: 'Meeting at library tomorrow at 3pm'
  }
];

const mockConversationMembers: ConversationMember[] = [
  // DM conversations
  { conversationId: 'conv-1', userId: 'current-user', role: 'member', muted: false, lastReadAt: new Date('2024-01-25T14:30:00Z') },
  { conversationId: 'conv-1', userId: '1', role: 'member', muted: false, lastReadAt: new Date('2024-01-25T14:25:00Z') },
  
  { conversationId: 'conv-2', userId: 'current-user', role: 'member', muted: false, lastReadAt: new Date('2024-01-25T16:40:00Z') },
  { conversationId: 'conv-2', userId: '2', role: 'member', muted: false, lastReadAt: new Date('2024-01-25T16:45:00Z') },
  
  // Group conversation
  { conversationId: 'conv-3', userId: 'current-user', role: 'member', muted: false, lastReadAt: new Date('2024-01-25T18:15:00Z') },
  { conversationId: 'conv-3', userId: '3', role: 'owner', muted: false, lastReadAt: new Date('2024-01-25T18:20:00Z') },
  { conversationId: 'conv-3', userId: '4', role: 'member', muted: false, lastReadAt: new Date('2024-01-25T18:10:00Z') },
];

const mockMessages: Message[] = [
  // Conversation 1 messages
  {
    id: 'msg-1', conversationId: 'conv-1', senderId: '1', type: 'text',
    text: 'Hey! Do you have time to help me with calculus today?', createdAt: new Date('2024-01-25T14:00:00Z'),
    delivery: { deliveredTo: ['current-user'], readBy: ['current-user'] }
  },
  {
    id: 'msg-2', conversationId: 'conv-1', senderId: 'current-user', type: 'text',
    text: 'Sure! What specific topics are you struggling with?', createdAt: new Date('2024-01-25T14:05:00Z'),
    delivery: { deliveredTo: ['1'], readBy: ['1'] }
  },
  {
    id: 'msg-3', conversationId: 'conv-1', senderId: '1', type: 'text',
    text: 'Integration by parts is really confusing me', createdAt: new Date('2024-01-25T14:10:00Z'),
    delivery: { deliveredTo: ['current-user'], readBy: ['current-user'] }
  },
  {
    id: 'msg-4', conversationId: 'conv-1', senderId: 'current-user', type: 'text',
    text: 'No problem! Let me walk you through it step by step', createdAt: new Date('2024-01-25T14:15:00Z'),
    delivery: { deliveredTo: ['1'], readBy: ['1'] }
  },
  {
    id: 'msg-5', conversationId: 'conv-1', senderId: '1', type: 'text',
    text: 'Thanks for the calculus help! 📚', createdAt: new Date('2024-01-25T14:30:00Z'),
    delivery: { deliveredTo: ['current-user'], readBy: ['current-user'] }
  },

  // Conversation 2 messages
  {
    id: 'msg-6', conversationId: 'conv-2', senderId: '2', type: 'text',
    text: 'Hi! I saw you\'re tutoring physics. I could use some help', createdAt: new Date('2024-01-25T16:30:00Z'),
    delivery: { deliveredTo: ['current-user'], readBy: ['current-user'] }
  },
  {
    id: 'msg-7', conversationId: 'conv-2', senderId: 'current-user', type: 'text',
    text: 'Absolutely! What area of physics?', createdAt: new Date('2024-01-25T16:35:00Z'),
    delivery: { deliveredTo: ['2'], readBy: ['2'] }
  },
  {
    id: 'msg-8', conversationId: 'conv-2', senderId: '2', type: 'text',
    text: 'Electromagnetism, specifically Maxwell\'s equations', createdAt: new Date('2024-01-25T16:40:00Z'),
    delivery: { deliveredTo: ['current-user'], readBy: ['current-user'] }
  },
  {
    id: 'msg-9', conversationId: 'conv-2', senderId: 'current-user', type: 'text',
    text: 'Let me know when you want to study physics together', createdAt: new Date('2024-01-25T16:45:00Z'),
    delivery: { deliveredTo: ['2'], readBy: [] }
  },

  // Group conversation messages
  {
    id: 'msg-10', conversationId: 'conv-3', senderId: '3', type: 'text',
    text: 'Hey everyone! Ready for tomorrow\'s exam?', createdAt: new Date('2024-01-25T18:00:00Z'),
    delivery: { deliveredTo: ['current-user', '4'], readBy: ['current-user'] }
  },
  {
    id: 'msg-11', conversationId: 'conv-3', senderId: 'current-user', type: 'text',
    text: 'I think I need more practice with algorithms', createdAt: new Date('2024-01-25T18:05:00Z'),
    delivery: { deliveredTo: ['3', '4'], readBy: ['3'] }
  },
  {
    id: 'msg-12', conversationId: 'conv-3', senderId: '4', type: 'text',
    text: 'Same here! Should we meet up to study?', createdAt: new Date('2024-01-25T18:10:00Z'),
    delivery: { deliveredTo: ['current-user', '3'], readBy: ['current-user'] }
  },
  {
    id: 'msg-13', conversationId: 'conv-3', senderId: '3', type: 'text',
    text: 'Meeting at library tomorrow at 3pm', createdAt: new Date('2024-01-25T18:20:00Z'),
    delivery: { deliveredTo: ['current-user', '4'], readBy: [] }
  }
];

const mockReactions: MessageReaction[] = [
  { id: 'react-1', messageId: 'msg-5', userId: 'current-user', emoji: '👍', createdAt: new Date('2024-01-25T14:31:00Z') },
  { id: 'react-2', messageId: 'msg-13', userId: 'current-user', emoji: '👍', createdAt: new Date('2024-01-25T18:21:00Z') },
  { id: 'react-3', messageId: 'msg-13', userId: '4', emoji: '👍', createdAt: new Date('2024-01-25T18:22:00Z') },
];

// Mock WebSocket-like event system
class MockEventSystem {
  private listeners: Map<string, ((event: MessageEvent) => void)[]> = new Map();

  subscribe(topic: string, callback: (event: MessageEvent) => void) {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, []);
    }
    this.listeners.get(topic)!.push(callback);

    return {
      unsubscribe: () => {
        const callbacks = this.listeners.get(topic);
        if (callbacks) {
          const index = callbacks.indexOf(callback);
          if (index > -1) {
            callbacks.splice(index, 1);
          }
        }
      }
    };
  }

  emit(topic: string, event: MessageEvent) {
    const callbacks = this.listeners.get(topic);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
  }
}

const eventSystem = new MockEventSystem();

// Mock messaging service implementation
export const mockMessagingService: MessagingService = {
  subscribeConversations(userId: string) {
    return eventSystem.subscribe(`conversations:${userId}`, (event) => {
      console.log('Conversation event:', event);
    });
  },

  async listConversations(userId: string, options = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockConversations.filter(conv => {
      // Filter conversations where user is a member
      return mockConversationMembers.some(member => 
        member.conversationId === conv.id && member.userId === userId
      );
    });
  },

  subscribeMessages(conversationId: string) {
    return eventSystem.subscribe(`messages:${conversationId}`, (event) => {
      console.log('Message event:', event);
    });
  },

  async listMessages(conversationId: string, options = { limit: 25 }) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    let messages = mockMessages.filter(msg => msg.conversationId === conversationId);
    
    if (options.before) {
      const beforeIndex = messages.findIndex(msg => msg.id === options.before);
      if (beforeIndex > -1) {
        messages = messages.slice(0, beforeIndex);
      }
    }
    
    return messages.slice(-options.limit);
  },

  async sendMessage(data) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: data.conversationId,
      senderId: data.senderId,
      type: data.type as any,
      text: data.text,
      createdAt: new Date(),
      delivery: { deliveredTo: [], readBy: [] }
    };

    // Add to mock data
    mockMessages.push(newMessage);
    
    // Update conversation
    const conversation = mockConversations.find(c => c.id === data.conversationId);
    if (conversation) {
      conversation.updatedAt = new Date();
      conversation.lastMessagePreview = data.text || '';
    }

    // Emit events
    eventSystem.emit(`messages:${data.conversationId}`, {
      type: 'message_created',
      data: newMessage
    });

    return newMessage;
  },

  async addReaction(data) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const newReaction: MessageReaction = {
      id: `react-${Date.now()}`,
      messageId: data.messageId,
      userId: data.userId,
      emoji: data.emoji,
      createdAt: new Date()
    };

    mockReactions.push(newReaction);

    eventSystem.emit(`messages:*`, {
      type: 'reaction_added',
      data: newReaction
    });

    return newReaction;
  },

  async removeReaction(data) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const index = mockReactions.findIndex(r => 
      r.messageId === data.messageId && 
      r.userId === data.userId && 
      r.emoji === data.emoji
    );
    
    if (index > -1) {
      mockReactions.splice(index, 1);
    }
  },

  async markRead(data) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const message = mockMessages.find(m => m.id === data.messageId);
    if (message && !message.delivery.readBy.includes(data.userId)) {
      message.delivery.readBy.push(data.userId);
    }
  },

  async setTyping(data) {
    const typingEvent: TypingIndicator = {
      conversationId: data.conversationId,
      userId: data.userId,
      isTyping: data.isTyping
    };

    eventSystem.emit(`messages:${data.conversationId}`, {
      type: 'member_typing',
      data: typingEvent
    });
  },

  async createGroup(data) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      type: 'group',
      title: data.title,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessagePreview: ''
    };

    mockConversations.push(newConversation);
    
    // Add members
    data.memberIds.forEach(userId => {
      const member: ConversationMember = {
        conversationId: newConversation.id,
        userId,
        role: userId === data.memberIds[0] ? 'owner' : 'member',
        muted: false,
        lastReadAt: new Date()
      };
      mockConversationMembers.push(member);
    });

    return newConversation;
  },

  async renameGroup(conversationId: string, title: string) {
    await new Promise(resolve => setTimeout(resolve, 50));
    const conversation = mockConversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.title = title;
      conversation.updatedAt = new Date();
    }
  },

  async updateGroupPhoto(conversationId: string, photoUrl: string) {
    await new Promise(resolve => setTimeout(resolve, 50));
    // In a real implementation, this would update the group photo
  },

  async addMember(conversationId: string, userId: string) {
    await new Promise(resolve => setTimeout(resolve, 50));
    const member: ConversationMember = {
      conversationId,
      userId,
      role: 'member',
      muted: false,
      lastReadAt: new Date()
    };
    mockConversationMembers.push(member);
  },

  async removeMember(conversationId: string, userId: string) {
    await new Promise(resolve => setTimeout(resolve, 50));
    const index = mockConversationMembers.findIndex(m => 
      m.conversationId === conversationId && m.userId === userId
    );
    if (index > -1) {
      mockConversationMembers.splice(index, 1);
    }
  },

  async leaveGroup(conversationId: string, userId: string) {
    await this.removeMember(conversationId, userId);
  },

  async deleteConversation(conversationId: string, userId: string) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Remove the conversation from user's conversation list
    const conversationIndex = mockConversations.findIndex(c => c.id === conversationId);
    if (conversationIndex > -1) {
      mockConversations.splice(conversationIndex, 1);
    }
    
    // Remove all members from this conversation
    const memberIndices = mockConversationMembers
      .map((member, index) => member.conversationId === conversationId ? index : -1)
      .filter(index => index !== -1)
      .reverse(); // Reverse to remove from end to avoid index shifting
    
    memberIndices.forEach(index => {
      mockConversationMembers.splice(index, 1);
    });
    
    // Remove all messages from this conversation
    const messageIndices = mockMessages
      .map((message, index) => message.conversationId === conversationId ? index : -1)
      .filter(index => index !== -1)
      .reverse();
    
    messageIndices.forEach(index => {
      mockMessages.splice(index, 1);
    });
    
    // Emit event for real-time updates
    eventSystem.emit(`conversations:${userId}`, {
      type: 'conversation_deleted',
      data: { conversationId }
    });
  }
};

// Helper function to get user data
export const getMockUser = (userId: string): User | undefined => {
  if (userId === 'current-user') {
    return { id: 'current-user', name: 'You', username: 'you', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You' };
  }
  return mockUsers.find(u => u.id === userId);
};

// Helper function to get conversation members
export const getMockConversationMembers = (conversationId: string): ConversationMember[] => {
  return mockConversationMembers.filter(m => m.conversationId === conversationId);
};

// Helper function to get message reactions
export const getMockMessageReactions = (messageId: string): MessageReaction[] => {
  return mockReactions.filter(r => r.messageId === messageId);
};