// components/common/Link.tsx
"use client";

import * as React from 'react';
import NextLink from 'next/link';
import { cn, filterDOMProps } from '@/lib/utils'; // Assuming a utility for class names
import { useAutoContrast } from '@/hooks/useAutoContrast';
import { LinkProps } from '@/interfaces/components/common/core'; // Adjust path
import { useAppContext } from '@/context/AppContext';


/**
 * A data-driven component that renders a styled anchor link,
 * using the modern Next.js Link component for optimized client-side navigation.
 */
export const Link: React.FC<LinkProps> = ({
  href,
  text,
  target,
  classes,
  ...restProps
}) => {
  const { basePath } = useAppContext();
  const linkRef = React.useRef<HTMLAnchorElement>(null);
  
  // Auto-detect and correct poor color contrast with enhanced detection
  const { correctedTextColor } = useAutoContrast(classes, {
    elementRef: linkRef,
    componentName: 'Link'
  });
  
  // Remove text color classes if we're applying a correction
  // This prevents Tailwind classes from overriding the inline style correction
  const adjustedClasses = correctedTextColor 
    ? classes?.replace(/text-\[#[0-9A-Fa-f]{3,6}\]|text-\w+(-\w+)*/g, '').trim()
    : classes;
  
  // Helper function to determine if a link is absolute
  const isAbsoluteLink = (url: string): boolean => {
    return url.startsWith('http://') || 
           url.startsWith('https://') || 
           url.startsWith('//') ||
           url.startsWith('mailto:') ||
           url.startsWith('tel:') ||
           url.startsWith('#');
  };
  
  // Automatically prefix relative links with basePath
  const finalHref = isAbsoluteLink(href) ? href : `${basePath}${href}`;
  
  // Extract base styles without text color
  const baseStyles = 'font-medium underline-offset-4 hover:underline';
  
  // Default text color that can be overridden
  const defaultTextColor = 'text-primary';
  
  return (
    <NextLink
      ref={linkRef}
      href={finalHref}
      target={target}
      className={cn(
        baseStyles,
        // Only apply default text color if no custom classes are provided
        !adjustedClasses?.includes('text-') && defaultTextColor,
        adjustedClasses
      )}
      style={correctedTextColor ? { color: correctedTextColor } : undefined}
      data-contrast-corrected={correctedTextColor && process.env.NODE_ENV === 'development' ? 'true' : undefined}
      {...filterDOMProps(restProps)}
    >
      {text}
    </NextLink>
  );
};

export default Link;
