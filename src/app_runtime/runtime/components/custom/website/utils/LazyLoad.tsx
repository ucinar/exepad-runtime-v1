// components/website/LazyLoad.tsx
"use client";

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assuming a utility for class names

// Assuming these components and interfaces are in the correct paths
import { DynamicRenderer, DynamicRendererList } from '@/components/DynamicRenderer';
import { LazyLoadProps } from '@/interfaces/components/website/utils';
import { ComponentProps } from '@/interfaces/components/common/core';

/**
 * A utility wrapper that defers the rendering of its content until they
 * are about to enter the viewport.
 */
export const LazyLoad: React.FC<LazyLoadProps> = ({
  content,
  placeholder,
  threshold = 0.1,
  rootMargin = '0px',
  classes,
  ...restProps
}) => {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // The callback will execute when the element's visibility changes
        const [entry] = entries;
        if (entry.isIntersecting) {
          // The component is in view, so we update the state to trigger a re-render
          setIsInView(true);
          // We only need to do this once, so we can unobserve the element
          if (containerRef.current) {
            observer.unobserve(containerRef.current);
          }
        }
      },
      {
        root: null, // observes intersections relative to the viewport
        rootMargin,
        threshold,
      }
    );

    // Start observing the container element
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Cleanup function to disconnect the observer when the component unmounts
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [threshold, rootMargin]); // Re-create the observer if these options change

  return (
    <div ref={containerRef} className={cn("lazy-load-container", classes)} {...filterDOMProps(restProps)}>
      {isInView ? (
        // If the component is in view, render the actual content
        (<DynamicRendererList components={content} />)
      ) : (
        // Otherwise, render the placeholder (or nothing if no placeholder is provided)
        (placeholder ? <DynamicRenderer component={placeholder} /> : null)
      )}
    </div>
  );
};

export default LazyLoad;
