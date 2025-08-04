import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, MessageCircle, Calendar, BookOpen, Search } from "lucide-react";

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  member_count: number;
  max_members: number;
  meeting_time?: string;
  location?: string;
  is_online: boolean;
}

interface StudyGroupsProps {
  user: any;
  onBack: () => void;
}

const StudyGroups = ({ user, onBack }: StudyGroupsProps) => {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudyGroups();
  }, []);

  const fetchStudyGroups = async () => {
    // Mock data for now - in real app would fetch from Supabase
    const mockGroups: StudyGroup[] = [
      {
        id: "1",
        name: "Calculus II Study Group",
        subject: "MATH 1420",
        description: "Weekly study sessions for Calculus II. We review homework, practice problems, and prepare for exams together.",
        member_count: 8,
        max_members: 12,
        meeting_time: "Tuesdays & Thursdays 6:00 PM",
        location: "Library Room 204",
        is_online: false
      },
      {
        id: "2", 
        name: "Organic Chemistry Online",
        subject: "CHEM 2310",
        description: "Virtual study group for Organic Chemistry. Join our Discord for daily discussions and problem-solving sessions.",
        member_count: 15,
        max_members: 20,
        meeting_time: "Daily 7:00 PM",
        location: "Discord Voice Chat",
        is_online: true
      },
      {
        id: "3",
        name: "CS Algorithms & Data Structures",
        subject: "CS 2420",
        description: "Programming practice and concept review for Computer Science II. Code reviews and collaborative projects.",
        member_count: 6,
        max_members: 10,
        meeting_time: "Saturdays 2:00 PM",
        location: "Engineering Building",
        is_online: false
      },
      {
        id: "4",
        name: "Physics I Problem Solvers",
        subject: "PHYS 2210",
        description: "Focus on problem-solving techniques and conceptual understanding for Physics I.",
        member_count: 11,
        max_members: 15,
        meeting_time: "Sundays 4:00 PM",
        location: "Online & In-Person",
        is_online: true
      }
    ];

    setStudyGroups(mockGroups);
    setLoading(false);
  };

  const handleJoinGroup = async (groupId: string) => {
    const group = studyGroups.find(g => g.id === groupId);
    if (!group) return;

    if (group.member_count >= group.max_members) {
      toast({
        title: "Group is full",
        description: "This study group has reached its maximum capacity.",
        variant: "destructive",
      });
      return;
    }

    // Mock join action - in real app would update database
    setStudyGroups(groups => 
      groups.map(g => 
        g.id === groupId 
          ? { ...g, member_count: g.member_count + 1 }
          : g
      )
    );

    toast({
      title: "Joined study group!",
      description: `You've joined ${group.name}. Check your messages for group chat access.`,
    });
  };

  if (loading) {
    return (
      <div className="animate-fade-in p-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading study groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20 p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">Study Groups</h1>
            <p className="text-sm text-muted-foreground">
              Find and join study groups for your classes
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Welcome Card */}
        <Card className="glass-card border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-300">
              <Users className="w-5 h-5" />
              Study Together, Succeed Together
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Join study groups to collaborate with classmates, share knowledge, and tackle difficult concepts together. Learning is better with friends!
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Group
            </Button>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search study groups by subject or name..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>

        {/* Study Groups List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Available Study Groups</h2>
          
          {studyGroups.map(group => (
            <Card key={group.id} className="glass-card hover-scale">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{group.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {group.subject}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{group.member_count}/{group.max_members}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>

                  {/* Meeting Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{group.meeting_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {group.is_online ? (
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span>{group.location}</span>
                      {group.is_online && (
                        <Badge variant="outline" className="text-xs ml-2">
                          Online
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Members Preview */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <Avatar key={i} className="w-6 h-6 border-2 border-background">
                          <AvatarFallback className="text-xs">
                            {String.fromCharCode(65 + i)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      and {group.member_count - 3} others
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={group.member_count >= group.max_members}
                      className="flex-1"
                    >
                      {group.member_count >= group.max_members ? 'Full' : 'Join Group'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Group CTA */}
        <Card className="glass-card border-dashed border-primary/50">
          <CardContent className="p-8 text-center">
            <Plus className="w-12 h-12 text-primary/50 mx-auto mb-4" />
            <h3 className="font-medium mb-2">Don't see your class?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a new study group and invite your classmates to join.
            </p>
            <Button variant="outline">
              Create Study Group
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudyGroups;