import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Moon, Sun, Music, Users, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PersonalizationQuestionsProps {
  onComplete: () => void;
}

const PersonalizationQuestions = ({ onComplete }: PersonalizationQuestionsProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const questions = [
    {
      id: 'study_schedule',
      title: "When do you study best?",
      subtitle: "Night owl or early riser? We won't judge 🦉",
      icon: <Moon className="w-6 h-6" />,
      options: [
        { value: 'early_riser', label: 'Early Morning (6-10 AM)', emoji: '🌅' },
        { value: 'day_person', label: 'Daytime (10 AM-5 PM)', emoji: '☀️' },
        { value: 'night_owl', label: 'Evening/Night (6 PM+)', emoji: '🌙' },
        { value: 'flexible', label: 'Flexible/Depends', emoji: '🤷‍♀️' }
      ]
    },
    {
      id: 'study_environment',
      title: "What's your go-to study vibe?",
      subtitle: "Dead silence or lo-fi beats?",
      icon: <Music className="w-6 h-6" />,
      options: [
        { value: 'silent', label: 'Complete Silence', emoji: '🤫' },
        { value: 'background_music', label: 'Background Music/Lo-fi', emoji: '🎵' },
        { value: 'collaborative', label: 'Bustling Coffee Shop', emoji: '☕' },
        { value: 'nature_sounds', label: 'Nature Sounds', emoji: '🌿' }
      ]
    },
    {
      id: 'collaboration_preference',
      title: "How do you prefer to learn?",
      subtitle: "Team player or solo warrior?",
      icon: <Users className="w-6 h-6" />,
      options: [
        { value: 'group_study', label: 'Group Study Sessions', emoji: '👥' },
        { value: 'one_on_one', label: 'One-on-One Tutoring', emoji: '💭' },
        { value: 'independent', label: 'Independent Study', emoji: '🧘‍♀️' },
        { value: 'mixed', label: 'Mix of Everything', emoji: '🔄' }
      ]
    },
    {
      id: 'learning_style',
      title: "How do you absorb info best?",
      subtitle: "Everyone learns differently!",
      icon: <Brain className="w-6 h-6" />,
      options: [
        { value: 'visual', label: 'Visual (Charts, Diagrams)', emoji: '📊' },
        { value: 'auditory', label: 'Auditory (Listening, Discussion)', emoji: '👂' },
        { value: 'kinesthetic', label: 'Hands-on (Practice, Doing)', emoji: '✋' },
        { value: 'reading', label: 'Reading/Writing', emoji: '📝' }
      ]
    }
  ];

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      savePreferences(newAnswers);
    }
  };

  const savePreferences = async (finalAnswers: Record<string, string>) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update user preferences
      const { error: prefsError } = await supabase
        .from('user_preferences')
        .update({
          study_schedule: finalAnswers.study_schedule,
          study_environment: finalAnswers.study_environment,
          learning_style: finalAnswers.learning_style,
          collaboration_preference: finalAnswers.collaboration_preference,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (prefsError) throw prefsError;

      // Mark study preferences as completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ study_preferences_completed: true })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Preferences Saved! 🎉",
        description: "We'll use this to find your perfect study matches.",
      });

      onComplete();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
        <h2 className="text-xl font-semibold">Setting up your profile...</h2>
        <p className="text-muted-foreground">Almost done! ✨</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="p-6 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            {question.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold">{question.title}</h2>
            <p className="text-muted-foreground">{question.subtitle}</p>
          </div>
        </div>

        <div className="space-y-3">
          {question.options.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              size="lg"
              onClick={() => handleAnswer(option.value)}
              className="w-full justify-start text-left h-auto p-4 hover:border-primary hover:bg-primary/5"
            >
              <span className="text-xl mr-3">{option.emoji}</span>
              <span className="font-medium">{option.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      {currentQuestion > 0 && (
        <Button
          variant="ghost"
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
          className="w-full"
        >
          ← Back
        </Button>
      )}
    </div>
  );
};

export default PersonalizationQuestions;