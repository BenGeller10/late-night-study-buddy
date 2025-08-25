import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, Calendar, MessageCircle, Download, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/layout/PageTransition";
import { createGoogleCalendarUrl, createOutlookCalendarUrl, downloadCalendarEvent, CalendarEvent } from "@/lib/calendar-utils";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session');
  const paymentStatus = searchParams.get('payment');
  const stripeSessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId && stripeSessionId) {
      verifyPayment();
    } else if (paymentStatus === 'cancelled') {
      setError('Payment was cancelled');
      setLoading(false);
    } else {
      setError('Invalid payment session');
      setLoading(false);
    }
  }, [sessionId, stripeSessionId, paymentStatus]);

  const verifyPayment = async () => {
    try {
      // Verify the payment with our backend
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          stripe_session_id: stripeSessionId,
          session_id: sessionId
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        // Get updated session details
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select(`
            *,
            tutor_profile:profiles!tutor_id(display_name, avatar_url),
            subject:subjects(name, code)
          `)
          .eq('id', sessionId)
          .single();

        if (sessionError) {
          throw sessionError;
        }

        setSession(sessionData);
        
        toast({
          title: "Payment successful! 🎉",
          description: "Your tutoring session has been confirmed.",
        });
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setError(error.message || 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment...
              </p>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  if (error || paymentStatus === 'cancelled') {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❌</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">
                {paymentStatus === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {paymentStatus === 'cancelled' 
                  ? 'You cancelled the payment process. No charges were made.'
                  : error || 'There was an issue processing your payment.'
                }
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/discover')} 
                  className="w-full"
                >
                  Find Another Tutor
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/sessions')}
                  className="w-full"
                >
                  View My Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                Your tutoring session has been confirmed and paid for.
              </p>
            </div>

            {session && (
              <>
                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold">Session Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tutor:</span>
                      <span className="font-medium">
                        {session.tutor_profile?.display_name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subject:</span>
                      <span className="font-medium">
                        {session.subject?.name || 'General Tutoring'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">
                        {new Date(session.scheduled_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span className="font-medium">
                        {new Date(session.scheduled_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{session.duration_minutes} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium">${session.total_amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-medium text-green-600 capitalize">
                        {session.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add to Calendar Section */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Add to Your Calendar
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const calendarEvent: CalendarEvent = {
                          title: `Tutoring Session - ${session.subject?.name || 'General'}`,
                          description: `Tutoring session with ${session.tutor_profile?.display_name}\nSubject: ${session.subject?.name || 'General Tutoring'}\nAmount: $${session.total_amount}`,
                          start: new Date(session.scheduled_at),
                          end: new Date(new Date(session.scheduled_at).getTime() + session.duration_minutes * 60 * 1000),
                          location: session.location || 'Online'
                        };
                        window.open(createGoogleCalendarUrl(calendarEvent), '_blank');
                      }}
                      className="w-full"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const calendarEvent: CalendarEvent = {
                          title: `Tutoring Session - ${session.subject?.name || 'General'}`,
                          description: `Tutoring session with ${session.tutor_profile?.display_name}\nSubject: ${session.subject?.name || 'General Tutoring'}\nAmount: $${session.total_amount}`,
                          start: new Date(session.scheduled_at),
                          end: new Date(new Date(session.scheduled_at).getTime() + session.duration_minutes * 60 * 1000),
                          location: session.location || 'Online'
                        };
                        window.open(createOutlookCalendarUrl(calendarEvent), '_blank');
                      }}
                      className="w-full"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Outlook
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const calendarEvent: CalendarEvent = {
                          title: `Tutoring Session - ${session.subject?.name || 'General'}`,
                          description: `Tutoring session with ${session.tutor_profile?.display_name}\nSubject: ${session.subject?.name || 'General Tutoring'}\nAmount: $${session.total_amount}`,
                          start: new Date(session.scheduled_at),
                          end: new Date(new Date(session.scheduled_at).getTime() + session.duration_minutes * 60 * 1000),
                          location: session.location || 'Online'
                        };
                        downloadCalendarEvent(calendarEvent);
                      }}
                      className="w-full"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/sessions')} 
                className="w-full"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View All Sessions
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/chat')}
                className="w-full"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message Your Tutor
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/home')}
                className="w-full"
              >
                Return to Home
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                A confirmation email has been sent to your email address.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default PaymentSuccess;