// components/feedback/CookieConsentBanner.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assumes a utility for class names
import { Button } from '@/runtime/components/ui/button'; // Adjust path
import { Cookie } from 'lucide-react';
import { ComponentProps } from '@/interfaces/components/common/core'; // Adjust path
import { CookieConsentBannerProps, ToastPosition } from '@/interfaces/components/common/feedback/feedback'; // Adjust path

// --- The CookieConsentBanner Component Implementation ---

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  position = 'bottom',
  message = 'We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.',
  acceptText = 'Accept All',
  declineText = 'Decline',
  onAccept,
  onDecline,
  showIcon = true,
  dismissible = true,
  storageKey = 'cookie-consent-status',
  expiryDays = 365,
  width,
  classes,
  ...restProps
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // On component mount, check localStorage to see if consent has already been given.
  useEffect(() => {
    try {
      const consentStatus = localStorage.getItem(storageKey);
      if (!consentStatus) {
        setIsVisible(true);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
  }, [storageKey]);

  // Function to handle user's choice and hide the banner.
  const handleConsent = (consent: 'accepted' | 'declined') => {
    try {
      localStorage.setItem(storageKey, consent);
      setIsVisible(false);

      // Trigger the appropriate event handler from the registry if provided.
      if (consent === 'accepted' && onAccept) {
        console.log(`Action triggered: ${onAccept}`);
      } else if (consent === 'declined' && onDecline) {
        console.log(`Action triggered: ${onDecline}`);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
  };

  if (!isVisible) {
    return null;
  }

  // Maps the position prop to the corresponding Tailwind CSS classes.
  const positionClasses: Record<string, string> = {
    top: 'top-0 left-0 right-0 w-full max-w-none rounded-none',
    bottom: 'bottom-0 left-0 right-0 w-full max-w-none rounded-none',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  // Create an inline style object to apply the custom width and zIndex.
  const style: React.CSSProperties = {
    zIndex: 50,
  };
  if (width) {
    style.width = width;
  }

  return (
    <div
      className={cn(
        'fixed p-4 bg-background border shadow-lg rounded-lg',
        // Only apply the default max-width if a custom width is not provided.
        !width && 'max-w-lg',
        positionClasses[position] || positionClasses.bottom, // Fallback to 'bottom' if position is invalid
        classes
      )}
      style={style} // Apply the custom width and zIndex here.
      role="dialog"
      aria-live="polite"
      aria-label="Cookie Consent Banner"
      {...filterDOMProps(restProps)}
    >
      <div className="flex items-center gap-4">
        {showIcon && <Cookie className="h-8 w-8 text-primary flex-shrink-0" />}
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        {declineText && (
          <Button variant="outline" onClick={() => handleConsent('declined')}>
            {declineText}
          </Button>
        )}
        {acceptText && (
          <Button onClick={() => handleConsent('accepted')}>
            {acceptText}
          </Button>
        )}
      </div>
    </div>
  );
};

CookieConsentBanner.displayName = 'CookieConsentBanner';

export default CookieConsentBanner;
