import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, Calendar, Star, Users, Clock } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";

// Mock data (same as SwipeView for consistency)
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
    totalSessions: 47,
    bio: "Economics major with 3 years of tutoring experience. I specialize in making complex economic concepts simple and relatable through visual aids and real-world examples.",
    availability: ["Mon 2-6pm", "Wed 1-5pm", "Fri 3-7pm"],
    specialties: ["Microeconomics", "Macroeconomics", "Statistics"],
    experience: "3 years",
    studentsHelped: 47
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
    totalSessions: 23,
    bio: "Computer Science senior who loves helping fellow students. I believe in collaborative learning and creating a stress-free environment where questions are always welcome.",
    availability: ["Tue 4-8pm", "Thu 2-6pm", "Sat 10am-2pm"],
    specialties: ["Python Programming", "Algorithms", "Data Structures"],
    experience: "2 years",
    studentsHelped: 23
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
    totalSessions: 31,
    bio: "Chemistry PhD student with a passion for teaching. I focus on helping students understand the why behind chemical reactions and lab procedures.",
    availability: ["Mon 6-9pm", "Wed 7-10pm", "Sun 1-5pm"],
    specialties: ["Organic Chemistry", "Lab Techniques", "Research Methods"],
    experience: "4 years",
    studentsHelped: 31
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
    totalSessions: 35,
    bio: "Economics and Statistics double major. I love connecting economic theory to current events and helping students see how economics affects their daily lives.",
    availability: ["Tue 5-8pm", "Thu 6-9pm", "Sat 12-4pm"],
    specialties: ["Applied Economics", "Statistical Analysis", "Market Research"],
    experience: "2.5 years",
    studentsHelped: 35
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
    totalSessions: 18,
    bio: "Computer Science junior who discovered a love for teaching through peer mentoring. I focus on building problem-solving skills and coding confidence.",
    availability: ["Mon 7-10pm", "Wed 5-8pm", "Fri 6-9pm"],
    specialties: ["Java Programming", "Problem Solving", "Code Review"],
    experience: "1.5 years",
    studentsHelped: 18
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
    totalSessions: 42,
    bio: "Chemistry major with research experience in sustainable materials. I help students connect chemistry concepts to environmental and health applications.",
    availability: ["Tue 3-7pm", "Thu 4-8pm", "Sun 10am-2pm"],
    specialties: ["Environmental Chemistry", "Materials Science", "Green Chemistry"],
    experience: "3.5 years",
    studentsHelped: 42
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
    totalSessions: 56,
    bio: "Economics graduate student and teaching assistant. I specialize in exam preparation and have helped numerous students improve their grades significantly.",
    availability: ["Mon 1-5pm", "Wed 3-7pm", "Fri 2-6pm"],
    specialties: ["Exam Preparation", "Advanced Economics", "Study Strategies"],
    experience: "4 years",
    studentsHelped: 56
  }
];

const LikedTutors = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const likedTutorIds = location.state?.likedTutorIds || [];
  
  // Filter tutors based on liked IDs
  const likedTutors = mockTutors.filter(tutor => likedTutorIds.includes(tutor.id));

  const handleViewProfile = (tutorId: string) => {
    navigate(`/tutor/${tutorId}`);
  };

  const handleChat = (tutorId: string) => {
    navigate(`/chat/${tutorId}`);
  };

  const handleBook = (tutorId: string) => {
    console.log('Booking session with tutor:', tutorId);
    // Handle booking logic
  };

  if (likedTutors.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background pb-20">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
            <div className="p-4 flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/discover')}
                className="btn-smooth"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">Your Liked Tutors</h1>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center text-center p-6">
            <div className="space-y-4">
              <span className="text-6xl">💔</span>
              <h3 className="text-xl font-semibold">No liked tutors yet</h3>
              <p className="text-muted-foreground">Go back and swipe right on tutors you'd like to connect with!</p>
              <Button onClick={() => navigate('/discover')} className="btn-smooth">
                Find Tutors
              </Button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
          <div className="p-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/discover')}
              className="btn-smooth"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Your Liked Tutors ❤️</h1>
              <p className="text-sm text-muted-foreground">{likedTutors.length} tutor{likedTutors.length > 1 ? 's' : ''} you liked</p>
            </div>
          </div>
        </div>

        {/* Tutors List */}
        <div className="p-4 space-y-4">
          {likedTutors.map((tutor) => (
            <Card key={tutor.id} className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <img
                    src={tutor.profilePicture}
                    alt={tutor.name}
                    className="w-16 h-16 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-primary transition-all btn-smooth"
                    onClick={() => handleViewProfile(tutor.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <CardTitle 
                        className="text-lg cursor-pointer hover:text-primary transition-colors story-link"
                        onClick={() => handleViewProfile(tutor.id)}
                      >
                        {tutor.name}
                      </CardTitle>
                      {tutor.isFree ? (
                        <Badge className="bg-success text-success-foreground">Free</Badge>
                      ) : (
                        <div className="text-primary font-semibold">${tutor.hourlyRate}/hr</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{tutor.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{tutor.studentsHelped} students</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{tutor.experience}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Classes */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Classes</h4>
                  <div className="flex flex-wrap gap-2">
                    {tutor.classes.map((className, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {className}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h4 className="text-sm font-medium mb-2">About</h4>
                  <p className="text-sm text-muted-foreground">{tutor.bio}</p>
                </div>

                {/* Specialties */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {tutor.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Availability</h4>
                  <div className="flex flex-wrap gap-2">
                    {tutor.availability.map((time, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 btn-smooth"
                    onClick={() => handleChat(tutor.id)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                  <Button
                    variant="campus"
                    className="flex-1 btn-smooth"
                    onClick={() => handleBook(tutor.id)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default LikedTutors;