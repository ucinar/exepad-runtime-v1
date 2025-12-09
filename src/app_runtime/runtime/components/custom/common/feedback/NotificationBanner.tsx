// components/feedback/NotificationBanner.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { useAutoContrast } from '@/hooks/useAutoContrast';
import { Alert, AlertDescription } from '@/runtime/components/ui/alert';
import { Button } from '@/runtime/components/ui/button';
import {
  NotificationBannerProps,
  FeedbackStatusType,
} from '@/interfaces/components/common/feedback/feedback';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

// --- The NotificationBanner Component Implementation ---

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  message,
  type = 'info',
  icon,
  dismissible = true,
  onDismiss,
  classes,
  ...restProps
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const bannerRef = React.useRef<HTMLDivElement>(null);

  // Auto-detect and correct poor color contrast with enhanced detection
  const { correctedTextColor } = useAutoContrast(classes, {
    elementRef: bannerRef,
    componentName: 'NotificationBanner'
  });

  if (!isVisible) {
    return null;
  }

  const typeConfig: Record<
    FeedbackStatusType,
    { icon: React.ReactNode; className: string }
  > = {
    success: {
      icon: <CheckCircle className="h-5 w-5" />,
      className: 'bg-green-500 text-white',
    },
    error: {
      icon: <XCircle className="h-5 w-5" />,
      className: 'bg-red-600 text-white',
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5" />,
      className: 'bg-yellow-500 text-black',
    },
    info: {
      icon: <Info className="h-5 w-5" />,
      className: 'bg-blue-500 text-white',
    },
  };

  const { icon: defaultIcon, className: variantClass } = typeConfig[type];

  const handleDismiss = () => {
    setIsVisible(false);
    // Here you would typically map the onDismiss string to a function
    // from your event handler registry if an action needs to be triggered.
    if (onDismiss) {
      console.log(`Dismiss action triggered: ${onDismiss}`);
    }
  };

  return (
    <div
      ref={bannerRef}
      className={cn(
        'w-full p-3 flex items-center justify-center gap-x-3 text-sm',
        variantClass,
        classes
      )}
      style={correctedTextColor ? { color: correctedTextColor } : undefined}
      data-contrast-corrected={correctedTextColor && process.env.NODE_ENV === 'development' ? 'true' : undefined}
      {...filterDOMProps(restProps)}
    >
      {defaultIcon}
      <p>{message}</p>
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-7 w-7 hover:bg-white/20"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      )}
    </div>
  );
};

NotificationBanner.displayName = 'NotificationBanner';

export default NotificationBanner;
