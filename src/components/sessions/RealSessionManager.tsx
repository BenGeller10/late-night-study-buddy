import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  Star, 
  Video,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface Session {
  id: string;
  student_id: string;
  tutor_id: string;
  subject_id: string;
  scheduled_at: string;
  duration_minutes: number;
  total_amount: number;
  status: 'pending_payment' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  location: string;
  notes: string;
  student_rating?: number;
  tutor_rating?: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  // Joined data
  student_profile?: any;
  tutor_profile?: any;
  subject?: any;
}

interface RealSessionManagerProps {
  currentUser: User;
  userType: 'student' | 'tutor';
}

const RealSessionManager = ({ currentUser, userType }: RealSessionManagerProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      loadSessions();
    }
  }, [currentUser, userType]);

  const loadSessions = async () => {
    try {
      const userIdField = userType === 'student' ? 'student_id' : 'tutor_id';
      const otherUserIdField = userType === 'student' ? 'tutor_id' : 'student_id';
      const otherProfileField = userType === 'student' ? 'tutor_profile' : 'student_profile';

      const { data: sessions, error } = await supabase
        .from('sessions')
        .select(`
          *,
          ${otherProfileField}:profiles!${otherUserIdField}(
            user_id,
            display_name,
            avatar_url,
            is_tutor
          ),
          subject:subjects(name, code)
        `)
        .eq(userIdField, currentUser.id)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      setSessions((sessions || []) as Session[]);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load sessions. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatus = async (sessionId: string, newStatus: Session['status']) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ status: newStatus })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, status: newStatus }
            : session
        )
      );

      toast({
        title: "Session updated",
        description: `Session status changed to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: "Error",
        description: "Failed to update session status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'pending_payment':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusActions = (session: Session) => {
    const actions = [];

    if (userType === 'tutor' && session.status === 'pending_payment') {
      actions.push(
        <Button
          key="confirm"
          size="sm"
          onClick={() => updateSessionStatus(session.id, 'confirmed')}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Confirm
        </Button>
      );
    }

    if (session.status === 'confirmed' && new Date(session.scheduled_at) <= new Date()) {
      actions.push(
        <Button
          key="start"
          size="sm"
          onClick={() => updateSessionStatus(session.id, 'in_progress')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Video className="w-4 h-4 mr-1" />
          Start Session
        </Button>
      );
    }

    if (session.status === 'in_progress') {
      actions.push(
        <Button
          key="complete"
          size="sm"
          onClick={() => updateSessionStatus(session.id, 'completed')}
          className="bg-gray-600 hover:bg-gray-700"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Complete
        </Button>
      );
    }

    if (['pending_payment', 'confirmed'].includes(session.status)) {
      actions.push(
        <Button
          key="cancel"
          size="sm"
          variant="destructive"
          onClick={() => updateSessionStatus(session.id, 'cancelled')}
        >
          <XCircle className="w-4 h-4 mr-1" />
          Cancel
        </Button>
      );
    }

    return actions;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
          <p className="text-muted-foreground">
            {userType === 'student' 
              ? "Book your first tutoring session to get started!"
              : "Students will start booking sessions with you soon!"
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const otherProfile = userType === 'student' 
          ? session.tutor_profile 
          : session.student_profile;
        
        return (
          <Card key={session.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={otherProfile?.avatar_url} />
                    <AvatarFallback>
                      {otherProfile?.display_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      Session with {otherProfile?.display_name || 'Unknown User'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {session.subject?.name || session.subject?.code || 'General Tutoring'}
                    </p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(session.status)} text-white`}>
                  {session.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Session Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(session.scheduled_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {new Date(session.scheduled_at).toLocaleTimeString()} 
                    ({session.duration_minutes}min)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>${session.total_amount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{session.location}</span>
                </div>
              </div>

              {/* Notes */}
              {session.notes && (
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-sm">{session.notes}</p>
                </div>
              )}

              {/* Payment Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Payment:</span>
                <Badge variant={session.payment_status === 'paid' ? 'default' : 'secondary'}>
                  {session.payment_status} via {session.payment_method}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {getStatusActions(session)}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RealSessionManager;