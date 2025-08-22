import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  MessageCircle, 
  ArrowLeft,
  BookOpen,
  Calendar,
  Plus,
  Clock
} from "lucide-react";

interface StudyGroup {
  id: string;
  course_name: string;
  course_code: string;
  description: string;
  member_count: number;
  max_members: number;
  created_by: string;
  creator_avatar: string;
  meeting_time: string;
  location: string;
  is_joined: boolean;
}

const StudyGroups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Mock data - in production, fetch from Supabase
  useEffect(() => {
    const mockGroups: StudyGroup[] = [
      {
        id: '1',
        course_name: 'Calculus II',
        course_code: 'MATH 251',
        description: 'Working through integration problems and preparing for the final exam',
        member_count: 8,
        max_members: 12,
        created_by: 'Sarah Chen',
        creator_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        meeting_time: 'Daily 7-9 PM',
        location: 'Library Study Room A',
        is_joined: true
      },
      {
        id: '2',
        course_name: 'Organic Chemistry',
        course_code: 'CHEM 301',
        description: 'Lab report discussions and reaction mechanism practice',
        member_count: 5,
        max_members: 8,
        created_by: 'Michael Rodriguez',
        creator_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        meeting_time: 'Tue/Thu 6-8 PM',
        location: 'Chemistry Building Room 205',
        is_joined: false
      },
      {
        id: '3',
        course_name: 'Computer Science 101',
        course_code: 'CS 101',
        description: 'Coding practice sessions and project collaboration',
        member_count: 15,
        max_members: 20,
        created_by: 'Alex Kim',
        creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        meeting_time: 'Mon/Wed/Fri 5-7 PM',
        location: 'Computer Lab 102',
        is_joined: false
      },
      {
        id: '4',
        course_name: 'Statistics for Business',
        course_code: 'STAT 200',
        description: 'Problem sets and exam preparation group',
        member_count: 6,
        max_members: 10,
        created_by: 'Emma Wilson',
        creator_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        meeting_time: 'Sun 2-5 PM',
        location: 'Student Center Room 301',
        is_joined: false
      },
      {
        id: '5',
        course_name: 'Economics 203',
        course_code: 'ECON 203',
        description: 'Microeconomics concepts and case study discussions',
        member_count: 12,
        max_members: 15,
        created_by: 'David Park',
        creator_avatar: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=100&h=100&fit=crop&crop=face',
        meeting_time: 'Sat 10 AM-12 PM',
        location: 'Business Building Room 150',
        is_joined: true
      }
    ];

    setTimeout(() => {
      setGroups(mockGroups);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredGroups = groups.filter(group => 
    group.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const joinedGroups = filteredGroups.filter(g => g.is_joined);
  const availableGroups = filteredGroups.filter(g => !g.is_joined);

  const handleJoinGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, is_joined: true, member_count: group.member_count + 1 }
        : group
    ));
  };

  const handleLeaveGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, is_joined: false, member_count: group.member_count - 1 }
        : group
    ));
  };

  const handleOpenGroupChat = (groupId: string) => {
    navigate(`/chat/group/${groupId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading study groups...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/home')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Study Groups
                </h1>
                <p className="text-sm text-muted-foreground">
                  Join collaborative learning sessions
                </p>
              </div>
              <Button size="sm" className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by course or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-card border-border/20"
              />
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Joined Groups */}
          {joinedGroups.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold">My Groups</h2>
                <Badge variant="secondary">{joinedGroups.length}</Badge>
              </div>

              <div className="space-y-3">
                {joinedGroups.map((group) => (
                  <Card key={group.id} className="glass-card border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={group.creator_avatar} />
                          <AvatarFallback className="bg-blue-500/20 text-blue-600">
                            {group.created_by.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{group.course_name}</h3>
                              <p className="text-sm text-blue-600 font-medium">{group.course_code}</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              Joined
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                          
                          <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{group.member_count}/{group.max_members} members</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{group.meeting_time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{group.location}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <Button
                              size="sm"
                              onClick={() => handleOpenGroupChat(group.id)}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Chat
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLeaveGroup(group.id)}
                              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                            >
                              Leave Group
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Available Groups */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold">Available Groups</h2>
              <Badge variant="secondary">{availableGroups.length}</Badge>
            </div>

            {availableGroups.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <h3 className="font-medium mb-2">No groups found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery ? 'Try a different search term' : 'Be the first to create a study group!'}
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Study Group
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {availableGroups.map((group) => (
                  <Card key={group.id} className="glass-card border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={group.creator_avatar} />
                          <AvatarFallback className="bg-green-500/20 text-green-600">
                            {group.created_by.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{group.course_name}</h3>
                              <p className="text-sm text-green-600 font-medium">{group.course_code}</p>
                              <p className="text-xs text-muted-foreground">Created by {group.created_by}</p>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={group.member_count >= group.max_members ? "border-red-300 text-red-600" : "border-green-300 text-green-600"}
                            >
                              {group.member_count >= group.max_members ? 'Full' : 'Open'}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                          
                          <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{group.member_count}/{group.max_members} members</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{group.meeting_time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{group.location}</span>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => handleJoinGroup(group.id)}
                            className="w-full mt-3"
                            disabled={group.member_count >= group.max_members}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            {group.member_count >= group.max_members ? 'Group Full' : 'Join Group'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default StudyGroups;