import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Filter, Sparkles } from "lucide-react";
import TutorCard from "./TutorCard";
import { supabase } from "@/integrations/supabase/client";
import { useSearchAnalytics } from "@/hooks/useGameification";
import { soundEffects } from "@/lib/sounds";
interface Tutor {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  major?: string;
  year?: number;
  campus?: string;
  rating?: number;
  total_sessions?: number;
}
interface Subject {
  id: string;
  name: string;
  code: string;
  hourly_rate?: number;
}
interface SwipeViewProps {
  onTutorMatch: (tutorId: string) => void;
  onChat: (tutorId: string) => void;
  onBook: (tutorId: string) => void;
  onViewProfile: (tutorId: string) => void;
}
const SwipeView = ({
  onTutorMatch,
  onChat,
  onBook,
  onViewProfile
}: SwipeViewProps) => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [originalTutors, setOriginalTutors] = useState<Tutor[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampus, setSelectedCampus] = useState<string>("");
  const [allSwiped, setAllSwiped] = useState(false);
  const [tutorSubjects, setTutorSubjects] = useState<{
    [tutorId: string]: Subject[];
  }>({});
  
  const { trackSearch } = useSearchAnalytics();

  useEffect(() => {
    fetchTutors();
  }, [selectedCampus]);

  useEffect(() => {
    if (tutors.length > 0 && originalTutors.length === 0) {
      setOriginalTutors([...tutors]);
    }
    setAllSwiped(currentIndex >= tutors.length);
  }, [tutors, currentIndex, originalTutors.length]);

  const fetchTutors = async () => {
    try {
      let query = supabase.from('profiles').select(`
          *,
          tutor_subjects (
            hourly_rate,
            subjects (
              id,
              name,
              code
            )
          )
        `).eq('is_tutor', true);
      
      if (selectedCampus) {
        query = query.eq('campus', selectedCampus);
      }
      
      const { data, error } = await query.limit(20);
      if (error) throw error;

      // Process tutor subjects
      const tutorList: Tutor[] = [];
      const subjectsMap: { [tutorId: string]: Subject[]; } = {};
      
      data?.forEach(tutor => {
        tutorList.push({
          id: tutor.id,
          user_id: tutor.user_id,
          display_name: tutor.display_name || 'Anonymous Tutor',
          avatar_url: tutor.avatar_url,
          bio: tutor.bio,
          major: tutor.major,
          year: tutor.year,
          campus: tutor.campus,
          rating: Math.random() * 1.5 + 3.5, // Mock rating for now
          total_sessions: Math.floor(Math.random() * 50) + 5 // Mock sessions
        });
        
        subjectsMap[tutor.user_id] = tutor.tutor_subjects?.map((ts: any) => ({
          id: ts.subjects.id,
          name: ts.subjects.name,
          code: ts.subjects.code,
          hourly_rate: ts.hourly_rate
        })) || [];
      });
      
      setTutors(tutorList);
      setTutorSubjects(subjectsMap);
      console.log('Loaded tutors from database:', tutorList.length, tutorList);
    } catch (error) {
      console.error('Error fetching tutors:', error);
      // Fallback to mock data
      setTutors([
        {
          id: '1',
          user_id: 'mock-1',
          display_name: 'Alex Chen',
          bio: 'CS major who loves helping with algorithms and data structures! Let\'s code together! 💻',
          major: 'Computer Science',
          year: 3,
          campus: 'Main Campus',
          rating: 4.8,
          total_sessions: 42
        },
        {
          id: '2',
          user_id: 'mock-2',
          display_name: 'Sarah Martinez',
          bio: 'Math tutor with a passion for making calculus fun and understandable! 📊',
          major: 'Mathematics',
          year: 4,
          campus: 'Main Campus',
          rating: 4.9,
          total_sessions: 38
        }
      ]);
      
      setTutorSubjects({
        'mock-1': [
          { id: '1', name: 'Computer Science I', code: 'CS 1410', hourly_rate: 30 },
          { id: '2', name: 'Computer Science II', code: 'CS 2420', hourly_rate: 35 }
        ],
        'mock-2': [
          { id: '3', name: 'Calculus I', code: 'MATH 1410', hourly_rate: 25 },
          { id: '4', name: 'Calculus II', code: 'MATH 1420', hourly_rate: 30 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await trackSearch(searchQuery, selectedCampus);
      setCurrentIndex(0);
    }
  };

  const handleSwipeRight = () => {
    soundEffects.playSwipeRight();
    const activeTutor = tutors[currentIndex];
    if (activeTutor) {
      onTutorMatch(activeTutor.user_id);
      soundEffects.playMatch();
    }
    setCurrentIndex(prev => prev + 1);
  };

  const handleSwipeLeft = () => {
    soundEffects.playSwipeLeft();
    setCurrentIndex(prev => prev + 1);
  };

  const handleChat = (tutorId: string) => {
    soundEffects.playMessage();
    onChat(tutorId);
  };

  const handleBook = (tutorId: string) => {
    soundEffects.playSuccess();
    onBook(tutorId);
  };

  const handleStartOver = () => {
    soundEffects.playSuccess();
    setCurrentIndex(0);
    setTutors([...originalTutors]);
    setAllSwiped(false);
  };

  const activeTutor = tutors[currentIndex];
  const activeSubjects = activeTutor ? tutorSubjects[activeTutor.user_id] || [] : [];

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-muted rounded-lg" />
        <div className="h-96 bg-muted rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto h-[600px] perspective-1000">
      {/* Card Stack Container */}
      <div className="relative w-full h-full">
        {allSwiped ? (
          // Empty State
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="p-8 text-center space-y-6 max-w-sm bg-background/95 backdrop-blur-sm border-primary/20 shadow-glow">
              <div className="text-8xl animate-bounce">👀</div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  You've seen everyone!
                </h3>
                <p className="text-muted-foreground text-lg">
                  Check back later for new tutors or adjust your filters ✨
                </p>
              </div>
              <Button 
                onClick={handleStartOver}
                className="mt-6 bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-all duration-300 text-lg px-8 py-3 rounded-full"
                size="lg"
              >
                Start Over 🔄
              </Button>
            </Card>
          </div>
        ) : (
          // Tutor Cards Stack
          <>
            {/* Background Cards (for stack effect) */}
            {tutors.slice(currentIndex + 1, currentIndex + 3).map((tutor, index) => {
              const subjects = tutorSubjects[tutor.user_id] || [];
              const scale = 1 - (index + 1) * 0.05;
              const yOffset = (index + 1) * 8;
              
              return (
                <div
                  key={`bg-${tutor.id}`}
                  className="absolute inset-0 transition-all duration-300"
                  style={{
                    transform: `translateY(${yOffset}px) scale(${scale})`,
                    zIndex: 10 - index,
                    opacity: 0.7 - index * 0.2
                  }}
                >
                  <TutorCard
                    tutor={{
                      id: tutor.id,
                      name: tutor.display_name,
                      profilePicture: tutor.avatar_url || "/placeholder.svg",
                      classes: subjects.map(s => s.code),
                      tutorStyle: tutor.bio || "Ready to help you succeed! 🚀",
                      hourlyRate: subjects.length > 0 ? subjects[0].hourly_rate || 25 : 25,
                      isFree: Math.random() > 0.7,
                      rating: tutor.rating || 4.5,
                      totalSessions: tutor.total_sessions || 0
                    }}
                    onSwipeLeft={() => {}}
                    onSwipeRight={() => {}}
                    onChat={() => {}}
                    onBook={() => {}}
                    onViewProfile={() => {}}
                  />
                </div>
              );
            })}

            {/* Main Active Card */}
            {activeTutor && (
              <div className="absolute inset-0 z-20 transition-all duration-300 hover:scale-105">
                <TutorCard
                  key={activeTutor.id}
                  tutor={{
                    id: activeTutor.id,
                    name: activeTutor.display_name,
                    profilePicture: activeTutor.avatar_url || "/placeholder.svg",
                    classes: activeSubjects.map(s => s.code),
                    tutorStyle: activeTutor.bio || "Ready to help you succeed! 🚀",
                    hourlyRate: activeSubjects.length > 0 ? activeSubjects[0].hourly_rate || 25 : 25,
                    isFree: Math.random() > 0.7,
                    rating: activeTutor.rating || 4.5,
                    totalSessions: activeTutor.total_sessions || 0
                  }}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onChat={() => handleChat(activeTutor.user_id)}
                  onBook={() => handleBook(activeTutor.user_id)}
                  onViewProfile={() => onViewProfile(activeTutor.user_id)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default SwipeView;