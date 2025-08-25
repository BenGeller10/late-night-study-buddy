import { useConversations } from "@/hooks/useConversations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Check, X, Clock } from "lucide-react";

const PendingMessagesView = () => {
  const { 
    conversations, 
    loading, 
    acceptConversation, 
    declineConversation,
    currentUser
  } = useConversations();
  const { toast } = useToast();

  // Filter for pending conversations where current user is the tutor (participant2)
  const pendingMessages = conversations.filter(
    conv => conv.status === 'pending' && conv.participant2_id === currentUser?.id
  );

  const handleAccept = async (conversationId: string, studentName: string) => {
    const success = await acceptConversation(conversationId);
    if (success) {
      toast({
        title: "Message request accepted",
        description: `You can now chat with ${studentName}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to accept message request",
        variant: "destructive",
      });
    }
  };

  const handleDecline = async (conversationId: string, studentName: string) => {
    const success = await declineConversation(conversationId);
    if (success) {
      toast({
        title: "Message request declined",
        description: `Declined message request from ${studentName}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to decline message request",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Pending Message Requests</h2>
        {pendingMessages.length > 0 && (
          <Badge variant="secondary" className="bg-warning/20 text-warning">
            {pendingMessages.length}
          </Badge>
        )}
      </div>

      {pendingMessages.length === 0 ? (
        <Card className="glass-card text-center p-8">
          <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No pending requests</h3>
          <p className="text-sm text-muted-foreground">
            New message requests from students will appear here
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingMessages.map((conversation) => (
            <Card key={conversation.id} className="glass-card border-l-4 border-l-warning">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conversation.other_participant.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {conversation.other_participant.display_name[0]?.toUpperCase() || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-warning border-2 border-background rounded-full flex items-center justify-center">
                      <Clock className="w-2 h-2 text-background" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {conversation.other_participant.display_name || 'Student'}
                        </h3>
                        <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                          New Request
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {conversation.last_message?.content || "wants to start a conversation with you"}
                      </p>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        Received {new Date(conversation.last_message_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAccept(conversation.id, conversation.other_participant.display_name)}
                        className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                        size="sm"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      
                      <Button
                        onClick={() => handleDecline(conversation.id, conversation.other_participant.display_name)}
                        variant="outline"
                        className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingMessagesView;