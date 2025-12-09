import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Assuming a utility for class names
import { DynamicRenderer } from '@/components/DynamicRenderer'; // Assuming this path

// Assuming the interface is imported from its definition file
import { LogoItemProps } from '@/interfaces/components/website/content/content';


/**
 * Renders a single press or partner logo, with an optional link and
 * grayscale styling. This component is SSR-compatible.
 */
export const LogoItem = ({
  name,
  logo,
  url,
  grayscale = false,
  classes,
}: LogoItemProps) => {

  // The core content is the logo image itself, rendered by our system's
  // DynamicRenderer. We ensure the `alt` text is passed correctly.
  const content = (
    <div className="flex h-24 items-center justify-center p-4">
      <DynamicRenderer component={{
        ...logo
      }} />
    </div>
  );

  // Apply conditional classes for the grayscale effect and hover interaction.
  const wrapperClasses = cn(
    "flex items-center justify-center transition-all duration-300 ease-in-out",
    grayscale ? "grayscale opacity-60 hover:grayscale-0 hover:opacity-100" : "opacity-100",
    classes
  );

  // If a URL is provided, wrap the entire component in a Next.js Link.
  if (url) {
    return (
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${name}`}
        className={wrapperClasses}
      >
        {content}
      </Link>
    );
  }

  // If no URL is provided, render it as a simple div.
  return (
    <div className={wrapperClasses}>
      {content}
    </div>
  );
};
