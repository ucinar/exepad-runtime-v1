/**
 * Simple Layout Component
 * A minimal layout wrapper that provides basic structure without data fetching
 *
 * This component should be used by route layouts to provide consistent shell structure.
 * All data fetching should be done in page components, not layouts.
 */

import { ReactNode } from 'react';

interface SimpleLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * A minimal layout component that provides basic structure
 * Does NOT fetch any data - that's the responsibility of pages
 */
export default function SimpleLayout({ children, className = '' }: SimpleLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {children}
    </div>
  );
}
