
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Calendar, Star, Clock, Award, Users } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { useToast } from "@/hooks/use-toast";
import BookingDialog from "@/components/booking/BookingDialog";
import { supabase } from "@/integrations/supabase/client";
import { Tutor } from "@/hooks/useTutors";

const TutorProfile = () => {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tutorId) {
      fetchTutorProfile(tutorId);
    }
  }, [tutorId]);

  const fetchTutorProfile = async (id: string) => {
    try {
      setLoading(true);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          tutor_subjects (
            id,
            hourly_rate,
            subjects (
              id,
              name,
              code
            )
          )
        `)
        .eq('user_id', id)
        .eq('is_tutor', true)
        .single();

      if (error) {
        throw error;
      }

      if (!profile) {
        setError('Tutor not found');
        return;
      }

      // Transform the data to match our Tutor interface
      const subjects = profile.tutor_subjects?.map((ts: any) => ({
        id: ts.subjects?.id || '',
        name: ts.subjects?.name || '',
        code: ts.subjects?.code || '',
        hourly_rate: ts.hourly_rate || 0
      })) || [];

      const classes = subjects.map(s => s.code).filter(Boolean);
      
      // Calculate average hourly rate
      const rates = subjects.map(s => s.hourly_rate).filter(r => r > 0);
      const avgRate = rates.length > 0 ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;

      const transformedTutor: Tutor = {
        id: profile.user_id,
        user_id: profile.user_id,
        name: profile.display_name || 'Anonymous Tutor',
        profilePicture: profile.avatar_url || '/placeholder.svg',
        classes,
        tutorStyle: profile.bio || "I'm here to help you succeed in your studies! 📚",
        hourlyRate: avgRate,
        isFree: avgRate === 0,
        rating: 4.8, // Default rating - could be calculated from session feedback
        totalSessions: 25, // Default - could be calculated from sessions table
        bio: profile.bio,
        experience: profile.experience,
        major: profile.major,
        subjects
      };

      setTutor(transformedTutor);
    } catch (err) {
      console.error('Error fetching tutor profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tutor profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center pb-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageTransition>
    );
  }

  if (error || !tutor) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center pb-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Tutor Not Found</h2>
            <p className="text-muted-foreground mb-4">{error || 'This tutor profile does not exist.'}</p>
            <Button onClick={() => navigate('/discover')}>
              Back to Discover
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const handleChat = () => {
    navigate(`/chat/${tutor.id}`);
  };

  const handleBookingSuccess = (sessionId: string) => {
    toast({
      title: "Session Booked!",
      description: `Your session with ${tutor.name} has been scheduled. Check your sessions page for details.`,
    });
    navigate('/my-sessions');
  };

  // Generate mock availability and achievements for display
  const availability = ["Mon 2-6 PM", "Wed 3-7 PM", "Fri 1-5 PM"];
  const achievements = ["Dean's List", "Peer Tutor Award", "High Student Ratings"];

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
                onClick={() => navigate(-1)}
                className="btn-smooth"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">Tutor Profile</h1>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-2xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <img
                  src={tutor.profilePicture}
                  alt={tutor.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h2 className="text-2xl font-bold">{tutor.name}</h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <Star className="w-3 h-3 mr-1" />
                      {tutor.rating} ({tutor.totalSessions} sessions)
                    </Badge>
                  </div>
                </div>
                
                <p className="text-muted-foreground">{tutor.bio}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {tutor.experience || 'Experienced tutor'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {tutor.totalSessions} students helped
                  </div>
                </div>

                {tutor.major && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Major:</strong> {tutor.major}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Pricing */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Pricing</h3>
            <div className="text-center p-4 bg-muted/20 rounded-xl">
              {tutor.isFree ? (
                <div>
                  <div className="text-2xl font-bold text-success">Free Tutoring! 🎉</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    This tutor offers free help to fellow students
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-bold text-primary">${tutor.hourlyRate}/hr</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Flexible scheduling • Pay per session
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Classes & Subjects */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Classes I Can Help With</h3>
            {tutor.classes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tutor.classes.map((className, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {className}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No specific classes listed</p>
            )}
          </Card>

          {/* Subjects with Individual Rates */}
          {tutor.subjects && tutor.subjects.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">Subject-Specific Rates</h3>
              <div className="space-y-2">
                {tutor.subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                    <span className="font-medium">{subject.code} - {subject.name}</span>
                    <span className="text-primary font-semibold">
                      {subject.hourly_rate > 0 ? `$${subject.hourly_rate}/hr` : 'Free'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Teaching Style */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Teaching Style</h3>
            <p className="text-muted-foreground leading-relaxed">
              {tutor.tutorStyle}
            </p>
          </Card>

          {/* Availability */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Availability</h3>
            <div className="space-y-2">
              {availability.map((time, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {time}
                </div>
              ))}
            </div>
          </Card>

          {/* Achievements */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Achievements</h3>
            <div className="space-y-2">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-primary" />
                  {achievement}
                </div>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 btn-smooth"
              onClick={handleChat}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Chat
            </Button>
            <BookingDialog
              tutor={tutor}
              onBookingSuccess={handleBookingSuccess}
              triggerButton={
                <Button
                  variant="campus"
                  size="lg"
                  className="flex-1 btn-smooth"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Session
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default TutorProfile;
