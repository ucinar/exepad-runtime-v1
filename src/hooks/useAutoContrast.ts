"use client";

import { useMemo, useState, useEffect } from 'react';
import { 
  extractColorsFromClasses, 
  getContrastRatio, 
  getContrastingTextColor,
  getEffectiveBackgroundColor,
  analyzeBackgroundComplexity
} from '@/lib/utils';
import {
  isContrastDebugEnabled,
  logContrastDebug,
  warnContrastIssue,
  logContrastCorrection
} from '@/lib/debug';

interface AutoContrastOptions {
  /**
   * Minimum contrast ratio required (WCAG AA is 4.5 for normal text, 3.0 for large text)
   */
  minContrastRatio?: number;
  
  /**
   * Reference to the element being styled (required for advanced detection)
   */
  elementRef?: React.RefObject<HTMLElement>;
  
  /**
   * Whether this is large text (heading, large font) - allows lower contrast ratio
   */
  isLargeText?: boolean;
  
  /**
   * Enable debug logging for this component
   */
  debug?: boolean;
  
  /**
   * Optional component name for better debug messages
   */
  componentName?: string;
}

interface AutoContrastResult {
  /**
   * The corrected text color (if needed), or null if contrast is sufficient
   */
  correctedTextColor: string | null;
  
  /**
   * The detected background color
   */
  backgroundColor: string | null;
  
  /**
   * The original text color from classes
   */
  originalTextColor: string | null;
  
  /**
   * The calculated contrast ratio
   */
  contrastRatio: number | null;
  
  /**
   * Whether the contrast meets the minimum requirement
   */
  meetsRequirement: boolean;

  /**
   * A corrected text color for hover state if hover bg is specified and needs it
   */
  hoverCorrectedTextColor?: string | null;
  
  /**
   * Whether the background is a gradient
   */
  isGradient?: boolean;
  
  /**
   * Whether the background has semi-transparency
   */
  isSemiTransparent?: boolean;
  
  /**
   * Method used to detect colors
   */
  detectionMethod?: 'class-map' | 'css-variable' | 'computed-style' | 'gradient' | 'parent-chain';
}

/**
 * Hook to automatically detect and correct poor color contrast in components
 * 
 * @param classes - Tailwind classes string from component
 * @param options - Configuration options for contrast checking
 * @returns Auto-contrast result with corrected color if needed
 * 
 * @example
 * ```tsx
 * const elementRef = useRef<HTMLDivElement>(null);
 * const { correctedTextColor } = useAutoContrast("bg-[#A8C6C3] text-white", { elementRef });
 * // Returns correctedTextColor: "#111827" because white on light teal has poor contrast
 * ```
 */
