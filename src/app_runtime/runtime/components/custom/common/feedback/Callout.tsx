// components/feedback/Callout.tsx
"use client";

import React, { useState } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { useAutoContrast } from '@/hooks/useAutoContrast';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/runtime/components/ui/alert';
import { Button } from '@/runtime/components/ui/button';
import {
  CalloutProps,
  CalloutVariant,
} from '@/interfaces/components/common/feedback/feedback';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { DynamicRenderer } from '@/components/DynamicRenderer';
import { ComponentProps } from '@/interfaces/components/common/core';

// --- The Callout Component Implementation ---

export const Callout: React.FC<CalloutProps> = ({
  title,
  message,
  variant = 'default',
  icon, // This allows overriding the default icon
  dismissible = false,
  onDismiss,
  classes,
  ...restProps
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const calloutRef = React.useRef<HTMLDivElement>(null);

  // Auto-detect and correct poor color contrast with enhanced detection
  const { correctedTextColor } = useAutoContrast(classes, {
    elementRef: calloutRef,
    componentName: 'Callout'
  });

  if (!isVisible) {
    return null;
  }

  // A map to get the appropriate icon and variant for shadcn/ui's Alert component.
  const typeConfig: Record<
    CalloutVariant,
    { variant: 'default' | 'destructive'; icon: React.ReactNode; className: string }
  > = {
    success: {
      variant: 'default',
      icon: <CheckCircle className="h-4 w-4" />,
      className: 'border-green-500/50 text-green-700 dark:border-green-500 [&>svg]:text-green-700 dark:[&>svg]:text-green-400',
    },
    error: {
      variant: 'destructive', // Uses the built-in destructive variant
      icon: <XCircle className="h-4 w-4" />,
      className: '', // No extra classes needed for destructive
    },
    warning: {
      variant: 'default',
      icon: <AlertTriangle className="h-4 w-4" />,
      className: 'border-yellow-500/50 text-yellow-700 dark:border-yellow-500 [&>svg]:text-yellow-700 dark:[&>svg]:text-yellow-400',
    },
    info: {
      variant: 'default',
      icon: <Info className="h-4 w-4" />,
      className: 'border-blue-500/50 text-blue-700 dark:border-blue-500 [&>svg]:text-blue-700 dark:[&>svg]:text-blue-400',
    },
    default: {
        variant: 'default',
        icon: <Info className="h-4 w-4" />,
        className: '',
    }
  };

  const { variant: alertVariant, icon: defaultIcon, className: variantClass } = typeConfig[variant];

  const handleDismiss = () => {
    setIsVisible(false);
    // Here you would typically map the onDismiss string to a function
    // from your event handler registry if an action needs to be triggered.
    if (onDismiss) {
      console.log(`Dismiss action triggered: ${onDismiss}`);
    }
  };

  return (
    <Alert
      ref={calloutRef as any}
      variant={alertVariant}
      className={cn(variantClass, 'relative', classes)}
      style={correctedTextColor ? { color: correctedTextColor } : undefined}
      data-contrast-corrected={correctedTextColor && process.env.NODE_ENV === 'development' ? 'true' : undefined}
      {...filterDOMProps(restProps)}
    >
      {/* The icon can be overridden by the icon prop */}
      {icon ? <Info className="h-4 w-4" /> /* Replace with a dynamic icon component if needed */ : defaultIcon}
      {title && (
        <AlertTitle>
          <DynamicRenderer component={title as ComponentProps} />
        </AlertTitle>
      )}
      <AlertDescription>
        <DynamicRenderer component={message as ComponentProps} />
      </AlertDescription>
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      )}
    </Alert>
  );
};

Callout.displayName = 'Callout';

export default Callout;
