import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User as UserIcon, 
  Calendar, 
  Clock, 
  DollarSign, 
  Star, 
  Users, 
  MessageCircle,
  Bell,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award
} from "lucide-react";

interface TutorHomeProps {
  user: User;
  onRoleSwitch: (isTutor: boolean) => void;
}

interface TutorRequest {
  id: string;
  student_name: string;
  subject: string;
  time_requested: string;
  message?: string;
}

const TutorHome = ({ user, onRoleSwitch }: TutorHomeProps) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [stats, setStats] = useState({
    sessionsThisMonth: 12,
    totalEarnings: 840,
    rating: 4.8,
    studentsHelped: 24
  });

  // Mock requests data
  useEffect(() => {
    setRequests([
      {
        id: '1',
        student_name: 'Emma Wilson',
        subject: 'Calculus II',
        time_requested: '2 hours ago',
        message: 'Need help with integration by parts before my exam tomorrow!'
      },
      {
        id: '2', 
        student_name: 'David Park',
        subject: 'Organic Chemistry',
        time_requested: '4 hours ago',
        message: 'Struggling with reaction mechanisms'
      },
      {
        id: '3',
        student_name: 'Sarah Johnson',
        subject: 'Linear Algebra',
        time_requested: '6 hours ago'
      }
    ]);
  }, []);

  const handleAcceptRequest = (requestId: string) => {
    setRequests(prev => prev.filter(req => req.id !== requestId));
    // Here you would handle the accept logic
  };

  const handleDeclineRequest = (requestId: string) => {
    setRequests(prev => prev.filter(req => req.id !== requestId));
    // Here you would handle the decline logic
  };

  const upcomingSessions = [
    {
      id: '1',
      student: 'Alex Rivera',
      subject: 'Physics I',
      time: 'Today, 3:00 PM',
      duration: '1 hour',
      rate: '$25/hr'
    },
    {
      id: '2',
      student: 'Maya Chen',
      subject: 'Statistics',
      time: 'Tomorrow, 10:00 AM', 
      duration: '1.5 hours',
      rate: '$30/hr'
    },
    {
      id: '3',
      student: 'Jordan Smith',
      subject: 'Calculus I',
      time: 'Thursday, 2:00 PM',
      duration: '2 hours',
      rate: '$25/hr'
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">
                Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'Tutor'}! 🎓
              </h1>
              <p className="text-sm text-muted-foreground">
                Ready to help students succeed?
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRoleSwitch(false)}
                className="text-xs"
              >
                Switch to Student
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/profile')}
              >
                <UserIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card border-green-200 dark:border-green-800">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">${stats.totalEarnings}</div>
              <div className="text-xs text-muted-foreground">This Month</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{stats.studentsHelped}</div>
              <div className="text-xs text-muted-foreground">Students Helped</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{stats.rating}</div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-purple-200 dark:border-purple-800">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{stats.sessionsThisMonth}</div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </CardContent>
          </Card>
        </div>

        {/* Incoming Requests */}
        <Card className="glass-card border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500" />
                Incoming Requests
              </div>
              <Badge variant="secondary">{requests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No new requests at the moment</p>
                <p className="text-sm">Check back later for new opportunities!</p>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="p-4 bg-muted/30 rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {request.student_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.student_name}</p>
                        <p className="text-sm text-muted-foreground">{request.subject}</p>
                        <p className="text-xs text-muted-foreground">{request.time_requested}</p>
                      </div>
                    </div>
                  </div>
                  
                  {request.message && (
                    <p className="text-sm bg-background/50 p-2 rounded italic">
                      "{request.message}"
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptRequest(request.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeclineRequest(request.id)}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card className="glass-card border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-blue-500/20 text-blue-600 text-sm">
                        {session.student.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{session.student}</p>
                      <p className="text-xs text-muted-foreground">{session.subject}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{session.time}</p>
                    <p className="text-xs text-muted-foreground">{session.duration} • {session.rate}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Your Impact */}
        <Card className="glass-card border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              Your Impact This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                17 Hours
              </div>
              <p className="text-muted-foreground">spent helping students succeed</p>
              <div className="flex justify-center gap-4 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-500">8</div>
                  <div className="text-xs text-muted-foreground">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-500">6</div>
                  <div className="text-xs text-muted-foreground">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-500">4.9</div>
                  <div className="text-xs text-muted-foreground">Avg Rating</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TutorHome;