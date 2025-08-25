
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Tutor {
  id: string;
  user_id: string;
  name: string;
  profilePicture: string;
  classes: string[];
  tutorStyle: string;
  hourlyRate: number;
  isFree: boolean;
  rating: number;
  totalSessions: number;
  bio?: string;
  experience?: string;
  major?: string;
  venmo_handle?: string;
  subjects?: Array<{
    id: string;
    name: string;
    code: string;
    hourly_rate: number;
  }>;
}

export const useTutors = (searchQuery?: string) => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rich mock data for investor demo
  const getMockTutors = (): Tutor[] => [
    {
      id: "t1",
      user_id: "t1",
      name: "Sarah Chen",
      profilePicture: "https://images.unsplash.com/photo-1494790108755-2616c367fb0c?w=400&h=400&fit=crop&crop=face",
      classes: ["MATH 295", "MATH 296", "PHY 211", "CAS 132"],
      tutorStyle: "Math PhD student passionate about helping others succeed in STEM. I break down complex concepts into digestible steps! 🧮✨",
      hourlyRate: 45,
      isFree: false,
      rating: 4.9,
      totalSessions: 127,
      bio: "Math PhD student passionate about helping others succeed in STEM",
      experience: "3 years tutoring experience, TA for Calculus courses",
      major: "Mathematics PhD",
      venmo_handle: "@sarahc-tutor",
      subjects: [
        { id: "1", name: "Calculus I", code: "MATH 295", hourly_rate: 45 },
        { id: "2", name: "Calculus II", code: "MATH 296", hourly_rate: 45 },
        { id: "3", name: "General Physics", code: "PHY 211", hourly_rate: 50 },
        { id: "4", name: "Public Speaking", code: "CAS 132", hourly_rate: 35 }
      ]
    },
    {
      id: "t2",
      user_id: "t2",
      name: "Marcus Johnson",
      profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      classes: ["CIS 252", "CIS 351", "CIS 375", "MAT 331"],
      tutorStyle: "CS grad student with expertise in algorithms and data structures. I make coding fun and accessible! 💻🚀",
      hourlyRate: 38,
      isFree: false,
      rating: 4.8,
      totalSessions: 89,
      bio: "Computer Science graduate student specializing in algorithms and machine learning",
      experience: "4 years programming, internships at Google and Microsoft",
      major: "Computer Science MS",
      venmo_handle: "@marcus-codes",
      subjects: [
        { id: "5", name: "Computer Science", code: "CIS 252", hourly_rate: 40 },
        { id: "6", name: "Data Structures", code: "CIS 351", hourly_rate: 42 },
        { id: "7", name: "Database Design", code: "CIS 375", hourly_rate: 45 },
        { id: "8", name: "Discrete Math", code: "MAT 331", hourly_rate: 35 }
      ]
    },
    {
      id: "t3",
      user_id: "t3",
      name: "Emma Rodriguez",
      profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      classes: ["CHE 275", "CHE 276", "BIO 121", "BIO 123"],
      tutorStyle: "Pre-med student specializing in chemistry and biology. I help you understand, not just memorize! 🧪🧬",
      hourlyRate: 42,
      isFree: false,
      rating: 5.0,
      totalSessions: 156,
      bio: "Pre-med student with 4.0 GPA, specializing in organic chemistry and biochemistry",
      experience: "5 years tutoring, MCAT scorer in 95th percentile",
      major: "Biology/Pre-Med",
      venmo_handle: "@emma-chem",
      subjects: [
        { id: "9", name: "Organic Chemistry I", code: "CHE 275", hourly_rate: 45 },
        { id: "10", name: "Organic Chemistry II", code: "CHE 276", hourly_rate: 48 },
        { id: "11", name: "General Biology I", code: "BIO 121", hourly_rate: 38 },
        { id: "12", name: "General Biology II", code: "BIO 123", hourly_rate: 40 }
      ]
    },
    {
      id: "t4",
      user_id: "t4",
      name: "David Kim",
      profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      classes: ["ECN 203", "ECN 301", "ACC 151", "FIN 256"],
      tutorStyle: "Economics and Finance double major. I simplify complex economic theories with real-world examples! 📈💰",
      hourlyRate: 35,
      isFree: false,
      rating: 4.7,
      totalSessions: 73,
      bio: "Economics and Finance double major with internship experience at Goldman Sachs",
      experience: "Wall Street internship, Dean's List all semesters",
      major: "Economics & Finance",
      venmo_handle: "@david-econ",
      subjects: [
        { id: "13", name: "Microeconomics", code: "ECN 203", hourly_rate: 35 },
        { id: "14", name: "Macroeconomics", code: "ECN 301", hourly_rate: 38 },
        { id: "15", name: "Financial Accounting", code: "ACC 151", hourly_rate: 32 },
        { id: "16", name: "Corporate Finance", code: "FIN 256", hourly_rate: 40 }
      ]
    },
    {
      id: "t5",
      user_id: "t5",
      name: "Jessica Park",
      profilePicture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
      classes: ["PSY 205", "PSY 315", "SOC 101", "ANT 111"],
      tutorStyle: "Psychology PhD candidate passionate about research methods and statistics. Let's decode human behavior! 🧠📊",
      hourlyRate: 40,
      isFree: false,
      rating: 4.6,
      totalSessions: 94,
      bio: "Psychology PhD candidate with expertise in research methods and cognitive psychology",
      experience: "Research assistant, published 3 papers, statistics expert",
      major: "Psychology PhD",
      venmo_handle: "@jess-psych",
      subjects: [
        { id: "17", name: "Introduction to Psychology", code: "PSY 205", hourly_rate: 35 },
        { id: "18", name: "Research Methods", code: "PSY 315", hourly_rate: 45 },
        { id: "19", name: "Introduction to Sociology", code: "SOC 101", hourly_rate: 32 },
        { id: "20", name: "Cultural Anthropology", code: "ANT 111", hourly_rate: 38 }
      ]
    },
    {
      id: "t6",
      user_id: "t6",
      name: "Michael Thompson",
      profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
      classes: ["ENG 105", "ENG 205", "WRT 105", "WRT 205"],
      tutorStyle: "English Literature graduate helping students excel in writing and critical analysis. Words are powerful! ✍️📚",
      hourlyRate: 30,
      isFree: false,
      rating: 4.9,
      totalSessions: 112,
      bio: "English Literature graduate with creative writing minor, published poet",
      experience: "Writing center tutor, published author, MFA candidate",
      major: "English Literature",
      venmo_handle: "@mike-writes",
      subjects: [
        { id: "21", name: "College Writing", code: "ENG 105", hourly_rate: 28 },
        { id: "22", name: "Critical Analysis", code: "ENG 205", hourly_rate: 32 },
        { id: "23", name: "Studio 1: Practices", code: "WRT 105", hourly_rate: 30 },
        { id: "24", name: "Studio 2: Critical Research", code: "WRT 205", hourly_rate: 35 }
      ]
    },
    {
      id: "t7",
      user_id: "t7",
      name: "Aisha Patel",
      profilePicture: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face",
      classes: ["CHE 106", "CHE 116", "MAT 295", "PHY 101"],
      tutorStyle: "Chemical Engineering major with a passion for problem-solving. Let's engineer your success! ⚗️🔧",
      hourlyRate: 48,
      isFree: false,
      rating: 4.8,
      totalSessions: 67,
      bio: "Chemical Engineering major with research experience in sustainable energy",
      experience: "3 years research, internship at ExxonMobil, tutor certification",
      major: "Chemical Engineering",
      venmo_handle: "@aisha-engr",
      subjects: [
        { id: "25", name: "General Chemistry I", code: "CHE 106", hourly_rate: 40 },
        { id: "26", name: "General Chemistry II", code: "CHE 116", hourly_rate: 42 },
        { id: "27", name: "Calculus I", code: "MAT 295", hourly_rate: 45 },
        { id: "28", name: "Physics for Engineers", code: "PHY 101", hourly_rate: 50 }
      ]
    },
    {
      id: "t8",
      user_id: "t8",
      name: "Ryan Mitchell",
      profilePicture: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
      classes: ["HIS 101", "HIS 111", "GEO 155", "PSC 121"],
      tutorStyle: "History and Political Science double major. I make the past come alive and connect it to today! 🏛️🌍",
      hourlyRate: 32,
      isFree: false,
      rating: 4.5,
      totalSessions: 45,
      bio: "History and Political Science double major with Washington D.C. internship experience",
      experience: "Congressional internship, Model UN coach, debate team captain",
      major: "History & Political Science",
      venmo_handle: "@ryan-history",
      subjects: [
        { id: "29", name: "American History to 1865", code: "HIS 101", hourly_rate: 30 },
        { id: "30", name: "World History", code: "HIS 111", hourly_rate: 32 },
        { id: "31", name: "Human Geography", code: "GEO 155", hourly_rate: 28 },
        { id: "32", name: "American Politics", code: "PSC 121", hourly_rate: 35 }
      ]
    }
  ];

  const fetchTutors = async () => {
    try {
      setLoading(true);
      
      // Use mock data for demo
      const mockTutors = getMockTutors();
      
      // Filter by search query if provided
      let filteredTutors = mockTutors;
      if (searchQuery && searchQuery.trim()) {
        filteredTutors = mockTutors.filter(tutor => 
          tutor.classes.some(className => 
            className.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tutor.major?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tutor.subjects?.some(subject => 
            subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subject.code.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }

      setTutors(filteredTutors);
    } catch (err) {
      console.error('Error fetching tutors:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tutors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, [searchQuery]);

  return { tutors, loading, error, refetch: fetchTutors };
};
