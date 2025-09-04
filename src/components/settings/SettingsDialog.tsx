import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ImageUpload from "@/components/ui/image-upload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  LogOut,
  Save,
  Camera,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Search,
  X,
} from "lucide-react";

interface SettingsDialogProps {
  user: any;
  onUserUpdate: (updatedUser: any) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SettingsDialog = ({ user, onUserUpdate, isOpen: externalIsOpen, onOpenChange }: SettingsDialogProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Profile states
  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [major, setMajor] = useState(user?.major || "");
  const [campus, setCampus] = useState(user?.campus || "");
  const [gradYear, setGradYear] = useState(user?.year || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");

  // Search states
  const [showMajorSearch, setShowMajorSearch] = useState(false);
  const [majorSearchTerm, setMajorSearchTerm] = useState("");

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowDirectMessages, setAllowDirectMessages] = useState(true);

  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not found. Please try signing in again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          bio: bio.trim(),
          major: major.trim(),
          campus: campus.trim(),
          year: gradYear ? parseInt(gradYear) : null,
          avatar_url: avatarUrl,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update user state
      onUserUpdate({
        ...user,
        display_name: displayName.trim(),
        bio: bio.trim(),
        major: major.trim(),
        year: gradYear ? parseInt(gradYear) : null,
        avatar_url: avatarUrl,
      });

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully.",
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Failed to update profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Clean up local storage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.startsWith('campus-connect-')) {
          localStorage.removeItem(key);
        }
      });

      await supabase.auth.signOut({ scope: 'global' });
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      // Force redirect to ensure clean state
      setTimeout(() => {
        window.location.href = '/auth';
      }, 500);
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      // Force redirect even if sign out fails
      window.location.href = '/auth';
    }
  };

  const campusOptions = [
    "University of Utah",
    "Utah State University",
    "Weber State University",
    "Southern Utah University",
    "Utah Valley University",
    "Snow College",
    "Salt Lake Community College",
    "Other"
  ];

  const majorOptions = [
    "Accounting", "Acting", "Aerospace Engineering", "African American Studies", "American Studies",
    "Anthropology", "Applied Mathematics", "Architecture", "Art Education", "Art History", "Audio Arts",
    "Biochemistry", "Bioengineering", "Biology", "Broadcast and Digital Journalism", "Business Administration",
    "Chemical Engineering", "Chemistry", "Child and Family Studies", "Civil Engineering",
    "Communication and Rhetorical Studies", "Computer Art", "Computer Engineering", "Computer Science",
    "Economics", "Electrical Engineering", "Elementary Education", "English", "Entrepreneurship",
    "Environmental Engineering", "Exercise Science", "Fashion Design", "Film", "Finance", "French",
    "Geography", "Geology", "Graphic Design", "Health and Exercise Science", "History", "Industrial Design",
    "Information Management", "International Relations", "Italian", "Journalism", "Latin American Studies",
    "Management", "Marketing", "Mathematics", "Mechanical Engineering", "Music", "Music Education",
    "Nursing", "Nutrition", "Philosophy", "Photography", "Physics", "Political Science", "Psychology",
    "Public Health", "Public Relations", "Religion", "Social Work", "Sociology", "Spanish",
    "Sport Management", "Supply Chain Management", "Theatre", "Writing", "Other"
  ];

  // Filter majors based on search term
  const filteredMajors = majorOptions.filter(majorOption =>
    majorOption.toLowerCase().includes(majorSearchTerm.toLowerCase())
  );

  const gradYearOptions = Array.from({length: 10}, (_, i) => (new Date().getFullYear() + i).toString());

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="text-xl">
                      {displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Label htmlFor="avatar">Profile Photo</Label>
                    <div className="mt-2">
                      <ImageUpload
                        onImageUpload={setAvatarUrl}
                        currentImage={avatarUrl}
                      />
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                {/* Academic Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="major">Major</Label>
                      <div className="relative">
                        {!showMajorSearch ? (
                          <div 
                            className="cursor-pointer"
                            onClick={() => setShowMajorSearch(true)}
                          >
                            <div className="flex items-center justify-between w-full px-3 py-2 border rounded-md bg-background hover:bg-accent transition-colors">
                              <span className={major ? "text-foreground" : "text-muted-foreground"}>
                                {major || "Click to search for your major"}
                              </span>
                              <Search className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  placeholder="Search for your major..."
                                  value={majorSearchTerm}
                                  onChange={(e) => setMajorSearchTerm(e.target.value)}
                                  className="pl-9"
                                  autoFocus
                                />
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setShowMajorSearch(false);
                                  setMajorSearchTerm("");
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            {majorSearchTerm && (
                              <div className="max-h-48 overflow-y-auto border rounded-md bg-popover shadow-lg z-50 relative">
                                {filteredMajors.length > 0 ? (
                                  <div className="p-1">
                                    {filteredMajors.slice(0, 10).map((majorOption) => (
                                      <div
                                        key={majorOption}
                                        className="px-3 py-2 cursor-pointer hover:bg-accent rounded-sm transition-colors"
                                        onClick={() => {
                                          setMajor(majorOption);
                                          setShowMajorSearch(false);
                                          setMajorSearchTerm("");
                                        }}
                                      >
                                        {majorOption}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-3 text-sm text-muted-foreground text-center">
                                    No majors found matching "{majorSearchTerm}"
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campus">Campus</Label>
                      <Input
                        id="campus"
                        value={campus}
                        onChange={(e) => setCampus(e.target.value)}
                        placeholder="e.g., UC Berkeley"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grad-year">Academic Year</Label>
                    <Select value={gradYear} onValueChange={setGradYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Freshman</SelectItem>
                        <SelectItem value="2">Sophomore</SelectItem>
                        <SelectItem value="3">Junior</SelectItem>
                        <SelectItem value="4">Senior</SelectItem>
                        <SelectItem value="5">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell others about yourself..."
                    className="min-h-20"
                  />
                </div>

                <Button onClick={handleSaveProfile} disabled={isLoading} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified about new messages and sessions</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="session-reminders">Session Reminders</Label>
                      <p className="text-sm text-muted-foreground">Remind me about upcoming tutoring sessions</p>
                    </div>
                    <Switch
                      id="session-reminders"
                      checked={sessionReminders}
                      onCheckedChange={setSessionReminders}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing-emails">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive tips, features, and Campus Connect news</p>
                    </div>
                    <Switch
                      id="marketing-emails"
                      checked={marketingEmails}
                      onCheckedChange={setMarketingEmails}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-visibility">Profile Visibility</Label>
                    <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Anyone can find me</SelectItem>
                        <SelectItem value="campus">Campus Only - Only my campus can see me</SelectItem>
                        <SelectItem value="private">Private - Only matched users can see me</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-online">Show Online Status</Label>
                      <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                    </div>
                    <Switch
                      id="show-online"
                      checked={showOnlineStatus}
                      onCheckedChange={setShowOnlineStatus}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-messages">Allow Direct Messages</Label>
                      <p className="text-sm text-muted-foreground">Allow other users to message you directly</p>
                    </div>
                    <Switch
                      id="allow-messages"
                      checked={allowDirectMessages}
                      onCheckedChange={setAllowDirectMessages}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Account Information</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Email: {user?.email}</p>
                      <p>Role: {user?.is_tutor ? 'Tutor' : 'Student'}</p>
                      <p>Member since: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4 text-destructive">Danger Zone</h4>
                    <Button 
                      variant="destructive" 
                      onClick={handleSignOut}
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;