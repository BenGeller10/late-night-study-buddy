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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampus, setSelectedCampus] = useState<string>("");
  const [tutorSubjects, setTutorSubjects] = useState<{
    [tutorId: string]: Subject[];
  }>({});
  const {
    trackSearch
  } = useSearchAnalytics();
  useEffect(() => {
    fetchTutors();
  }, [selectedCampus]);
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
      const {
        data,
        error
      } = await query.limit(20);
      if (error) throw error;

      // Process tutor subjects
      const tutorList: Tutor[] = [];
      const subjectsMap: {
        [tutorId: string]: Subject[];
      } = {};
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
          rating: Math.random() * 1.5 + 3.5,
          // Mock rating for now
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
    } catch (error) {
      console.error('Error fetching tutors:', error);
      // Fallback to mock data
      setTutors([{
        id: '1',
        user_id: 'mock-1',
        display_name: 'Alex Chen',
        bio: 'CS major who loves helping with algorithms and data structures! Let\'s code together! 💻',
        major: 'Computer Science',
        year: 3,
        campus: 'Main Campus',
        rating: 4.8,
        total_sessions: 42
      }, {
        id: '2',
        user_id: 'mock-2',
        display_name: 'Sarah Martinez',
        bio: 'Math tutor with a passion for making calculus fun and understandable! 📊',
        major: 'Mathematics',
        year: 4,
        campus: 'Main Campus',
        rating: 4.9,
        total_sessions: 38
      }]);
      setTutorSubjects({
        'mock-1': [{
          id: '1',
          name: 'Computer Science I',
          code: 'CS 1410',
          hourly_rate: 30
        }, {
          id: '2',
          name: 'Computer Science II',
          code: 'CS 2420',
          hourly_rate: 35
        }],
        'mock-2': [{
          id: '3',
          name: 'Calculus I',
          code: 'MATH 1410',
          hourly_rate: 25
        }, {
          id: '4',
          name: 'Calculus II',
          code: 'MATH 1420',
          hourly_rate: 30
        }]
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await trackSearch(searchQuery, selectedCampus);
      // Implement search filtering here
      setCurrentIndex(0);
    }
  };
  const handleSwipeRight = () => {
    soundEffects.playSwipeRight();
    const currentTutor = tutors[currentIndex];
    if (currentTutor) {
      onTutorMatch(currentTutor.user_id);
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
  const currentTutor = tutors[currentIndex];
  const currentSubjects = currentTutor ? tutorSubjects[currentTutor.user_id] || [] : [];
  if (loading) {
    return <div className="space-y-4">
        <div className="h-12 bg-muted rounded-lg animate-pulse" />
        <div className="h-96 bg-muted rounded-2xl animate-pulse" />
      </div>;
  }
  return <div className="space-y-6 animate-fade-in">
      {/* Search and Filters */}
      

      {/* Tutor Cards */}
      <div className="relative min-h-[600px] flex items-center justify-center">
        {currentTutor ? <TutorCard key={currentTutor.id} tutor={{
        id: currentTutor.id,
        name: currentTutor.display_name,
        profilePicture: currentTutor.avatar_url || "/placeholder.svg",
        classes: currentSubjects.map(s => s.code),
        tutorStyle: currentTutor.bio || "Passionate tutor ready to help!",
        hourlyRate: currentSubjects.length > 0 ? currentSubjects[0].hourly_rate || 25 : 25,
        isFree: Math.random() > 0.7,
        // Random free sessions
        rating: currentTutor.rating || 4.5,
        totalSessions: currentTutor.total_sessions || 0
      }} onSwipeLeft={handleSwipeLeft} onSwipeRight={handleSwipeRight} onChat={() => handleChat(currentTutor.user_id)} onBook={() => handleBook(currentTutor.user_id)} onViewProfile={() => onViewProfile(currentTutor.user_id)} /> : <Card className="p-8 text-center space-y-4 max-w-sm">
            <div className="text-6xl">🎉</div>
            <h3 className="text-xl font-bold">You've seen everyone!</h3>
            <p className="text-muted-foreground">
              Check back later for new tutors or adjust your filters
            </p>
            <Button 
              onClick={() => {
                setCurrentIndex(0);
                fetchTutors(); // Refresh the tutors list
              }} 
              className="mt-4"
            >
              Start Over
            </Button>
          </Card>}
      </div>
    </div>;
};
export default SwipeView;