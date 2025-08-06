import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Brain, Coffee, Moon, Sun, Music, Users, BookOpen, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EnhancedCollegeAgentProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  isFollowUp?: boolean;
}

// Dynamic, personality-driven questions that feel like chatting with a friend
const collegeQuestionPools = {
  initial: [
    {
      id: "study_vibe",
      question: "Night owl or early riser? We won't judge 🌙☀️",
      type: "select",
      options: ["Total night owl 🦉", "Early bird gets the worm 🐦", "Depends on my mood", "Sleep? What's that? ☕"],
      icon: <Moon className="w-5 h-5 text-primary" />,
      profileField: "study_schedule_preference"
    },
    {
      id: "study_environment",
      question: "What's your go-to study vibe: dead silence or lo-fi beats? 🎵",
      type: "select", 
      options: ["Dead silent library vibes 📚", "Lo-fi hip hop radio 🎧", "Coffee shop chaos ☕", "Nature sounds 🌿"],
      icon: <Music className="w-5 h-5 text-primary" />,
      profileField: "study_environment"
    },
    {
      id: "group_preference",
      question: "Are you team 'Group Project Pro' or 'Leave Me Alone'? 👥",
      type: "select",
      options: ["Group study all day! 👫", "Solo study warrior 🥷", "Depends on the subject", "Small groups only (2-3 people)"],
      icon: <Users className="w-5 h-5 text-primary" />,
      profileField: "collaboration_style"
    },
    {
      id: "stress_response",
      question: "When you're stressed about exams, what's your go-to move? 😅",
      type: "text",
      placeholder: "Stress eating? Netflix? Crying? We've all been there...",
      icon: <Zap className="w-5 h-5 text-primary" />,
      profileField: "stress_management"
    }
  ],
  followUp: [
    {
      id: "procrastination",
      question: "Real talk: what's your biggest procrastination weakness? 😬",
      type: "text",
      placeholder: "TikTok? Instagram? Reorganizing your entire room?",
      icon: <Brain className="w-5 h-5 text-primary" />,
      profileField: "procrastination_triggers"
    },
    {
      id: "motivation",
      question: "What gets you hyped to actually start studying? ⚡",
      type: "text",
      placeholder: "New stationery? Good playlist? Fear of failure?",
      icon: <Sparkles className="w-5 h-5 text-primary" />,
      profileField: "motivation_triggers"
    },
    {
      id: "ideal_tutor",
      question: "If you could design the perfect tutor, what would they be like? 🌟",
      type: "text",
      placeholder: "Patient? Funny? Strict? Someone who brings snacks?",
      icon: <BookOpen className="w-5 h-5 text-primary" />,
      profileField: "tutor_preferences"
    }
  ]
};

// Conversational responses that feel natural and supportive
const agentResponses = {
  encouragement: [
    "Yo, love that energy! 🔥",
    "That's so real! Respect 💯", 
    "Okay I see you! 👀✨",
    "Not gonna lie, that's iconic 😎",
    "You're speaking my language! 🗣️"
  ],
  empathy: [
    "We've ALL been there bestie 😭",
    "The relatability is through the roof 📈", 
    "Why is this so accurate though?? 😂",
    "College life hitting different fr 💀",
    "You just described my entire existence 🥲"
  ],
  excitement: [
    "This is giving main character energy! ✨",
    "We love a self-aware icon! 👑",
    "Your honesty is refreshing ngl 🌟",
    "This intel is going straight to my brain 🧠",
    "Already plotting your perfect matches 🎯"
  ]
};

