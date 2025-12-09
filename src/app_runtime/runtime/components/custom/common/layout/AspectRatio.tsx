// components/layout/AspectRatio.tsx
// No "use client" directive - this is a Server Component by default.

import React from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assumes a utility for class names
import { AspectRatio as ShadcnAspectRatio } from '@/runtime/components/ui/aspect-ratio'; // Adjust path
import DynamicRenderer from '@/components/DynamicRenderer'; // Adjust path
import { AspectRatioProps } from '@/interfaces/components/common/layout/layout'; // Adjust path

// --- The AspectRatio Component Implementation (SSR-Friendly) ---

export const AspectRatio: React.FC<AspectRatioProps> = ({
  ratio,
  content,
  classes,
  ...restProps
}) => {

  // The 'ratio' prop in the interface is a string (e.g., "16 / 9").
  // The shadcn/ui AspectRatio component expects a number (e.g., 16 / 9).
  // This logic safely parses the string into the required number.
  const ratioParts = ratio.split('/').map(part => parseInt(part.trim(), 10));
  const numericRatio = ratioParts.length === 2 && ratioParts[1] !== 0 
    ? ratioParts[0] / ratioParts[1] 
    : 1; // Default to 1/1 if format is invalid

  return (
    <div className={cn(classes)} {...filterDOMProps(restProps)}>
      <ShadcnAspectRatio ratio={numericRatio}>
        {/* The 'children' prop is a single ComponentProps object,
            so we render it using the DynamicRenderer. 
        */}
        <DynamicRenderer component={content} />
      </ShadcnAspectRatio>
    </div>
  );
};

AspectRatio.displayName = 'AspectRatio';

export default AspectRatio;
