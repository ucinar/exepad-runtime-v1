// Toggles overlay visibility over a target element
/*
 * CODING AGENT PROMPT:
 *
 * Implement this Overlay component using shadcn-ui library and tailwindcss.
 * Description: Toggles overlay visibility over a target element
 *
 * Requirements:
 * 1. Use appropriate shadcn-ui components that match the functionality described above
 * 2. Implement responsive design using tailwindcss utility classes
 * 3. Handle all props defined in the OverlayProps type
 * 4. Ensure accessibility standards are met (ARIA attributes, keyboard navigation)
 * 5. Add proper error handling and loading states if needed
 * 6. Include comprehensive comments explaining complex logic
 * 7. Optimize for performance where applicable
 *
 * The implementation should be clean, well-structured, and follow best practices for React components.
 */

"use client"

import React, { type PropsWithChildren, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import type { OverlayProps as OverlayPropsType } from '@/interfaces/components/website/utils';

type OverlayProps = PropsWithChildren<OverlayPropsType>;

/**
 * Overlay - A component that creates an overlay on top of a target element
 *
 * This component creates a customizable overlay that can be toggled on and off.
 * It uses React Portal to render the overlay at the root level of the DOM to avoid
 * z-index and stacking context issues. The overlay is positioned absolutely relative
 * to the target element.
 *
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render inside the overlay
 * @param {string} props.target - CSS selector for the target element to overlay
 * @param {boolean} props.isVisible - Whether the overlay is visible
 * @param {string} props.classes - Additional CSS classes
 */
export const Overlay: React.FC<OverlayProps> = ({
  children,
  target,
  isVisible = false,
  classes
}): JSX.Element => {
  // State to store the target element's dimensions and position
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  // Reference to the target element
  const targetRef = useRef<Element | null>(null);
  // State to track if we're in a browser environment (for SSR compatibility)
  const [isBrowser, setIsBrowser] = useState(false);

  // Set isBrowser to true on component mount
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Find the target element and update its dimensions when target or isVisible changes
  useEffect(() => {
    if (!isBrowser || !target) return;

    // Find the target element
    const targetElement = document.querySelector(target);
    targetRef.current = targetElement;

    if (!targetElement) {
      console.warn(`Overlay target not found: ${target}`);
      return;
    }

    // Function to update the target's dimensions
    const updateTargetRect = () => {
      if (targetElement) {
        setTargetRect(targetElement.getBoundingClientRect());
      }
    };

    // Update dimensions initially
    updateTargetRect();

    // Set up resize observer to update dimensions when the target element changes size
    const resizeObserver = new ResizeObserver(updateTargetRect);
    resizeObserver.observe(targetElement);

    // Set up scroll and resize listeners to update position
    window.addEventListener('scroll', updateTargetRect, true);
    window.addEventListener('resize', updateTargetRect);

    // Clean up listeners on unmount
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updateTargetRect, true);
      window.removeEventListener('resize', updateTargetRect);
    };
  }, [target, isVisible, isBrowser]);

  // If we're not in a browser or the overlay is not visible, render nothing
  if (!isBrowser || !isVisible || !targetRect) {
    return <></>;
  }

  // Create the overlay element
  const overlayElement = (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
        classes
      )}
      style={{
        position: 'absolute',
        top: `${targetRect.top}px`,
        left: `${targetRect.left}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
      }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isVisible}
    >
      {children}
    </div>
  );

  // Use createPortal to render the overlay at the root level
  return createPortal(
    overlayElement,
    document.body
  );
};
