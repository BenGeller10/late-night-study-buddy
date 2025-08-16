import { useConversations } from "@/hooks/useConversations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { mockConversations, type Conversation as MockConversation } from "@/data/mockConversations";

const ChatList = () => {
  const { conversations: liveConversations, loading, currentUser } = useConversations();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-xl animate-pulse">
            <div className="w-12 h-12 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // For demo purposes, prioritize mock conversations
  const allConversations = [...mockConversations, ...(liveConversations || [])];

  if (allConversations.length === 0) {
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

  const renderConversation = (conversation: MockConversation | any, index: number) => {
    // Check if it's a mock conversation or live conversation
    const isMock = 'participant' in conversation;
    
    if (isMock) {
      const mockConv = conversation as MockConversation;
      return (
        <div
          key={mockConv.id}
          onClick={() => navigate(`/chat/${mockConv.participant.id}`)}
          className="flex items-center gap-3 p-4 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors btn-smooth"
        >
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarImage src={mockConv.participant.avatar} />
              <AvatarFallback>
                {mockConv.participant.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {mockConv.participant.status === "online" && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold truncate">{mockConv.participant.name}</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {mockConv.lastActivity}
                </span>
                {mockConv.unread && mockConv.unread > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-xs h-5 min-w-5 px-1">
                    {mockConv.unread}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground truncate flex-1">
                {mockConv.messages[mockConv.messages.length - 1]?.text || "No messages yet"}
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      // Handle live conversation
      const liveConv = conversation;
      return (
        <div
          key={liveConv.id}
          onClick={() => navigate(`/chat/${liveConv.other_participant?.user_id || liveConv.other_participant?.id}`)}
          className="flex items-center gap-3 p-4 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors btn-smooth"
        >
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarImage src={liveConv.other_participant?.avatar_url} />
              <AvatarFallback>
                {(liveConv.other_participant?.display_name || 'U').split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold truncate">{liveConv.other_participant?.display_name || 'Unknown'}</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {liveConv.last_message_at || 'Recently'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground truncate flex-1">
                {liveConv.last_message || "No messages yet"}
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-2 p-4">
      {allConversations.map((conversation, index) => renderConversation(conversation, index))}
    </div>
  );
};

export default ChatList;