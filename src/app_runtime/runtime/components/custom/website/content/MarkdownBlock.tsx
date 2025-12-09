import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'; // <-- Import rehype-raw
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils'; // Assuming a utility for class names

// Assuming the interface is imported from its definition file
import { MarkdownBlockProps } from '@/interfaces/components/website/content/content';

/**
 * Renders a string of Markdown content into styled, safe HTML.
 * This component is SSR-compatible by default.
 */
export const MarkdownBlock = ({
  content,
  sanitize = true, // Sanitize by default for security
  classes,
}: MarkdownBlockProps) => {

  // Configure plugins for react-markdown.
  // We use rehype-raw to render HTML when not sanitizing.
  const rehypePlugins = sanitize ? [rehypeSanitize] : [rehypeRaw];

  return (
    <div className={cn(
      // Apply prose styles for beautiful typography from Tailwind CSS
      "prose prose-gray max-w-none",
      // Dark mode styles for prose
      "dark:prose-invert",
      // Custom styles for links within the markdown
      "prose-a:text-primary hover:prose-a:text-primary/80",
      classes
    )}>
      <ReactMarkdown 
        rehypePlugins={rehypePlugins}
        components={{
          // Override input elements to be read-only to prevent the warning
          input: ({ node, ...props }) => <input {...props} readOnly />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
