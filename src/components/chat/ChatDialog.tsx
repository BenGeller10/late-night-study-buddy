import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ChatConversation from "./ChatConversation";

interface ChatDialogProps {
  tutor: {
    id: string;
    name: string;
    profilePicture: string;
    classes: string[];
    subjects?: Array<{
      id: string;
      name: string;
      code: string;
      hourly_rate: number;
    }>;
  };
  triggerButton: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ChatDialog = ({ tutor, triggerButton, isOpen, onOpenChange }: ChatDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    onOpenChange?.(open);
  };

  const handleBack = () => {
    setDialogOpen(false);
    onOpenChange?.(false);
  };

  // Convert tutor data to match ChatConversation expectations
  const chatTutor = {
    id: tutor.id,
    name: tutor.name,
    profilePicture: tutor.profilePicture,
    classes: tutor.classes.length > 0 ? tutor.classes : tutor.subjects?.map(s => s.code) || ['General'],
    isOnline: Math.random() > 0.3 // Random online status for demo
  };

  const open = isOpen !== undefined ? isOpen : dialogOpen;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="p-0 max-w-md w-full h-[80vh] max-h-[600px] flex flex-col overflow-hidden">
        <ChatConversation 
          tutor={chatTutor}
          onBack={handleBack}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;