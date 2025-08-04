import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailVerificationProps {
  onNext: (email: string) => void;
  onBack: () => void;
}

const EmailVerification = ({ onNext, onBack }: EmailVerificationProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.includes('.edu')) {
      alert('Please enter a valid .edu email address');
      return;
    }

    setIsLoading(true);
    
    // Simulate email verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    onNext(email);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-background via-background to-card">
      <div className="max-w-md mx-auto space-y-8 text-center animate-bounce-in">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">
            What's good? 📧
          </h1>
          <p className="text-muted-foreground text-lg">
            Let's start with your .edu email to verify you're part of the squad
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="your.name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 text-center text-lg"
              required
            />
            <p className="text-xs text-muted-foreground">
              We need your .edu email to verify you're a student 🎓
            </p>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              variant="campus"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Continue"}
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

export default EmailVerification;