import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageTransition from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  MessageCircle, 
  Star, 
  ArrowLeft,
  Video,
  MapPin,
  DollarSign
} from "lucide-react";

interface Session {
  id: string;
  tutor_name: string;
  tutor_avatar: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  location: string;
  amount: number;
  rating?: number;
}

const MySessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - in production, fetch from Supabase
  useEffect(() => {
    const mockSessions: Session[] = [
      {
        id: '1',
        tutor_name: 'Sarah Chen',
        tutor_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        subject: 'Calculus II',
        date: 'Today',
        time: '3:00 PM',
        duration: '1 hour',
        status: 'upcoming',
        location: 'Library Room 204',
        amount: 25
      },
      {
        id: '2',
        tutor_name: 'Marcus Williams',
        tutor_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        subject: 'Computer Science 101',
        date: 'Tomorrow',
        time: '10:00 AM',
        duration: '1.5 hours',
        status: 'upcoming',
        location: 'Virtual Session',
        amount: 0
      },
      {
        id: '3',
        tutor_name: 'Emma Rodriguez',
        tutor_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        subject: 'Organic Chemistry',
        date: 'Dec 15',
        time: '2:00 PM',
        duration: '2 hours',
        status: 'completed',
        location: 'Chemistry Lab',
        amount: 60,
        rating: 5
      },
      {
        id: '4',
        tutor_name: 'Alex Kim',
        tutor_avatar: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=100&h=100&fit=crop&crop=face',
        subject: 'Economics 203',
        date: 'Dec 10',
        time: '4:00 PM',
        duration: '1 hour',
        status: 'completed',
        location: 'Student Center',
        amount: 20,
        rating: 4
      }
    ];

    setTimeout(() => {
      setSessions(mockSessions);
      setLoading(false);
    }, 1000);
  }, []);

  const handleChatWithTutor = (sessionId: string) => {
    navigate(`/chat/${sessionId}`);
  };

  const handleRateTutor = (sessionId: string) => {
    // In production, open rating modal
    console.log('Rate tutor for session:', sessionId);
  };

  const upcomingSessions = sessions.filter(s => s.status === 'upcoming');
  const pastSessions = sessions.filter(s => s.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/home')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  My Sessions
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track your learning journey
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Upcoming Sessions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
              <Badge variant="secondary">{upcomingSessions.length}</Badge>
            </div>

            {upcomingSessions.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <h3 className="font-medium mb-2">No upcoming sessions</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Book a session with a tutor to get started!
                  </p>
                  <Button onClick={() => navigate('/home')}>
                    Find Tutors
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <Card key={session.id} className="glass-card border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={session.tutor_avatar} />
                          <AvatarFallback>
                            {session.tutor_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{session.tutor_name}</h3>
                              <p className="text-sm text-blue-600 font-medium">{session.subject}</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              Upcoming
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{session.date} • {session.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{session.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{session.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>{session.amount === 0 ? 'Free' : `$${session.amount}`}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleChatWithTutor(session.id)}
                              className="flex-1"
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Chat
                            </Button>
                            {session.location === 'Virtual Session' && (
                              <Button size="sm" variant="outline">
                                <Video className="w-4 h-4 mr-2" />
                                Join
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Past Sessions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold">Past Sessions</h2>
              <Badge variant="secondary">{pastSessions.length}</Badge>
            </div>

            <div className="space-y-3">
              {pastSessions.map((session) => (
                <Card key={session.id} className="glass-card border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={session.tutor_avatar} />
                        <AvatarFallback>
                          {session.tutor_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{session.tutor_name}</h3>
                            <p className="text-sm text-green-600 font-medium">{session.subject}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {session.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-current text-yellow-500" />
                                <span className="text-sm font-medium">{session.rating}</span>
                              </div>
                            )}
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                              Completed
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{session.date} • {session.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{session.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{session.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>{session.amount === 0 ? 'Free' : `$${session.amount}`}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChatWithTutor(session.id)}
                            className="flex-1"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                          {!session.rating && (
                            <Button
                              size="sm"
                              onClick={() => handleRateTutor(session.id)}
                              className="flex-1"
                            >
                              <Star className="w-4 h-4 mr-2" />
                              Rate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default MySessions;