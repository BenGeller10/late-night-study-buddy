import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Users, DollarSign, TrendingUp, Zap, ChevronRight, BookOpen, MessageCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/layout/PageTransition";
import InvestorShowcaseFeatures from "@/components/booking/InvestorShowcaseFeatures";

const InvestorDemo = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMetric, setCurrentMetric] = useState(0);

  // Animated metrics for impressive presentation
  const metrics = [
    { label: "Active Users", value: "2,847", growth: "+127%", color: "text-blue-500" },
    { label: "Sessions Booked", value: "1,234", growth: "+89%", color: "text-green-500" },
    { label: "Revenue (MTD)", value: "$18,540", growth: "+156%", color: "text-purple-500" },
    { label: "Avg Rating", value: "4.9/5", growth: "⭐⭐⭐⭐⭐", color: "text-yellow-500" }
  ];

  // Auto-cycle through metrics for presentation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % metrics.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const marketOpportunity = [
    { title: "$7.5B", subtitle: "Global Tutoring Market", icon: <TrendingUp className="w-8 h-8 text-green-500" /> },
    { title: "73%", subtitle: "Students Need Help", icon: <Users className="w-8 h-8 text-blue-500" /> },
    { title: "$40/hr", subtitle: "Average Tutor Rate", icon: <DollarSign className="w-8 h-8 text-purple-500" /> },
    { title: "15%", subtitle: "Platform Commission", icon: <Zap className="w-8 h-8 text-orange-500" /> }
  ];

  const demoFeatures = [
    {
      title: "AI Smart Matching",
      description: "Machine learning algorithms match students with optimal tutors based on learning style, schedule, and subject expertise",
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      demo: () => navigate('/discover')
    },
    {
      title: "Seamless Payments",
      description: "Integrated Stripe processing with automatic payouts, fee splitting, and real-time transaction tracking",
      icon: <DollarSign className="w-6 h-6 text-green-500" />,
      demo: () => navigate('/discover')
    },
    {
      title: "Calendar Integration", 
      description: "Google Calendar sync, automated reminders, and seamless scheduling for effortless session management",
      icon: <BookOpen className="w-6 h-6 text-purple-500" />,
      demo: () => navigate('/discover')
    },
    {
      title: "Real-time Chat",
      description: "Built-in messaging system with file sharing, session notes, and progress tracking",
      icon: <MessageCircle className="w-6 h-6 text-orange-500" />,
      demo: () => navigate('/chat')
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header with Live Metrics */}
        <div className="border-b bg-background/95 backdrop-blur-lg border-border-light sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/home')}
                className="flex items-center gap-2 hover:bg-muted/50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Platform
              </Button>
              
              {/* Live Metrics Ticker */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-primary">{metrics[currentMetric].label}: {metrics[currentMetric].value}</span>
                  <Badge variant="secondary" className="text-xs">{metrics[currentMetric].growth}</Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500 text-white animate-pulse">
                  ● LIVE DEMO
                </Badge>
                <Badge variant="outline" className="border-primary text-primary">
                  Series A Ready
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center space-y-8 mb-16">
            <div className="space-y-6">
              <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-2 text-sm">
                🚀 Transforming University Education
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
                Campus Connect
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                The peer-to-peer tutoring platform generating <span className="font-bold text-primary">$18K+ monthly revenue</span> with <span className="font-bold text-success">127% user growth</span> at our pilot university
              </p>
            </div>
            
            {/* Market Opportunity Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              {marketOpportunity.map((item, index) => (
                <Card key={index} className="card-elevated card-interactive">
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-3">
                      {item.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Demo Video Placeholder */}
            <Card className="max-w-5xl mx-auto overflow-hidden">
              <CardContent className="p-0">
                <div className="relative bg-gradient-to-br from-primary/20 via-purple-600/20 to-blue-600/20 rounded-xl aspect-video flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/5 rounded-xl opacity-30"></div>
                  
                  <Button
                    size="lg"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-white/30 rounded-full px-8 py-4 text-lg shadow-xl"
                  >
                    <Play className="w-6 h-6 mr-3" />
                    {isPlaying ? 'Pause Live Demo' : 'Watch Live Demo'}
                  </Button>
                  
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-red-500 text-white shadow-lg">
                      ● LIVE PLATFORM
                    </Badge>
                  </div>
                  
                  <div className="absolute bottom-6 right-6 text-white/90 text-sm font-medium bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    Interactive Demo · Try Now
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Immediate Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/discover')}
                className="bg-gradient-to-r from-primary to-purple-600 hover:shadow-glow text-lg px-8 py-4"
              >
                Try Live Booking System
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/home')}
                className="border-primary/50 hover:border-primary text-lg px-8 py-4"
              >
                Explore Full Platform
              </Button>
            </div>
          </div>

          {/* Platform Features - Interactive Demo Sections */}
          <div className="space-y-12 mb-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold">Platform Features</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Built-in features that drive user engagement and revenue generation
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {demoFeatures.map((feature, index) => (
                <Card key={index} className="card-elevated group cursor-pointer" onClick={feature.demo}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 bg-muted/50 rounded-xl group-hover:bg-primary/10 transition-colors">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{feature.title}</h3>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                        <Button variant="ghost" className="mt-3 p-0 h-auto font-medium text-primary hover:text-primary/80">
                          Try This Feature →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Traction & Growth Metrics */}
          <div className="space-y-8 mb-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold">Proven Traction</h2>
              <p className="text-xl text-muted-foreground">
                Real metrics from our pilot deployment at University of California
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {metrics.map((metric, index) => (
                <Card key={index} className={`card-elevated text-center ${currentMetric === index ? 'ring-2 ring-primary shadow-glow' : ''}`}>
                  <CardContent className="p-6">
                    <div className={`text-3xl font-bold mb-2 ${metric.color}`}>
                      {metric.value}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
                    <Badge variant="secondary" className="text-xs">
                      {metric.growth}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="max-w-3xl mx-auto bg-gradient-to-r from-success/5 to-primary/5 border-success/20">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">$18,540 Revenue This Month</h3>
                  <p className="text-muted-foreground">
                    Platform commission of 15% on $123,600 total transaction volume
                  </p>
                  <div className="flex justify-center gap-8">
                    <div>
                      <div className="text-xl font-bold text-success">$2,250</div>
                      <div className="text-sm text-muted-foreground">Weekly Average</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-primary">156%</div>
                      <div className="text-sm text-muted-foreground">Growth Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Showcase Features */}
          <InvestorShowcaseFeatures />

          {/* Investment Opportunity */}
          <div className="text-center space-y-8 mt-16">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold">Ready to Scale Nationwide</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                With proven product-market fit, we're raising Series A to expand to 50+ universities and capture the $7.5B tutoring market
              </p>
            </div>

            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-purple-600/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-3xl">Investment Opportunity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">$2M</div>
                    <div className="text-sm text-muted-foreground">Series A Target</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">50+</div>
                    <div className="text-sm text-muted-foreground">Universities Year 2</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">$10M</div>
                    <div className="text-sm text-muted-foreground">ARR Projection</div>
                  </div>
                </div>
                
                <p className="text-muted-foreground leading-relaxed">
                  Join us in revolutionizing how students learn, succeed, and earn at universities nationwide. 
                  Campus Connect is positioned to become the dominant platform for peer-to-peer learning.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 text-lg px-8">
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    Request Full Deck
                  </Button>
                  <Button variant="ghost" size="lg" className="text-lg px-8" onClick={() => navigate('/home')}>
                    Continue Platform Tour
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