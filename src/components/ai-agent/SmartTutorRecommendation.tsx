import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageCircle, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ChatDialog from "@/components/chat/ChatDialog";

interface TutorMatch {
  id: string;
  name: string;
  avatar_url: string;
  major: string;
  subjects: string[];
  rating: number;
  hourly_rate: number;
  match_reasons: string[];
  match_score: number;
}

interface SmartTutorRecommendationProps {
  userId: string;
  onChat: (tutorId: string) => void;
  onBook: (tutorId: string) => void;
  onViewProfile: (tutorId: string) => void;
}

const SmartTutorRecommendation = ({ 
  userId, 
  onChat, 
  onBook, 
  onViewProfile 
}: SmartTutorRecommendationProps) => {
  const [recommendations, setRecommendations] = useState<TutorMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const { toast } = useToast();

  const analyzeUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !profile) return null;

      // Extract keywords from user responses
      const interests = [
        profile.major_passion,
        profile.semester_goal,
        profile.stress_relief,
        profile.dream_career
      ].filter(Boolean);

      return {
        major: profile.major,
        interests,
        studySpot: profile.favorite_study_spot,
        hasCompletedQuestions: profile.completed_intro_questions
      };
    } catch (error) {
      console.error('Error analyzing user profile:', error);
      return null;
    }
  };

  const generateSmartMatches = async () => {
    setIsLoading(true);
    
    try {
      const userProfile = await analyzeUserProfile();
      
      if (!userProfile?.hasCompletedQuestions) {
        return; // Don't show recommendations until user completes onboarding
      }

      // Mock smart matching logic - in real app, this would use AI
      const mockTutors = [
        {
          id: "1",
          name: "Sarah Chen",
          avatar_url: "/placeholder.svg",
          major: "Chemistry",
          subjects: ["Organic Chemistry", "General Chemistry"],
          rating: 4.9,
          hourly_rate: 35,
          match_reasons: ["Aced Organic Chem", "Night owl tutor", "Same major"],
          match_score: 95
        },
        {
          id: "2", 
          name: "Marcus Johnson",
          avatar_url: "/placeholder.svg",
          major: "Economics",
          subjects: ["Microeconomics", "Statistics"],
          rating: 4.8,
          hourly_rate: 30,
          match_reasons: ["Econ expert", "Study group leader", "High ratings"],
          match_score: 88
        }
      ];

      // Filter and sort based on user profile
      const matchedTutors = mockTutors
        .filter(tutor => {
          // Basic matching logic
          if (userProfile.major && tutor.major.toLowerCase().includes(userProfile.major.toLowerCase())) {
            return true;
          }
          
          // Check if any interests match subjects
          return userProfile.interests.some(interest => 
            tutor.subjects.some(subject => 
              subject.toLowerCase().includes(interest?.toLowerCase() || '')
            )
          );
        })
        .sort((a, b) => b.match_score - a.match_score);

      setRecommendations(matchedTutors.slice(0, 2)); // Show top 2 matches
      setShowRecommendations(true);

      if (matchedTutors.length > 0) {
        toast({
          title: "🔥 Found your perfect tutors!",
          description: "Based on your profile, I found some amazing matches!"
        });
      }
    } catch (error) {
      console.error('Error generating smart matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      // Trigger smart matching after a short delay
      const timer = setTimeout(() => {
        generateSmartMatches();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [userId]);

  if (!showRecommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        <h3 className="font-semibold text-lg">Recommended for You</h3>
      </div>

      {recommendations.map((tutor) => (
        <Card key={tutor.id} className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={tutor.avatar_url} alt={tutor.name} />
                  <AvatarFallback>{tutor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{tutor.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {tutor.match_score}% match
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {tutor.major} • ${tutor.hourly_rate}/hr • ⭐ {tutor.rating}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tutor.match_reasons.map((reason, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                  
                  <p className="text-xs text-primary font-medium">
                    "🔥 Not to flex, but this tutor literally aced the same classes you're working on!"
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 ml-2">
                <ChatDialog
                  tutor={{
                    id: tutor.id,
                    name: tutor.name,
                    profilePicture: tutor.avatar_url,
                    classes: tutor.subjects || [tutor.major || 'General'],
                    subjects: (tutor.subjects || [tutor.major || 'General']).map((subject, index) => ({
                      id: `subject-${index}`,
                      name: subject,
                      code: subject.toUpperCase().replace(/\s+/g, ''),
                      hourly_rate: tutor.hourly_rate
                    }))
                  }}
                  triggerButton={
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Message
                    </Button>
                  }
                />
                <Button
                  size="sm"
                  onClick={() => onBook(tutor.id)}
                  className="flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3" />
                  Book
                </Button>
              </div>
            </div>
            
            <Button
              variant="link"
              size="sm"
              onClick={() => onViewProfile(tutor.id)}
              className="p-0 h-auto text-xs text-primary mt-2"
            >
              View Full Profile →
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SmartTutorRecommendation;