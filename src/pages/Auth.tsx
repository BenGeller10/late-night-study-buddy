import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/layout/PageTransition";
import ImageUpload from "@/components/ui/image-upload";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [error, setError] = useState("");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [isTutor, setIsTutor] = useState(false);
  const [venmoHandle, setVenmoHandle] = useState("");

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/home');
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/home');
      }
    });

    checkAuth();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const cleanupAuthState = () => {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.');
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
        
        // Force page reload for clean state
        window.location.href = '/home';
      }
    } catch (error: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (!profileImage) {
      setError("Profile photo is required");
      setIsLoading(false);
      return;
    }

    if (isTutor && !venmoHandle.trim()) {
      setError("Venmo handle is required for tutors");
      setIsLoading(false);
      return;
    }

    try {
      // Clean up existing state
      cleanupAuthState();

      const redirectUrl = `${window.location.origin}/home`;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName.trim(),
            avatar_url: profileImage,
            is_tutor: isTutor,
            venmo_handle: isTutor ? venmoHandle.trim() : null,
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setError('An account with this email already exists. Try signing in instead.');
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          // User is immediately confirmed
          toast({
            title: "Account created!",
            description: "Welcome to Campus Connect!",
          });
          window.location.href = '/home';
        } else {
          // Email confirmation required
          toast({
            title: "Check your email!",
            description: "We've sent you a confirmation link. Click it to complete your registration.",
          });
          setActiveTab("signin");
          setError("");
        }
      }
    } catch (error: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setConfirmPassword("");
    setProfileImage("");
    setIsTutor(false);
    setVenmoHandle("");
    setError("");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    resetForm();
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="absolute top-4 left-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-2xl">🎓</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Campus Connect
            </h1>
            <p className="text-muted-foreground">
              Connect with tutors and achieve academic success
            </p>
          </div>

          {/* Auth Card */}
          <Card className="glass-card">
            <CardHeader className="text-center pb-4">
              <CardTitle>Welcome!</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="signin" className="space-y-4 mt-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-primary hover:bg-gradient-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    {/* Profile Image Upload */}
                    <div className="space-y-2">
                      <Label>Profile Photo *</Label>
                      <ImageUpload
                        onImageUpload={setProfileImage}
                        currentImage={profileImage}
                        required={true}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-3">
                      <Label>I want to...</Label>
                      <div className="flex items-center justify-center gap-3 p-3 bg-card/50 rounded-lg border border-border/50">
                        <Label htmlFor="role-toggle" className={`text-sm font-medium ${!isTutor ? 'text-primary' : 'text-muted-foreground'}`}>
                          📚 Find Tutors
                        </Label>
                        <Switch
                          id="role-toggle"
                          checked={isTutor}
                          onCheckedChange={setIsTutor}
                          disabled={isLoading}
                        />
                        <Label htmlFor="role-toggle" className={`text-sm font-medium ${isTutor ? 'text-primary' : 'text-muted-foreground'}`}>
                          🧠 Become a Tutor
                        </Label>
                      </div>
                    </div>

                    {/* Venmo Handle for Tutors */}
                    {isTutor && (
                      <div className="space-y-2">
                        <Label htmlFor="venmo-handle">Venmo Handle *</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="venmo-handle"
                            type="text"
                            placeholder="@your-venmo-username"
                            value={venmoHandle}
                            onChange={(e) => setVenmoHandle(e.target.value)}
                            className="pl-10"
                            required={isTutor}
                            disabled={isLoading}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Students will use this to pay you for tutoring sessions
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                          disabled={isLoading}
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-primary hover:bg-gradient-primary/90"
                      disabled={isLoading || !profileImage || (isTutor && !venmoHandle.trim())}
                    >
                      {isLoading ? "Creating account..." : `Create ${isTutor ? 'Tutor' : 'Student'} Account`}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              By continuing, you agree to our terms of service and privacy policy
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Auth;