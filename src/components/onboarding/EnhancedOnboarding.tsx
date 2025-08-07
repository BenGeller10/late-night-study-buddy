import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { User, Brain, Clock, Coffee, Users, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingData {
  username: string;
  display_name: string;
  major: string;
  year: number;
  campus: string;
  bio: string;
  is_tutor: boolean;
  gpa?: number;
  study_preferences: Record<string, any>;
  personality_traits: Record<string, any>;
}

interface EnhancedOnboardingProps {
  onComplete: (data: OnboardingData) => Promise<boolean>;
  userEmail: string;
}

const EnhancedOnboarding = ({ onComplete, userEmail }: EnhancedOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    username: '',
    display_name: '',
    major: '',
    year: 1,
    campus: '',
    bio: '',
    is_tutor: false,
    study_preferences: {},
    personality_traits: {}
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const funQuestions = [
    {
      id: 'study_time',
      question: "Night owl or early riser? We won't judge 🦉",
      options: ['night_owl', 'early_bird', 'depends_on_coffee'],
      labels: ['Night Owl 🌙', 'Early Bird ☀️', 'Depends on Coffee ☕']
    },
    {
      id: 'study_vibe',
      question: "What's your go-to study vibe?",
      options: ['dead_silence', 'lofi_beats', 'nature_sounds', 'study_playlist'],
      labels: ['Dead Silence 🤫', 'Lo-fi Beats 🎵', 'Nature Sounds 🌿', 'Study Playlist 🎧']
    },
    {
      id: 'work_style',
      question: "Are you team 'Group Project Pro' or 'Leave Me Alone'?",
      options: ['group_pro', 'solo_warrior', 'depends_on_mood', 'mix_both'],
      labels: ['Group Pro 👥', 'Solo Warrior 🥷', 'Depends on Mood 🎭', 'Mix of Both 🔄']
    },
    {
      id: 'stress_relief',
      question: "When stressed, you:",
      options: ['hit_the_gym', 'binge_netflix', 'call_friends', 'take_naps'],
      labels: ['Hit the Gym 💪', 'Binge Netflix 📺', 'Call Friends 📞', 'Take Naps 😴']
    }
  ];

  const steps = [
    { title: "Basic Info", icon: User },
    { title: "Academic", icon: Brain },
    { title: "Personality", icon: Star },
    { title: "Final Touch", icon: Coffee }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePersonalityAnswer = (questionId: string, answer: string) => {
    setFormData(prev => ({
      ...prev,
      personality_traits: {
        ...prev.personality_traits,
        [questionId]: answer
      }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const success = await onComplete(formData);
    if (!success) {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.username.length >= 8 && formData.display_name.length > 0;
      case 1:
        return formData.major.length > 0 && formData.campus.length > 0;
      case 2:
        return Object.keys(formData.personality_traits).length >= 2;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="text-4xl">🎓</div>
          </div>
          <CardTitle className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to Campus Connect!
          </CardTitle>
          <Progress value={progress} className="mt-4" />
          <div className="flex justify-center gap-2 mt-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    index <= currentStep 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted/20 text-muted-foreground'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username (8+ characters)</Label>
                    <Input
                      id="username"
                      placeholder="coolstudent123"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="glass-card"
                    />
                    {formData.username.length > 0 && formData.username.length < 8 && (
                      <p className="text-sm text-red-500">Username must be at least 8 characters</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      placeholder="Alex Smith"
                      value={formData.display_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                      className="glass-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Quick Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us a bit about yourself..."
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="glass-card resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="major">Major</Label>
                    <Input
                      id="major"
                      placeholder="Computer Science"
                      value={formData.major}
                      onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
                      className="glass-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campus">Campus/University</Label>
                    <Input
                      id="campus"
                      placeholder="University of California, Berkeley"
                      value={formData.campus}
                      onChange={(e) => setFormData(prev => ({ ...prev, campus: e.target.value }))}
                      className="glass-card"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <select
                        id="year"
                        value={formData.year}
                        onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                        className="w-full p-2 rounded-lg bg-background border border-border glass-card"
                      >
                        <option value={1}>Freshman</option>
                        <option value={2}>Sophomore</option>
                        <option value={3}>Junior</option>
                        <option value={4}>Senior</option>
                        <option value={5}>Graduate</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Want to be a tutor?</Label>
                      <div className="flex items-center gap-2 pt-2">
                        <Switch
                          checked={formData.is_tutor}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_tutor: checked }))}
                        />
                        <span className="text-sm text-muted-foreground">
                          {formData.is_tutor ? 'Yes! 🧠' : 'Not yet 📚'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {formData.is_tutor && (
                    <div className="space-y-2">
                      <Label htmlFor="gpa">GPA (Required for tutors - min. 3.6)</Label>
                      <Input
                        id="gpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="4.0"
                        placeholder="3.8"
                        value={formData.gpa || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, gpa: parseFloat(e.target.value) }))}
                        className="glass-card"
                      />
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Let's get to know you! 😊</h3>
                    <p className="text-sm text-muted-foreground">
                      Answer a couple fun questions to help us match you better
                    </p>
                  </div>
                  {funQuestions.slice(0, 2).map((q) => (
                    <div key={q.id} className="space-y-3">
                      <Label className="text-sm font-medium">{q.question}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((option, index) => (
                          <Button
                            key={option}
                            variant={formData.personality_traits[q.id] === option ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePersonalityAnswer(q.id, option)}
                            className="text-xs h-auto p-3 whitespace-normal"
                          >
                            {q.labels[index]}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Almost done! 🎉</h3>
                    <p className="text-sm text-muted-foreground">
                      Just a couple more quick questions
                    </p>
                  </div>
                  {funQuestions.slice(2).map((q) => (
                    <div key={q.id} className="space-y-3">
                      <Label className="text-sm font-medium">{q.question}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((option, index) => (
                          <Button
                            key={option}
                            variant={formData.personality_traits[q.id] === option ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePersonalityAnswer(q.id, option)}
                            className="text-xs h-auto p-3 whitespace-normal"
                          >
                            {q.labels[index]}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="btn-smooth"
            >
              Back
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="btn-smooth bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                className="btn-smooth bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {isSubmitting ? 'Setting up...' : 'Complete Setup! 🚀'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedOnboarding;
