// components/feedback/Toast.tsx
"use client";

import React, { useEffect } from 'react';
import { useToast } from '@/runtime/hooks/use-toast'; // Adjust path
import { Button } from '@/runtime/components/ui/button'; // Adjust path
import { ToastProps, FeedbackStatusType, ToastPosition } from '@/interfaces/components/common/feedback/feedback'; // Adjust path
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

// --- The Toast Component Implementation ---

// This component is a "trigger" or "controller". It doesn't render any visible UI itself.
// Its sole purpose is to call the useToast hook to display a toast notification
// based on the props it receives from the JSON configuration.
export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  position, // Note: shadcn/ui Toaster position is set globally, not per-toast.
  icon,
  action,
  onAction,
  onClose,
  ...restProps
}) => {
  const { toast, dismiss } = useToast();

  useEffect(() => {
    // A map to get the appropriate icon based on the toast type.
    const typeIcons: Record<FeedbackStatusType, React.ReactNode> = {
      success: <CheckCircle className="h-5 w-5 text-green-500" />,
      error: <XCircle className="h-5 w-5 text-red-500" />,
      warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      info: <Info className="h-5 w-5 text-blue-500" />,
    };

    // The toast function from shadcn/ui returns an object with an id and a dismiss function.
    const { id } = toast({
      title: type.charAt(0).toUpperCase() + type.slice(1), // e.g., "Success"
      description: message,
      duration: duration,
      variant: type === 'error' ? 'destructive' : 'default',
      action: action ? (
        <Button
          variant="outline"
          size="sm"
          // Here you would typically map the onAction string to a function
          // from your event handler registry.
          onClick={() => {
            console.log(`Action triggered: ${onAction}`);
            dismiss(id);
          }}
        >
          {action}
        </Button>
      ) : undefined,
    });

    // Note: The `position` prop from your interface cannot be directly applied
    // to an individual toast in shadcn/ui. The position is set globally on the
    // <Toaster /> component in your main layout file (e.g., app/layout.tsx).

  // FIX: Changed the dependency array to an empty array [].
  // This ensures the effect runs only once when the component mounts,
  // preventing the infinite loop that was causing the "Maximum update depth exceeded" error.
  }, []);

  // This component does not render anything itself. It just triggers the toast.
  return null;
};

Toast.displayName = 'Toast';

export default Toast;
