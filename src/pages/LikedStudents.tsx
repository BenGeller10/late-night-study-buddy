import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, 
  MessageCircle, 
  BookOpen, 
  Star, 
  Clock,
  User as UserIcon,
  GraduationCap,
  MapPin
} from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { useConversations } from "@/hooks/useConversations";
import { useToast } from "@/hooks/use-toast";

interface LikedStudent {
  id: string;
  name: string;
  avatar: string;
  major: string;
  year: string;
  subjects: string[];
  rating: number;
  lastActive: string;
  bio: string;
  campus: string;
  matchDate: string;
}

const LikedStudents = () => {
  const navigate = useNavigate();
  const [likedStudents, setLikedStudents] = useState<LikedStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { createConversation } = useConversations();
  const { toast } = useToast();

  // Mock data - in real app would come from database
  useEffect(() => {
    const mockStudents: LikedStudent[] = [
      {
        id: '1',
        name: 'Emma Johnson',
        avatar: '/placeholder.svg',
        major: 'Biology',
        year: 'Sophomore',
        subjects: ['BIO 201', 'CHEM 102'],
        rating: 4.9,
        lastActive: '2 hours ago',
        bio: 'Pre-med student struggling with organic chemistry. Looking for consistent help.',
        campus: 'Main Campus',
        matchDate: '2024-01-15'
      },
      {
        id: '2',
        name: 'Marcus Chen',
        avatar: '/placeholder.svg',
        major: 'Computer Science',
        year: 'Junior',
        subjects: ['CS 301', 'MATH 245'],
        rating: 4.7,
        lastActive: '1 day ago',
        bio: 'Need help with data structures and algorithms for upcoming interviews.',
        campus: 'North Campus',
        matchDate: '2024-01-12'
      },
      {
        id: '3',
        name: 'Sofia Rodriguez',
        avatar: '/placeholder.svg',
        major: 'Economics',
        year: 'Senior',
        subjects: ['ECON 301', 'STAT 200'],
        rating: 4.8,
        lastActive: '3 hours ago',
        bio: 'Senior thesis work on behavioral economics. Need advanced statistics help.',
        campus: 'Main Campus',
        matchDate: '2024-01-10'
      },
      {
        id: '4',
        name: 'Jake Williams',
        avatar: '/placeholder.svg',
        major: 'Physics',
        year: 'Freshman',
        subjects: ['PHYS 101', 'MATH 151'],
        rating: 4.6,
        lastActive: '5 hours ago',
        bio: 'First year struggling with calculus-based physics. Very motivated to learn!',
        campus: 'South Campus',
        matchDate: '2024-01-08'
      }
    ];

    setTimeout(() => {
      setLikedStudents(mockStudents);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleChat = async (studentId: string) => {
    try {
      const conversationId = await createConversation(studentId);
      if (conversationId) {
        navigate(`/chat/${studentId}`);
      } else {
        toast({
          title: "Error",
          description: "Failed to start conversation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: "Error", 
        description: "Failed to start conversation",
        variant: "destructive",
      });
    }
  };

  const handleViewProfile = (studentId: string) => {
    navigate(`/student/${studentId}`);
  };

  const handleAcceptStudent = (studentId: string) => {
    // Logic to accept the student match
    console.log('Accepting student:', studentId);
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center pb-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your matches...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-800 pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-700/80 backdrop-blur-lg border-b border-gray-600">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <h1 className="text-xl font-bold text-sky-400">
                  TutorPro - Student Matches 💼
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your potential clients
                </p>
              </div>
              
              {/* Profile Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/profile')}
                className="btn-smooth hover:bg-muted/50"
              >
                <UserIcon className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {likedStudents.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No matches yet</h3>
              <p className="text-muted-foreground">
                Students who like your profile will appear here
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {likedStudents.length} student{likedStudents.length !== 1 ? 's' : ''} interested in your tutoring
                </p>
              </div>

              {likedStudents.map((student) => (
                <Card key={student.id} className="glass-card hover:bg-muted/20 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={student.avatar} alt={student.name} />
                         <AvatarFallback className="bg-sky-500/20 text-sky-600">
                           {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{student.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <GraduationCap className="w-4 h-4" />
                              <span>{student.major} • {student.year}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current text-yellow-500" />
                            <span className="text-sm font-medium">{student.rating}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {student.subjects.map((subject) => (
                            <Badge key={subject} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {student.bio}
                        </p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{student.campus}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Active {student.lastActive}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptStudent(student.id)}
                            className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            Accept Match
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChat(student.id)}
                            className="flex-1"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Chat
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewProfile(student.id)}
                          >
                            <BookOpen className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default LikedStudents;