import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Heart, Coffee, Music, Gamepad2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CollegeQuestionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const collegeQuestions = [
  {
    id: "major_passion",
    question: "What made you choose your major? 🎓",
    placeholder: "Tell me what sparked your interest!",
    type: "text",
    icon: <Sparkles className="w-5 h-5 text-primary" />,
    profileField: "major_passion"
  },
  {
    id: "study_spot",
    question: "Where's your favorite spot to study on campus? 📚",
    placeholder: "Library? Coffee shop? Your dorm?",
    type: "text",
    icon: <Coffee className="w-5 h-5 text-primary" />,
    profileField: "favorite_study_spot"
  },
  {
    id: "college_goal",
    question: "What's one thing you want to accomplish this semester? 🎯",
    placeholder: "Academic goals, personal growth, making friends?",
    type: "text",
    icon: <Heart className="w-5 h-5 text-primary" />,
    profileField: "semester_goal"
  },
  {
    id: "stress_relief",
    question: "How do you like to unwind after a tough study session? 🎵",
    placeholder: "Music, gaming, exercise, netflix?",
    type: "text",
    icon: <Music className="w-5 h-5 text-primary" />,
    profileField: "stress_relief"
  },
  {
    id: "dream_career",
    question: "What's your dream job after graduation? ✨",
    placeholder: "Dream big! What gets you excited?",
    type: "text",
    icon: <Gamepad2 className="w-5 h-5 text-primary" />,
    profileField: "dream_career"
  }
];

const CollegeQuestionPopup = ({ isOpen, onClose, userId }: CollegeQuestionPopupProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const currentQuestion = collegeQuestions[currentQuestionIndex];

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast({
        title: "Oops! 😅",
        description: "I'd love to hear your answer!",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update the profile with the answer
      const updateData = {
        [currentQuestion.profileField]: answer.trim()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId);

      if (error) throw error;

      // Show encouraging message
      const encouragingMessages = [
        "Love it! 🌟",
        "That's awesome! 💫",
        "Great answer! ✨",
        "So cool! 🎉",
        "Amazing! 🚀"
      ];
      
      toast({
        title: encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)],
        description: "Thanks for sharing with me!"
      });

      // Move to next question or close
      if (currentQuestionIndex < collegeQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAnswer("");
      } else {
        // Mark that user has completed the intro questions
        await supabase
          .from('profiles')
          .update({ completed_intro_questions: true })
          .eq('user_id', userId);
        
        toast({
          title: "We're going to be great friends! 🤗",
          description: "I'll check in with more fun questions as you use the app!"
        });
        onClose();
      }
    } catch (error: any) {
      console.error('Error saving answer:', error);
      toast({
        title: "Oops, something went wrong! 😅",
        description: "Let's try that again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < collegeQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer("");
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            Hey there! I'm your campus buddy! 👋
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-primary/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              {currentQuestion.icon}
              <h3 className="font-medium text-lg">{currentQuestion.question}</h3>
            </div>
            
            <div className="space-y-3">
              {currentQuestion.type === "text" && (
                <Textarea
                  placeholder={currentQuestion.placeholder}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-20 resize-none border-primary/20 focus:border-primary"
                />
              )}
              
              <div className="text-xs text-muted-foreground text-center">
                Question {currentQuestionIndex + 1} of {collegeQuestions.length}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="flex-1"
                disabled={isSubmitting}
              >
                Skip for now
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !answer.trim()}
                className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90"
              >
                {isSubmitting ? "Saving..." : "Share! ✨"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-xs text-muted-foreground text-center">
          I'm here to make your college experience more fun and connected! 🎓💫
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default CollegeQuestionPopup;