"use client";

import { useMemo, useEffect, useId } from 'react';
import type { CSSProperties } from 'react';

interface DynamicTailwindResult {
  /**
   * Cleaned Tailwind classes with arbitrary values removed
   */
  cleanClasses: string;
  
  /**
   * Inline styles extracted from arbitrary values
   */
  inlineStyles: CSSProperties;
  
  /**
   * Whether hover styles were injected
   */
  hasHoverStyles: boolean;
  
  /**
   * Unique ID for hover style injection
   */
  styleId?: string;
}

/**
 * Extract and convert arbitrary Tailwind values to inline styles
 * Supports: bg-[#...], text-[#...], border-[#...], and hover variants
 * 
 * This hook solves the problem of dynamic arbitrary values in JSON configs
 * that Tailwind can't scan at build time.
 * 
 * @param classes - Tailwind classes string from config
 * @returns Cleaned classes and inline styles
 * 
 * @example
 * ```tsx
 * const { cleanClasses, inlineStyles, hasHoverStyles, styleId } = useDynamicTailwindClasses(
 *   "bg-[#C79A9A] hover:bg-[#8C6C6C] text-white"
 * );
 * 
 * return (
 *   <button 
 *     className={cleanClasses}
 *     style={inlineStyles}
 *     data-dynamic-hover={hasHoverStyles ? styleId : undefined}
 *   >
 *     Click me
 *   </button>
 * );
 * ```
 */
export function useDynamicTailwindClasses(classes?: string): DynamicTailwindResult {
  const uniqueId = useId();
  
  const result = useMemo(() => {
    if (!classes) {
      return {
        cleanClasses: '',
        inlineStyles: {},
        hasHoverStyles: false,
      };
    }
    
    const styles: CSSProperties = {};
    let cleanClasses = classes;
    let hoverStyles: CSSProperties = {};
    let hasHover = false;
    
    // Extract bg-[#...] and convert to backgroundColor
    const bgMatch = classes.match(/(?:^|\s)(bg-\[#([0-9A-Fa-f]{3,6})\])(?:\s|$)/);
    if (bgMatch) {
      const fullMatch = bgMatch[1];
      const hexValue = bgMatch[2];
      styles.backgroundColor = `#${hexValue}`;
      cleanClasses = cleanClasses.replace(fullMatch, '').trim();
    }
    
    // Extract text-[#...] and convert to color
    const textMatch = classes.match(/(?:^|\s)(text-\[#([0-9A-Fa-f]{3,6})\])(?:\s|$)/);
    if (textMatch) {
      const fullMatch = textMatch[1];
      const hexValue = textMatch[2];
      styles.color = `#${hexValue}`;
      cleanClasses = cleanClasses.replace(fullMatch, '').trim();
    }
    
    // Extract border-[#...] and convert to borderColor
    const borderMatch = classes.match(/(?:^|\s)(border-\[#([0-9A-Fa-f]{3,6})\])(?:\s|$)/);
    if (borderMatch) {
      const fullMatch = borderMatch[1];
      const hexValue = borderMatch[2];
      styles.borderColor = `#${hexValue}`;
      cleanClasses = cleanClasses.replace(fullMatch, '').trim();
    }
    
    // Extract hover:bg-[#...] for dynamic injection
    const hoverBgMatch = classes.match(/(?:^|\s)(hover:bg-\[#([0-9A-Fa-f]{3,6})\])(?:\s|$)/);
    if (hoverBgMatch) {
      const fullMatch = hoverBgMatch[1];
      const hexValue = hoverBgMatch[2];
      hoverStyles.backgroundColor = `#${hexValue}`;
      hasHover = true;
      cleanClasses = cleanClasses.replace(fullMatch, '').trim();
    }
    
    // Extract hover:text-[#...] for dynamic injection
    const hoverTextMatch = classes.match(/(?:^|\s)(hover:text-\[#([0-9A-Fa-f]{3,6})\])(?:\s|$)/);
    if (hoverTextMatch) {
      const fullMatch = hoverTextMatch[1];
      const hexValue = hoverTextMatch[2];
      hoverStyles.color = `#${hexValue}`;
      hasHover = true;
      cleanClasses = cleanClasses.replace(fullMatch, '').trim();
    }
    
    // Extract hover:border-[#...] for dynamic injection
    const hoverBorderMatch = classes.match(/(?:^|\s)(hover:border-\[#([0-9A-Fa-f]{3,6})\])(?:\s|$)/);
    if (hoverBorderMatch) {
      const fullMatch = hoverBorderMatch[1];
      const hexValue = hoverBorderMatch[2];
      hoverStyles.borderColor = `#${hexValue}`;
      hasHover = true;
      cleanClasses = cleanClasses.replace(fullMatch, '').trim();
    }
    
    // Clean up extra spaces
    cleanClasses = cleanClasses.replace(/\s+/g, ' ').trim();
    
    return {
      cleanClasses,
      inlineStyles: styles,
      hasHoverStyles: hasHover,
      hoverStyles,
      styleId: hasHover ? uniqueId : undefined,
    };
  }, [classes, uniqueId]);
  
  // Inject hover styles dynamically
  useEffect(() => {
    if (!result.hasHoverStyles || !result.styleId || !result.hoverStyles) {
      return;
    }
    
    if (typeof document === 'undefined') {
      return;
    }
    
    const styleId = `dynamic-hover-${result.styleId}`;
    
    // Remove existing style if present
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Build hover CSS rules
    const hoverRules: string[] = [];
    if (result.hoverStyles.backgroundColor) {
      hoverRules.push(`background-color: ${result.hoverStyles.backgroundColor} !important;`);
    }
    if (result.hoverStyles.color) {
      hoverRules.push(`color: ${result.hoverStyles.color} !important;`);
    }
    if (result.hoverStyles.borderColor) {
      hoverRules.push(`border-color: ${result.hoverStyles.borderColor} !important;`);
    }
    
    // Create and inject style element
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      [data-dynamic-hover="${result.styleId}"]:hover {
        ${hoverRules.join('\n        ')}
      }
    `;
    document.head.appendChild(style);
    
    // Cleanup on unmount
    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [result.hasHoverStyles, result.styleId, result.hoverStyles]);
  
  return {
    cleanClasses: result.cleanClasses,
    inlineStyles: result.inlineStyles,
    hasHoverStyles: result.hasHoverStyles,
    styleId: result.styleId,
  };
}

