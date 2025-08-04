import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  MessageCircle, 
  BookOpen, 
  Star, 
  Clock,
  User as UserIcon,
  GraduationCap,
  MapPin,
  Search,
  X
} from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { useConversations } from "@/hooks/useConversations";
import { useToast } from "@/hooks/use-toast";

interface LikedStudent {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string;
  major: string;
  year: number;
  bio: string;
  campus: string;
  is_tutor: boolean;
}

const LikedStudents = () => {
  const navigate = useNavigate();
  const [likedStudents, setLikedStudents] = useState<LikedStudent[]>([]);
  const [searchResults, setSearchResults] = useState<LikedStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("liked");
  const { createConversation } = useConversations();
  const { toast } = useToast();

  // Fetch real student profiles from the database (for liked students)
  useEffect(() => {
    const fetchStudentProfiles = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_tutor', false)
          .limit(10);

        if (error) {
          console.error('Error fetching student profiles:', error);
          return;
        }

        // Convert profiles to LikedStudent format
        const studentData: LikedStudent[] = (profiles || []).map(profile => ({
          id: profile.id,
          user_id: profile.user_id,
          display_name: profile.display_name || 'Student',
          avatar_url: profile.avatar_url || '',
          major: profile.major || 'Undeclared',
          year: profile.year || 1,
          bio: profile.bio || 'Student looking for tutoring help',
          campus: profile.campus || 'Campus',
          is_tutor: profile.is_tutor
        }));

        setLikedStudents(studentData);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentProfiles();
  }, []);

  // Search functionality
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // Search by name, major, and email
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_id
        `)
        .eq('is_tutor', false)
        .or(`display_name.ilike.%${query}%,major.ilike.%${query}%`)
        .limit(20);

      if (error) {
        console.error('Error searching students:', error);
        toast({
          title: "Search Error",
          description: "Failed to search students. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Convert profiles to LikedStudent format
      const studentData: LikedStudent[] = (profiles || []).map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        display_name: profile.display_name || 'Student',
        avatar_url: profile.avatar_url || '',
        major: profile.major || 'Undeclared',
        year: profile.year || 1,
        bio: profile.bio || 'Student looking for tutoring help',
        campus: profile.campus || 'Campus',
        is_tutor: profile.is_tutor
      }));

      setSearchResults(studentData);
    } catch (error) {
      console.error('Error searching students:', error);
      toast({
        title: "Search Error",
        description: "Failed to search students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

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

  const handleAcceptStudent = async (studentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to accept connections.",
          variant: "destructive",
        });
        return;
      }

      // Update or create connection record
      const { error } = await supabase
        .from('tutor_student_connections')
        .upsert({
          tutor_id: session.user.id,
          student_id: studentId,
          status: 'accepted'
        }, {
          onConflict: 'tutor_id,student_id'
        });

      if (error) {
        console.error('Error accepting student:', error);
        toast({
          title: "Error",
          description: "Failed to accept connection. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Connection accepted! ✅",
        description: "You can now chat and schedule sessions with this student.",
      });

      // Remove from liked students list
      setLikedStudents(prev => prev.filter(student => student.user_id !== studentId));
    } catch (error) {
      console.error('Error accepting student:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Reusable student card component  
  const StudentCard = ({ student, showAcceptButton = true }: { student: LikedStudent; showAcceptButton?: boolean }) => (
    <Card className="glass-card hover:bg-muted/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-14 h-14">
            <AvatarImage src={student.avatar_url} alt={student.display_name} />
            <AvatarFallback className="bg-sky-500/20 text-sky-600">
              {student.display_name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-white">{student.display_name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="w-4 h-4" />
                  <span>{student.major} • Year {student.year}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {student.bio}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{student.campus}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {showAcceptButton && (
                <Button
                  size="sm"
                  onClick={() => handleAcceptStudent(student.user_id)}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Accept Match
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleChat(student.user_id)}
                className={`${showAcceptButton ? 'flex-1' : 'flex-1'} border-sky-400 text-sky-400 hover:bg-sky-500 hover:text-white`}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleViewProfile(student.user_id)}
                className="text-sky-400 hover:bg-sky-500 hover:text-white"
              >
                <BookOpen className="w-4 h-4" />
              </Button>
            </div>
         </div>
        </div>
      </CardContent>
    </Card>
  );

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
                  Students 👥
                </h1>
                <p className="text-sm text-muted-foreground">
                  Connect with students for tutoring
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

        {/* Content with Tabs */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="liked">Liked Students</TabsTrigger>
              <TabsTrigger value="search">Find Students</TabsTrigger>
            </TabsList>

            <TabsContent value="liked" className="space-y-4">
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
                    <StudentCard key={student.id} student={student} showAcceptButton={true} />
                  ))}
                </>
              )}
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, major, or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Search Results */}
              {isSearching ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Searching students...</p>
                </div>
              ) : searchQuery && searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">No students found</h3>
                  <p className="text-muted-foreground">
                    Try searching with different keywords
                  </p>
                </div>
              ) : searchQuery ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      Found {searchResults.length} student{searchResults.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {searchResults.map((student) => (
                    <StudentCard key={student.id} student={student} showAcceptButton={false} />
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">Search for students</h3>
                  <p className="text-muted-foreground">
                    Find new students by searching for their name, major, or email
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
};

export default LikedStudents;