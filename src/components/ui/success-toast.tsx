import { motion } from "framer-motion";
import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessToastProps {
  title: string;
  description?: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const SuccessToast = ({ title, description, onDismiss, action }: SuccessToastProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm"
    >
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-green-800 dark:text-green-200 text-sm">
              {title}
            </p>
            {description && (
              <p className="text-green-600 dark:text-green-300 text-xs mt-1">
                {description}
              </p>
            )}
          </div>

          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-auto p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-800"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {action && (
          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
            <Button
              size="sm"
              onClick={action.onClick}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SuccessToast;