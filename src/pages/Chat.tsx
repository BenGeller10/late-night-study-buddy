import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import ChatConversation from "@/components/chat/ChatConversation";
import RealChatConversation from "@/components/chat/RealChatConversation";
import ChatList from "@/components/chat/ChatList";
import PageTransition from "@/components/layout/PageTransition";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { supabase } from "@/integrations/supabase/client";

const Chat = () => {
  const navigate = useNavigate();
  const { tutorId, studentId } = useParams();
  const location = useLocation();
  const [isTutor, setIsTutor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { conversations, loading, currentUser } = useConversations();

  // Check if user is a tutor
  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_tutor')
          .eq('user_id', session.user.id)
          .single();
        
        setIsTutor(profile?.is_tutor || false);
      }
      setIsLoading(false);
    };

    checkUserRole();
  }, []);

  const handleChatSelect = (participantId: string) => {
    navigate(`/chat/${participantId}`);
  };

  const handleBackToList = () => {
    navigate('/chat');
  };

  // If we have a conversation ID in the URL, show the conversation
  const conversationParticipantId = tutorId || studentId;
  if (conversationParticipantId && currentUser) {
    // Find the conversation with this participant (matching by user_id)
    const conversation = conversations.find(conv => {
      // The other_participant.id is actually the user_id from profiles table
      // But we need to match against the user_id that was passed in the URL
      return conv.participant1_id === conversationParticipantId || 
             conv.participant2_id === conversationParticipantId;
    });

    if (conversation) {
      return (
        <PageTransition>
          <RealChatConversation
            conversationId={conversation.id}
            otherParticipant={conversation.other_participant}
            currentUserId={currentUser.id}
            onBack={handleBackToList}
          />
        </PageTransition>
      );
    } else if (!loading) {
      // Conversation not found, redirect back to chat list
      navigate('/chat');
      return null;
    }
  }

  if (isLoading || loading) {
    return (
      <PageTransition>
        <div className={`min-h-screen pb-20 flex items-center justify-center ${
          isTutor ? 'bg-gray-800' : 'bg-background'
        }`}>
          <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
        </div>
      </PageTransition>
    );
  }

  // Show chat list
  return (
    <PageTransition>
      <div className={`min-h-screen pb-20 ${
        isTutor ? 'bg-gray-800' : 'bg-background'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 backdrop-blur-lg border-b ${
          isTutor 
            ? 'bg-gray-700/80 border-gray-600' 
            : 'bg-background/80 border-border/20'
        }`}>
          <div className="p-4">
            <h1 className={`text-xl font-bold ${
              isTutor ? 'text-sky-400' : 'bg-gradient-primary bg-clip-text text-transparent'
            }`}>
              Messages 💬
            </h1>
            <p className="text-sm text-muted-foreground">
              {isTutor ? 'Chat with your students' : 'Chat with your tutors and study groups'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No conversations yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isTutor 
                  ? 'Students will appear here when they message you' 
                  : 'Start a conversation with a tutor to see it here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => {
                const lastMessage = conversation.last_message;
                const timeAgo = lastMessage 
                  ? formatTimeAgo(new Date(lastMessage.created_at))
                  : 'No messages';

                return (
                  <Card
                    key={conversation.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      isTutor ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : ''
                    }`}
                    onClick={() => handleChatSelect(
                      conversation.participant1_id === currentUser.id 
                        ? conversation.participant2_id 
                        : conversation.participant1_id
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={conversation.other_participant.avatar_url} />
                        <AvatarFallback className="bg-sky-500 text-white">
                          {conversation.other_participant.display_name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold truncate ${
                            isTutor ? 'text-white' : 'text-foreground'
                          }`}>
                            {conversation.other_participant.display_name || 'Unknown User'}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {conversation.other_participant.is_tutor ? 'Tutor' : 'Student'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {timeAgo}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
};

export default Chat;