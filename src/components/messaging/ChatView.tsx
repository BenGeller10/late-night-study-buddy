import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical, Users, VolumeX, LogOut, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import { 
  mockMessagingService, 
  getMockUser, 
  getMockConversationMembers 
} from '@/services/mockMessagingService';
import { Message, Conversation, TypingIndicator } from '@/types/messaging';

interface ChatViewProps {
  conversationId: string;
  onBack: () => void;
}

export default function ChatView({ conversationId, onBack }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = 'current-user';

  useEffect(() => {
    loadConversation();
    loadMessages();
    
    // Subscribe to message updates
    const subscription = mockMessagingService.subscribeMessages(conversationId);
    
    return () => subscription.unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    try {
      const conversations = await mockMessagingService.listConversations(currentUserId);
      const conv = conversations.find(c => c.id === conversationId);
      setConversation(conv || null);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await mockMessagingService.listMessages(conversationId);
      setMessages(data);
      
      // Mark messages as read
      data.forEach(msg => {
        if (msg.senderId !== currentUserId && !msg.delivery.readBy.includes(currentUserId)) {
          mockMessagingService.markRead({
            conversationId,
            userId: currentUserId,
            messageId: msg.id
          });
        }
      });
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text: string) => {
    try {
      const newMessage = await mockMessagingService.sendMessage({
        conversationId,
        senderId: currentUserId,
        type: 'text',
        text
      });
      
      setMessages(prev => [...prev, newMessage]);
      setReplyTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleReactionAdd = async (messageId: string, emoji: string) => {
    try {
      await mockMessagingService.addReaction({
        messageId,
        emoji,
        userId: currentUserId
      });
      // In a real app, this would trigger a re-render via subscription
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleTypingStart = () => {
    mockMessagingService.setTyping({
      conversationId,
      userId: currentUserId,
      isTyping: true
    });
  };

  const handleTypingStop = () => {
    mockMessagingService.setTyping({
      conversationId,
      userId: currentUserId,
      isTyping: false
    });
  };

  const getConversationDisplay = () => {
    if (!conversation) return { title: 'Chat', subtitle: '', avatar: null, isOnline: false };
    
    if (conversation.type === 'group') {
      const members = getMockConversationMembers(conversationId);
      return {
        title: conversation.title || 'Group Chat',
        subtitle: `${members.length} members`,
        avatar: '👥',
        isOnline: false
      };
    }
    
    // DM conversation
    const members = getMockConversationMembers(conversationId);
    const otherMember = members.find(m => m.userId !== currentUserId);
    const otherUser = getMockUser(otherMember?.userId || '');
    
    return {
      title: otherUser?.name || 'Unknown User',
      subtitle: otherUser?.username || '',
      avatar: otherUser?.avatarUrl,
      isOnline: Math.random() > 0.6 // Mock online status
    };
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [date: string]: Message[] } = {};
    
    messages.forEach(msg => {
      const date = new Date(msg.createdAt).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    
    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const shouldShowAvatar = (message: Message, index: number, messages: Message[]) => {
    if (message.senderId === currentUserId) return false;
    
    const nextMessage = messages[index + 1];
    return !nextMessage || nextMessage.senderId !== message.senderId ||
           new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime() > 60000;
  };

  const display = getConversationDisplay();
  const groupedMessages = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/20 bg-background/95 backdrop-blur-sm">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-0 w-8 h-8">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={display.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {conversation?.type === 'group' ? '👥' : display.title[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {display.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">{display.title}</h2>
          <p className="text-sm text-muted-foreground truncate">{display.subtitle}</p>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <Video className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {conversation?.type === 'group' && (
                <>
                  <DropdownMenuItem>
                    <Users className="w-4 h-4 mr-2" />
                    View Members
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Group
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>
                <VolumeX className="w-4 h-4 mr-2" />
                Mute
              </DropdownMenuItem>
              {conversation?.type === 'group' && (
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave Group
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center justify-center py-2">
                <Badge variant="secondary" className="text-xs bg-muted/50">
                  {formatDateHeader(date)}
                </Badge>
              </div>
              
              {/* Messages for this date */}
              <div className="space-y-2">
                {dateMessages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === currentUserId}
                    showAvatar={shouldShowAvatar(message, index, dateMessages)}
                    onReactionAdd={handleReactionAdd}
                    onReply={setReplyTo}
                  />
                ))}
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span className="text-sm text-muted-foreground">
                {typingUsers.length === 1 
                  ? `${getMockUser(typingUsers[0])?.name} is typing...`
                  : `${typingUsers.length} people are typing...`
                }
              </span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Composer */}
      <MessageComposer
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}