import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Star, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MatchedTutor {
  name: string;
  match_score: number;
  best_overlap: string;
}

interface AIMatchingResult {
  matched_tutors: MatchedTutor[];
  message: string;
}

interface AIMatchmakingProps {
  studentId: string;
  className: string;
  onChat: (tutorId: string) => void;
  onBook: (tutorId: string) => void;
}

const AIMatchmaking = ({ studentId, className, onChat, onBook }: AIMatchmakingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<MatchedTutor[]>([]);
  const [message, setMessage] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const findMatches = async () => {
    setIsLoading(true);
    try {
      // Get student's profile and schedule
      const { data: studentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('schedule_data')
        .eq('user_id', studentId)
        .single();

      if (profileError) {
        throw new Error('Could not fetch student profile');
      }

      // Get available tutors (mock data for now)
      const mockTutors = [
        {
          name: "Josh M.",
          major: "Biology", 
          courses: ["Organic Chemistry", "Biology 101"],
          availability: "Monday: 9am-12pm, Wednesday: 2pm-5pm"
        },
        {
          name: "Emma P.",
          major: "Chemistry",
          courses: ["Organic Chemistry", "Physics 101"], 
          availability: "Tuesday: 5pm-8pm, Thursday: 1pm-4pm"
        },
        {
          name: "Sarah T.",
          major: "Math",
          courses: ["Calculus", "Statistics"],
          availability: "Monday: 1pm-3pm, Friday: 9am-11am"
        },
        {
          name: "Alex K.",
          major: "Chemistry",
          courses: ["Organic Chemistry", "General Chemistry"],
          availability: "Monday: 10am-1pm, Tuesday: 3pm-6pm"
        }
      ];

      const requestData = {
        student_needs: {
          class: className,
          schedule_text: studentProfile.schedule_data || "Available most afternoons and evenings"
        },
        available_tutors: mockTutors
      };

      console.log('Sending AI matchmaking request:', requestData);

      const { data: result, error } = await supabase.functions.invoke('ai-matchmaking', {
        body: requestData
      });

      if (error) {
        console.error('AI Matchmaking error:', error);
        throw error;
      }

      console.log('AI Matchmaking result:', result);

      setMatches(result.matched_tutors || []);
      setMessage(result.message || "");
      setHasSearched(true);

      toast({
        title: "Smart matches found!",
        description: `Found ${result.matched_tutors?.length || 0} tutors that fit your schedule.`,
      });

    } catch (error) {
      console.error('Error finding matches:', error);
      toast({
        title: "Error",
        description: "Couldn't find matches right now. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* AI Matchmaking Banner */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-blue-400">
            Smart Schedule Matching 🗓️
          </CardTitle>
          <p className="text-muted-foreground">
            Let AI find tutors that perfectly match your schedule for {className}
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={findMatches}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding your best matches...
              </>
            ) : (
              "See your best matches now 🗓️"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          {message && (
            <Card className="bg-card/50">
              <CardContent className="pt-4">
                <p className="text-center text-muted-foreground">{message}</p>
              </CardContent>
            </Card>
          )}

          {matches.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Your Top Matches:</h3>
              {matches.map((match, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">{match.name}</h4>
                          <Badge 
                            className={`${getScoreColor(match.match_score)} text-white`}
                          >
                            {match.match_score}% match
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{match.best_overlap}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onChat('mock-tutor-id')}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Chat
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onBook('mock-tutor-id')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Book
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {matches.length === 0 && hasSearched && (
            <Card className="bg-card/50">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  No perfect matches found right now, but don't worry! 
                  Try browsing all tutors below or update your schedule.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AIMatchmaking;