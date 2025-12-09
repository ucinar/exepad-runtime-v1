// components/website/BackToTop.tsx
"use client";

import * as React from 'react';
import { useEffect, useState } from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assuming a utility for class names

// Assuming shadcn/ui and lucide-react are installed
import { Button } from '@/runtime/components/ui/button'; 
import { ArrowUp } from 'lucide-react';

// Assuming interfaces are in this path
import { BackToTopProps } from '@/interfaces/components/website/utils';

/**
 * Renders a button that appears after scrolling past a certain threshold
 * and smoothly scrolls the user back to the top of the page.
 */
export const BackToTop: React.FC<BackToTopProps> = ({
  threshold = 400,
  smooth = true,
  icon, // Note: The component currently uses a default icon.
  position = 'bottom-right',
  classes,
  ...restProps
}) => {
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Toggles the visibility of the button based on the scroll position.
   */
  const toggleVisibility = () => {
    if (window.pageYOffset > threshold) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  /**
   * Scrolls the window to the top.
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  // Set up the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility, { passive: true });

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [threshold]); // Re-run effect if threshold changes

  // --- Dynamic classes for positioning ---
  const positionClasses: Record<'bottom-right' | 'bottom-left', string> = {
    'bottom-right': 'bottom-4 right-4 md:bottom-8 md:right-8',
    'bottom-left': 'bottom-4 left-4 md:bottom-8 md:left-8',
  };

  return (
    <div
      className={cn(
        'fixed z-50 transition-opacity duration-300',
        positionClasses[position as 'bottom-right' | 'bottom-left'],
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
        classes
      )}
      {...filterDOMProps(restProps)}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="rounded-full shadow-lg"
      >
        {/* The component uses a default icon but could be extended to use the `icon` prop */}
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default BackToTop;
