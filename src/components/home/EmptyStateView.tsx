
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Users, BookOpen, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateViewProps {
  userType: 'student' | 'tutor';
  onAction: (action: string) => void;
}

const EmptyStateView = ({ userType, onAction }: EmptyStateViewProps) => {
  const studentEmptyState = {
    title: "Welcome to your campus community! 🎓",
    subtitle: "Your journey to academic success starts here",
    actions: [
      {
        icon: Search,
        title: "Find Tutors",
        description: "Discover amazing tutors in your area",
        action: "find-tutors",
        color: "bg-blue-500/10 text-blue-600 border-blue-200"
      },
      {
        icon: Users,
        title: "Join Study Groups",
        description: "Connect with classmates studying the same subjects",
        action: "study-groups",
        color: "bg-green-500/10 text-green-600 border-green-200"
      },
      {
        icon: BookOpen,
        title: "Share Materials",
        description: "Upload and access study resources",
        action: "study-materials",
        color: "bg-purple-500/10 text-purple-600 border-purple-200"
      },
      {
        icon: MessageCircle,
        title: "Post Your First Story",
        description: "Share what you're studying today!",
        action: "create-story",
        color: "bg-orange-500/10 text-orange-600 border-orange-200"
      }
    ]
  };

  const tutorEmptyState = {
    title: "Ready to make an impact? 🧠",
    subtitle: "Help students succeed while earning money",
    actions: [
      {
        icon: Users,
        title: "Set Your Subjects",
        description: "Add subjects you can tutor",
        action: "setup-subjects",
        color: "bg-blue-500/10 text-blue-600 border-blue-200"
      },
      {
        icon: Search,
        title: "Set Availability",
        description: "Let students know when you're free",
        action: "set-availability",
        color: "bg-green-500/10 text-green-600 border-green-200"
      },
      {
        icon: MessageCircle,
        title: "Connect with Students",
        description: "Start building your student network",
        action: "find-students",
        color: "bg-purple-500/10 text-purple-600 border-purple-200"
      },
      {
        icon: BookOpen,
        title: "Share Your Story",
        description: "Tell campus what makes you a great tutor!",
        action: "create-story",
        color: "bg-orange-500/10 text-orange-600 border-orange-200"
      }
    ]
  };

  const currentState = userType === 'student' ? studentEmptyState : tutorEmptyState;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="text-6xl mb-4">
            {userType === 'student' ? '📚' : '🧠'}
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {currentState.title}
          </h2>
          <p className="text-muted-foreground text-sm">
            {currentState.subtitle}
          </p>
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-3">
          {currentState.actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.action}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`glass-card border-2 hover:scale-105 transition-all duration-300 cursor-pointer ${action.color}`}
                  onClick={() => onAction(action.action)}
                >
                  <CardContent className="p-4 text-center space-y-2">
                    <Icon className="w-8 h-8 mx-auto opacity-80" />
                    <h3 className="font-semibold text-sm">{action.title}</h3>
                    <p className="text-xs opacity-75 leading-relaxed">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Button
            onClick={() => onAction('complete-profile')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-2 rounded-full font-medium hover:scale-105 transition-transform"
          >
            Complete Your Profile ✨
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default EmptyStateView;
