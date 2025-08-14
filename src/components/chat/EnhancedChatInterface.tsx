import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Smile, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical,
  ArrowLeft,
  Heart,
  ThumbsUp,
  Laugh,
  
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender: {
    username: string;
    display_name: string;
    avatar_url: string;
    is_tutor: boolean;
  };
  reactions?: { emoji: string; user_id: string }[];
}

interface EnhancedChatInterfaceProps {
  conversationId: string;
  otherUserId: string;
  currentUserId: string;
  onBack: () => void;
}

const reactionEmojis = [
  { emoji: "❤️", icon: Heart },
  { emoji: "👍", icon: ThumbsUp }, 
  { emoji: "😂", icon: Laugh },
  { emoji: "😮", icon: Smile }
];

const EnhancedChatInterface = ({ 
  conversationId, 
  otherUserId, 
  currentUserId,
  onBack 
}: EnhancedChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchOtherUser();
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        fetchMessages(); // Refresh messages when new one arrives
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchOtherUser = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', otherUserId)
        .single();

      if (error) throw error;
      setOtherUser(data);
    } catch (error) {
      console.error('Error fetching other user:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_sender_id_fkey (
            username,
            display_name,
            avatar_url,
            is_tutor
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data?.map(msg => ({ ...msg, sender: msg.profiles })) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: newMessage.trim()
        });

      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      setNewMessage("");
      fetchMessages();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Message failed to send 😅",
        description: "Try again in a moment.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLongPress = (messageId: string) => {
    setShowReactions(messageId);
  };

  if (!otherUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Chat Header */}
      <Card className="rounded-none border-b border-border/20 shadow-sm">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <Avatar>
                <AvatarImage src={otherUser.avatar_url} />
                <AvatarFallback>{otherUser.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-semibold">{otherUser.display_name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">@{otherUser.username}</span>
                  {otherUser.is_tutor && (
                    <Badge variant="secondary" className="text-xs">Tutor</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              onDoubleClick={() => handleLongPress(message.id)}
            >
              <div className={`flex items-end gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isOwn && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.sender.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {message.sender.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`relative group ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl whitespace-pre-wrap ${
                      isOwn
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                  
                  {/* Reaction popup */}
                  {showReactions === message.id && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded-full px-2 py-1 shadow-lg z-10 flex gap-1">
                      {reactionEmojis.map(({ emoji, icon: Icon }) => (
                        <Button
                          key={emoji}
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 hover:bg-primary/10"
                          onClick={() => {
                            // Handle reaction logic here
                            setShowReactions(null);
                          }}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <p className={`text-xs text-muted-foreground mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed to bottom */}
      <div className="border-t border-border/20 bg-background p-4 relative z-20 shadow-lg">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-primary/10">
            <Paperclip className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-12 border-primary/20 focus:border-primary bg-background text-foreground"
              disabled={isSending}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 hover:bg-primary/10"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-md"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Click outside to hide reactions */}
      {showReactions && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowReactions(null)}
        />
      )}
    </div>
  );
};

export default EnhancedChatInterface;