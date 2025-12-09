/**
 * Debug utilities for auto contrast system
 */

// Global flag for contrast debugging
declare global {
  interface Window {
    __LEAPDO_CONTRAST_DEBUG__?: boolean;
  }
}

/**
 * Check if contrast debug mode is enabled
 * @returns True if debug mode is active
 */
export function isContrastDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check explicit window flag first
  if (window.__LEAPDO_CONTRAST_DEBUG__ !== undefined) {
    return window.__LEAPDO_CONTRAST_DEBUG__;
  }
  
  // Auto-enable in development mode
  return process.env.NODE_ENV === 'development';
}

/**
 * Enable contrast debug mode
 */
export function enableContrastDebug(): void {
  if (typeof window !== 'undefined') {
    window.__LEAPDO_CONTRAST_DEBUG__ = true;
    console.log('✅ Auto-contrast debug mode enabled');
  }
}

/**
 * Disable contrast debug mode
 */
export function disableContrastDebug(): void {
  if (typeof window !== 'undefined') {
    window.__LEAPDO_CONTRAST_DEBUG__ = false;
    console.log('❌ Auto-contrast debug mode disabled');
  }
}

/**
 * Log contrast debug information
 * @param message - Debug message
 * @param data - Optional data to log
 */
export function logContrastDebug(message: string, data?: any): void {
  if (!isContrastDebugEnabled()) return;
  
  console.log(`[Auto-Contrast] ${message}`, data || '');
}

/**
 * Warn about contrast issues
 * @param message - Warning message
 * @param data - Optional data to log
 */
export function warnContrastIssue(message: string, data?: any): void {
  if (!isContrastDebugEnabled()) return;
  
  console.warn(`[Auto-Contrast] ⚠️ ${message}`, data || '');
}

/**
 * Log successful contrast correction
 * @param data - Correction details
 */
export function logContrastCorrection(data: {
  component?: string;
  backgroundColor: string;
  originalTextColor: string;
  correctedTextColor: string;
  contrastRatio: number;
  minRequired: number;
}): void {
  if (!isContrastDebugEnabled()) return;
  
  console.log(
    `[Auto-Contrast] ✅ Correction applied` + (data.component ? ` (${data.component})` : ''),
    `\n  Background: ${data.backgroundColor}`,
    `\n  Original Text: ${data.originalTextColor}`,
    `\n  Corrected Text: ${data.correctedTextColor}`,
    `\n  Contrast Ratio: ${data.contrastRatio.toFixed(2)}:1 (min: ${data.minRequired}:1)`
  );
}

