import { useState, useRef, useEffect } from 'react';
import { Send, Smile, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Message } from '@/types/messaging';
import { getMockUser } from '@/services/mockMessagingService';

interface MessageComposerProps {
  onSendMessage: (text: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  replyTo?: Message;
  onCancelReply?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageComposer({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  replyTo,
  onCancelReply,
  disabled = false,
  placeholder = "Type a message..."
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (textareaRef.current) {
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    
    onSendMessage(message.trim());
    setMessage('');
    handleTypingStop();
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    if (!isTyping && e.target.value.length > 0) {
      handleTypingStart();
    } else if (isTyping && e.target.value.length === 0) {
      handleTypingStop();
    }
  };

  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true);
      onTypingStart?.();
    }
    
    // Reset timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 3000);
  };

  const handleTypingStop = () => {
    if (isTyping) {
      setIsTyping(false);
      onTypingStop?.();
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const replyToUser = replyTo ? getMockUser(replyTo.senderId) : null;

  return (
    <div className="bg-background border-t border-border/20 p-4">
      {/* Reply preview */}
      {replyTo && (
        <div className="mb-3 p-3 bg-muted/30 rounded-lg border-l-4 border-primary">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Avatar className="w-4 h-4">
                <AvatarImage src={replyToUser?.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {replyToUser?.name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-primary">
                {replyToUser?.name || 'Unknown User'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0"
              onClick={onCancelReply}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {replyTo.text || 'Attachment'}
          </p>
        </div>
      )}

      {/* Composer */}
      <div className="flex items-end gap-2">
        {/* Attachment menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 flex-shrink-0"
              disabled={disabled}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            <DropdownMenuItem>
              📷 Photo/Video
            </DropdownMenuItem>
            <DropdownMenuItem>
              📁 File
            </DropdownMenuItem>
            <DropdownMenuItem>
              📍 Location
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Text input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "min-h-[44px] max-h-32 resize-none pr-12",
              "bg-muted/30 border-0 rounded-2xl",
              "focus:ring-1 focus:ring-primary"
            )}
            rows={1}
          />
          
          {/* Emoji button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 bottom-2 w-8 h-8 p-0"
            disabled={disabled}
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="sm"
          className="w-10 h-10 p-0 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}