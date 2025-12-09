// components/website/Portal.tsx
"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DynamicRendererList } from '@/components/DynamicRenderer'; // Adjust path
import { PortalProps } from '@/interfaces/components/website/utils'; // Adjust path

/**
 * Renders content into a different DOM root via a portal. Essential for
 * modals, drawers, and other overlaying UI elements.
 */
export const Portal: React.FC<PortalProps> = ({ content, targetId }) => {
  const [mounted, setMounted] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // This effect runs only on the client-side after the initial render.
    setMounted(true);
    
    const element = document.getElementById(targetId);
    if (element) {
      setTargetElement(element);
    } else {
      // For robustness, you could create the target element if it doesn't exist.
      // However, for this implementation, we'll just log a warning.
      console.warn(`[Portal] Target element with id "${targetId}" not found.`);
    }

    // When the component unmounts, we no longer need the portal.
    return () => setMounted(false);
  }, [targetId]);

  // The portal can only be created on the client-side where the DOM is available.
  // We check `mounted` and `targetElement` to ensure we don't try to create it on the server
  // or before the target element is found.
  if (mounted && targetElement) {
    return createPortal(
      <DynamicRendererList components={content} />,
      targetElement
    );
  }

  // Return null if we're on the server or the target isn't available yet.
  return null;
};

export default Portal;
