// components/common/Text.tsx
"use client";

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { cn, filterDOMProps } from '@/lib/utils'; // Assuming a utility for class names
import { TextProps } from '@/interfaces/components/common/core'; // Adjust path
import { useAutoContrast } from '@/hooks/useAutoContrast';

/**
 * A data-driven component for rendering styled text blocks.
 * It can render as a <p>, <span>, or <div> and supports several
 * stylistic variants. Now with markdown parsing support.
 */
export const Text: React.FC<TextProps> = ({
  as: Tag = 'p', // Default to 'p' if 'as' is not provided
  variant = 'default',
  content,
  classes,
  sanitize = true,
  ...restProps
}) => {
  // A mapping from the variant prop to Tailwind CSS classes
  const variantClasses = {
    default: 'leading-7',
    // FIX: Added `leading-relaxed` to provide appropriate line-height for the larger font size.
    lead: 'text-xl text-muted-foreground leading-relaxed',
    large: 'text-lg font-semibold',
    small: 'text-sm font-medium leading-none',
    muted: 'text-sm text-muted-foreground',
  };

  const textRef = React.useRef<HTMLDivElement | null>(null);

  // Auto-detect and correct poor color contrast with enhanced detection
  const { correctedTextColor } = useAutoContrast(classes, {
    elementRef: textRef,
    componentName: 'Text'
  });

  const rehypePlugins = sanitize ? [rehypeSanitize] : [];

  return (
    <div
      ref={textRef}
      className={cn(
        // Apply the base styles for the selected variant
        variantClasses[variant],
        // Add prose styles for markdown formatting
        'prose prose-gray max-w-none dark:prose-invert',
        // Tighter prose spacing for UI text
        'prose-p:mb-0 prose-p:leading-[inherit]',
        'prose-strong:font-semibold',
        'prose-em:italic',
        'prose-a:text-primary hover:prose-a:text-primary/80',
        // Merge any custom classes from the JSON config
        classes
      )}
      style={correctedTextColor ? { color: correctedTextColor } : undefined}
      data-contrast-corrected={correctedTextColor && process.env.NODE_ENV === 'development' ? 'true' : undefined}
      {...filterDOMProps(restProps)}
    >
      <ReactMarkdown
        rehypePlugins={rehypePlugins}
        components={{
          // Render inline for short text - no extra paragraph wrapping
          p: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default Text;
