import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Assuming a utility for class names
import { DynamicRenderer } from '@/components/DynamicRenderer';
import { ComponentProps } from '@/interfaces/components/common/core';

// Assuming the interface is imported from its definition file
import { QuoteBlockProps } from '@/interfaces/components/website/content/content';


/**
 * Renders a stylized blockquote with optional author and source information.
 * This component is SSR-compatible by default.
 */
export const QuoteBlock = ({
  quote,
  author,
  source,
  alignment = 'left',
  classes,
}: QuoteBlockProps) => {

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <figure className={cn("max-w-screen-md mx-auto", alignmentClasses[alignment], classes)}>
      <svg className="w-10 h-10 mx-auto mb-3 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 14">
        <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z"/>
      </svg>
      <blockquote>
        <div className="text-xl md:text-2xl italic font-medium text-gray-900">
          "<DynamicRenderer component={quote as ComponentProps} />"
        </div>
      </blockquote>
      <figcaption className="flex items-center justify-center mt-6 space-x-3">
        <div className="flex items-center divide-x-2 divide-gray-500">
          {author && (
            <cite className="pr-3 font-medium text-gray-900 not-italic">
              <DynamicRenderer component={author as ComponentProps} />
            </cite>
          )}
          {source && (
            <cite className="pl-3 text-sm text-gray-500 not-italic">
              {source.sourceUrl ? (
                <Link href={source.sourceUrl} className="hover:underline">
                  {source.text}
                </Link>
              ) : (
                source.text
              )}
            </cite>
          )}
        </div>
      </figcaption>
    </figure>
  );
};
