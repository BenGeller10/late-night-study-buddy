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
    id: "11111111-1111-1111-1111-111111111111",
    name: "Sarah Chen",
    rating: 4.9,
    price: 45,
    school: "Syracuse University",
    subjects: ["MATH 295", "MATH 296", "PHY 211", "CAS 132"],
    modes: ["Zoom", "Chat"],
    nextAvailable: "Today at 3:00 PM",
    profilePicture: "https://images.unsplash.com/photo-1494790108755-2616c367fb0c?w=400&h=400&fit=crop&crop=face",
    bio: "Math PhD student passionate about helping others succeed in STEM. 3 years TA experience, 127 sessions completed! 🧮✨",
    major: "Mathematics PhD"
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Marcus Johnson",
    rating: 4.8,
    price: 38,
    school: "Syracuse University",
    subjects: ["CIS 252", "CIS 351", "CIS 375", "MAT 331"],
    modes: ["Zoom", "Chat"],
    nextAvailable: "Tomorrow at 10:00 AM",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    bio: "CS grad student with Google & Microsoft internships. Making coding fun and accessible! 💻🚀",
    major: "Computer Science MS"
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Emma Rodriguez",
    rating: 5.0,
    price: 42,
    school: "Syracuse University", 
    subjects: ["CHE 275", "CHE 276", "BIO 121", "BIO 123"],
    modes: ["Zoom", "Chat"],
    nextAvailable: "Available now",
    profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    bio: "Pre-med with 4.0 GPA, MCAT 95th percentile. 156 sessions completed, perfect 5.0 rating! 🧪🧬",
    major: "Biology/Pre-Med"
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "David Kim",
    rating: 4.7,
    price: 35,
    school: "Syracuse University",
    subjects: ["ECN 203", "ECN 301", "ACC 151", "FIN 256"],
    modes: ["Zoom", "Chat"],
    nextAvailable: "Monday at 2:00 PM",
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    bio: "Economics & Finance double major with Goldman Sachs internship. Real-world examples! 📈💰",
    major: "Economics & Finance"
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "Jessica Park",
    rating: 4.6,
    price: 40,
    school: "Syracuse University",
    subjects: ["PSY 205", "PSY 315", "SOC 101", "ANT 111"],
    modes: ["Zoom", "Chat"],
    nextAvailable: "Tonight at 7:00 PM",
    profilePicture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    bio: "Psychology PhD candidate, published researcher. Let's decode human behavior! 🧠📊",
    major: "Psychology PhD"
  },
  {
    id: "66666666-6666-6666-6666-666666666666", 
    name: "Michael Thompson",
    rating: 4.9,
    price: 30,
    school: "Syracuse University",
    subjects: ["ENG 105", "ENG 205", "WRT 105", "WRT 205"],
    modes: ["Zoom", "Chat"],
    nextAvailable: "Available now",
    profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    bio: "Published author & MFA candidate. Writing Center tutor, 112 sessions completed! ✍️📚",
    major: "English Literature"
  },
  {
    id: "77777777-7777-7777-7777-777777777777",
    name: "Aisha Patel",
    rating: 4.8,
    price: 48,
    school: "Syracuse University", 
    subjects: ["CHE 106", "CHE 116", "MAT 295", "PHY 101"],
    modes: ["Zoom", "Chat"],
    nextAvailable: "Today at 4:00 PM",
    profilePicture: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face",
    bio: "Chemical Engineering major with ExxonMobil internship. Let's engineer your success! ⚗️🔧",
    major: "Chemical Engineering"
  },
  {
    id: "88888888-8888-8888-8888-888888888888",
    name: "Ryan Mitchell",
    rating: 4.5,
    price: 32,
    school: "Syracuse University",
    subjects: ["HIS 101", "HIS 111", "GEO 155", "PSC 121"],
    modes: ["Zoom", "Chat"], 
    nextAvailable: "Tomorrow at 2:00 PM",
    profilePicture: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
    bio: "History & Political Science double major with D.C. internship. Making the past come alive! 🏛️🌍",
    major: "History & Political Science"
  }
];