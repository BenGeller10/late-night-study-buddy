import { useState } from 'react';
import ConversationList from '@/components/messaging/ConversationList';
import ChatView from '@/components/messaging/ChatView';
import PageTransition from '@/components/layout/PageTransition';

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleBack = () => {
    setSelectedConversationId(null);
  };

  const handleNewChat = () => {
    // In a real app, this would open a dialog to create a new chat
    console.log('New chat clicked');
  };

  return (
    <PageTransition>
      <div className="h-screen bg-background overflow-hidden">
        {selectedConversationId ? (
          <ChatView 
            conversationId={selectedConversationId} 
            onBack={handleBack}
          />
        ) : (
          <ConversationList 
            onConversationSelect={handleConversationSelect}
            onNewChat={handleNewChat}
          />
        )}
      </div>
    </PageTransition>
  );
}