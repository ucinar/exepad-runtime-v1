/**
 * App Store (Preview-Only)
 * Centralized state management using Zustand
 * 
 * IMPORTANT: This should only be used in preview mode
 * Published mode doesn't need state management
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { WebAppProps } from '@/app_runtime/interfaces/apps/webapp';
import { ConnectionStatus } from '@/services/WebSocketManager';
import { ContentUpdate } from '@/services/PersistenceService';

export interface ComponentMetadata {
  componentType?: string;
  textPreview?: string;
}

interface AppStore {
  // Config state
  appConfig: WebAppProps | null;
  setAppConfig: (config: WebAppProps) => void;

  // Selection state
  selectedComponentId: string | null;
  selectComponent: (id: string | null, metadata?: ComponentMetadata) => void;

  // Edit state
  isEditMode: boolean;
  setEditMode: (enabled: boolean) => void;
  contentUpdates: Map<string, ContentUpdate>;
  updateContent: (update: ContentUpdate) => void;
  markContentAsSaved: (componentId: string) => void;
  clearContentUpdate: (componentId: string) => void;

  // Processing state
  processingComponentIds: Set<string>;
  setComponentProcessing: (id: string, processing: boolean) => void;

  // WebSocket state
  wsConnectionStatus: ConnectionStatus;
  setWsConnectionStatus: (status: ConnectionStatus) => void;

  // Derived state & actions
  hasUnsavedChanges: () => boolean;
  getUnsavedUpdates: () => ContentUpdate[];
  clearUpdates: () => void;
  
  // Component lookup
  getComponentById: (id: string) => any | null;
}

/**
 * Create the Zustand store with devtools and persistence
 */
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Config state
        appConfig: null,
        setAppConfig: (config) => {
          console.log('[AppStore] Config updated');
          // Clear contentUpdates when new config is loaded to prevent stale edits
          set({ appConfig: config, contentUpdates: new Map() });
        },

        // Selection state
        selectedComponentId: null,
        selectComponent: (id, metadata) => {
          console.log('[AppStore] Component selected:', id);
          set({ selectedComponentId: id });
        },

        // Edit state
        isEditMode: false,
        setEditMode: (enabled) => {
          console.log('[AppStore] Edit mode:', enabled);
          set({ isEditMode: enabled });
        },

        contentUpdates: new Map(),
        updateContent: (update) => {
          set((state) => {
            const newUpdates = new Map(state.contentUpdates);
            newUpdates.set(update.componentId, { ...update, isSaved: false });
            console.log('[AppStore] Content updated:', update.componentId);
            return { contentUpdates: newUpdates };
          });
        },

        markContentAsSaved: (componentId) => {
          set((state) => {
            const newUpdates = new Map(state.contentUpdates);
            const existing = newUpdates.get(componentId);
            if (existing) {
              newUpdates.set(componentId, { ...existing, isSaved: true });
            }
            return { contentUpdates: newUpdates };
          });
        },

        clearContentUpdate: (componentId) => {
          set((state) => {
            const newUpdates = new Map(state.contentUpdates);
            newUpdates.delete(componentId);
            return { contentUpdates: newUpdates };
          });
        },

        // Processing state
        processingComponentIds: new Set(),
        setComponentProcessing: (id, processing) => {
          set((state) => {
            const newSet = new Set(state.processingComponentIds);
            if (processing) {
              newSet.add(id);
              console.log('[AppStore] Component processing started:', id);
            } else {
              newSet.delete(id);
              console.log('[AppStore] Component processing completed:', id);
            }
            return { processingComponentIds: newSet };
          });
        },

        // WebSocket state
        wsConnectionStatus: 'disconnected',
        setWsConnectionStatus: (status) => {
          console.log('[AppStore] WebSocket status:', status);
          set({ wsConnectionStatus: status });
        },

        // Derived state & actions
        hasUnsavedChanges: () => {
          const updates = get().contentUpdates;
          return Array.from(updates.values()).some((u) => !u.isSaved);
        },

        getUnsavedUpdates: () => {
          const updates = get().contentUpdates;
          return Array.from(updates.values()).filter((u) => !u.isSaved);
        },

        clearUpdates: () => {
          console.log('[AppStore] Clearing all updates');
          set({ contentUpdates: new Map() });
        },

        // Component lookup
        getComponentById: (id) => {
          const config = get().appConfig;
          if (!config) return null;

          // Helper function to recursively search for component
          const findComponent = (items: any[]): any => {
            for (const item of items) {
              if (item.uuid === id) return item;
              
              // Search in nested structures
              for (const value of Object.values(item)) {
                if (Array.isArray(value)) {
                  const found = findComponent(value);
                  if (found) return found;
                }
              }
            }
            return null;
          };

          // Search in all sections
          const sections = [
            ...(config.header || []),
            ...(config.footer || []),
            ...(config.sidebar || []),
            ...(config.pages || []).flatMap((page: any) => page.content || []),
          ];

          return findComponent(sections);
        },
      }),
      {
        name: 'runtime-app-store',
        partialize: (state) => ({
          // Don't persist anything - contentUpdates are temporary edits
          // that should only live during the editing session
        }),
      }
    ),
    {
      name: 'AppStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

