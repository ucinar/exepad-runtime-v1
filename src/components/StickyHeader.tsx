"use client";

import React from 'react';
import { cn } from '../lib/utils';

interface StickyHeaderProps {
  children: React.ReactNode;
  isSticky: boolean;
  className?: string;
}

const StickyHeaderInner: React.FC<StickyHeaderProps> = ({ 
  children, 
  isSticky, 
  className 
}) => {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    if (isSticky) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isSticky]);

  const headerClasses = cn(
    "app-header border-b z-50 transition-all duration-300",
    isSticky ? "sticky top-0" : "relative",
    scrolled && isSticky ? "shadow-md bg-background/95 backdrop-blur-sm" : "bg-background",
    className
  );

  return (
    <header className={headerClasses} data-navigation-area="true">
      {children}
    </header>
  );
};

// Memoize to prevent unnecessary re-renders
export const StickyHeader = React.memo(StickyHeaderInner);