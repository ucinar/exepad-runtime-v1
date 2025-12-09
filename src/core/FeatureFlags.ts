/**
 * Feature Flags System
 * Controls which features are available in published vs preview mode
 */

import { RuntimeMode } from './RuntimeMode';

export type Feature = 
  | 'rendering'      // Basic rendering engine (both modes)
  | 'navigation'     // Navigation and routing (both modes)
  | 'forms'          // Form components (both modes)
  | 'editing'        // Edit mode features (preview only)
  | 'websocket'      // WebSocket connection (preview only)
  | 'debugging'      // DevTools and debugging (preview only)
  | 'state_management' // Zustand store (preview only)
  | 'hot_reload';    // Hot reload capabilities (preview only)

/**
 * Features available in published mode
 * Minimal set for production performance
 */
const PUBLISHED_FEATURES: Feature[] = [
  'rendering',
  'navigation',
  'forms',
];

/**
 * Features available in preview mode
 * Full feature set including editing capabilities
 */
const PREVIEW_FEATURES: Feature[] = [
  ...PUBLISHED_FEATURES,
  'editing',
  'websocket',
  'debugging',
  'state_management',
  'hot_reload',
];

/**
 * Check if a feature is enabled for the given mode
 */
export const isFeatureEnabled = (feature: Feature, mode: RuntimeMode): boolean => {
  if (mode === 'published') {
    return PUBLISHED_FEATURES.includes(feature);
  }
  return PREVIEW_FEATURES.includes(feature);
};

/**
 * Get all enabled features for a mode
 */
export const getEnabledFeatures = (mode: RuntimeMode): Feature[] => {
  return mode === 'published' ? PUBLISHED_FEATURES : PREVIEW_FEATURES;
};

/**
 * Check if editing features are available
 */
export const canEdit = (mode: RuntimeMode): boolean => {
  return isFeatureEnabled('editing', mode);
};

/**
 * Check if WebSocket connection should be established
 */
export const shouldConnectWebSocket = (mode: RuntimeMode): boolean => {
  return isFeatureEnabled('websocket', mode);
};

/**
 * Check if debugging tools should be available
 */
export const canDebug = (mode: RuntimeMode): boolean => {
  return isFeatureEnabled('debugging', mode);
};

