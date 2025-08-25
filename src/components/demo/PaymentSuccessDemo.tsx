import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, Clock, DollarSign, MessageSquare } from 'lucide-react';

const PaymentSuccessDemo = () => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-background flex items-center justify-center p-4 relative">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="confetti">🎉</div>
        </div>
      )}
      
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-3xl text-green-700">Payment Successful!</CardTitle>
          <p className="text-muted-foreground">Your tutoring session has been confirmed</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Session Details */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Session Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tutor</p>
                <p className="font-medium">Sarah Chen</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="font-medium">Calculus I</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">Today, 3:00 PM</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">60 minutes</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="font-medium">Amount Paid</span>
            </div>
            <Badge variant="secondary" className="text-lg font-bold">$25.00</Badge>
          </div>

          {/* Next Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold">What's Next?</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span className="text-sm">Your tutor will message you with meeting details</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-sm">Session reminder will be sent 30 minutes before</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" className="flex-1">
              📅 Add to Calendar
            </Button>
            <Button className="flex-1 bg-gradient-primary">
              💬 Message Tutor
            </Button>
          </div>
        </CardContent>
      </Card>

      <style>{`
        .confetti {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          font-size: 3rem;
          animation: confetti-fall 3s ease-out;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateX(-50%) translateY(-100px);
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) translateY(200px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccessDemo;