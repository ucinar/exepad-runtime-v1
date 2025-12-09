// components/common/Heading.tsx
"use client";

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { cn, filterDOMProps } from '@/lib/utils'; // Assuming a utility for class names
import { HeadingProps } from '@/interfaces/components/common/core'; // Adjust path
import { useAutoContrast } from '@/hooks/useAutoContrast';

/**
 * A data-driven component that renders a semantic HTML heading tag (h1-h6)
 * with sensible default styles that can be overridden. Now with markdown support.
 */
export const Heading: React.FC<HeadingProps> = ({
  level,
  text,
  classes,
  sanitize = true,
  ...restProps
}) => {
  console.log('[Heading] Text:', text);
  // Ensure the level is within the valid range of 1-6
  const safeLevel = Math.max(1, Math.min(6, level));
  
  // Dynamically create the appropriate heading tag type
  const Tag = `h${safeLevel}` as keyof JSX.IntrinsicElements;

  // Define default styles for each heading level based on common design systems.
  const levelStyles = {
    1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
    2: 'scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0',
    3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
    4: 'scroll-m-20 text-xl font-semibold tracking-tight',
    5: 'scroll-m-20 text-lg font-semibold tracking-tight',
    6: 'scroll-m-20 text-base font-semibold tracking-tight',
  };

  const headingRef = React.useRef<HTMLDivElement>(null);

  // Auto-detect and correct poor color contrast (headings are large text - lower threshold)
  const { correctedTextColor } = useAutoContrast(classes, {
    isLargeText: true,
    elementRef: headingRef,
    componentName: 'Heading'
  });

  const rehypePlugins = sanitize ? [rehypeSanitize] : [];

  return (
    <div
      ref={headingRef}
      className={cn(
        // Apply the default styles for the current level
        levelStyles[safeLevel as keyof typeof levelStyles],
        // Add prose styles for markdown formatting
        'prose prose-gray max-w-none dark:prose-invert',
        // Ensure inline rendering preserves heading styles
        'prose-p:mb-0 prose-p:leading-[inherit] prose-p:font-[inherit]',
        'prose-strong:font-extrabold',
        'prose-em:italic',
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
          // Render inline to preserve heading semantics
          p: ({ children }) => <>{children}</>,
          // Prevent nested headings from markdown
          h1: ({ children }) => <>{children}</>,
          h2: ({ children }) => <>{children}</>,
          h3: ({ children }) => <>{children}</>,
          h4: ({ children }) => <>{children}</>,
          h5: ({ children }) => <>{children}</>,
          h6: ({ children }) => <>{children}</>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default Heading;
