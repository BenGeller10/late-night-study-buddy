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
                      <Select value={major} onValueChange={setMajor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your major" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Accounting">Accounting</SelectItem>
                          <SelectItem value="Acting">Acting</SelectItem>
                          <SelectItem value="Aerospace Engineering">Aerospace Engineering</SelectItem>
                          <SelectItem value="African American Studies">African American Studies</SelectItem>
                          <SelectItem value="American Studies">American Studies</SelectItem>
                          <SelectItem value="Anthropology">Anthropology</SelectItem>
                          <SelectItem value="Applied Mathematics">Applied Mathematics</SelectItem>
                          <SelectItem value="Architecture">Architecture</SelectItem>
                          <SelectItem value="Art Education">Art Education</SelectItem>
                          <SelectItem value="Art History">Art History</SelectItem>
                          <SelectItem value="Audio Arts">Audio Arts</SelectItem>
                          <SelectItem value="Biochemistry">Biochemistry</SelectItem>
                          <SelectItem value="Bioengineering">Bioengineering</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="Broadcast and Digital Journalism">Broadcast and Digital Journalism</SelectItem>
                          <SelectItem value="Business Administration">Business Administration</SelectItem>
                          <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Child and Family Studies">Child and Family Studies</SelectItem>
                          <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                          <SelectItem value="Communication and Rhetorical Studies">Communication and Rhetorical Studies</SelectItem>
                          <SelectItem value="Computer Art">Computer Art</SelectItem>
                          <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Economics">Economics</SelectItem>
                          <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                          <SelectItem value="Elementary Education">Elementary Education</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Entrepreneurship">Entrepreneurship</SelectItem>
                          <SelectItem value="Environmental Engineering">Environmental Engineering</SelectItem>
                          <SelectItem value="Exercise Science">Exercise Science</SelectItem>
                          <SelectItem value="Fashion Design">Fashion Design</SelectItem>
                          <SelectItem value="Film">Film</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="Geography">Geography</SelectItem>
                          <SelectItem value="Geology">Geology</SelectItem>
                          <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                          <SelectItem value="Health and Exercise Science">Health and Exercise Science</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                          <SelectItem value="Industrial Design">Industrial Design</SelectItem>
                          <SelectItem value="Information Management">Information Management</SelectItem>
                          <SelectItem value="International Relations">International Relations</SelectItem>
                          <SelectItem value="Italian">Italian</SelectItem>
                          <SelectItem value="Journalism">Journalism</SelectItem>
                          <SelectItem value="Latin American Studies">Latin American Studies</SelectItem>
                          <SelectItem value="Management">Management</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                          <SelectItem value="Music">Music</SelectItem>
                          <SelectItem value="Music Education">Music Education</SelectItem>
                          <SelectItem value="Nursing">Nursing</SelectItem>
                          <SelectItem value="Nutrition">Nutrition</SelectItem>
                          <SelectItem value="Philosophy">Philosophy</SelectItem>
                          <SelectItem value="Photography">Photography</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Political Science">Political Science</SelectItem>
                          <SelectItem value="Psychology">Psychology</SelectItem>
                          <SelectItem value="Public Health">Public Health</SelectItem>
                          <SelectItem value="Public Relations">Public Relations</SelectItem>
                          <SelectItem value="Religion">Religion</SelectItem>
                          <SelectItem value="Social Work">Social Work</SelectItem>
                          <SelectItem value="Sociology">Sociology</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="Sport Management">Sport Management</SelectItem>
                          <SelectItem value="Supply Chain Management">Supply Chain Management</SelectItem>
                          <SelectItem value="Theatre">Theatre</SelectItem>
                          <SelectItem value="Writing">Writing</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
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