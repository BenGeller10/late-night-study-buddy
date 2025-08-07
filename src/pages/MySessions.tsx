
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign,
  ArrowLeft,
  MessageCircle,
  Star,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Session {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  total_amount: number;
  status: string;
  payment_status: string;
  location: string;
  notes: string;
  student_rating: number | null;
  tutor_rating: number | null;
  created_at: string;
  tutor_profile: {
    display_name: string;
    avatar_url: string;
  };
  subject: {
    name: string;
    code: string;
  };
}

const MySessions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          tutor_profile:profiles!sessions_tutor_id_fkey(display_name, avatar_url),
          subject:subjects(name, code)
        `)
        .eq('student_id', user.id)
        .order('scheduled_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: "Error",
          description: "Failed to load your sessions.",
          variant: "destructive",
        });
        return;
      }

      setSessions(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = (sessions: Session[]) => {
    const now = new Date();
    
    switch (activeTab) {
      case 'upcoming':
        return sessions.filter(session => 
          new Date(session.scheduled_at) > now && 
          session.status !== 'cancelled'
        );
      case 'completed':
        return sessions.filter(session => 
          session.status === 'completed' || 
          (new Date(session.scheduled_at) < now && session.status !== 'cancelled')
        );
      case 'cancelled':
        return sessions.filter(session => session.status === 'cancelled');
      default:
        return sessions;
    }
  };

  const handleChatWithTutor = (tutorId: string) => {
    navigate(`/chat/${tutorId}`);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center pb-20">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Loading your sessions...</p>
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
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/home')}
                className="btn-smooth"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">My Sessions</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your tutoring sessions
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4 mt-6">
              {filterSessions(sessions).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Upcoming Sessions</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      You don't have any upcoming tutoring sessions scheduled.
                    </p>
                    <Button onClick={() => navigate('/discover')}>
                      Find a Tutor
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filterSessions(sessions).map((session) => (
                  <SessionCard 
                    key={session.id} 
                    session={session} 
                    onChatWithTutor={handleChatWithTutor}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-6">
              {filterSessions(sessions).map((session) => (
                <SessionCard 
                  key={session.id} 
                  session={session} 
                  onChatWithTutor={handleChatWithTutor}
                  showRating
                />
              ))}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4 mt-6">
              {filterSessions(sessions).map((session) => (
                <SessionCard 
                  key={session.id} 
                  session={session} 
                  onChatWithTutor={handleChatWithTutor}
                />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
};

const SessionCard = ({ 
  session, 
  onChatWithTutor, 
  showRating = false 
}: { 
  session: Session; 
  onChatWithTutor: (tutorId: string) => void;
  showRating?: boolean;
}) => {
  const scheduledDate = new Date(session.scheduled_at);
  const isPast = scheduledDate < new Date();

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === 'pending_payment' || paymentStatus === 'pending') {
      return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">Pending Payment</Badge>;
    }
    if (status === 'confirmed') {
      return <Badge variant="secondary" className="bg-green-500/20 text-green-700">Confirmed</Badge>;
    }
    if (status === 'completed') {
      return <Badge variant="secondary" className="bg-blue-500/20 text-blue-700">Completed</Badge>;
    }
    if (status === 'cancelled') {
      return <Badge variant="secondary" className="bg-red-500/20 text-red-700">Cancelled</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={session.tutor_profile.avatar_url} />
            <AvatarFallback>
              {session.tutor_profile.display_name?.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{session.tutor_profile.display_name}</h3>
                <p className="text-muted-foreground">
                  {session.subject.code} - {session.subject.name}
                </p>
              </div>
              {getStatusBadge(session.status, session.payment_status)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{format(scheduledDate, 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{format(scheduledDate, 'h:mm a')} ({session.duration_minutes}min)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{session.location}</span>
              </div>
            </div>

            {session.notes && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm">{session.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">
                  {session.total_amount === 0 ? 'Free' : `$${session.total_amount}`}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onChatWithTutor(session.id)}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Chat
                </Button>
                
                {showRating && session.student_rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{session.student_rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MySessions;
