export interface Message {
  id: string;
  from: "me" | "them";
  at: string;
  text: string;
  avatar?: string;
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar?: string;
    status?: "online" | "offline" | "away";
  };
  messages: Message[];
  lastActivity: string;
  unread?: number;
}

export const mockConversations: Conversation[] = [
  {
    id: "conv1",
    participant: {
      id: "t1",
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616c367fb0c?w=100&h=100&fit=crop&crop=face",
      status: "online"
    },
    lastActivity: "2 minutes ago",
    unread: 1,
    messages: [
      {
        id: "m1",
        from: "them",
        at: "2024-08-16T14:30:00.000Z",
        text: "Hi! I'm available to help with your calculus questions. What specific topics are you working on?"
      },
      {
        id: "m2",
        from: "me",
        at: "2024-08-16T14:35:00.000Z",
        text: "Thanks! I'm struggling with derivatives, especially the chain rule. Could you help explain it?"
      },
      {
        id: "m3",
        from: "them",
        at: "2024-08-16T14:37:00.000Z",
        text: "Absolutely! The chain rule is really useful. Let's start with a simple example and build up from there. Are you free for a quick session now?"
      }
    ]
  },
  {
    id: "conv2",
    participant: {
      id: "t2",
      name: "Mike Rodriguez",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      status: "away"
    },
    lastActivity: "1 hour ago",
    messages: [
      {
        id: "m4",
        from: "me",
        at: "2024-08-16T13:00:00.000Z",
        text: "Hey Mike! Are you available to help with my data structures assignment?"
      },
      {
        id: "m5",
        from: "them",
        at: "2024-08-16T13:15:00.000Z",
        text: "Sure! What data structure are you working with? Arrays, linked lists, trees?"
      }
    ]
  }
];