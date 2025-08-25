import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

interface ChatConversationProps {
  tutor: {
    id: string;
    name: string;
    profilePicture: string;
    classes: string[];
    isOnline?: boolean;
  };
  onBack: () => void;
}

const ChatConversation = ({ tutor, onBack }: ChatConversationProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: tutor.id,
      content: `Hi! I'm ${tutor.name}. Ready to help you with ${tutor.classes[0]}! What questions do you have? 📚`,
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      isCurrentUser: false
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      senderId: "current-user",
      content: newMessage.trim(),
      timestamp: new Date(),
      isCurrentUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate tutor response
    setTimeout(() => {
      const tutorResponse: Message = {
        id: (Date.now() + 1).toString(),
        senderId: tutor.id,
        content: getTutorResponse(newMessage),
        timestamp: new Date(),
        isCurrentUser: false
      };
      setMessages(prev => [...prev, tutorResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const getTutorResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // More contextual responses based on keywords
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `Hey there! I'm excited to help you with ${tutor.classes[0]}. What specific topic are you working on? 👋`;
    }
    
    if (lowerMessage.includes('book') || lowerMessage.includes('schedule') || lowerMessage.includes('session')) {
      return "Great! I'd love to set up a tutoring session. You can book directly through the app - I have availability most afternoons and evenings. What works best for you? 📅";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('stuck') || lowerMessage.includes('confused')) {
      return "No worries at all! That's what I'm here for. Can you tell me exactly where you're getting stuck? I'll walk you through it step by step. 🤝";
    }
    
    if (lowerMessage.includes('exam') || lowerMessage.includes('test') || lowerMessage.includes('quiz')) {
      return "Test prep is my specialty! I can help you create a study plan, review key concepts, and practice problems. When is your exam? Let's get you ready! 📚";
    }
    
    if (lowerMessage.includes('homework') || lowerMessage.includes('assignment') || lowerMessage.includes('problem')) {
      return "I'd be happy to help with your homework! I can guide you through problems without just giving you answers. What specific assignment are you working on? 📝";
    }
    
    // Fallback responses
    const responses = [
      "That's a great question! Let me break that down for you step by step. 🤔",
      "I can definitely help with that! Here's how I'd approach it...",
      "That's a common issue students face. Let me explain it clearly 💡",
      "Perfect timing! I just helped another student with something similar.",
      "Let's work through this together. Do you have your notes ready? 📖",
      "I love that question! It shows you're really thinking about the material.",
      "No worries, we've all been there. Let me show you a simple way to understand this.",
      "Great topic! This is actually one of my favorite things to teach. Here's the key insight...",
      "I can see why that would be confusing. Let me clarify that concept for you! ✨"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20 p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="btn-smooth"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <img
                src={tutor.profilePicture}
                alt={tutor.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {tutor.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold">{tutor.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {tutor.isOnline ? 'Online' : 'Last seen recently'}
                </span>
                <Badge variant="outline" className="text-xs h-4 px-1">
                  {tutor.classes[0]}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
              message.isCurrentUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}>
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-2 rounded-2xl">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-background border-t border-border/20 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${tutor.name}...`}
            className="flex-1"
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!newMessage.trim() || isTyping}
            className="btn-smooth"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatConversation;