import { Button } from "@/components/ui/button";

interface RoleSelectionProps {
  onSelectRole: (role: 'student' | 'tutor') => void;
}

const RoleSelection = ({ onSelectRole }: RoleSelectionProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-background via-background to-card">
      <div className="max-w-md mx-auto space-y-8 text-center animate-bounce-in">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">
            What's your main gig? 🤔
          </h1>
          <p className="text-muted-foreground text-lg">
            Don't worry, you can switch this up later if you're a genius in one class but drowning in another
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="campus"
            size="xl"
            className="w-full h-20 text-lg"
            onClick={() => onSelectRole('student')}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-2xl">📚</span>
              <span>I Need Help (Student)</span>
            </div>
          </Button>

          <Button
            variant="outline"
            size="xl"
            className="w-full h-20 text-lg border-2 hover:border-primary"
            onClick={() => onSelectRole('tutor')}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-2xl">🧠</span>
              <span>I Can Teach (Tutor)</span>
            </div>
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Pro-tip: Most people end up doing both! 💡
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;