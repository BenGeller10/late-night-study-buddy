import { useParams, useSearchParams } from 'react-router-dom';
import MessagingInterface from './MessagingInterface';

const MessagingPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [searchParams] = useSearchParams();
  const otherUserId = searchParams.get('otherUserId');

  if (!conversationId || !otherUserId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Invalid conversation</p>
      </div>
    );
  }

  return (
    <MessagingInterface 
      conversationId={conversationId} 
      otherUserId={otherUserId} 
    />
  );
};

export default MessagingPage;