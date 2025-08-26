import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { User, Brain, Star, Coffee, CheckCircle } from "lucide-react";
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

interface StreamlinedOnboardingProps {
  onComplete: (data: OnboardingData) => Promise<boolean>;
  userEmail: string;
}

const StreamlinedOnboarding = ({ onComplete, userEmail }: StreamlinedOnboardingProps) => {
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
  const [autoAdvancing, setAutoAdvancing] = useState(false);

  // Auto-advance when certain fields are filled
  useEffect(() => {
    if (currentStep === 0 && formData.username.length >= 8 && formData.display_name.length > 0 && !autoAdvancing) {
      setAutoAdvancing(true);
      setTimeout(() => {
        setCurrentStep(1);
        setAutoAdvancing(false);
      }, 800);
    }
  }, [formData.username, formData.display_name, currentStep, autoAdvancing]);

  const quickPersonalityQuestions = [
    {
      id: 'study_time',
      question: "When do you study best?",
      options: ['morning', 'afternoon', 'night', 'anytime'],
      labels: ['Morning ☀️', 'Afternoon 🌤️', 'Night 🌙', 'Anytime 🔄'],
      emoji: '⏰'
    },
    {
      id: 'study_style',
      question: "How do you prefer to learn?",
      options: ['visual', 'hands_on', 'discussion', 'solo'],
      labels: ['Visual 👁️', 'Hands-on 🛠️', 'Discussion 💬', 'Solo Focus 🎯'],
      emoji: '🧠'
    }
  ];

  const steps = [
    { title: "Welcome", icon: User, color: "from-blue-500 to-purple-500" },
    { title: "Academic", icon: Brain, color: "from-purple-500 to-pink-500" },
    { title: "Quick Questions", icon: Star, color: "from-pink-500 to-red-500" },
    { title: "Ready!", icon: CheckCircle, color: "from-green-500 to-blue-500" }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
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
    
    // Add some smart defaults
    const completedData = {
      ...formData,
      study_preferences: {
        ...formData.study_preferences,
        completed_intro: true,
        onboarding_source: 'streamlined'
      }
    };
    
    const success = await onComplete(completedData);
    if (!success) {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.username.length >= 8 && formData.display_name.length > 0;
      case 1:
        const baseValid = formData.major.length > 0 && formData.campus.length > 0;
        if (formData.is_tutor) {
          return baseValid && formData.gpa && formData.gpa >= 3.6;
        }
        return baseValid;
      case 2:
        return Object.keys(formData.personality_traits).length >= 1;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card p-4 flex items-center justify-center">
      <Card className="w-full max-w-lg glass-card border-0 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${steps[currentStep].color} flex items-center justify-center shadow-lg`}
          >
            {React.createElement(steps[currentStep].icon, { className: "w-8 h-8 text-white" })}
          </motion.div>
          
          <div>
            <CardTitle className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-xl">
              {currentStep === 0 && "Welcome to Campus Connect! 🎓"}
              {currentStep === 1 && "Tell us about your studies 📚"}
              {currentStep === 2 && "Just a couple quick questions ⚡"}
              {currentStep === 3 && "You're all set! 🚀"}
            </CardTitle>
            <Progress value={progress} className="mt-4 h-2" />
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
                  <div className="text-center text-sm text-muted-foreground mb-4">
                    Let's get you connected with your campus community
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="username" className="text-sm font-medium">Choose a username</Label>
                      <Input
                        id="username"
                        placeholder="coolstudent2024"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        className="mt-1 transition-all duration-200 focus:scale-[1.02]"
                      />
                      {formData.username.length > 0 && formData.username.length < 8 && (
                        <p className="text-xs text-orange-500 mt-1">At least 8 characters</p>
                      )}
                      {formData.username.length >= 8 && (
                        <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Looks good!
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="display_name" className="text-sm font-medium">What should we call you?</Label>
                      <Input
                        id="display_name"
                        placeholder="Alex Johnson"
                        value={formData.display_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                        className="mt-1 transition-all duration-200 focus:scale-[1.02]"
                      />
                    </div>
                  </div>
                  
                  {isStepValid() && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <p className="text-sm text-green-600 font-medium">Perfect! Moving on... ⚡</p>
                    </motion.div>
                  )}
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="major">What's your major?</Label>
                      <Input
                        id="major"
                        placeholder="Computer Science"
                        value={formData.major}
                        onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="campus">Which school?</Label>
                      <Input
                        id="campus"
                        placeholder="UC Berkeley"
                        value={formData.campus}
                        onChange={(e) => setFormData(prev => ({ ...prev, campus: e.target.value }))}
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="year">Year</Label>
                        <select
                          id="year"
                          value={formData.year}
                          onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                          className="w-full p-2 rounded-lg bg-background border border-border transition-all duration-200 focus:scale-[1.02]"
                        >
                          <option value={1}>Freshman</option>
                          <option value={2}>Sophomore</option>
                          <option value={3}>Junior</option>
                          <option value={4}>Senior</option>
                          <option value={5}>Graduate</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Want to tutor?</Label>
                        <div className="flex items-center gap-2 pt-1">
                          <Switch
                            checked={formData.is_tutor}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_tutor: checked }))}
                          />
                          <span className="text-sm text-muted-foreground">
                            {formData.is_tutor ? 'Yes! 🧠' : 'Maybe later 📚'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {formData.is_tutor && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <Label htmlFor="gpa">GPA (min. 3.6 for tutors)</Label>
                        <Input
                          id="gpa"
                          type="number"
                          step="0.01"
                          min="0"
                          max="4.0"
                          placeholder="3.8"
                          value={formData.gpa || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, gpa: parseFloat(e.target.value) }))}
                          className="transition-all duration-200 focus:scale-[1.02]"
                        />
                        {formData.gpa && formData.gpa < 3.6 && (
                          <p className="text-sm text-orange-500">Need at least 3.6 to tutor</p>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">
                      Help us match you with the right people
                    </p>
                  </div>
                  
                  {quickPersonalityQuestions.map((q) => (
                    <div key={q.id} className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <span className="text-lg">{q.emoji}</span>
                        {q.question}
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((option, index) => (
                          <Button
                            key={option}
                            variant={formData.personality_traits[q.id] === option ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePersonalityAnswer(q.id, option)}
                            className="h-auto p-3 text-xs whitespace-normal transition-all duration-200 hover:scale-105"
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
                <div className="text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-6xl"
                  >
                    🎉
                  </motion.div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Welcome to Campus Connect!</h3>
                    <p className="text-sm text-muted-foreground">
                      You're ready to discover tutors, join study groups, and connect with your campus community.
                    </p>
                  </div>
                  
                  <div className="bg-muted/20 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">🚀 What's next?</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Browse tutors in your subjects</li>
                      <li>• Join study groups and discussions</li>
                      <li>• Share your campus stories</li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between pt-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="transition-all duration-200"
            >
              Back
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid() || autoAdvancing}
                className="bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-200 hover:scale-105"
              >
                {autoAdvancing ? 'Next...' : 'Continue'}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                className="bg-gradient-to-r from-green-600 to-blue-600 transition-all duration-200 hover:scale-105"
              >
                {isSubmitting ? 'Setting up...' : "Let's go! 🚀"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamlinedOnboarding;