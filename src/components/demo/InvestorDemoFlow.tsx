import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, DollarSign, MessageSquare, Star, TrendingUp, Clock } from 'lucide-react';

const InvestorDemoFlow = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: "Market Opportunity",
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-center">$7.5B Tutoring Market</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">73%</p>
                <p className="text-sm text-muted-foreground">Students need tutoring</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">$40/hr</p>
                <p className="text-sm text-muted-foreground">Average tutor rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Our Solution",
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-center">Campus Connect Platform</h3>
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold">Smart Matching</p>
                    <p className="text-sm text-muted-foreground">AI-powered tutor-student pairing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold">Seamless Payments</p>
                    <p className="text-sm text-muted-foreground">Integrated Stripe + Venmo payments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Traction",
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-center">Early Success Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">120%</p>
                <p className="text-sm text-muted-foreground">Month-over-month growth</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-sm text-muted-foreground">Average session rating</p>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <p className="text-lg font-semibold">$15K+ GMV in first semester</p>
              <p className="text-sm text-muted-foreground">With 15% platform fee</p>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      toast({
        title: "Demo Complete! 🎉",
        description: "Ready to see the live platform in action?"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl bg-gradient-primary bg-clip-text text-transparent">
            Campus Connect
          </CardTitle>
          <CardDescription className="text-lg">
            The Future of Peer-to-Peer Learning
          </CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            {demoSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            <Badge variant="outline" className="mx-auto block w-fit">
              {demoSteps[currentStep].title}
            </Badge>
            
            {demoSteps[currentStep].content}
            
            <div className="flex justify-center pt-4">
              <Button 
                onClick={nextStep}
                size="lg"
                className="bg-gradient-primary hover:bg-gradient-primary/90"
              >
                {currentStep < demoSteps.length - 1 ? 'Next' : 'See Live Demo'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorDemoFlow;