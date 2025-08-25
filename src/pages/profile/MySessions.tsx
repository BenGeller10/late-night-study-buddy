import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Clock, Star, User, MessageCircle, CheckCircle } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
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
        .neq('status', 'cancelled')
        .order('scheduled_at', { ascending: true });

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
      case 'completed': return 'bg-success/20 text-success border-success/30';
      case 'pending_payment': 
      case 'confirmed':
      case 'in_progress': return 'bg-blue/20 text-blue border-blue/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
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

  // Filter sessions by status
  const upcomingSessions = sessions.filter(s => 
    ['pending_payment', 'confirmed', 'in_progress'].includes(s.status)
  );
  const completedSessions = sessions.filter(s => s.status === 'completed');

  // Get sessions for selected date
  const getSessionsForDate = (date: Date) => {
    return upcomingSessions.filter(session => {
      if (!session.scheduled_at) return false;
      return isSameDay(parseISO(session.scheduled_at), date);
    });
  };

  // Get dates that have sessions
  const getSessionDates = () => {
    return upcomingSessions
      .filter(s => s.scheduled_at)
      .map(s => parseISO(s.scheduled_at));
  };

  // Check if date has sessions
  const hasSessionsOnDate = (date: Date) => {
    return getSessionsForDate(date).length > 0;
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
              <div className="text-2xl font-bold text-success">
                {completedSessions.length}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue">
                {upcomingSessions.length}
              </div>
              <div className="text-xs text-muted-foreground">Upcoming</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-accent">
                {Math.round(sessions.reduce((total, s) => total + (s.duration_minutes || 60), 0) / 60)}h
              </div>
              <div className="text-xs text-muted-foreground">Total Hours</div>
            </CardContent>
          </Card>
        </div>

        {sessions.length === 0 ? (
          <Card className="text-center p-8">
            <CalendarIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-medium mb-2">No sessions yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Book your first tutoring session to get started!
            </p>
            <Button onClick={onBack}>Find Tutors</Button>
          </Card>
        ) : (
          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedSessions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Upcoming Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border pointer-events-auto"
                    modifiers={{
                      hasSession: getSessionDates()
                    }}
                    modifiersStyles={{
                      hasSession: {
                        backgroundColor: 'hsl(var(--blue))',
                        color: 'hsl(var(--blue-foreground))',
                        borderRadius: '50%'
                      }
                    }}
                  />

                  {selectedDate && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-base">
                        {format(selectedDate, 'EEEE, MMMM d')}
                      </h3>
                      
                      {getSessionsForDate(selectedDate).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No sessions scheduled for this date.</p>
                      ) : (
                        <div className="space-y-3">
                          {getSessionsForDate(selectedDate).map(session => (
                            <Card key={session.id} className="p-4 border-l-4 border-l-blue">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-5 h-5 text-primary" />
                                </div>
                                
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">{session.tutor?.display_name || 'Tutor'}</h4>
                                    <Badge className={getStatusColor(session.status)} variant="outline">
                                      {session.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4" />
                                      <span>{format(parseISO(session.scheduled_at), 'h:mm a')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4" />
                                      <span>{session.duration_minutes} min</span>
                                    </div>
                                  </div>
                                  
                                  <Badge variant="secondary" className="text-xs">
                                    {session.subject?.code} - {session.subject?.name}
                                  </Badge>

                                  <Button variant="outline" size="sm" className="w-full mt-2">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Chat with Tutor
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <div className="space-y-3">
                {completedSessions.length === 0 ? (
                  <Card className="text-center p-8">
                    <CheckCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No completed sessions yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Your completed sessions will appear here.
                    </p>
                  </Card>
                ) : (
                  completedSessions.map(session => (
                    <Card key={session.id} className="glass-card">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-success" />
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">
                                {session.tutor?.display_name || 'Tutor'}
                              </h3>
                              <Badge className={getStatusColor(session.status)} variant="outline">
                                Completed
                              </Badge>
                            </div>
                            
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                <span>{formatDate(session.scheduled_at || '')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{session.duration_minutes || 60} minutes</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {session.subject?.code} - {session.subject?.name}
                              </Badge>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Chat
                              </Button>
                              
                              {!session.student_rating ? (
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <Button
                                      key={rating}
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRateTutor(session.id, rating)}
                                      className="p-1 hover:text-warning"
                                    >
                                      <Star className="w-4 h-4" />
                                    </Button>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-sm px-2">
                                  <Star className="w-4 h-4 fill-warning text-warning" />
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
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default MySessions;