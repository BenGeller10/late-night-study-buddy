export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
}

export interface Conversation {
  id: string;
  type: "dm" | "group";
  title?: string; // for group chats
  createdAt: Date;
  updatedAt: Date;
  lastMessagePreview?: string;
}

export interface ConversationMember {
  conversationId: string;
  userId: string;
  role: "owner" | "member";
  muted: boolean;
  lastReadAt?: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: "text" | "image" | "video" | "file" | "system" | "booking";
  text?: string;
  attachmentUrl?: string;
  attachmentMeta?: {
    width?: number;
    height?: number;
    duration?: number;
    fileName?: string;
    size?: number;
  };
  replyToMessageId?: string;
  createdAt: Date;
  editedAt?: Date;
  deletedAt?: Date;
  delivery: {
    deliveredTo: string[];
    readBy: string[];
  };
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

// Event types for mock WebSocket
export type MessageEvent = 
  | { type: 'conversation_updated'; data: Conversation }
  | { type: 'message_created'; data: Message }
  | { type: 'message_updated'; data: Message }
  | { type: 'reaction_added'; data: MessageReaction }
  | { type: 'member_typing'; data: TypingIndicator };

// Service interfaces
export interface MessagingService {
  // Conversations
  subscribeConversations(userId: string): { unsubscribe: () => void };
  listConversations(userId: string, options?: { search?: string; limit?: number; cursor?: string }): Promise<Conversation[]>;
  
  // Messages
  subscribeMessages(conversationId: string): { unsubscribe: () => void };
  listMessages(conversationId: string, options?: { limit?: number; before?: string }): Promise<Message[]>;
  sendMessage(data: { conversationId: string; senderId: string; type: string; text?: string; attachment?: any }): Promise<Message>;
  
  // Reactions
  addReaction(data: { messageId: string; emoji: string; userId: string }): Promise<MessageReaction>;
  removeReaction(data: { messageId: string; emoji: string; userId: string }): Promise<void>;
  
  // Read receipts
  markRead(data: { conversationId: string; userId: string; messageId: string }): Promise<void>;
  
  // Typing
  setTyping(data: { conversationId: string; userId: string; isTyping: boolean }): Promise<void>;
  
  // Group management
  createGroup(data: { title: string; memberIds: string[] }): Promise<Conversation>;
  renameGroup(conversationId: string, title: string): Promise<void>;
  updateGroupPhoto(conversationId: string, photoUrl: string): Promise<void>;
  addMember(conversationId: string, userId: string): Promise<void>;
  removeMember(conversationId: string, userId: string): Promise<void>;
  leaveGroup(conversationId: string, userId: string): Promise<void>;
}