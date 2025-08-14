import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useMessages } from '@/hooks/useConversations';
import { useToast } from '@/hooks/use-toast';

interface RealChatConversationProps {
  conversationId: string;
  otherParticipant: {
    id: string;
    display_name: string;
    avatar_url: string;
    is_tutor: boolean;
  };
  currentUserId: string;
  onBack: () => void;
}

const RealChatConversation = ({ 
  conversationId, 
  otherParticipant, 
  currentUserId, 
  onBack 
}: RealChatConversationProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, loading, sendMessage } = useMessages(conversationId);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(inputMessage);
      setInputMessage('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-800">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 bg-gray-700 border-b border-gray-600">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-white hover:bg-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="w-10 h-10">
          <AvatarImage src={otherParticipant.avatar_url} />
          <AvatarFallback className="bg-sky-500 text-white">
            {otherParticipant.display_name?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h2 className="font-semibold text-white">
            {otherParticipant.display_name || 'Unknown User'}
          </h2>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
            {otherParticipant.is_tutor ? 'Tutor' : 'Student'}
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isCurrentUser
                      ? 'bg-sky-500 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-sky-100' : 'text-gray-400'
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-gray-700 border-t border-gray-600 relative z-20">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-sky-400 focus:ring-sky-400/20"
          />
          <Button
            onClick={handleSendMessage}
            disabled={sending || !inputMessage.trim()}
            size="icon"
            className="bg-sky-500 hover:bg-sky-600 text-white shadow-md"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RealChatConversation;