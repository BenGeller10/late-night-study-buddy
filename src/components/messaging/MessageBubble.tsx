import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, Copy, Reply, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Message, MessageReaction } from '@/types/messaging';
import { getMockUser, getMockMessageReactions } from '@/services/mockMessagingService';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onReactionAdd?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '🙏'];

export default function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  onReactionAdd,
  onReply,
  onEdit,
  onDelete
}: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [longPressed, setLongPressed] = useState(false);

  const sender = getMockUser(message.senderId);
  const reactions = getMockMessageReactions(message.id);
  
  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, MessageReaction[]>);

  const handleLongPress = () => {
    setLongPressed(true);
    setShowReactions(true);
  };

  const handleReactionClick = (emoji: string) => {
    onReactionAdd?.(message.id, emoji);
    setShowReactions(false);
  };

  const getDeliveryStatus = () => {
    if (!isOwn) return null;
    
    const { deliveredTo, readBy } = message.delivery;
    
    if (readBy.length > 0) {
      return <CheckCheck className="w-3 h-3 text-primary" />;
    } else if (deliveredTo.length > 0) {
      return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
    } else {
      return <Check className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className={cn(
      "flex gap-2 group",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={sender?.avatarUrl} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {sender?.name[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
      {showAvatar && isOwn && <div className="w-8" />}

      <div className={cn(
        "flex flex-col max-w-[70%] relative",
        isOwn ? "items-end" : "items-start"
      )}>
        {/* Reaction Picker */}
        {showReactions && (
          <div 
            className={cn(
              "absolute z-20 bg-popover border rounded-full p-2 shadow-lg mb-2 animate-in fade-in-0 zoom-in-95 duration-200",
              "flex gap-1",
              isOwn ? "right-0 bottom-full" : "left-0 bottom-full"
            )}
            onPointerLeave={() => setShowReactions(false)}
          >
            {REACTION_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 hover:bg-muted hover:scale-110 transition-all duration-150"
                onClick={() => handleReactionClick(emoji)}
              >
                <span className="text-lg">{emoji}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "relative px-3 py-2 rounded-2xl max-w-full",
            "cursor-pointer select-none",
            isOwn 
              ? "bg-primary text-primary-foreground rounded-br-md" 
              : "bg-muted/50 text-foreground rounded-bl-md"
          )}
          onDoubleClick={() => setShowReactions(true)}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowReactions(true);
          }}
          onTouchStart={(e) => {
            const timer = setTimeout(() => setShowReactions(true), 500);
            const cleanup = () => clearTimeout(timer);
            
            e.currentTarget.addEventListener('touchend', cleanup, { once: true });
            e.currentTarget.addEventListener('touchmove', cleanup, { once: true });
          }}
        >
          {/* System messages */}
          {message.type === 'system' && (
            <div className="text-center text-sm text-muted-foreground italic">
              {message.text}
            </div>
          )}

          {/* Regular text messages */}
          {message.type === 'text' && (
            <>
              {message.deletedAt ? (
                <span className="italic text-muted-foreground">
                  This message has been deleted
                </span>
              ) : (
                <div className="break-words whitespace-pre-wrap">
                  {message.text}
                  {message.editedAt && (
                    <span className="text-xs opacity-70 ml-2">(edited)</span>
                  )}
                </div>
              )}
            </>
          )}

          {/* Attachments */}
          {message.type === 'image' && message.attachmentUrl && (
            <div className="max-w-sm">
              <img 
                src={message.attachmentUrl} 
                alt="Attachment"
                className="rounded-lg w-full h-auto"
              />
              {message.text && (
                <p className="mt-2 text-sm">{message.text}</p>
              )}
            </div>
          )}

          {/* File attachments */}
          {message.type === 'file' && (
            <div className="flex items-center gap-2 p-2 bg-background/10 rounded">
              <div className="w-8 h-8 bg-background/20 rounded flex items-center justify-center">
                📎
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {message.attachmentMeta?.fileName || 'File'}
                </p>
                <p className="text-xs opacity-70">
                  {message.attachmentMeta?.size ? `${Math.round(message.attachmentMeta.size / 1024)}KB` : 'Unknown size'}
                </p>
              </div>
            </div>
          )}

          {/* Message actions menu */}
          <div className={cn(
            "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity",
            isOwn ? "-left-8" : "-right-8"
          )}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-6 h-6 p-0 bg-background border">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? "end" : "start"}>
                <DropdownMenuItem onClick={() => onReply?.(message)}>
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.text || '')}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                {isOwn && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit?.(message.id)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(message.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Reactions */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className={cn(
            "flex flex-wrap gap-1 mt-1",
            isOwn ? "justify-end" : "justify-start"
          )}>
            {Object.entries(groupedReactions).map(([emoji, reactionList]) => (
              <Button
                key={emoji}
                variant="outline"
                size="sm"
                className="h-6 px-2 py-0 text-xs bg-background/50 hover:bg-background/80"
                onClick={() => handleReactionClick(emoji)}
              >
                {emoji} {reactionList.length}
              </Button>
            ))}
          </div>
        )}

        {/* Time and status */}
        <div className={cn(
          "flex items-center gap-1 mt-1 text-xs text-muted-foreground",
          isOwn ? "flex-row-reverse" : "flex-row"
        )}>
          <span>{formatTime(message.createdAt)}</span>
          {getDeliveryStatus()}
        </div>
      </div>
    </div>
  );
}