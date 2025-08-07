
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UsernameSetupProps {
  userId: string;
  onComplete: (username: string) => void;
  currentUsername?: string;
}

const UsernameSetup = ({ userId, onComplete, currentUsername = '' }: UsernameSetupProps) => {
  const [username, setUsername] = useState(currentUsername);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const checkUsernameAvailability = async (value: string) => {
    if (value.length < 8) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', value.toLowerCase())
        .neq('user_id', userId);

      if (error) throw error;

      setIsAvailable(data.length === 0);
    } catch (error) {
      console.error('Error checking username:', error);
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    // Remove spaces and special characters, convert to lowercase
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleanValue);
    
    if (cleanValue !== currentUsername) {
      setIsAvailable(null);
      if (cleanValue.length >= 8) {
        const timeoutId = setTimeout(() => checkUsernameAvailability(cleanValue), 500);
        return () => clearTimeout(timeoutId);
      }
    }
  };

  const handleSave = async () => {
    if (!username || username.length < 8 || isAvailable !== true) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.toLowerCase() })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Username saved! 🎉",
        description: `Your username @${username} is now active.`,
      });

      onComplete(username);
    } catch (error: any) {
      toast({
        title: "Error saving username",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getValidationMessage = () => {
    if (username.length === 0) return null;
    if (username.length < 8) return { type: 'error', message: 'Username must be at least 8 characters' };
    if (isChecking) return { type: 'loading', message: 'Checking availability...' };
    if (isAvailable === true) return { type: 'success', message: 'Username is available!' };
    if (isAvailable === false) return { type: 'error', message: 'Username is already taken' };
    return null;
  };

  const validation = getValidationMessage();

  return (
    <Card className="glass-card max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
          Choose Your Username
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          This will be how other students and tutors find you
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <Input
              id="username"
              placeholder="coolstudent123"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              className="pl-8 glass-card"
              maxLength={20}
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              @
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Must be 8+ characters (letters, numbers, _)</span>
            <span>{username.length}/20</span>
          </div>
        </div>

        {validation && (
          <Alert className={validation.type === 'error' ? 'border-red-500/20 bg-red-500/10' : 
                           validation.type === 'success' ? 'border-green-500/20 bg-green-500/10' : 
                           'border-blue-500/20 bg-blue-500/10'}>
            <div className="flex items-center gap-2">
              {validation.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
              {validation.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
              {validation.type === 'loading' && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
              <AlertDescription className="text-sm">
                {validation.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <Button
          onClick={handleSave}
          disabled={!username || username.length < 8 || isAvailable !== true || isSaving}
          className="w-full bg-gradient-primary hover:scale-105 transition-transform"
        >
          {isSaving ? 'Saving...' : 'Save Username'}
        </Button>

        <div className="text-center text-xs text-muted-foreground">
          You can change this later in your profile settings
        </div>
      </CardContent>
    </Card>
  );
};

export default UsernameSetup;