const EnhancedCollegeAgent = ({ 
  isOpen, 
  onClose, 
  userId, 
  isFollowUp = false 
}: EnhancedCollegeAgentProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionPool, setQuestionPool] = useState<any[]>([]);
  const { toast } = useToast();

  // Initialize question pool based on whether this is follow-up
  useEffect(() => {
    const pool = isFollowUp ? collegeQuestionPools.followUp : collegeQuestionPools.initial;
    // Randomize order to keep it fresh
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setQuestionPool(shuffled.slice(0, 3)); // Show 3 random questions
  }, [isFollowUp]);

  const currentQuestion = questionPool[currentQuestionIndex];

  const getPersonalizedResponse = (answerText: string) => {
    // Simple sentiment analysis for response selection
    const stressWords = ['stress', 'anxiety', 'overwhelm', 'tired', 'exhausted'];
    const positiveWords = ['love', 'enjoy', 'excited', 'great', 'awesome'];
    
    const lowerAnswer = answerText.toLowerCase();
    
    if (stressWords.some(word => lowerAnswer.includes(word))) {
      return agentResponses.empathy[Math.floor(Math.random() * agentResponses.empathy.length)];
    } else if (positiveWords.some(word => lowerAnswer.includes(word))) {
      return agentResponses.excitement[Math.floor(Math.random() * agentResponses.excitement.length)];
    } else {
      return agentResponses.encouragement[Math.floor(Math.random() * agentResponses.encouragement.length)];
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast({
        title: "Come on, don't leave me hanging! 😅",
        description: "I'm genuinely curious about your answer!",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to study_preferences or personality_traits JSONB field
      const isPersonalityQuestion = ['stress_response', 'procrastination', 'motivation', 'ideal_tutor'].includes(currentQuestion.id);
      const targetField = isPersonalityQuestion ? 'personality_traits' : 'study_preferences';
      
      // Get current data
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select(targetField)
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Update with new answer
      const currentData = profile[targetField] || {};
      const updatedData = {
        ...currentData,
        [currentQuestion.profileField]: answer.trim()
      };

      const { error } = await supabase
        .from('profiles')
        .update({ [targetField]: updatedData })
        .eq('user_id', userId);

      if (error) throw error;

      // Show personalized response
      const response = getPersonalizedResponse(answer);
      toast({
        title: response,
        description: "Thanks for keeping it real with me!"
      });

      // Move to next question or close
      if (currentQuestionIndex < questionPool.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAnswer("");
      } else {
        // Mark completion for first-time users
        if (!isFollowUp) {
          await supabase
            .from('profiles')
            .update({ completed_intro_questions: true })
            .eq('user_id', userId);
        }
        
        toast({
          title: "We're about to be unstoppable together! 🚀",
          description: "I'm already cooking up some perfect tutor matches for you!"
        });
        onClose();
      }
    } catch (error: any) {
      console.error('Error saving answer:', error);
      toast({
        title: "Oop, technical difficulties! 🤖",
        description: "Let's try that again - I promise I'm usually better at this!",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < questionPool.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer("");
    } else {
      onClose();
    }
  };

  if (!currentQuestion) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            {isFollowUp ? "Your campus bestie is back! 👋" : "Hey there! I'm your campus AI bestie! 🤖✨"}
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              {currentQuestion.icon}
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-2">{currentQuestion.question}</h3>
                
                {currentQuestion.type === "select" ? (
                  <Select value={answer} onValueChange={setAnswer}>
                    <SelectTrigger className="border-primary/20 focus:border-primary">
                      <SelectValue placeholder="Pick one that vibes with you..." />
                    </SelectTrigger>
                    <SelectContent>
                      {currentQuestion.options.map((option: string, index: number) => (
                        <SelectItem key={index} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Textarea
                    placeholder={currentQuestion.placeholder}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="min-h-20 resize-none border-primary/20 focus:border-primary"
                  />
                )}
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground text-center">
              Question {currentQuestionIndex + 1} of {questionPool.length}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="flex-1 hover:bg-muted/50"
                disabled={isSubmitting}
              >
                Skip this one
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !answer.trim()}
                className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90 transition-all"
              >
                {isSubmitting ? "Thinking..." : "Spill the tea! ☕"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-xs text-muted-foreground text-center">
          {isFollowUp 
            ? "Just checking in to keep your matches fresh! 💫" 
            : "I'm here to make college less stressful and way more connected! 🎓💜"
          }
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedCollegeAgent;
