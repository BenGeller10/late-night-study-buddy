import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Check, X, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UsernameSetupProps {
  onComplete: (username: string) => void;
  currentUsername?: string;
}

const UsernameSetup = ({ onComplete, currentUsername }: UsernameSetupProps) => {
  const [username, setUsername] = useState(currentUsername || "");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const checkUsername = async (value: string) => {
    if (value.length < 8) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', value)
        .single();

      if (error && error.code === 'PGRST116') {
        // No matching record found - username is available
        setIsAvailable(true);
      } else if (data) {
        // Username exists
        setIsAvailable(false);
      }
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    // Remove spaces and special characters, keep alphanumeric and underscores
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleanValue);
    
    if (cleanValue.length >= 8) {
      checkUsername(cleanValue);
    } else {
      setIsAvailable(null);
    }
  };

  const handleSubmit = async () => {
    if (!username || username.length < 8 || isAvailable !== true) {
      toast({
        title: "Invalid Username",
        description: "Please choose a valid, available username with at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('user_id', user.id);

      if (error) throw error;

      onComplete(username);
      toast({
        title: "Username Set!",
        description: `Your username @${username} is now active.`,
      });
    } catch (error) {
      console.error('Error saving username:', error);
      toast({
        title: "Error",
        description: "Failed to save username. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (isChecking) return <div className="w-4 h-4 animate-spin rounded-full border-2 border-muted border-t-primary" />;
    if (isAvailable === true) return <Check className="w-4 h-4 text-success" />;
    if (isAvailable === false) return <X className="w-4 h-4 text-destructive" />;
    return null;
  };

  const getHelperText = () => {
    if (username.length === 0) return "Choose a unique username for your Campus Connect profile";
    if (username.length < 8) return `Username must be at least 8 characters (${8 - username.length} more needed)`;
    if (isChecking) return "Checking availability...";
    if (isAvailable === true) return "✅ Username available!";
    if (isAvailable === false) return "❌ Username taken, try another";
    return "";
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Choose Your Username</h2>
        <p className="text-muted-foreground">
          This is how other students will find and recognize you on campus
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              @
            </div>
            <Input
              id="username"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="yourname"
              className="pl-8 pr-10"
              maxLength={20}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {getStatusIcon()}
            </div>
          </div>
          <p className={`text-sm ${
            isAvailable === true ? 'text-success' : 
            isAvailable === false ? 'text-destructive' : 
            'text-muted-foreground'
          }`}>
            {getHelperText()}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Username Rules:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className={username.length >= 8 ? 'text-success' : ''}>
              • At least 8 characters long
            </li>
            <li>• Only letters, numbers, and underscores</li>
            <li>• Must be unique across Campus Connect</li>
            <li>• Cannot be changed later</li>
          </ul>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!username || username.length < 8 || isAvailable !== true || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Setting Username..." : "Continue"}
        </Button>
      </Card>
    </div>
  );
};

export default UsernameSetup;
