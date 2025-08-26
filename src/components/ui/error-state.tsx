import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface ErrorStateProps {
  type?: 'page' | 'card' | 'inline';
  title?: string;
  description?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  showRetry?: boolean;
  showHome?: boolean;
  showBack?: boolean;
}

export const ErrorState = ({
  type = 'inline',
  title = 'Something went wrong',
  description = 'We encountered an unexpected error. Please try again.',
  onRetry,
  onGoHome,
  onGoBack,
  showRetry = true,
  showHome = false,
  showBack = false
}: ErrorStateProps) => {
  const ActionButton = ({ onClick, icon: Icon, children, variant = "default" }: {
    onClick: () => void;
    icon: any;
    children: React.ReactNode;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  }) => (
    <Button 
      onClick={onClick} 
      variant={variant}
      size="sm"
      className="flex items-center gap-2"
    >
      <Icon className="w-4 h-4" />
      {children}
    </Button>
  );

  if (type === 'inline') {
    return (
      <div className="flex items-center justify-center gap-2 text-muted-foreground p-4">
        <AlertTriangle className="w-4 h-4 text-orange-500" />
        <span className="text-sm">{title}</span>
        {showRetry && onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  if (type === 'page') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="flex justify-center gap-3">
            {showBack && onGoBack && (
              <ActionButton onClick={onGoBack} icon={ArrowLeft} variant="outline">
                Go Back
              </ActionButton>
            )}
            {showRetry && onRetry && (
              <ActionButton onClick={onRetry} icon={RefreshCw}>
                Try Again
              </ActionButton>
            )}
            {showHome && onGoHome && (
              <ActionButton onClick={onGoHome} icon={Home} variant="outline">
                Go Home
              </ActionButton>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="text-center pb-4">
          <div className="w-10 h-10 mx-auto bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>
          
          <div className="flex justify-center gap-2">
            {showRetry && onRetry && (
              <Button size="sm" onClick={onRetry}>
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            )}
            {showHome && onGoHome && (
              <Button size="sm" variant="outline" onClick={onGoHome}>
                <Home className="w-3 h-3 mr-1" />
                Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default ErrorState;