export function useAutoContrast(
  classes?: string,
  options: AutoContrastOptions = {}
): AutoContrastResult {
  const {
    minContrastRatio = options.isLargeText ? 3.0 : 4.5,
    elementRef,
    isLargeText = false,
    debug = false,
    componentName,
  } = options;
  
  const debugEnabled = debug || isContrastDebugEnabled();
  
  // Track mount state to re-run detection after DOM is available
  // This fixes timing issues where elementRef.current is null on first render
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Small delay to ensure DOM is fully painted and CSS variables are resolved
    const timer = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);
  
  return useMemo(() => {
    if (debugEnabled) {
      logContrastDebug(
        `Analyzing contrast${componentName ? ` for ${componentName}` : ''}`,
        { classes, isLargeText, minContrastRatio }
      );
    }
    
    const element = elementRef?.current;
    let detectionMethod: AutoContrastResult['detectionMethod'] = 'class-map';
    
    // Analyze background complexity (gradients, transparency)
    const complexity = analyzeBackgroundComplexity(classes);
    
    // Extract colors from classes
    let { backgroundColor: classBgColor, textColor } = extractColorsFromClasses(classes, element ?? undefined);
    
    // If gradient detected, use average color
    if (complexity.hasGradient && complexity.averageColor) {
      classBgColor = complexity.averageColor;
      detectionMethod = 'gradient';
      
      if (debugEnabled) {
        logContrastDebug('Gradient detected, using average color', { averageColor: complexity.averageColor });
      }
    }
    
    // Extract hover background color (supports all formats now)
    let hoverBackgroundColor: string | null = null;
    
    // Try hex format first
    const hoverBgHexMatch = classes?.match(/hover:bg-\[#([0-9A-Fa-f]{3,6})\]/);
    if (hoverBgHexMatch) {
      hoverBackgroundColor = `#${hoverBgHexMatch[1]}`;
    } else if (element && classes) {
      // Try standard Tailwind hover classes
      const hoverBgMatch = classes.match(/hover:(bg-[\w-]+)/);
      if (hoverBgMatch) {
        // Would need to resolve this, but for now we'll skip
        // Could enhance later with resolveColorFromClass
      }
    }
    
    // Determine effective background color
    let backgroundColor = classBgColor;
    
    // If no background in classes, check the element's computed style directly
    // This catches default styles from variants (e.g. bg-background in shadcn components)
    if (!backgroundColor && element) {
      try {
        const computedBg = window.getComputedStyle(element).backgroundColor;
        
        // Check if it has a visible background color
        // Match rgba(r, g, b, alpha) or rgb(r, g, b)
        const match = computedBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
          const alpha = match[4] ? parseFloat(match[4]) : 1;
          
          // If alpha is significant, use this as the background color
          if (alpha > 0.1) {
             const r = parseInt(match[1]);
             const g = parseInt(match[2]);
             const b = parseInt(match[3]);
             const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
             backgroundColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
             detectionMethod = 'computed-style';
             
             if (debugEnabled) {
               logContrastDebug('Background detected from computed style', { backgroundColor });
             }
          }
        }
      } catch (e) {
        // Ignore computed style errors (e.g. during SSR or unmounted)
      }
    }

    // If still no background, try to get from parent chain
    // Only if the element itself is transparent (no background detected above)
    if (!backgroundColor && element) {
      backgroundColor = getEffectiveBackgroundColor(element);
      if (backgroundColor) {
        detectionMethod = 'parent-chain';
        
        if (debugEnabled) {
          logContrastDebug('Background detected from parent chain', { backgroundColor });
        }
      }
    }
    
    // If we don't have both colors, we can't calculate contrast
    if (!backgroundColor || !textColor) {
      if (debugEnabled) {
        warnContrastIssue('Unable to detect colors', {
          backgroundColor: backgroundColor || 'NOT FOUND',
          textColor: textColor || 'NOT FOUND',
          classes
        });
      }
      
      return {
        correctedTextColor: null,
        backgroundColor,
        originalTextColor: textColor,
        contrastRatio: null,
        meetsRequirement: true, // Assume OK if we can't check
        hoverCorrectedTextColor: null,
        isGradient: complexity.hasGradient,
        isSemiTransparent: complexity.hasSemiTransparency,
        detectionMethod,
      };
    }
    
    // Calculate contrast ratio
    const contrastRatio = getContrastRatio(backgroundColor, textColor);
    const meetsRequirement = contrastRatio >= minContrastRatio;
    
    // If contrast is sufficient, no correction needed
    if (meetsRequirement) {
      if (debugEnabled) {
        logContrastDebug('Contrast is sufficient', {
          backgroundColor,
          textColor,
          contrastRatio: contrastRatio.toFixed(2),
          minRequired: minContrastRatio
        });
      }
      
      return {
        correctedTextColor: null,
        backgroundColor,
        originalTextColor: textColor,
        contrastRatio,
        meetsRequirement: true,
        hoverCorrectedTextColor: hoverBackgroundColor
          ? getContrastingTextColor(hoverBackgroundColor)
          : null,
        isGradient: complexity.hasGradient,
        isSemiTransparent: complexity.hasSemiTransparency,
        detectionMethod,
      };
    }
    
    // Contrast is insufficient - get a corrected text color
    const correctedTextColor = getContrastingTextColor(backgroundColor);
    const hoverCorrectedTextColor = hoverBackgroundColor
      ? getContrastingTextColor(hoverBackgroundColor)
      : null;
    
    if (debugEnabled) {
      logContrastCorrection({
        component: componentName,
        backgroundColor,
        originalTextColor: textColor,
        correctedTextColor,
        contrastRatio,
        minRequired: minContrastRatio
      });
    }
    
    return {
      correctedTextColor,
      backgroundColor,
      originalTextColor: textColor,
      contrastRatio,
      meetsRequirement: false,
      hoverCorrectedTextColor,
      isGradient: complexity.hasGradient,
      isSemiTransparent: complexity.hasSemiTransparency,
      detectionMethod,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mounted triggers re-computation after DOM is available
  }, [classes, elementRef, minContrastRatio, isLargeText, debugEnabled, componentName, mounted]);
}

