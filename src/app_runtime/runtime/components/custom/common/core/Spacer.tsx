// components/common/Spacer.tsx
import * as React from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { SpacerProps } from '@/interfaces/components/common/core'; // Adjust path

/**
 * A simple component that renders an empty space of a defined size.
 * Useful for creating vertical or horizontal gaps in layouts.
 * 
 * Supports:
 * - Numeric values: "24" → "h-24" 
 * - CSS values: "200vh" → style="height: 200vh"
 * - Tailwind classes: "h-8" → "h-8" (pass-through)
 */
export const Spacer: React.FC<SpacerProps> = ({
  size,
  classes,
  ...restProps
}) => {
  const getSizeClass = (size: string): { className?: string; style?: React.CSSProperties } => {
    // Check if it's a pure number (e.g., "24", "8", "16")
    if (/^\d+$/.test(size)) {
      // Convert number to Tailwind height class: "24" → "h-24"
      return { className: `h-${size}` };
    }
    
    // Check if it's a CSS value with units (e.g., "200vh", "1rem", "50px")
    if (/^\d+(\.\d+)?(px|rem|em|vh|vw|%|ch|ex|cm|mm|in|pt|pc)$/.test(size)) {
      // Apply as inline style
      return { style: { height: size } };
    }
    
    // Otherwise, treat as existing Tailwind class (e.g., "h-8", "py-4", "space-y-4")
    return { className: size };
  };

  const { className, style } = getSizeClass(size);

  return (
    <div
      className={cn(className, classes)}
      style={style}
      aria-hidden="true" // Hide from screen readers as it's purely presentational
      {...filterDOMProps(restProps)}
    />
  );
};

export default Spacer;
