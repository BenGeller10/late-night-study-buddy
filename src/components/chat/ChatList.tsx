import { Badge } from "@/components/ui/badge";

interface ChatPreview {
  tutorId: string;
  tutorName: string;
  tutorProfilePicture: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  className: string;
}

interface ChatListProps {
  chats: ChatPreview[];
  onChatSelect: (tutorId: string) => void;
}

const ChatList = ({ chats, onChatSelect }: ChatListProps) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffMinutes < 1 ? 'now' : `${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-6">
        <div className="space-y-4 max-w-sm">
          <span className="text-6xl">💬</span>
          <h3 className="text-xl font-semibold">No conversations yet</h3>
          <p className="text-muted-foreground">
            Start chatting with tutors from the Discover page to see your conversations here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <div
          key={chat.tutorId}
          onClick={() => onChatSelect(chat.tutorId)}
          className="flex items-center gap-3 p-4 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors btn-smooth"
        >
          <div className="relative">
            <img
              src={chat.tutorProfilePicture}
              alt={chat.tutorName}
              className="w-12 h-12 rounded-full object-cover"
            />
            {chat.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold truncate">{chat.tutorName}</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatTime(chat.lastMessageTime)}
                </span>
                {chat.unreadCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-xs h-5 min-w-5 px-1">
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground truncate flex-1">
                {chat.lastMessage}
              </p>
              <Badge variant="outline" className="text-xs h-4 px-1 ml-2">
                {chat.className}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;