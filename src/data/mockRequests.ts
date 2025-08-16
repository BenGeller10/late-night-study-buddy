export interface RequestItem {
  id: string;
  studentName: string;
  subject: string;
  when: string;
  status: "new" | "accepted" | "declined";
  avatar?: string;
  message?: string;
}

export const mockRequests: RequestItem[] = [
  {
    id: "r1",
    studentName: "Emma Wilson",
    subject: "Calculus",
    when: "Today at 2:00 PM",
    status: "new",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    message: "Need help with derivatives and chain rule"
  },
  {
    id: "r2",
    studentName: "James Lee",
    subject: "Organic Chemistry",
    when: "Tomorrow at 4:30 PM",
    status: "new",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    message: "Struggling with reaction mechanisms"
  },
  {
    id: "r3",
    studentName: "Maria Garcia",
    subject: "Computer Science",
    when: "Friday at 1:00 PM",
    status: "new",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616c367fb0c?w=100&h=100&fit=crop&crop=face",
    message: "Data structures assignment due soon"
  },
  {
    id: "r4",
    studentName: "Ryan Chang",
    subject: "Economics",
    when: "Yesterday at 3:00 PM",
    status: "accepted",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    message: "Microeconomics exam prep"
  },
  {
    id: "r5",
    studentName: "Sophie Brown",
    subject: "Statistics",
    when: "Monday at 11:00 AM",
    status: "declined",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    message: "Hypothesis testing confusion"
  },
  {
    id: "r6",
    studentName: "Kevin Liu",
    subject: "Physics",
    when: "Wednesday at 5:00 PM",
    status: "accepted",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    message: "Quantum mechanics problems"
  }
];