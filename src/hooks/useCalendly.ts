import { useEffect, useState } from 'react';

interface CalendlyOptions {
  url: string;
}

interface CalendlyEvent {
  event: string;
  payload?: {
    event_start_time?: string;
    invitee?: {
      name?: string;
      email?: string;
    };
  };
}

export const useCalendly = (onScheduled?: (event: CalendlyEvent) => void) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if Calendly script is already loaded
    if (window.Calendly) {
      setIsReady(true);
      return;
    }

    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = () => {
      // Wait a bit for Calendly to initialize
      setTimeout(() => {
        if (window.Calendly) {
          setIsReady(true);
        }
      }, 100);
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="calendly"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  useEffect(() => {
    if (!onScheduled) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.event === 'calendly.event_scheduled') {
        onScheduled(event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onScheduled]);

  const openCalendly = (options: CalendlyOptions) => {
    if (!window.Calendly || !isReady) {
      console.warn('Calendly is not ready yet');
      return;
    }

    setIsLoading(true);
    
    try {
      window.Calendly.initPopupWidget({
        url: options.url,
        prefill: {},
        utm: {}
      });
    } catch (error) {
      console.error('Error opening Calendly:', error);
    } finally {
      // Reset loading state after a short delay
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  return {
    openCalendly,
    isReady,
    isLoading
  };
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: {
        url: string;
        prefill?: Record<string, any>;
        utm?: Record<string, any>;
      }) => void;
    };
  }
}