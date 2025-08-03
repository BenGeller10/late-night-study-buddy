import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TutorListItem from "@/components/discovery/TutorListItem";
import PageTransition from "@/components/layout/PageTransition";

// Mock data for demo - same as SwipeView
const mockTutors = [
  {
    id: "1",
    name: "Sarah Chen",
    profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    classes: ["ECON 203", "ECON 101", "MATH 115"],
    tutorStyle: "I'll draw everything on a virtual whiteboard so it makes sense. I got you. 📝✨",
    hourlyRate: 25,
    isFree: false,
    rating: 4.9,
    totalSessions: 47
  },
  {
    id: "2", 
    name: "Marcus Williams",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    classes: ["CS 101", "CS 150", "MATH 120"],
    tutorStyle: "Think of me as a study buddy who already took the class. No pressure. 🤝",
    hourlyRate: 0,
    isFree: true,
    rating: 4.7,
    totalSessions: 23
  },
  {
    id: "3",
    name: "Emma Rodriguez", 
    profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    classes: ["CHEM 201", "CHEM 101", "BIO 150"],
    tutorStyle: "Lab work can be confusing but I break it down step by step. We'll ace this together! 🧪💪",
    hourlyRate: 30,
    isFree: false,
    rating: 5.0,
    totalSessions: 31
  },
  {
    id: "4",
    name: "Alex Kim",
    profilePicture: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=400&fit=crop&crop=face",
    classes: ["ECON 203", "ECON 101", "STAT 200"],
    tutorStyle: "Economics doesn't have to be boring! I use real-world examples to make it click. 📊🌍",
    hourlyRate: 20,
    isFree: false,
    rating: 4.8,
    totalSessions: 35
  },
  {
    id: "5",
    name: "Jordan Parker",
    profilePicture: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=400&fit=crop&crop=face",
    classes: ["CS 101", "CS 150", "CS 200"],
    tutorStyle: "Coding is like solving puzzles. I'll help you see the patterns and logic. 🧩💻",
    hourlyRate: 0,
    isFree: true,
    rating: 4.6,
    totalSessions: 18
  },
  {
    id: "6",
    name: "Maya Patel",
    profilePicture: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face",
    classes: ["CHEM 201", "CHEM 101", "CHEM 301"],
    tutorStyle: "Chemistry is everywhere! I make it relatable with everyday examples. ⚗️✨",
    hourlyRate: 28,
    isFree: false,
    rating: 4.9,
    totalSessions: 42
  },
  {
    id: "7",
    name: "David Chen",
    profilePicture: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop&crop=face",
    classes: ["ECON 203", "ECON 301", "MATH 115"],
    tutorStyle: "Got an econ final coming up? I've helped 20+ students ace theirs. Let's do this! 🎯📈",
    hourlyRate: 35,
    isFree: false,
    rating: 5.0,
    totalSessions: 56
  }
];

const TutorsList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const className = searchParams.get('class') || '';

  // Filter tutors for the specific class
  const tutorsForClass = mockTutors.filter(tutor => 
    tutor.classes.includes(className)
  );

  const handleChat = (tutorId: string) => {
    console.log('Starting chat with tutor:', tutorId);
    // Navigate to chat with specific tutor
  };

  const handleBook = (tutorId: string) => {
    console.log('Booking session with tutor:', tutorId);
    // Handle booking logic
  };

  const handleBackToDiscover = () => {
    navigate('/discover');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToDiscover}
                className="btn-smooth"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {className} Tutors
                </h1>
                <p className="text-sm text-muted-foreground">
                  {tutorsForClass.length} tutor{tutorsForClass.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {tutorsForClass.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div className="space-y-4">
                <span className="text-6xl">🔍</span>
                <h3 className="text-xl font-semibold">No tutors found</h3>
                <p className="text-muted-foreground">
                  We couldn't find any tutors for {className}. Try checking back later!
                </p>
                <Button onClick={handleBackToDiscover} className="mt-4">
                  Back to Discover
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stats */}
              <div className="text-center p-4 bg-muted/20 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  Found <span className="font-semibold text-primary">{tutorsForClass.length}</span> tutor{tutorsForClass.length !== 1 ? 's' : ''} for <span className="font-semibold">{className}</span>
                </p>
              </div>

              {/* Tutors List */}
              <div className="space-y-3">
                {tutorsForClass.map((tutor) => (
                  <TutorListItem
                    key={tutor.id}
                    tutor={tutor}
                    onChat={() => handleChat(tutor.id)}
                    onBook={() => handleBook(tutor.id)}
                    className="animate-fade-in-up"
                  />
                ))}
              </div>

              {/* Back Button */}
              <div className="text-center pt-6">
                <Button 
                  variant="outline" 
                  onClick={handleBackToDiscover}
                  className="btn-smooth"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Discover
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default TutorsList;