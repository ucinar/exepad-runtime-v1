/**
 * Store Selectors
 * Optimized selectors to prevent unnecessary re-renders
 */

import { WebAppProps } from '@/app_runtime/interfaces/apps/webapp';
import { ContentUpdate } from '@/services/PersistenceService';

/**
 * Select a specific component by ID from the config
 */
export const selectComponent = (id: string) => (state: { appConfig: WebAppProps | null }) => {
  if (!state.appConfig) return null;

  const config = state.appConfig;

  // Helper function to recursively search for component
  const findComponent = (items: any[]): any => {
    if (!Array.isArray(items)) return null;
    
    for (const item of items) {
      if (item && typeof item === 'object') {
        if (item.uuid === id) return item;

        // Search in nested structures
        for (const value of Object.values(item)) {
          if (Array.isArray(value)) {
            const found = findComponent(value);
            if (found) return found;
          }
        }
      }
    }
    return null;
  };

  // Search in all sections
  let found = findComponent(config.header || []);
  if (found) return found;

  found = findComponent(config.footer || []);
  if (found) return found;

  found = findComponent(config.sidebar || []);
  if (found) return found;

  // Search in pages
  if (config.pages) {
    for (const page of config.pages) {
      if ('content' in page && Array.isArray(page.content)) {
        found = findComponent(page.content);
        if (found) return found;
      }
    }
  }

  return null;
};

/**
 * Select whether there are unsaved changes
 */
export const selectHasUnsavedChanges = (state: { contentUpdates: Map<string, ContentUpdate> }) =>
  Array.from(state.contentUpdates.values()).some((u) => !u.isSaved);

/**
 * Select whether a component is currently being processed
 */
export const selectIsProcessing = (id: string) => (state: { processingComponentIds: Set<string> }) =>
  state.processingComponentIds.has(id);

/**
 * Select all unsaved updates
 */
export const selectUnsavedUpdates = (state: { contentUpdates: Map<string, ContentUpdate> }) =>
  Array.from(state.contentUpdates.values()).filter((u) => !u.isSaved);

/**
 * Select count of unsaved changes
 */
export const selectUnsavedCount = (state: { contentUpdates: Map<string, ContentUpdate> }) =>
  Array.from(state.contentUpdates.values()).filter((u) => !u.isSaved).length;

/**
 * Select edit mode status
 */
export const selectIsEditMode = (state: { isEditMode: boolean }) => state.isEditMode;

/**
 * Select selected component ID
 */
export const selectSelectedComponentId = (state: { selectedComponentId: string | null }) =>
  state.selectedComponentId;

/**
 * Select WebSocket connection status
 */
export const selectWsStatus = (state: { wsConnectionStatus: string }) => state.wsConnectionStatus;

/**
 * Select whether WebSocket is connected
 */
export const selectIsWsConnected = (state: { wsConnectionStatus: string }) =>
  state.wsConnectionStatus === 'connected';

