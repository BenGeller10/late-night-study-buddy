import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Star, User, MessageCircle, CheckCircle } from "lucide-react";

interface Session {
  id: string;
  tutor_id: string;
  student_id: string;
  subject_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  total_amount: number;
  student_rating?: number;
  tutor_rating?: number;
  tutor?: {
    display_name: string;
    avatar_url: string;
  };
  subject?: {
    name: string;
    code: string;
  };
}

interface MySessionsProps {
  user: any;
  onBack: () => void;
}

const MySessions = ({ user, onBack }: MySessionsProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          tutor:profiles!sessions_tutor_id_fkey(display_name, avatar_url),
          subject:subjects(name, code)
        `)
        .eq('student_id', user.id)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error loading sessions",
        description: "Failed to load your sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRateTutor = async (sessionId: string, rating: number) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ student_rating: rating })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(sessions.map(session => 
        session.id === sessionId 
          ? { ...session, student_rating: rating }
          : session
      ));

      toast({
        title: "Rating submitted!",
        description: "Thank you for your feedback.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to submit rating",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="animate-fade-in p-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your sessions...</p>
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
            <h1 className="text-xl font-bold">My Sessions</h1>
            <p className="text-sm text-muted-foreground">
              Your tutoring sessions and progress
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
                {sessions.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-500">
                {sessions.filter(s => s.status === 'upcoming').length}
              </div>
              <div className="text-xs text-muted-foreground">Upcoming</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-accent">
                {sessions.reduce((total, s) => total + (s.duration_minutes || 60), 0) / 60}h
              </div>
              <div className="text-xs text-muted-foreground">Total Hours</div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Sessions</h2>
          
          {sessions.length === 0 ? (
            <Card className="text-center p-8">
              <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No sessions yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Book your first tutoring session to get started!
              </p>
              <Button onClick={onBack}>Find Tutors</Button>
            </Card>
          ) : (
            sessions.map(session => (
              <Card key={session.id} className="glass-card hover-scale">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">
                          {session.tutor?.display_name || 'Tutor'}
                        </h3>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(session.scheduled_at || '')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{session.duration_minutes || 60} minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {session.subject?.code} - {session.subject?.name}
                          </Badge>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                        
                        {session.status === 'completed' && !session.student_rating && (
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <Button
                                key={rating}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRateTutor(session.id, rating)}
                                className="p-1"
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        {session.student_rating && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 fill-current text-yellow-500" />
                            <span>{session.student_rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MySessions;