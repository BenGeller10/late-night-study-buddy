export interface MockTutor {
  id: string;
  name: string;
  rating: number;
  price: number;
  school: string;
  subjects: string[];
  modes: ("Zoom" | "Chat")[];
  nextAvailable?: string;
  profilePicture?: string;
  bio?: string;
  major?: string;
}

export const mockTutors: MockTutor[] = [
  {
    id: "t1",
    name: "Sarah Chen",
    rating: 4.9,
    price: 45,
    school: "Stanford University",
    subjects: ["Calculus", "Linear Algebra", "Statistics", "Physics"],
    modes: ["Zoom", "Chat"],
    nextAvailable: "Today at 3:00 PM",
    profilePicture: "https://images.unsplash.com/photo-1494790108755-2616c367fb0c?w=400&h=400&fit=crop&crop=face",
    bio: "Math PhD student passionate about helping others succeed in STEM",
    major: "Mathematics"
  },
  {
    id: "t2",
    name: "Mike Rodriguez",
    rating: 4.8,
    price: 35,
    school: "UC Berkeley",
    subjects: ["Computer Science", "Data Structures", "Algorithms"],
    modes: ["Zoom", "Chat"],
    nextAvailable: "Tomorrow at 10:00 AM",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    bio: "CS graduate student with 3 years tutoring experience",
    major: "Computer Science"
  },
  {
    id: "t3",
    name: "Emily Johnson",
    rating: 5.0,
    price: 50,
    school: "MIT",
    subjects: ["Organic Chemistry", "Biochemistry", "General Chemistry", "Biology", "Physics"],
    modes: ["Zoom"],
    nextAvailable: "2024-08-17T14:30:00.000Z",
    profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    bio: "Pre-med student specializing in chemistry and life sciences",
    major: "Chemistry"
  },
  {
    id: "t4",
    name: "Alex Kim",
    rating: 4.7,
    price: 30,
    school: "Stanford University",
    subjects: ["Economics", "Microeconomics", "Macroeconomics"],
    modes: ["Chat"],
    nextAvailable: "Monday at 2:00 PM",
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    bio: "Economics major with passion for making complex concepts simple",
    major: "Economics"
  },
  {
    id: "t5",
    name: "Jessica Park",
    rating: 4.6,
    price: 40,
    school: "UC Berkeley",
    subjects: ["Psychology", "Research Methods", "Statistics", "Neuroscience"],
    modes: ["Zoom", "Chat"],
    profilePicture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    bio: "Psychology PhD candidate with expertise in research and stats",
    major: "Psychology"
  },
  {
    id: "t6",
    name: "David Thompson",
    rating: 4.9,
    price: 25,
    school: "MIT",
    subjects: ["English Literature", "Writing", "Essay Composition", "Critical Analysis"],
    modes: ["Zoom", "Chat"],
    nextAvailable: "Available now",
    profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    bio: "English Literature graduate helping students excel in writing",
    major: "English Literature"
  }
];