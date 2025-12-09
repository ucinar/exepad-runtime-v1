// components/feedback/ProgressBar.tsx
"use client";

import React from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assumes a utility for class names
import { Progress } from '@/runtime/components/ui/progress'; // Adjust path
import { ComponentProps } from '@/interfaces/components/common/core'; // Adjust path
import { ProgressBarProps } from '@/interfaces/components/common/feedback/feedback'; // Adjust path


// --- The ProgressBar Component Implementation ---

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showValue = false,
  variant = 'default',
  striped = false,
  animated = false,
  classes,
  ...restProps
}) => {
  // Calculate the progress percentage.
  const percentage = max > 0 ? (value / max) * 100 : 0;

  // A map to get the appropriate color classes for the progress indicator.
  const variantClasses: Record<string, string> = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-600',
  };

  // Combine all the necessary classes for the progress bar.
  const progressClasses = cn(
    // Apply the color variant.
    variantClasses[variant],
    // Apply the striped and animated classes if the props are true.
    // These require corresponding definitions in your global CSS file.
    {
      'progress-bar-striped': striped,
      'progress-bar-animated': animated && striped,
    },
    classes
  );

  return (
    <div className="w-full" {...filterDOMProps(restProps)}>
      <Progress value={percentage} className={progressClasses} />
      {showValue && (
        <p className="text-center text-sm text-muted-foreground mt-2">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
};

/*
  IMPORTANT: To use the 'striped' and 'animated' features, you will need to
  add the following CSS to your global stylesheet (e.g., globals.css).

  .progress-bar-striped {
    background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
    background-size: 1rem 1rem;
  }

  .progress-bar-animated {
    animation: progress-bar-stripes 1s linear infinite;
  }

  @keyframes progress-bar-stripes {
    from {
      background-position: 1rem 0;
    }
    to {
      background-position: 0 0;
    }
  }
*/

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
