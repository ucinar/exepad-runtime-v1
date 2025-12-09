// components/common/Tag.tsx
"use client";

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, filterDOMProps } from '@/lib/utils';
import { useAutoContrast } from '@/hooks/useAutoContrast';
import { X } from 'lucide-react';
import { TagProps } from '@/interfaces/components/common/core'; // Adjust path

// --- Define Tag Variants using CVA ---
const tagVariants = cva(
  'inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm font-medium',
  {
    variants: {
      color: {
        gray: 'bg-gray-100 text-gray-800',
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        red: 'bg-red-100 text-red-800',
        yellow: 'bg-yellow-100 text-yellow-800',
      },
    },
    defaultVariants: {
      color: 'gray',
    },
  }
);

// A mock event handler function for demonstration purposes.
const getEventHandler = (handlerName: string) => {
    return () => {
        console.log(`Event handler triggered: ${handlerName}`);
    };
};

/**
 * A data-driven component for displaying a styled tag or label,
 * with an optional close button for removal.
 */
export const Tag: React.FC<TagProps> = ({
  label,
  color = 'gray',
  removable,
  onRemove,
  classes,
  ...restProps
}) => {
  const handleRemove = onRemove ? getEventHandler(onRemove) : undefined;
  const tagRef = React.useRef<HTMLDivElement>(null);

  // Auto-detect and correct poor color contrast with enhanced detection
  const { correctedTextColor } = useAutoContrast(classes, {
    elementRef: tagRef as React.RefObject<HTMLElement>,
    componentName: 'Tag'
  });

  return (
    <div
      ref={tagRef}
      className={cn(tagVariants({ color }), classes)}
      style={correctedTextColor ? { color: correctedTextColor } : undefined}
      data-contrast-corrected={correctedTextColor && process.env.NODE_ENV === 'development' ? 'true' : undefined}
      {...filterDOMProps(restProps)}
    >
      <span>{label}</span>
      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-500/20"
          aria-label={`Remove ${label} tag`}
        >
          <span className="sr-only">Remove</span>
          <X className="h-3.5 w-3.5 text-gray-500 group-hover:text-gray-700" aria-hidden="true" />
          <span className="absolute -inset-1" />
        </button>
      )}
    </div>
  );
};

export default Tag;
