import { useNavigate, useParams } from "react-router-dom";
import ChatConversation from "@/components/chat/ChatConversation";
import ChatList from "@/components/chat/ChatList";
import PageTransition from "@/components/layout/PageTransition";

// Mock data for demo
const mockTutors = [
  {
    id: "1",
    name: "Sarah Chen",
    profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    classes: ["ECON 203", "ECON 101", "MATH 115"],
    isOnline: true
  },
  {
    id: "2", 
    name: "Marcus Williams",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    classes: ["CS 101", "CS 150", "MATH 120"],
    isOnline: false
  },
  {
    id: "3",
    name: "Emma Rodriguez", 
    profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    classes: ["CHEM 201", "CHEM 101", "BIO 150"],
    isOnline: true
  }
];

const mockChats = [
  {
    tutorId: "1",
    tutorName: "Sarah Chen",
    tutorProfilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    lastMessage: "Hi! I'm Sarah. Ready to help you with ECON 203! What questions do you have? 📚",
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    unreadCount: 1,
    isOnline: true,
    className: "ECON 203"
  },
  {
    tutorId: "3",
    tutorName: "Emma Rodriguez",
    tutorProfilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    lastMessage: "Great question! Let me break that down for you step by step. 🤔",
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unreadCount: 0,
    isOnline: true,
    className: "CHEM 201"
  }
];

const Chat = () => {
  const navigate = useNavigate();
  const { tutorId } = useParams();

  const handleChatSelect = (selectedTutorId: string) => {
    navigate(`/chat/${selectedTutorId}`);
  };

  const handleBackToList = () => {
    navigate('/chat');
  };

  // If tutorId is provided, show individual conversation
  if (tutorId) {
    const tutor = mockTutors.find(t => t.id === tutorId);
    if (!tutor) {
      // Tutor not found, redirect to chat list
      navigate('/chat');
      return null;
    }

    return (
      <PageTransition>
        <div className="min-h-screen bg-background pb-20">
          <ChatConversation tutor={tutor} onBack={handleBackToList} />
        </div>
      </PageTransition>
    );
  }

  // Show chat list
  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
          <div className="p-4">
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Messages 💬
            </h1>
            <p className="text-sm text-muted-foreground">
              Chat with your tutors and study groups
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <ChatList chats={mockChats} onChatSelect={handleChatSelect} />
        </div>
      </div>
    </PageTransition>
  );
};

export default Chat;