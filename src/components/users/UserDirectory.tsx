import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MessageCircle, GraduationCap, Users, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  user_id: string;
  display_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  major: string;
  campus: string;
  year: number;
  is_tutor: boolean;
  graduation_year: number;
}

const UserDirectory = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    getCurrentUser();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setCurrentUser(session.user.id);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          display_name,
          username,
          avatar_url,
          bio,
          major,
          campus,
          year,
          is_tutor,
          graduation_year
        `)
        .not('display_name', 'is', null)
        .order('display_name');

      if (error) throw error;

      setUsers(profiles || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.major?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.campus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredUsers(filtered);
  };

  const startConversation = async (otherUserId: string) => {
    if (otherUserId === currentUser) {
      toast({
        title: 'Error',
        description: 'You cannot start a conversation with yourself',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${currentUser},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${currentUser})`)
        .maybeSingle();

      if (existingConversation) {
        // Navigate to existing conversation
        navigate(`/chat/conversation/${existingConversation.id}?otherUserId=${otherUserId}`);
        return;
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          participant1_id: currentUser,
          participant2_id: otherUserId
        })
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Started new conversation',
      });

      // Navigate to new conversation
      navigate(`/chat/conversation/${newConversation.id}?otherUserId=${otherUserId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation',
        variant: 'destructive',
      });
    }
  };

  const getYearDisplay = (year: number) => {
    const yearNames = ['', 'Freshman', 'Sophomore', 'Junior', 'Senior'];
    return yearNames[year] || `Year ${year}`;
  };

  const UserCard = ({ user }: { user: UserProfile }) => (
    <Card className="p-4 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback className="text-lg">
            {user.display_name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg truncate">
              {user.display_name || user.username || 'Unknown User'}
            </h3>
            <Badge variant={user.is_tutor ? 'default' : 'secondary'}>
              {user.is_tutor ? 'Tutor' : 'Student'}
            </Badge>
          </div>

          {user.username && (
            <p className="text-sm text-muted-foreground mb-1">@{user.username}</p>
          )}

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
            {user.major && (
              <div className="flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                {user.major}
              </div>
            )}
            {user.year && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {getYearDisplay(user.year)}
              </div>
            )}
            {user.campus && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {user.campus}
              </div>
            )}
          </div>

          {user.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {user.bio}
            </p>
          )}

          <Button
            size="sm"
            onClick={() => startConversation(user.user_id)}
            className="w-full"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
        </div>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 bg-background">
        <div className="p-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  const tutors = filteredUsers.filter(user => user.is_tutor);
  const students = filteredUsers.filter(user => !user.is_tutor);

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            User Directory 👥
          </h1>
          <p className="text-muted-foreground">
            Find and connect with other students and tutors
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, username, major, or campus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* User Lists */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Users ({filteredUsers.length})</TabsTrigger>
            <TabsTrigger value="tutors">Tutors ({tutors.length})</TabsTrigger>
            <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No users found</p>
                {searchTerm && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search terms
                  </p>
                )}
              </div>
            ) : (
              filteredUsers
                .filter(user => user.user_id !== currentUser)
                .map((user) => (
                  <UserCard key={user.user_id} user={user} />
                ))
            )}
          </TabsContent>

          <TabsContent value="tutors" className="space-y-4">
            {tutors.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tutors found</p>
              </div>
            ) : (
              tutors
                .filter(user => user.user_id !== currentUser)
                .map((user) => (
                  <UserCard key={user.user_id} user={user} />
                ))
            )}
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            {students.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No students found</p>
              </div>
            ) : (
              students
                .filter(user => user.user_id !== currentUser)
                .map((user) => (
                  <UserCard key={user.user_id} user={user} />
                ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDirectory;