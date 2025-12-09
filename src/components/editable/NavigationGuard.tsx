'use client';

import { useEffect } from 'react';
import { useEditMode } from '@/context/EditModeContext';

interface NavigationGuardProps {
  children: React.ReactNode;
}

export function NavigationGuard({ children }: NavigationGuardProps) {
  const { isEditMode, hasUnsavedChanges, saveChanges } = useEditMode();

  useEffect(() => {
    if (!isEditMode) return;

    // Add CSS class to body for styling
    document.body.classList.add('edit-mode-active');

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if click is on a link
      const clickedLink = target.closest('a[href]') as HTMLAnchorElement;
      if (!clickedLink) return;

      // Get the href
      const href = clickedLink.getAttribute('href');
      if (!href) return;

      // Check if element is inside a navigation area
      const inNavArea = !!(target.closest('header, nav, [role="navigation"], [data-navigation-area="true"]'));
      
      if (inNavArea) {
        // For navigation area links, auto-save if there are unsaved changes, then navigate
        e.preventDefault();

        const proceedNavigation = () => {
          try {
            // Handle both relative and absolute URLs
            const url = new URL(href, window.location.href);
            // Only modify internal navigation (same origin)
            if (url.origin === window.location.origin) {
              url.searchParams.set('edit', 'yes');
              window.location.href = url.toString();
            } else {
              window.location.href = href;
            }
          } catch (error) {
            console.error('Error processing navigation URL:', error);
            const separator = href.includes('?') ? '&' : '?';
            window.location.href = `${href}${separator}edit=yes`;
          }
        };

        if (hasUnsavedChanges) {
          // Force save, then proceed after a short tick to allow WS to send
          saveChanges(true);
          setTimeout(proceedNavigation, 250);
        } else {
          proceedNavigation();
        }
      } else {
        // For body content links, prevent navigation
        e.preventDefault();
        console.log('Navigation prevented in edit mode for body content element:', clickedLink);
      }
    };

    // Use capture phase to intercept before any component handlers
    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.body.classList.remove('edit-mode-active');
      document.removeEventListener('click', handleClick, true);
    };
  }, [isEditMode, hasUnsavedChanges, saveChanges]);

  return <>{children}</>;
}