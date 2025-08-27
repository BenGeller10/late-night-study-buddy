import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  GraduationCap, 
  Star, 
  BookOpen, 
  Users, 
  Award,
  Calendar,
  MessageCircle,
  Settings,
  Edit3,
  Camera,
  Trophy,
  Target,
  Clock,
  Heart
} from "lucide-react";

const MockProfile = () => {
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data
  const user = {
    name: "Alex Chen",
    username: "@alexchen",
    bio: "Computer Science major passionate about machine learning and web development. Always excited to help fellow students with programming concepts!",
    avatar: "/placeholder.svg",
    campus: "UC Berkeley",
    major: "Computer Science",
    year: "Junior",
    gpa: 3.8,
    joinedDate: "September 2023",
    followers: 324,
    following: 186,
    sessionsCompleted: 47,
    hoursLearned: 156,
    currentStreak: 12,
    badges: [
      { name: "Early Bird", icon: "🌅", description: "Completed 5 morning sessions" },
      { name: "Helper", icon: "🤝", description: "Helped 10 students" },
      { name: "Consistent", icon: "🔥", description: "7-day study streak" }
    ],
    subjects: [
      { name: "JavaScript", level: 85 },
      { name: "React", level: 92 },
      { name: "Python", level: 78 },
      { name: "Data Structures", level: 88 }
    ],
    recentActivity: [
      { action: "Completed session", subject: "React Hooks", time: "2 hours ago" },
      { action: "Earned badge", subject: "Early Bird", time: "1 day ago" },
      { action: "Helped student", subject: "JavaScript Basics", time: "3 days ago" }
    ]
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Your academic journey
            </p>
          </div>
          <Button
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="gap-2"
          >
            {isEditing ? <Settings className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {isEditing ? 'Settings' : 'Edit'}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Main Profile Card */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xl bg-gradient-primary text-primary-foreground">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-muted-foreground">{user.username}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {user.major}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="w-3 h-3" />
                    {user.campus}
                  </Badge>
                  <Badge variant="secondary">
                    {user.year}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {user.bio}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{user.followers}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{user.following}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue">{user.sessionsCompleted}</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{user.hoursLearned}h</div>
                <div className="text-xs text-muted-foreground">Learned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Progress */}
        <Card className="glass-card border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-accent">
              <Target className="w-5 h-5" />
              Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.subjects.map((subject, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{subject.name}</span>
                  <span className="text-muted-foreground">{subject.level}%</span>
                </div>
                <Progress value={subject.level} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="glass-card border-warning/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-warning">
              <Trophy className="w-5 h-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {user.badges.map((badge, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="text-2xl mb-2">{badge.icon}</div>
                  <div className="text-xs font-medium">{badge.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {badge.description}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Study Streak */}
        <Card className="glass-card border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-success/10">
                  <Clock className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold">Study Streak</h3>
                  <p className="text-sm text-muted-foreground">Keep it up!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-success">{user.currentStreak}</div>
                <div className="text-xs text-muted-foreground">days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.action}</div>
                  <div className="text-xs text-muted-foreground">{activity.subject}</div>
                </div>
                <div className="text-xs text-muted-foreground">{activity.time}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-14 flex-col gap-2 border-blue/20 hover:border-blue/40"
          >
            <MessageCircle className="w-5 h-5 text-blue" />
            <span className="text-sm">Messages</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-14 flex-col gap-2 border-accent/20 hover:border-accent/40"
          >
            <Heart className="w-5 h-5 text-accent" />
            <span className="text-sm">Favorites</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MockProfile;