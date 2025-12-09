"use client";

import { useMemo, useEffect, useId } from 'react';
import type { CSSProperties, RefObject } from 'react';
import { useDynamicTailwindClasses } from './useDynamicTailwindClasses';
import { useAutoContrast } from './useAutoContrast';
import { useAutoPadding } from './useAutoPadding';
import { injectHoverStyles, removeHoverStyles } from '@/lib/utils';

/**
 * Configuration options for style processing
 */
interface ComponentStylesOptions {
  /**
   * Element reference for advanced detection (auto-contrast)
   */
  elementRef?: RefObject<HTMLElement>;
  
  /**
   * Component name for debugging
   */
  componentName?: string;
  
  /**
   * Enable/disable specific processors
   */
  processors?: {
    dynamicTailwind?: boolean;    // Default: true
    autoContrast?: boolean;        // Default: true
    autoPadding?: boolean;         // Default: true
  };
  
  /**
   * Options for specific processors
   */
  contrastOptions?: {
    minContrastRatio?: number;
    isLargeText?: boolean;
    debug?: boolean;
  };
}

/**
 * Result from component styles processing
 */
interface ComponentStylesResult {
  /**
   * Final className string to apply
   */
  className: string;
  
  /**
   * Combined inline styles from all processors
   */
  style: CSSProperties;
  
  /**
   * Data attributes for tracking and debugging
   */
  dataAttributes: {
    'data-dynamic-hover'?: string;
    'data-contrast-id'?: string;
    'data-contrast-corrected'?: string;
  };
  
  /**
   * Metadata about applied transformations
   */
  metadata: {
    dynamicTailwindApplied: boolean;
    contrastCorrected: boolean;
    paddingAdjusted: boolean;
    hasHoverStyles: boolean;
  };
}

/**
 * Comprehensive hook that processes component classes through multiple
 * style transformation pipelines: dynamic Tailwind, auto-contrast, auto-padding.
 * 
 * This is the main entry point for component styling - it orchestrates all
 * style processors in the correct order and combines their results.
 * 
 * **Processing Pipeline:**
 * 1. Dynamic Tailwind: Extracts arbitrary values (bg-[#...]) → inline styles
 * 2. Auto-Contrast: Analyzes background/text contrast → corrects if needed
 * 3. Auto-Padding: Detects rounded buttons with small padding → adjusts
 * 4. Combines all results into final className and style object
 * 
 * @param classes - Raw Tailwind classes string from component config
 * @param options - Configuration for style processing
 * @returns Processed className, styles, and data attributes
 * 
 * @example
 * ```tsx
 * const MyComponent = ({ classes }) => {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const { className, style, dataAttributes } = useComponentStyles(classes, {
 *     elementRef: ref,
 *     componentName: 'MyComponent'
 *   });
 *   
 *   return <div ref={ref} className={className} style={style} {...dataAttributes} />;
 * };
 * ```
 * 
 * @example
 * ```tsx
 * // Disable specific processors
 * const { className, style } = useComponentStyles(classes, {
 *   processors: {
 *     autoContrast: false,  // Disable contrast correction
 *   }
 * });
 * ```
 */
export function useComponentStyles(
  classes?: string,
  options: ComponentStylesOptions = {}
): ComponentStylesResult {
  const {
    elementRef,
    componentName,
    processors = {},
    contrastOptions = {},
  } = options;
  
  // Default all processors to enabled
  const {
    dynamicTailwind = true,
    autoContrast = true,
    autoPadding = true,
  } = processors;
  
  const contrastId = useId();
  
  // ========================================
  // STEP 1: Dynamic Tailwind Processing
  // ========================================
  const dynamicResult = useDynamicTailwindClasses(
    dynamicTailwind ? classes : undefined
  );
  
  // If dynamic Tailwind is disabled, use original classes
  const cleanClasses = dynamicTailwind ? dynamicResult.cleanClasses : (classes || '');
  const inlineStyles = dynamicTailwind ? dynamicResult.inlineStyles : {};
  
  // ========================================
  // STEP 2: Auto-Contrast Processing
  // ========================================
  const contrastResult = useAutoContrast(
    autoContrast ? cleanClasses : undefined,
    {
      elementRef,
      componentName,
      ...contrastOptions,
    }
  );
  
  // ========================================
  // STEP 3: Auto-Padding Processing
  // ========================================
  const paddingResult = useAutoPadding(
    autoPadding ? cleanClasses : undefined
  );
  
  // ========================================
  // STEP 4: Inject Hover Styles (if needed)
  // ========================================
  useEffect(() => {
    if (autoContrast && contrastResult.hoverCorrectedTextColor && elementRef?.current) {
      injectHoverStyles(contrastId, contrastResult.hoverCorrectedTextColor);
    }
    
    return () => {
      removeHoverStyles(contrastId);
    };
  }, [autoContrast, contrastResult.hoverCorrectedTextColor, contrastId, elementRef]);
  
  // ========================================
  // STEP 5: Combine All Results
  // ========================================
  return useMemo(() => {
    // Remove text color classes if contrast is being corrected
    let finalClassName = cleanClasses;
    if (autoContrast && contrastResult.correctedTextColor) {
      finalClassName = finalClassName
        ?.replace(/text-\[#[0-9A-Fa-f]{3,6}\]|text-\w+(-\w+)*/g, '')
        .trim();
    }
    
    // Combine all inline styles
    const combinedStyle: CSSProperties = {
      ...inlineStyles,
      ...(autoContrast && contrastResult.correctedTextColor && { 
        color: contrastResult.correctedTextColor 
      }),
      ...(autoPadding && paddingResult.paddingStyle || {}),
    };
    
    // Build data attributes
    const dataAttributes: ComponentStylesResult['dataAttributes'] = {};
    
    if (dynamicTailwind && dynamicResult.hasHoverStyles && dynamicResult.styleId) {
      dataAttributes['data-dynamic-hover'] = dynamicResult.styleId;
    }
    
    if (autoContrast && contrastResult.hoverCorrectedTextColor) {
      dataAttributes['data-contrast-id'] = contrastId;
    }
    
    if (autoContrast && contrastResult.correctedTextColor && process.env.NODE_ENV === 'development') {
      dataAttributes['data-contrast-corrected'] = 'true';
    }
    
    // Build metadata
    const metadata = {
      dynamicTailwindApplied: dynamicTailwind && Object.keys(inlineStyles).length > 0,
      contrastCorrected: autoContrast && contrastResult.correctedTextColor !== null,
      paddingAdjusted: autoPadding && paddingResult.wasAdjusted,
      hasHoverStyles: (dynamicTailwind && dynamicResult.hasHoverStyles) || 
                      (autoContrast && !!contrastResult.hoverCorrectedTextColor),
    };
    
    return {
      className: finalClassName,
      style: combinedStyle,
      dataAttributes,
      metadata,
    };
  }, [
    cleanClasses,
    inlineStyles,
    autoContrast,
    contrastResult.correctedTextColor,
    contrastResult.hoverCorrectedTextColor,
    autoPadding,
    paddingResult.paddingStyle,
    paddingResult.wasAdjusted,
    dynamicTailwind,
    dynamicResult.hasHoverStyles,
    dynamicResult.styleId,
    contrastId,
  ]);
}

