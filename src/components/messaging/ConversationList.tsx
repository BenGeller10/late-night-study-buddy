import { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Pin, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  mockMessagingService, 
  getMockUser, 
  getMockConversationMembers 
} from '@/services/mockMessagingService';
import { Conversation } from '@/types/messaging';

interface ConversationListProps {
  onConversationSelect: (conversationId: string) => void;
  onNewChat: () => void;
}

export default function ConversationList({ onConversationSelect, onNewChat }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const currentUserId = 'current-user';

  useEffect(() => {
    loadConversations();
    
    // Subscribe to conversation updates
    const subscription = mockMessagingService.subscribeConversations(currentUserId);
    
    return () => subscription.unsubscribe();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await mockMessagingService.listConversations(currentUserId);
      setConversations(data.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent conversation selection
    
    try {
      await mockMessagingService.deleteConversation(conversationId, currentUserId);
      
      // Remove from local state immediately for better UX
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    // For DM, search by other user's name
    if (conv.type === 'dm') {
      const members = getMockConversationMembers(conv.id);
      const otherMember = members.find(m => m.userId !== currentUserId);
      const otherUser = getMockUser(otherMember?.userId || '');
      return otherUser?.name.toLowerCase().includes(query) || 
             otherUser?.username.toLowerCase().includes(query);
    }
    
    // For groups, search by title
    return conv.title?.toLowerCase().includes(query);
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getConversationDisplay = (conv: Conversation) => {
    if (conv.type === 'group') {
      return {
        title: conv.title || 'Group Chat',
        avatar: '👥',
        isOnline: false
      };
    }
    
    // DM conversation
    const members = getMockConversationMembers(conv.id);
    const otherMember = members.find(m => m.userId !== currentUserId);
    const otherUser = getMockUser(otherMember?.userId || '');
    
    return {
      title: otherUser?.name || 'Unknown User',
      avatar: otherUser?.avatarUrl,
      isOnline: Math.random() > 0.6 // Mock online status
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border/20">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Messages
          </h1>
          <Button onClick={onNewChat} size="sm" className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/30 border-0"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
              💬
            </div>
            <h3 className="font-semibold mb-2">No messages yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Find a tutor and say hi!
            </p>
            <Button onClick={onNewChat} variant="outline">
              Start a conversation
            </Button>
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conv) => {
              const display = getConversationDisplay(conv);
              const members = getMockConversationMembers(conv.id);
              const currentMember = members.find(m => m.userId === currentUserId);
              const unreadCount = 0; // Mock unread count
              
              return (
                <Card
                  key={conv.id}
                  className="mb-2 p-3 cursor-pointer hover:bg-muted/30 transition-colors border-0 bg-transparent"
                  onClick={() => onConversationSelect(conv.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={display.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {conv.type === 'group' ? '👥' : display.title[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {display.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">
                          {display.title}
                        </h3>
                        {conv.type === 'group' && (
                          <Badge variant="secondary" className="text-xs">
                            Group
                          </Badge>
                        )}
                        {currentMember?.muted && (
                          <VolumeX className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessagePreview || 'No messages yet'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conv.updatedAt)}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                          <Badge variant="default" className="w-5 h-5 p-0 text-xs flex items-center justify-center bg-primary">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </Badge>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                              <Pin className="w-4 h-4 mr-2" />
                              Pin conversation
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              {currentMember?.muted ? (
                                <>
                                  <Volume2 className="w-4 h-4 mr-2" />
                                  Unmute
                                </>
                              ) : (
                                <>
                                  <VolumeX className="w-4 h-4 mr-2" />
                                  Mute
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => handleDeleteConversation(conv.id, e)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}