// components/feedback/AlertItem.tsx
"use client";

import React from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { useAutoContrast } from '@/hooks/useAutoContrast';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/runtime/components/ui/alert';
import { Button } from '@/runtime/components/ui/button';
import {
  AlertItemProps,
  FeedbackStatusType,
} from '@/interfaces/components/common/feedback/feedback';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

// --- The AlertItem Component Implementation ---

export const AlertItem: React.FC<AlertItemProps> = ({
  type = 'info',
  message,
  title,
  icon,
  dismissible = false,
  onDismiss,
  classes,
  // --- FIX IS HERE ---
  // We explicitly destructure all props that are not meant for the DOM element.
  // This prevents React from warning about unknown properties like `onAction`.
  componentType,
  uuid,
  action,
  onAction,
  ...restProps
}) => {
  const alertRef = React.useRef<HTMLDivElement>(null);
  
  // Auto-detect and correct poor color contrast with enhanced detection
  const { correctedTextColor } = useAutoContrast(classes, {
    elementRef: alertRef as React.RefObject<HTMLElement>,
    componentName: 'AlertItem'
  });

  // A map to get the appropriate icon and variant for shadcn/ui's Alert component.
  const typeConfig: Record<
    FeedbackStatusType,
    { variant: 'default' | 'destructive'; icon: React.ReactNode }
  > = {
    success: {
      variant: 'default',
      icon: <CheckCircle className="h-4 w-4" />,
    },
    error: {
      variant: 'destructive',
      icon: <XCircle className="h-4 w-4" />,
    },
    warning: {
      variant: 'default',
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    info: {
      variant: 'default',
      icon: <Info className="h-4 w-4" />,
    },
  };

  const { variant, icon: defaultIcon } = typeConfig[type];

  // Custom styling for different alert types using theme tokens
  // Success uses accent colors, warning uses muted colors for subtlety
  const alertClasses = cn(
    {
      // Warning: use muted background with visible border
      'bg-muted/50 border-muted-foreground/30 text-muted-foreground dark:bg-muted/30 dark:border-muted-foreground/50':
        type === 'warning',
      // Success: use accent colors for positive feedback
      'bg-accent/10 border-accent text-accent-foreground dark:bg-accent/20 dark:border-accent/50':
        type === 'success',
    },
    'relative', // Needed for positioning the dismiss button
    classes
  );

  return (
    <Alert 
      ref={alertRef as any}
      variant={variant} 
      className={alertClasses} 
      style={correctedTextColor ? { color: correctedTextColor } : undefined}
      data-contrast-corrected={correctedTextColor && process.env.NODE_ENV === 'development' ? 'true' : undefined}
      {...filterDOMProps(restProps)}
    >
      {defaultIcon}
      {title && <AlertTitle>{title}</AlertTitle>}
      {message && <AlertDescription>{message}</AlertDescription>}
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6"
          onClick={onDismiss as unknown as React.MouseEventHandler<HTMLButtonElement>}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      )}
    </Alert>
  );
};

AlertItem.displayName = 'AlertItem';

export default AlertItem;
