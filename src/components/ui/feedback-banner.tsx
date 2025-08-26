import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackBannerProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    colors: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
  },
  error: {
    icon: AlertCircle,
    colors: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
  },
  warning: {
    icon: AlertTriangle,
    colors: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200'
  },
  info: {
    icon: Info,
    colors: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
  }
};

export const FeedbackBanner = ({
  type,
  title,
  description,
  action,
  dismissible = true,
  onDismiss,
  className = ""
}: FeedbackBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const config = typeConfig[type];
  const Icon = config.icon;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`border rounded-lg p-4 ${config.colors} ${className}`}
        >
          <div className="flex items-start gap-3">
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm mb-1">{title}</h4>
              {description && (
                <p className="text-sm opacity-90">{description}</p>
              )}
              
              {action && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    onClick={action.onClick}
                    className="h-8 text-xs"
                  >
                    {action.label}
                  </Button>
                </div>
              )}
            </div>

            {dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-auto p-1 opacity-70 hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackBanner;