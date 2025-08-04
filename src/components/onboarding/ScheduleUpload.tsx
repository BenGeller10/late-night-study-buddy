import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScheduleUploadProps {
  onNext: (scheduleData: string) => void;
  onBack: () => void;
}

const ScheduleUpload = ({ onNext, onBack }: ScheduleUploadProps) => {
  const [scheduleText, setScheduleText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setScheduleText(content);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (!scheduleText.trim()) {
      alert('Please enter your schedule or upload a file');
      return;
    }
    onNext(scheduleText);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-background via-background to-card">
      <div className="max-w-md mx-auto space-y-8 text-center animate-bounce-in">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">
            What's your schedule look like? 📅
          </h1>
          <p className="text-muted-foreground text-lg">
            Tell us when you're free so we can match you with the perfect tutor
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="schedule" className="text-left block">
              Type your schedule:
            </Label>
            <Textarea
              id="schedule"
              placeholder="Example: I'm free Monday mornings, Tuesday after 5pm, and Wednesday afternoons. My Organic Chemistry class is Thursday 10am-12pm."
              value={scheduleText}
              onChange={(e) => setScheduleText(e.target.value)}
              className="min-h-32"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="file-upload" className="text-left block">
              Or upload a schedule file:
            </Label>
            <Input
              id="file-upload"
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Uploaded: {file.name}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button
              variant="campus"
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={!scheduleText.trim()}
            >
              Continue
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={onBack}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleUpload;