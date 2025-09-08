import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/layout/PageTransition";
import ImageUpload from "@/components/ui/image-upload";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [error, setError] = useState("");
  const [signInAttempts, setSignInAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [isTutor, setIsTutor] = useState(false);
  const [venmoHandle, setVenmoHandle] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [scheduleData, setScheduleData] = useState("");
  const [tutorData, setTutorData] = useState<any>(null);

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

    // Pre-fill form if coming from onboarding
    const state = location.state as any;
    if (state?.fromOnboarding) {
      setEmail(state.email || "");
      setFullName(state.fullName || "");
      setPassword(state.password || "");
      setConfirmPassword(state.password || "");
      setScheduleData(state.scheduleData || "");
      setTutorData(state.tutorData || null);
      setIsTutor(state.userRole === 'tutor');
      setActiveTab("signup");
      setAgreedToTerms(true); // Auto-agree since they went through onboarding
      
      // Pre-fill tutor-specific data
      if (state.tutorData) {
        setVenmoHandle(state.tutorData.venmoHandle || "");
        setProfileImage("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGNEY0RjUiLz48L3N2Zz4K"); // Placeholder
      }
    }

    return () => subscription.unsubscribe();
  }, [navigate, location.state]);

  // Security utilities
  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  };

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters long" };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: "Password must contain at least one lowercase letter" };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: "Password must contain at least one uppercase letter" };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: "Password must contain at least one number" };
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return { isValid: false, message: "Password must contain at least one special character (@$!%*?&)" };
    }
    return { isValid: true, message: "" };
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const lastAttempt = localStorage.getItem('lastSignInAttempt');
    const attempts = parseInt(localStorage.getItem('signInAttempts') || '0');
    
    if (lastAttempt && now - parseInt(lastAttempt) < 60000) { // 1 minute
      if (attempts >= 5) {
        setIsRateLimited(true);
        setTimeout(() => {
          setIsRateLimited(false);
          localStorage.removeItem('signInAttempts');
          localStorage.removeItem('lastSignInAttempt');
        }, 60000);
        return false;
      }
    } else {
      localStorage.removeItem('signInAttempts');
      localStorage.removeItem('lastSignInAttempt');
    }
    return true;
  };

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

    // Security validations
    if (!checkRateLimit()) {
      setError('Too many failed attempts. Please wait 1 minute before trying again.');
      setIsLoading(false);
      return;
    }

    if (isRateLimited) {
      setError('Account temporarily locked. Please wait 1 minute before trying again.');
      setIsLoading(false);
      return;
    }

    const sanitizedEmail = sanitizeInput(email);
    if (!validateEmail(sanitizedEmail)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('Password is required.');
      setIsLoading(false);
      return;
    }

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
        email: sanitizedEmail,
        password,
      });

      if (error) {
        // Track failed attempts
        const attempts = parseInt(localStorage.getItem('signInAttempts') || '0') + 1;
        localStorage.setItem('signInAttempts', attempts.toString());
        localStorage.setItem('lastSignInAttempt', Date.now().toString());
        
        // Generic error message to prevent account enumeration
        setError('Invalid email or password. Please check your credentials and try again.');
        setIsLoading(false);
        return;
      }

      // Clear rate limit data on successful login
      localStorage.removeItem('signInAttempts');
      localStorage.removeItem('lastSignInAttempt');

      if (data.user) {
        toast({
          title: "Welcome back! 🎉",
          description: "You've been signed in successfully.",
        });
        
        // Small delay to let toast show, then redirect
        setTimeout(() => {
          window.location.href = '/home';
        }, 500);
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

    // Security validations
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedFullName = sanitizeInput(fullName);
    const sanitizedVenmoHandle = sanitizeInput(venmoHandle);

    if (!validateEmail(sanitizedEmail)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (!sanitizedFullName || sanitizedFullName.length < 2) {
      setError("Full name must be at least 2 characters long");
      setIsLoading(false);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (!profileImage) {
      setError("Profile photo is required");
      setIsLoading(false);
      return;
    }

    if (isTutor && !sanitizedVenmoHandle.trim()) {
      setError("Venmo handle is required for tutors");
      setIsLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service to continue");
      setIsLoading(false);
      return;
    }

    try {
      // Clean up existing state
      cleanupAuthState();

      // Validate and sanitize redirect URL
      const allowedDomain = window.location.origin;
      const redirectUrl = `${allowedDomain}/home`;

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: sanitizedFullName,
            avatar_url: profileImage,
            is_tutor: isTutor,
            schedule_data: scheduleData,
            bio: sanitizeInput(tutorData?.bio || ""),
            experience: sanitizeInput(tutorData?.experience || ""),
            venmo_handle: isTutor ? sanitizedVenmoHandle : null
          }
        }
      });

      if (error) {
        // Generic error handling to prevent information leakage
        if (error.message.includes('User already registered') || error.message.includes('already been registered')) {
          setError('An account with this email already exists. Try signing in instead.');
        } else if (error.message.includes('password')) {
          setError('Password does not meet security requirements. Please choose a stronger password.');
        } else if (error.message.includes('email')) {
          setError('Please enter a valid email address.');
        } else {
          setError('Unable to create account. Please try again or contact support.');
        }
        return;
      }

      if (data.user) {
        // Create tutor subjects if this is a tutor
        if (tutorData?.subjects && data.user.id) {
          try {
            for (const subject of tutorData.subjects) {
              await supabase
                .from('tutor_subjects')
                .insert({
                  tutor_id: data.user.id,
                  subject_id: subject.subject_id,
                  hourly_rate: subject.hourly_rate
                });
            }
          } catch (error) {
            console.error('Error creating tutor subjects:', error);
          }
        }

        if (data.user.email_confirmed_at) {
          // User is immediately confirmed
          const isStudentWithSchedule = scheduleData && !isTutor;
          const message = isStudentWithSchedule 
            ? "Welcome to Campus Connect! Let's find you the perfect tutor." 
            : isTutor 
            ? "Welcome to Campus Connect! Students can now find and book you."
            : "Welcome to Campus Connect!";
            
          toast({
            title: "Account created!",
            description: message,
          });
          
          // Redirect based on user type
          if (isStudentWithSchedule) {
            window.location.href = '/discover';
          } else if (isTutor) {
            window.location.href = '/set-availability';
          } else {
            window.location.href = '/home';
          }
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
    setAgreedToTerms(false);
    setError("");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    resetForm();
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-pattern-auth bg-background relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-[8%] w-64 h-64 bg-gradient-cyber opacity-8 rounded-full blur-3xl animate-pulse animate-float"></div>
          <div className="absolute bottom-[15%] right-[12%] w-80 h-80 bg-gradient-hologram opacity-6 rounded-full blur-3xl animate-pulse animate-float-delayed delay-1000"></div>
          <div className="absolute top-[45%] left-[25%] w-48 h-48 bg-gradient-accent opacity-10 rounded-full blur-2xl animate-pulse animate-drift delay-500"></div>
          <div className="absolute top-[25%] right-[20%] w-56 h-56 bg-gradient-cyber opacity-7 rounded-full blur-3xl animate-pulse animate-float delay-700"></div>
          <div className="absolute bottom-[35%] left-[15%] w-40 h-40 bg-gradient-hologram opacity-9 rounded-full blur-2xl animate-pulse animate-drift-slow delay-300"></div>
          <div className="absolute top-[70%] right-[35%] w-72 h-72 bg-gradient-accent opacity-6 rounded-full blur-3xl animate-pulse animate-float-delayed delay-1200"></div>
          <div className="absolute bottom-[60%] right-[5%] w-32 h-32 bg-gradient-cyber opacity-12 rounded-full blur-xl animate-pulse animate-drift delay-900"></div>
          <div className="absolute top-[35%] left-[5%] w-44 h-44 bg-gradient-hologram opacity-8 rounded-full blur-2xl animate-pulse animate-float delay-600"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center space-y-4 animate-fade-in-up">
              <Button
                variant="glass"
                size="sm"
                onClick={() => navigate('/')}
                className="absolute top-6 left-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-cyber rounded-3xl flex items-center justify-center mx-auto shadow-cyber relative">
                  <span className="text-3xl">🎓</span>
                  <div className="absolute inset-0 bg-gradient-hologram opacity-30 rounded-3xl animate-pulse"></div>
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
                Campus Connect
              </h1>
              <p className="text-muted-foreground text-lg">
                Connect with tutors and achieve academic success
              </p>
            </div>

            {/* Auth Card */}
            <div className="glass-elevated animate-fade-in-up delay-200">
              <div className="p-8">
                <div className="text-center pb-6">
                  <h2 className="text-2xl font-semibold text-foreground">Welcome!</h2>
                  <p className="text-muted-foreground mt-2">
                    Sign in to your account or create a new one
                  </p>
                </div>
                
                {/* Custom Tab Navigation */}
                <div className="grid w-full grid-cols-2 gap-1 p-1 bg-muted/30 backdrop-blur-sm rounded-xl mb-6">
                  <button
                    onClick={() => handleTabChange("signin")}
                    className={`py-3 px-4 text-sm font-medium rounded-lg transition-all duration-300 ${
                      activeTab === "signin"
                        ? "bg-gradient-cyber text-white shadow-glow"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleTabChange("signup")}
                    className={`py-3 px-4 text-sm font-medium rounded-lg transition-all duration-300 ${
                      activeTab === "signup"
                        ? "bg-gradient-cyber text-white shadow-glow"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg backdrop-blur-sm">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                {/* Sign In Form */}
                {activeTab === "signin" && (
                  <form onSubmit={handleSignIn} className="space-y-6 animate-fade-in-up">
                    <div className="space-y-3">
                      <label htmlFor="signin-email" className="text-sm font-medium text-foreground">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-input/50 backdrop-blur-sm border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label htmlFor="signin-password" className="text-sm font-medium text-foreground">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-4 bg-input/50 backdrop-blur-sm border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                          required
                          disabled={isLoading || isRateLimited}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading || isRateLimited}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {isRateLimited && (
                        <p className="text-xs text-destructive mt-2">
                          Account temporarily locked due to multiple failed attempts
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="cyber"
                      size="lg"
                      className="w-full h-12 text-base"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Signing in...
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                )}

                {/* Sign Up Form */}
                {activeTab === "signup" && (
                  <form onSubmit={handleSignUp} className="space-y-6 animate-fade-in-up">
                    {/* Profile Image Upload */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">Profile Photo *</label>
                      <ImageUpload
                        onImageUpload={setProfileImage}
                        currentImage={profileImage}
                        required={true}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-3">
                        <label htmlFor="signup-name" className="text-sm font-medium text-foreground">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                          <input
                            id="signup-name"
                            type="text"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-input/50 backdrop-blur-sm border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label htmlFor="signup-email" className="text-sm font-medium text-foreground">Email *</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                          <input
                            id="signup-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-input/50 backdrop-blur-sm border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-foreground">I want to...</label>
                      <div className="flex items-center justify-center gap-4 p-4 glass-subtle rounded-xl border border-border/30">
                        <span className={`text-sm font-medium transition-colors ${!isTutor ? 'text-primary' : 'text-muted-foreground'}`}>
                          🧠 Find Tutors
                        </span>
                        <Switch
                          checked={isTutor}
                          onCheckedChange={setIsTutor}
                          disabled={isLoading}
                          className="data-[state=checked]:bg-gradient-cyber"
                        />
                        <span className={`text-sm font-medium transition-colors ${isTutor ? 'text-primary' : 'text-muted-foreground'}`}>
                          📚 Become a Tutor
                        </span>
                      </div>
                    </div>

                    {/* Password fields */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-3">
                        <label htmlFor="signup-password" className="text-sm font-medium text-foreground">Password *</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                          <input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-12 py-4 bg-input/50 backdrop-blur-sm border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                            required
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">Confirm Password *</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                          <input
                            id="confirm-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-input/50 backdrop-blur-sm border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Venmo Handle for Tutors */}
                    {isTutor && (
                      <div className="space-y-3 animate-fade-in-up">
                        <label htmlFor="venmo-handle" className="text-sm font-medium text-foreground">Venmo Handle *</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                          <input
                            id="venmo-handle"
                            type="text"
                            placeholder="@your-venmo-username"
                            value={venmoHandle}
                            onChange={(e) => setVenmoHandle(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-input/50 backdrop-blur-sm border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                            required={isTutor}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    )}

                    {/* Terms Agreement */}
                    <div className="flex items-center space-x-3 p-4 glass-subtle rounded-xl">
                      <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                        disabled={isLoading}
                        className="border-border/50 data-[state=checked]:bg-gradient-cyber data-[state=checked]:border-primary"
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                        I agree to the{" "}
                        <span className="text-primary hover:text-primary-glow transition-colors cursor-pointer">
                          Terms of Service
                        </span>{" "}
                        and{" "}
                        <span className="text-primary hover:text-primary-glow transition-colors cursor-pointer">
                          Privacy Policy
                        </span>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      variant="cyber"
                      size="lg"
                      className="w-full h-12 text-base"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Creating Account...
                        </div>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Auth;
