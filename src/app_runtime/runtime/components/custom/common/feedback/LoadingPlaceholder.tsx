// components/feedback/LoadingPlaceholder.tsx
// No "use client" directive - this is a Server Component by default.

import React from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assumes a utility for class names
import { ComponentProps } from '@/interfaces/components/common/core'; // Adjust path
import { LoadingPlaceholderProps } from '@/interfaces/components/common/feedback/feedback'; // Adjust path
// --- The LoadingPlaceholderProps Interface ---
// This is based on the interface you provided.



// --- The LoadingPlaceholder Component Implementation ---

export const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({
  type = 'text',
  lines = 3,
  width = '100%',
  height = '1rem', // Corresponds to h-4 in default Tailwind
  animation = 'pulse',
  classes,
  ...restProps
}) => {

  const animationClass = animation === 'pulse' ? 'animate-pulse' : 'animate-wave';

  // Base classes for all placeholder elements.
  const baseElementClass = cn(
    'bg-muted rounded',
    animationClass,
    classes
  );

  // Render a multi-line text placeholder.
  if (type === 'text') {
    return (
      <div className="space-y-2" {...filterDOMProps(restProps)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={baseElementClass}
            style={{
              // The last line is often shorter in text placeholders.
              width: index === lines - 1 ? '80%' : width,
              height: height,
            }}
          />
        ))}
      </div>
    );
  }

  // Render a rectangular or circular placeholder.
  return (
    <div
      className={cn(
        baseElementClass,
        {
          'rounded-full': type === 'circle',
        }
      )}
      style={{
        width: width,
        height: height,
      }}
      {...filterDOMProps(restProps)}
    />
  );
};

/*
  IMPORTANT: To use the 'wave' animation, you will need to add the following
  CSS to your global stylesheet (e.g., globals.css), as it is not included
  in Tailwind CSS by default.

  .animate-wave {
    animation: wave 2s linear 0.5s infinite;
    background: linear-gradient(90deg, transparent, rgba(0,0,0,0.04), transparent);
    background-size: 200% 100%;
  }

  @keyframes wave {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
*/

LoadingPlaceholder.displayName = 'LoadingPlaceholder';

export default LoadingPlaceholder;
