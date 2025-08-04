import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, isToday } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon,
  ChevronLeft, 
  ChevronRight,
  Clock,
  DollarSign,
  User as UserIcon,
  MessageCircle,
  MapPin,
  BookOpen,
  Star
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PageTransition from "@/components/layout/PageTransition";
import { cn } from "@/lib/utils";

interface BookedSession {
  id: string;
  studentName: string;
  studentAvatar: string;
  subject: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  location: string;
  amount: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  studentRating?: number;
  notes?: string;
}

const Bookings = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [bookedSessions, setBookedSessions] = useState<BookedSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Fetch real session data from database
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const { data: sessions, error } = await supabase
          .from('sessions')
          .select(`
            id,
            scheduled_at,
            duration_minutes,
            total_amount,
            status,
            location,
            notes,
            student_rating,
            tutor_rating,
            profiles!sessions_student_id_fkey (
              display_name,
              avatar_url
            ),
            subjects (
              name
            )
          `)
          .eq('tutor_id', user.user.id)
          .not('scheduled_at', 'is', null)
          .order('scheduled_at', { ascending: true });

        if (error) {
          console.error('Error fetching sessions:', error);
          return;
        }

        const formattedSessions: BookedSession[] = sessions?.map(session => ({
          id: session.id,
          studentName: session.profiles?.display_name || 'Unknown Student',
          studentAvatar: session.profiles?.avatar_url || '/placeholder.svg',
          subject: session.subjects?.name || 'Unknown Subject',
          date: new Date(session.scheduled_at),
          startTime: format(new Date(session.scheduled_at), 'h:mm a'),
          endTime: format(new Date(new Date(session.scheduled_at).getTime() + (session.duration_minutes || 60) * 60000), 'h:mm a'),
          duration: session.duration_minutes || 60,
          location: session.location || 'TBD',
          amount: Number(session.total_amount) || 0,
          status: session.status as 'confirmed' | 'pending' | 'completed' | 'cancelled',
          studentRating: session.student_rating || undefined,
          notes: session.notes || undefined
        })) || [];

        setBookedSessions(formattedSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const getSessionsForDate = (date: Date) => {
    return bookedSessions.filter(session => isSameDay(session.date, date));
  };

  const getDatesWithSessions = () => {
    return bookedSessions.map(session => session.date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const totalEarningsThisWeek = bookedSessions
    .filter(session => {
      const sessionDate = session.date;
      return sessionDate >= currentWeek && sessionDate < addWeeks(currentWeek, 1);
    })
    .reduce((total, session) => total + session.amount, 0);

  const sessionsThisWeek = bookedSessions.filter(session => {
    const sessionDate = session.date;
    return sessionDate >= currentWeek && sessionDate < addWeeks(currentWeek, 1);
  }).length;

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center pb-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your bookings...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-800 pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-700/80 backdrop-blur-lg border-b border-gray-600">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <h1 className="text-xl font-bold text-sky-400">
                  TutorPro - Business Calendar 💼
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your tutoring appointments & earnings
                </p>
              </div>
              
              {/* Profile Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/profile')}
                className="btn-smooth hover:bg-muted/50"
              >
                <UserIcon className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Stats and Calendar Picker */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <CalendarIcon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{sessionsThisWeek}</div>
                <div className="text-xs text-muted-foreground">Sessions This Week</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">${totalEarningsThisWeek}</div>
                <div className="text-xs text-muted-foreground">Expected Earnings</div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar Navigation */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Your Schedule</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewMode === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('month')}
                  >
                    Month
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Jump to Date
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          if (date) {
                            setCurrentWeek(startOfWeek(date));
                          }
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                        modifiers={{
                          booked: getDatesWithSessions()
                        }}
                        modifiersStyles={{
                          booked: { backgroundColor: 'hsl(var(--primary))', color: 'white', borderRadius: '50%' }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Week/Month View */}
          {viewMode === 'week' ? (
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <CardTitle className="text-center">
                    Week of {format(currentWeek, 'MMM d, yyyy')}
                  </CardTitle>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                  
                  {weekDays.map((day) => {
                    const sessionsForDay = getSessionsForDate(day);
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                    const isCurrentDay = isToday(day);
                    
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "relative p-2 rounded-lg text-sm transition-colors",
                          "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary",
                          isSelected && "bg-primary text-primary-foreground",
                          isCurrentDay && !isSelected && "bg-muted text-foreground font-semibold"
                        )}
                      >
                        <div>{format(day, 'd')}</div>
                        {sessionsForDay.length > 0 && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isSelected ? "bg-primary-foreground" : "bg-primary"
                            )} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className={cn("w-full pointer-events-auto")}
                  modifiers={{
                    booked: getDatesWithSessions()
                  }}
                  modifiersStyles={{
                    booked: { 
                      backgroundColor: 'hsl(var(--primary))', 
                      color: 'white', 
                      borderRadius: '6px',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Selected Day Sessions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
                  {selectedDate && isToday(selectedDate) && (
                    <Badge variant="secondary" className="ml-2">Today</Badge>
                  )}
                </span>
                <Badge variant="outline">
                  {selectedDate ? getSessionsForDate(selectedDate).length : 0} session{selectedDate && getSessionsForDate(selectedDate).length !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {!selectedDate || getSessionsForDate(selectedDate).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{!selectedDate ? 'Select a date to view sessions' : 'No sessions scheduled for this day'}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => navigate('/set-availability')}
                  >
                    Set Availability
                  </Button>
                </div>
              ) : (
                getSessionsForDate(selectedDate).map((session) => (
                  <Card key={session.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={session.studentAvatar} alt={session.studentName} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {session.studentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{session.studentName}</h4>
                              <p className="text-sm text-muted-foreground">{session.subject}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="secondary" 
                                className={cn("text-white", getStatusColor(session.status))}
                              >
                                {getStatusText(session.status)}
                              </Badge>
                              {session.studentRating && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-current text-yellow-500" />
                                  <span className="text-xs">{session.studentRating}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{session.startTime} - {session.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span>${session.amount}</span>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>{session.location}</span>
                            </div>
                          </div>

                          {session.notes && (
                            <div className="text-sm bg-muted/30 p-2 rounded italic">
                              "{session.notes}"
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <BookOpen className="w-4 h-4 mr-2" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default Bookings;