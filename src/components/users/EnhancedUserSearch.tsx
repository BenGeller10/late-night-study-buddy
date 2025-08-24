import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  user_id: string;
  display_name: string;
  username: string;
  avatar_url: string;
  major: string;
  campus: string;
  is_tutor: boolean;
}

interface EnhancedUserSearchProps {
  onUserSelect: (userId: string) => void;
  placeholder?: string;
  excludeCurrentUser?: boolean;
}

const EnhancedUserSearch = ({ 
  onUserSelect, 
  placeholder = "Search users by name, username, major, or campus...",
  excludeCurrentUser = true 
}: EnhancedUserSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (excludeCurrentUser) {
      getCurrentUser();
    }
  }, [excludeCurrentUser]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setCurrentUserId(session.user.id);
    }
  };

  const searchUsers = async () => {
    if (!searchTerm.trim() || searchTerm.length < 2) return;

    setIsSearching(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          display_name,
          username,
          avatar_url,
          major,
          campus,
          is_tutor
        `)
        .or(`display_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,major.ilike.%${searchTerm}%,campus.ilike.%${searchTerm}%`)
        .not('display_name', 'is', null)
        .limit(10);

      if (error) throw error;

      let results = profiles || [];
      
      // Exclude current user if requested
      if (excludeCurrentUser && currentUserId) {
        results = results.filter(user => user.user_id !== currentUserId);
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to search users',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    onUserSelect(userId);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto bg-background border rounded-md shadow-lg">
          {searchResults.map((user) => (
            <div
              key={user.user_id}
              className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
              onClick={() => handleUserSelect(user.user_id)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>
                    {user.display_name?.charAt(0)?.toUpperCase() || 
                     user.username?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {user.display_name || user.username}
                    </p>
                    <Badge variant={user.is_tutor ? 'default' : 'secondary'} className="text-xs">
                      {user.is_tutor ? 'Tutor' : 'Student'}
                    </Badge>
                  </div>
                  
                  {user.username && (
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  )}
                  
                  {(user.major || user.campus) && (
                    <p className="text-xs text-muted-foreground">
                      {[user.major, user.campus].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </div>
                
                <UserPlus className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))}
          
          {isSearching && (
            <div className="p-3 text-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
            </div>
          )}
        </div>
      )}
      
      {/* No results message */}
      {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg p-3 text-center">
          <p className="text-sm text-muted-foreground">No users found</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedUserSearch;