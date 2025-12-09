"use client";

import { useMemo } from 'react';

interface AutoPaddingResult {
  /**
   * Corrected padding style if needed, or null if padding is adequate
   */
  paddingStyle: React.CSSProperties | null;
  
  /**
   * Whether the padding was adjusted
   */
  wasAdjusted: boolean;
  
  /**
   * The original padding class that was detected
   */
  originalPadding: string | null;
}

/**
 * Hook to automatically detect and fix insufficient padding on rounded buttons
 * 
 * LLMs often generate buttons with `rounded-full` but insufficient vertical padding
 * (py-0, py-1, py-2), which makes text feel cramped against the borders.
 * This hook automatically corrects small padding to ensure proper visual spacing.
 * 
 * @param classes - Tailwind classes string from component
 * @returns Auto-padding result with corrected padding if needed
 * 
 * @example
 * ```tsx
 * const { paddingStyle } = useAutoPadding("bg-white py-2 px-6 rounded-full");
 * // Returns paddingStyle with 12px vertical padding (corrected from 8px)
 * ```
 */
export function useAutoPadding(classes?: string): AutoPaddingResult {
  return useMemo(() => {
    if (!classes) {
      return { 
        paddingStyle: null, 
        wasAdjusted: false,
        originalPadding: null 
      };
    }

    const classList = classes.split(/\s+/);
    
    // Check if element has fully rounded corners
    const isFullyRounded = classList.includes('rounded-full');
    
    // Check for small vertical padding (py-0 through py-2)
    // These values are insufficient for rounded-full buttons
    const smallPaddingMatch = classList.find(cls => 
      /^py-(0|0\.5|1|1\.5|2)$/.test(cls)
    );
    
    // Only fix if element is rounded-full with small padding
    if (!isFullyRounded || !smallPaddingMatch) {
      return { 
        paddingStyle: null, 
        wasAdjusted: false,
        originalPadding: null 
      };
    }
    
    // Extract current padding value
    const paddingValue = smallPaddingMatch.match(/^py-(.+)$/)?.[1];
    
    // Map of inadequate padding to corrected values
    // All small paddings get corrected to py-3 (0.75rem / 12px)
    // This provides adequate breathing room for rounded buttons
    const paddingMap: Record<string, string> = {
      '0': '0.75rem',      // py-0 → py-3 (0px → 12px)
      '0.5': '0.75rem',    // py-0.5 → py-3 (2px → 12px)
      '1': '0.75rem',      // py-1 → py-3 (4px → 12px)
      '1.5': '0.75rem',    // py-1.5 → py-3 (6px → 12px)
      '2': '0.75rem',      // py-2 → py-3 (8px → 12px)
    };
    
    const correctedPadding = paddingValue ? paddingMap[paddingValue] : null;
    
    if (correctedPadding) {
      return {
        paddingStyle: {
          paddingTop: correctedPadding,
          paddingBottom: correctedPadding,
        },
        wasAdjusted: true,
        originalPadding: smallPaddingMatch,
      };
    }
    
    return { 
      paddingStyle: null, 
      wasAdjusted: false,
      originalPadding: null 
    };
  }, [classes]);
}

