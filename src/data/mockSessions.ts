export interface Session {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar?: string;
  subject: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: "upcoming" | "completed" | "cancelled";
  price: number;
  location: "Zoom" | "Chat" | "In-person";
  notes?: string;
}

export const mockSessions: Session[] = [
  {
    id: "s1",
    tutorId: "t1",
    tutorName: "Sarah Chen",
    tutorAvatar: "https://images.unsplash.com/photo-1494790108755-2616c367fb0c?w=100&h=100&fit=crop&crop=face",
    subject: "Calculus",
    date: "2024-08-17",
    time: "15:00",
    duration: 60,
    status: "upcoming",
    price: 45,
    location: "Zoom",
    notes: "Derivatives and chain rule practice"
  },
  {
    id: "s2",
    tutorId: "t3",
    tutorName: "Emily Johnson",
    tutorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    subject: "Organic Chemistry",
    date: "2024-08-18",
    time: "14:30",
    duration: 90,
    status: "upcoming",
    price: 50,
    location: "Zoom",
    notes: "Reaction mechanisms review"
  },
  {
    id: "s3",
    tutorId: "t2",
    tutorName: "Mike Rodriguez",
    tutorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    subject: "Data Structures",
    date: "2024-08-15",
    time: "16:00",
    duration: 60,
    status: "completed",
    price: 35,
    location: "Zoom",
    notes: "Binary trees and traversal algorithms"
  }
];

export interface Availability {
  tutorId: string;
  start: string;
  end: string;
  isBooked?: boolean;
}

export const mockAvailability: Availability[] = [
  // Sarah Chen (t1)
  { tutorId: "t1", start: "2024-08-17T09:00:00.000Z", end: "2024-08-17T10:00:00.000Z" },
  { tutorId: "t1", start: "2024-08-17T15:00:00.000Z", end: "2024-08-17T16:00:00.000Z", isBooked: true },
  { tutorId: "t1", start: "2024-08-18T10:00:00.000Z", end: "2024-08-18T11:30:00.000Z" },
  { tutorId: "t1", start: "2024-08-18T14:00:00.000Z", end: "2024-08-18T15:00:00.000Z" },
  
  // Mike Rodriguez (t2)
  { tutorId: "t2", start: "2024-08-17T10:00:00.000Z", end: "2024-08-17T11:00:00.000Z" },
  { tutorId: "t2", start: "2024-08-17T16:00:00.000Z", end: "2024-08-17T17:30:00.000Z" },
  { tutorId: "t2", start: "2024-08-18T13:00:00.000Z", end: "2024-08-18T14:00:00.000Z" },
  { tutorId: "t2", start: "2024-08-19T09:00:00.000Z", end: "2024-08-19T10:30:00.000Z" }
];