import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileCreationProps {
  email: string;
  scheduleData: string;
  onNext: (profileData: { fullName: string; password: string }) => void;
  onBack: () => void;
}

const ProfileCreation = ({ email, scheduleData, onNext, onBack }: ProfileCreationProps) => {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      alert('Please enter your full name');
      return;
    }
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    onNext({ fullName, password });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-background via-background to-card">
      <div className="max-w-md mx-auto space-y-8 text-center animate-bounce-in">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">
            Welcome to the squad! 🎉
          </h1>
          <p className="text-muted-foreground text-lg">
            Let's set up your profile to get you connected
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-left block">
              Email:
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="fullName" className="text-left block">
              Full Name:
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-left block">
              Password:
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="confirmPassword" className="text-left block">
              Confirm Password:
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              variant="campus"
              size="lg"
              className="w-full"
            >
              Continue to Role Selection
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={onBack}
            >
              Back
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCreation;