import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import campusLogo from "@/assets/campus-connect-logo.png";
import heroImage from "@/assets/campus-hero-image.jpg";

const WelcomeScreen = ({ onNext }: { onNext: (email: string) => void }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('.edu')) {
      alert('Please use your .edu email address 📧');
      return;
    }
    
    setIsLoading(true);
    // Simulate email verification
    setTimeout(() => {
      onNext(email);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/50" />
        
        <div className="relative z-10 max-w-md mx-auto space-y-8 animate-bounce-in">
          <div className="flex flex-col items-center space-y-4">
            <img 
              src={campusLogo} 
              alt="Campus Connect" 
              className="w-20 h-20 rounded-2xl shadow-glow"
            />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Campus Connect
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                What's good? Let's get you set up to ace your classes. ✨
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="your.name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 text-center text-lg bg-card/50 backdrop-blur-sm border-border/50 focus:border-accent"
                required
              />
              <p className="text-xs text-muted-foreground">
                We need your .edu email to verify you're a student 🎓
              </p>
            </div>

            <Button
              type="submit"
              variant="campus"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending verification..." : "Get Started 🚀"}
            </Button>
          </form>

          <div className="text-xs text-muted-foreground max-w-xs">
            By continuing, you agree to our vibe check and campus community guidelines
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="glass-card mx-6 mb-6 p-4 rounded-2xl">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">2.1k</div>
            <div className="text-xs text-muted-foreground">Active Tutors</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent">15k</div>
            <div className="text-xs text-muted-foreground">Sessions Booked</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-success">4.9</div>
            <div className="text-xs text-muted-foreground">Average Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;