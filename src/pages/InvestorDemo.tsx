import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Users, DollarSign, TrendingUp, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/layout/PageTransition";
import InvestorShowcaseFeatures from "@/components/booking/InvestorShowcaseFeatures";

const InvestorDemo = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  const demoFeatures = [
    {
      title: "Smart Tutor Matching",
      description: "AI algorithms match students with optimal tutors",
      icon: <Zap className="w-6 h-6 text-blue-500" />
    },
    {
      title: "Seamless Payments",
      description: "Integrated Stripe processing with automatic payouts",
      icon: <DollarSign className="w-6 h-6 text-green-500" />
    },
    {
      title: "Calendar Integration",
      description: "Google Calendar sync for effortless scheduling",
      icon: <Users className="w-6 h-6 text-purple-500" />
    },
    {
      title: "Growth Analytics",
      description: "Real-time metrics showing exponential growth",
      icon: <TrendingUp className="w-6 h-6 text-orange-500" />
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/home')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to App
              </Button>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700">
                  Live Demo
                </Badge>
                <Badge variant="outline">
                  Series A Ready
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-12">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Campus Connect
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                The future of university education through peer-to-peer tutoring
              </p>
            </div>
            
            {/* Demo Video Placeholder */}
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-0">
                <div className="relative bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg aspect-video flex items-center justify-center">
                  <Button
                    size="lg"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                  >
                    <Play className="w-6 h-6 mr-2" />
                    {isPlaying ? 'Pause Demo' : 'Play Demo'}
                  </Button>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-500 text-white">
                      ● LIVE
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4 text-white/80 text-sm">
                    2:30 Demo Video
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Features Quick Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {demoFeatures.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-center mb-3">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Live App Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/discover')}
                className="bg-gradient-to-r from-primary to-purple-600"
              >
                Try Live Booking System
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/home')}
              >
                Explore Full Platform
              </Button>
            </div>
          </div>

          {/* Showcase Features */}
          <InvestorShowcaseFeatures />

          {/* Call to Action */}
          <div className="text-center space-y-6 mt-12">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-purple-600/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Ready to Transform Education?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Campus Connect is revolutionizing how students learn, succeed, and earn at universities nationwide.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600">
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" size="lg">
                    Request Full Deck
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default InvestorDemo;