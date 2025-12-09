// components/common/Badge.tsx
"use client";

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, filterDOMProps } from '@/lib/utils';
import { useAutoContrast } from '@/hooks/useAutoContrast';
import { BadgeProps as BaseBadgeProps } from '@/interfaces/components/common/core'; // Adjust path

// --- Define Badge Variants including custom ones ---
// We use CVA (Class Variance Authority) to manage variant classes,
// which is the same library used by shadcn/ui.
const customBadgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        // --- Custom Variants ---
        success:
          'border-transparent bg-green-500 text-white hover:bg-green-500/80',
        warning:
          'border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// --- FIX: Resolve the type conflict ---
// We use Omit to create a new type from BaseBadgeProps that does NOT include the 'variant' property.
// Then, we merge it with the type-safe variants from CVA.
export interface BadgeProps extends Omit<BaseBadgeProps, 'variant'>, VariantProps<typeof customBadgeVariants> {}

/**
 * A data-driven component for displaying small status descriptors or labels.
 * It supports the standard shadcn/ui variants plus custom 'success' and 'warning' variants.
 * Now with markdown support for inline formatting.
 */
export const Badge: React.FC<BadgeProps> = ({
  content,
  variant,
  classes,
  sanitize = true,
  ...restProps
}) => {
  const badgeRef = React.useRef<HTMLDivElement>(null);
  
  // Auto-detect and correct poor color contrast with enhanced detection
  const { correctedTextColor } = useAutoContrast(classes, {
    elementRef: badgeRef as React.RefObject<HTMLElement>,
    componentName: 'Badge'
  });

  const rehypePlugins = sanitize ? [rehypeSanitize] : [];

  return (
    <div
      ref={badgeRef}
      className={cn(
        customBadgeVariants({ variant }), 
        'self-start',
        // Add prose styles for markdown
        'prose prose-gray max-w-none dark:prose-invert',
        // Inline rendering with no extra spacing
        'prose-p:mb-0 prose-p:inline',
        'prose-strong:font-bold',
        'prose-em:italic',
        classes
      )}
      style={correctedTextColor ? { color: correctedTextColor } : undefined}
      data-contrast-corrected={correctedTextColor && process.env.NODE_ENV === 'development' ? 'true' : undefined}
      {...filterDOMProps(restProps)}
    >
      <ReactMarkdown
        rehypePlugins={rehypePlugins}
        components={{
          // Render completely inline - no paragraphs
          p: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default Badge;
