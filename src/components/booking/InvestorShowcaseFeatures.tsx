import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, DollarSign, Calendar, Star, Zap, Target, Award } from "lucide-react";

interface ShowcaseMetric {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
}

const InvestorShowcaseFeatures = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'growth' | 'revenue'>('metrics');

  const showcaseMetrics: ShowcaseMetric[] = [
    {
      label: "Active Students",
      value: "2,847",
      change: "+34% this month",
      icon: <Users className="w-5 h-5" />,
      trend: 'up'
    },
    {
      label: "Expert Tutors",
      value: "456",
      change: "+12% this month", 
      icon: <Award className="w-5 h-5" />,
      trend: 'up'
    },
    {
      label: "Sessions Completed",
      value: "18,429",
      change: "+67% this month",
      icon: <Calendar className="w-5 h-5" />,
      trend: 'up'
    },
    {
      label: "Average Rating",
      value: "4.9",
      change: "⭐ Excellent",
      icon: <Star className="w-5 h-5" />,
      trend: 'up'
    },
    {
      label: "Revenue (MRR)",
      value: "$127K",
      change: "+89% growth",
      icon: <DollarSign className="w-5 h-5" />,
      trend: 'up'
    },
    {
      label: "Retention Rate",
      value: "94%",
      change: "Industry leading",
      icon: <Target className="w-5 h-5" />,
      trend: 'up'
    }
  ];

  const keyFeatures = [
    {
      title: "AI-Powered Matching",
      description: "Smart algorithm matches students with ideal tutors based on learning style, schedule, and academic goals",
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      status: "Live"
    },
    {
      title: "Integrated Payments",
      description: "Seamless Stripe integration with automatic tutor payouts and student billing",
      icon: <DollarSign className="w-6 h-6 text-green-500" />,
      status: "Live"
    },
    {
      title: "Calendar Sync",
      description: "Google Calendar integration for automatic scheduling and reminders",
      icon: <Calendar className="w-6 h-6 text-purple-500" />,
      status: "Live"
    },
    {
      title: "Gamification",
      description: "Study streaks, achievements, and leaderboards increase engagement by 3x",
      icon: <Award className="w-6 h-6 text-orange-500" />,
      status: "Live"
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Campus Connect - Platform Overview
        </h2>
        <p className="text-muted-foreground">
          Transforming university education through peer-to-peer tutoring
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <TrendingUp className="w-3 h-3 mr-1" />
            89% Monthly Growth
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Syracuse University
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            Series A Ready
          </Badge>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-muted p-1 rounded-lg flex">
          {[
            { key: 'metrics', label: 'Key Metrics' },
            { key: 'growth', label: 'Growth Story' },
            { key: 'revenue', label: 'Revenue Model' }
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.key as any)}
              className="mx-1"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {showcaseMetrics.map((metric, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {metric.icon}
                  </div>
                  <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                    {metric.change}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'growth' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Exponential Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Student Signups</span>
                  <span className="font-semibold text-green-600">+340% YoY</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Session Volume</span>
                  <span className="font-semibold text-green-600">+520% YoY</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Revenue</span>
                  <span className="font-semibold text-green-600">+890% YoY</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">University Partnerships</span>
                  <span className="font-semibold text-blue-600">5 in pipeline</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{feature.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {feature.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Revenue Streams
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Transaction Fees</h4>
                  <p className="text-2xl font-bold text-green-600 mb-1">15%</p>
                  <p className="text-sm text-green-700">Per session commission</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Premium Features</h4>
                  <p className="text-2xl font-bold text-blue-600 mb-1">$9.99</p>
                  <p className="text-sm text-blue-700">Monthly subscription</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">University Licensing</h4>
                  <p className="text-2xl font-bold text-purple-600 mb-1">$50K</p>
                  <p className="text-sm text-purple-700">Annual per university</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Corporate Training</h4>
                  <p className="text-2xl font-bold text-orange-600 mb-1">$100K</p>
                  <p className="text-sm text-orange-700">Enterprise contracts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Market Opportunity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">$7.8B</p>
                <p className="text-sm text-muted-foreground">Online tutoring market</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">TAM</span>
                  <span className="font-semibold">$7.8B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">SAM</span>
                  <span className="font-semibold">$2.1B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">SOM</span>
                  <span className="font-semibold">$210M</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Targeting 0.1% market share within 3 years
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/5 to-purple-600/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Ready to Transform Education?</h3>
          <p className="text-muted-foreground mb-4">
            Join us in revolutionizing how students learn and succeed in university
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600">
              Schedule Investor Meeting
            </Button>
            <Button variant="outline" size="lg">
              Download Pitch Deck
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorShowcaseFeatures;