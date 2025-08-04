import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, MessageCircle, Calendar, Star, BookOpen } from "lucide-react";

interface Student {
  id: string;
  display_name: string;
  avatar_url: string;
  major?: string;
  year?: number;
  sessions_count: number;
  subjects: string[];
  last_session?: string;
  total_hours: number;
  average_rating?: number;
}

interface StudentsProps {
  user: any;
  onBack: () => void;
}

const Students = ({ user, onBack }: StudentsProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const fetchStudents = async () => {
    if (!user?.id) return;

    try {
      // Mock data for now - in real app would query sessions table
      const mockStudents: Student[] = [
        {
          id: "1",
          display_name: "Alex Johnson",
          avatar_url: "",
          major: "Engineering",
          year: 3,
          sessions_count: 8,
          subjects: ["Calculus II", "Physics I"],
          last_session: "2024-01-15",
          total_hours: 12,
          average_rating: 5
        },
        {
          id: "2",
          display_name: "Sarah Chen",
          avatar_url: "",
          major: "Pre-Med",
          year: 2,
          sessions_count: 12,
          subjects: ["Organic Chemistry", "Biology I"],
          last_session: "2024-01-14",
          total_hours: 18,
          average_rating: 4.8
        },
        {
          id: "3",
          display_name: "Mike Davis",
          avatar_url: "",
          major: "Physics",
          year: 4,
          sessions_count: 6,
          subjects: ["Physics I", "Physics II"],
          last_session: "2024-01-13",
          total_hours: 9,
          average_rating: 4.9
        },
        {
          id: "4",
          display_name: "Emma Wilson",
          avatar_url: "",
          major: "Computer Science",
          year: 2,
          sessions_count: 15,
          subjects: ["Computer Science II", "Discrete Math"],
          last_session: "2024-01-12",
          total_hours: 22.5,
          average_rating: 5
        },
        {
          id: "5",
          display_name: "James Brown",
          avatar_url: "",
          major: "Mathematics",
          year: 1,
          sessions_count: 4,
          subjects: ["Statistics", "Calculus I"],
          last_session: "2024-01-10",
          total_hours: 6,
          average_rating: 4.7
        }
      ];

      setStudents(mockStudents);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error loading students",
        description: "Failed to load your student list.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatLastSession = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="animate-fade-in p-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20 p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">My Students</h1>
            <p className="text-sm text-muted-foreground">
              Students you've helped and their progress
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {students.length}
              </div>
              <div className="text-xs text-muted-foreground">Total Students</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-500">
                {students.reduce((sum, s) => sum + s.sessions_count, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Sessions</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-accent">
                {students.reduce((sum, s) => sum + s.total_hours, 0)}h
              </div>
              <div className="text-xs text-muted-foreground">Hours Taught</div>
            </CardContent>
          </Card>
        </div>

        {/* Student List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Students</h2>
          
          {students.length === 0 ? (
            <Card className="text-center p-8">
              <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No students yet</h3>
              <p className="text-sm text-muted-foreground">
                Start tutoring to build your student network!
              </p>
            </Card>
          ) : (
            students.map(student => (
              <Card key={student.id} className="glass-card hover-scale">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={student.avatar_url} alt={student.display_name} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {getInitials(student.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{student.display_name}</h3>
                        {student.average_rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current text-yellow-500" />
                            <span className="text-sm font-medium">{student.average_rating}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {student.major && (
                          <Badge variant="outline" className="text-xs">
                            {student.major} {student.year && `• Year ${student.year}`}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          <span>Subjects: {student.subjects.join(", ")}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span>{student.sessions_count} sessions</span>
                            <span>{student.total_hours}h total</span>
                          </div>
                          {student.last_session && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span className="text-xs">Last: {formatLastSession(student.last_session)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            toast({
                              title: "Opening chat...",
                              description: `Starting conversation with ${student.display_name}`,
                            });
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            window.open('https://calendly.com/your-calendly-link', '_blank');
                          }}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Teaching Impact */}
        <Card className="glass-card border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-300">
              <span className="text-lg">📈</span>
              Your Teaching Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {(students.reduce((sum, s) => sum + (s.average_rating || 0), 0) / students.length).toFixed(1)}
                </div>
                <div className="text-muted-foreground">Average Rating</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {Math.round(students.reduce((sum, s) => sum + s.total_hours, 0) / students.length * 10) / 10}h
                </div>
                <div className="text-muted-foreground">Avg Hours/Student</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              You're making a real difference in your students' academic journey! 🌟
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Students;