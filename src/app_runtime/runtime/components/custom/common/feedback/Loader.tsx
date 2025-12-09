// components/feedback/Loader.tsx
// No "use client" directive - this is a Server Component by default.

import React from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assumes a utility for class names
import { Loader2 } from 'lucide-react'; // Using a spinner icon from lucide-react
import { LoaderProps } from '@/interfaces/components/common/feedback/feedback'; // Adjust path

// --- The Loader Component Implementation (SSR-Friendly) ---

export const Loader: React.FC<LoaderProps> = ({
  message,
  size = 48, // Defaulting to 48px
  color = 'hsl(var(--primary))', // Defaulting to the primary theme color
  overlay = false, // Defaulting to an inline loader
  classes,
  ...restProps
}) => {

  // The content of the loader (the spinner and the message).
  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2
        className="animate-spin"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          color: color,
        }}
      />
      {message && <p className="text-lg text-muted-foreground">{message}</p>}
    </div>
  );

  // If the 'overlay' prop is true, we wrap the content in a full-screen overlay.
  if (overlay) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
          classes
        )}
        {...filterDOMProps(restProps)}
      >
        {loaderContent}
      </div>
    );
  }

  // Otherwise, we render the loader as a standard inline component.
  return (
    <div
      className={cn(
        'flex items-center justify-center p-8',
        classes
      )}
      {...filterDOMProps(restProps)}
    >
      {loaderContent}
    </div>
  );
};

Loader.displayName = 'Loader';

export default Loader;
