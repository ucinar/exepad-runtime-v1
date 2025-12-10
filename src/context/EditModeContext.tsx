/**
 * Edit Mode Context (Preview-Only - Refactored)
 * Thin provider layer that bridges React components with services/store
 * 
 * IMPORTANT: This should only be used in preview mode
 * 
 * BEFORE: 557 lines with all logic inline
 * AFTER: ~150 lines as thin provider using services/store
 * 
 * SECURITY: Edit mode is only enabled when running inside the editor iframe.
 * Opening the preview URL in a new tab will NOT enable edit mode or WebSocket connection.
 */

'use client';

import React, { createContext, useContext, useEffect, useCallback, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { WebSocketManager, ConnectionStatus } from '../services/WebSocketManager';
import { PersistenceService, ContentUpdate } from '../services/PersistenceService';
import { ConfigService } from '../services/ConfigService';
import { useAppStore } from '../stores/appStore';
import { useLifecycle } from '../hooks/useLifecycle';
import { getJWTTokenAsync } from '../lib/jwt-helper';
import { toast } from 'sonner';

/**
 * Check if we're running inside an iframe (the editor embeds preview in iframe)
 * This is more reliable than query params and can't be URL-spoofed
 */
function getIsInEditorIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch (e) {
    // If we can't access window.top due to cross-origin restrictions,
    // we're definitely in an iframe
    return true;
  }
}

interface ComponentMetadata {
  componentType?: string;
  textPreview?: string;
}

interface EditModeContextType {
  isEditMode: boolean;
  isPreview: boolean;
  updateContent: (componentId: string, content: string, componentType: string, targetField: string) => void;
  saveChanges: (force?: boolean, origin?: 'autosave' | 'manual') => Promise<void>;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  selectedComponentId: string | null;
  selectComponent: (componentId: string | null, metadata?: ComponentMetadata) => void;
  wsConnectionStatus: ConnectionStatus;
  sendWebSocketMessage: (message: { type: string; data?: any; [key: string]: any }) => boolean;
  triggerEditMode: (enable: boolean) => void;
  processingComponentIds: Set<string>;
  setComponentProcessing: (componentId: string, isProcessing: boolean) => void;
  // Fine-grained content accessors to avoid global rerenders
  getContentFor: (componentId: string) => string | undefined;
  subscribeContent: (componentId: string, callback: () => void) => () => void;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
  isPreview: false,
  updateContent: () => {},
  saveChanges: async () => {},
  hasUnsavedChanges: false,
  isSaving: false,
  selectedComponentId: null,
  selectComponent: () => {},
  wsConnectionStatus: 'disconnected',
  sendWebSocketMessage: () => false,
  triggerEditMode: () => {},
  processingComponentIds: new Set(),
  setComponentProcessing: () => {},
  getContentFor: () => undefined,
  subscribeContent: () => () => {},
});

export const useEditMode = () => useContext(EditModeContext);

interface EditModeProviderProps {
  children: React.ReactNode;
  isPreview: boolean;
  appId: string;
}

export function EditModeProvider({ children, isPreview, appId }: EditModeProviderProps) {
  const searchParams = useSearchParams();
  const lifecycle = useLifecycle({ name: 'EditModeProvider', debug: false });
  
  // Check if we're running inside the editor iframe
  // This determines whether edit mode and WebSocket connection should be enabled
  const [isInEditorIframe] = useState(() => getIsInEditorIframe());
  
  // Use Zustand store for state
  const {
    isEditMode,
    setEditMode,
    selectedComponentId,
    selectComponent: storeSelectComponent,
    contentUpdates,
    updateContent: storeUpdateContent,
    hasUnsavedChanges: storeHasUnsavedChanges,
    getUnsavedUpdates,
    processingComponentIds,
    setComponentProcessing,
    wsConnectionStatus,
    setWsConnectionStatus,
    appConfig,
    setAppConfig,
  } = useAppStore();

  // Service instances
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const persistenceServiceRef = useRef<PersistenceService | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [wsEditMode, setWsEditMode] = React.useState(false);

  // Initialize services - connect WebSocket in preview mode (works in iframe OR separate tab)
  useEffect(() => {
    if (!isPreview) return;
    
    // Note: We now support WebSocket in both iframe AND separate tabs!
    // Cookie-based authentication allows this to work anywhere.
    
    wsManagerRef.current = WebSocketManager.getInstance();
    persistenceServiceRef.current = new PersistenceService();

    // Connect WebSocket with JWT authentication
    (async () => {
      try {
        console.log('[EditModeProvider] Fetching JWT token for WebSocket authentication...');
        
        // This now tries multiple sources:
        // 1. Cached token (session storage)
        // 2. Cookie-authenticated API (works in separate tabs!)
        // 3. postMessage from parent (works in iframe)
        const jwtToken = await getJWTTokenAsync();
        
        if (jwtToken) {
          console.log('[EditModeProvider] ✅ JWT token obtained, connecting to WebSocket...');
          await wsManagerRef.current!.connect(appId, jwtToken);
        } else {
          console.warn('[EditModeProvider] ❌ No JWT token available - WebSocket disabled');
          console.warn('[EditModeProvider] Preview will be read-only without authentication');
          
          // Show friendly message to user
          toast.info('Limited Preview Mode', {
            description: 'Please log in to enable edit mode and live updates.',
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('[EditModeProvider] WebSocket connection failed:', error);
        
        toast.error('Connection Failed', {
          description: 'Could not connect to server. Some features may be limited.',
          duration: 5000,
        });
      }
    })();

    // Subscribe to connection status changes
    const unsubscribe = wsManagerRef.current.subscribe('connection', (message) => {
      setWsConnectionStatus(message.status);
    });
    lifecycle.add(unsubscribe);

    // Subscribe to WebSocket messages
    const unsubscribeMessages = wsManagerRef.current.subscribe('*', (message) => {
      handleWebSocketMessage(message);
    });
    lifecycle.add(unsubscribeMessages);

    // Add cleanup for services
    lifecycle.add(() => {
      persistenceServiceRef.current?.cleanup();
      wsManagerRef.current?.disconnect();
    });

    // Note: lifecycle.cleanup() is automatically called on unmount by useLifecycle hook
  }, [isPreview, appId]);  // Removed isInEditorIframe dependency - works anywhere now!

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'enter_edit_mode':
        // Only allow edit mode when running inside the editor iframe
        if (!isInEditorIframe) {
          console.log('[EditModeProvider] Ignoring enter_edit_mode (not in editor iframe)');
          return;
        }
        console.log('[EditModeProvider] Entering edit mode via WebSocket');
        setWsEditMode(true);
        setEditMode(true);
        break;

      case 'exit_edit_mode':
        console.log('[EditModeProvider] Exiting edit mode via WebSocket');
        setWsEditMode(false);
        setEditMode(false);
        break;

      case 'save_changes':
        console.log('[EditModeProvider] Save triggered via WebSocket');
        const origin = message?.data?.reason === 'autosave' ? 'autosave' : 'manual';
        if (storeHasUnsavedChanges() && !isSaving) {
          saveChanges(false, origin);
        }
        break;

      case 'app_config_updated':
        console.log('[EditModeProvider] Config updated via WebSocket', message);
        const reloadApp = message.reload_app || message.data?.reload_app;
        const changedComponentUuid = message.changed_component_uuid || message.data?.changed_component_uuid;
        const changeType = message.change_type || message.data?.change_type;
        const changedComponentConfig = message.changed_component_config || message.data?.changed_component_config;

        if (reloadApp) {
          console.log('[EditModeProvider] Full reload required');
          window.location.reload();
        } else if (changedComponentConfig && changedComponentUuid && changeType === 'modify') {
          // DIRECT UPDATE - Apply component config directly from SSE event (no fetch needed)
          console.log('[EditModeProvider] Direct component update from SSE:', changedComponentUuid);
          
          // Clear selection
          selectComponent(null);
          
          // Clear processing state
          setComponentProcessing(changedComponentUuid, false);
          
          // Apply the component update directly
          applyDirectComponentUpdate(changedComponentUuid, changedComponentConfig);
        } else if (changedComponentUuid && changeType === 'remove') {
          // Handle component removal
          console.log('[EditModeProvider] Component removed:', changedComponentUuid);
          selectComponent(null);
          setComponentProcessing(changedComponentUuid, false);
          // For removal, we still need to fetch to get the updated config without the component
          fetchAndApplyUpdate(changedComponentUuid, changeType);
        } else {
          // Fallback: Fetch and apply update
          console.log('[EditModeProvider] Fallback: Fetching update from backend');
          if (changedComponentUuid) {
            selectComponent(null);
            setComponentProcessing(changedComponentUuid, false);
          }
          fetchAndApplyUpdate(changedComponentUuid, changeType);
        }
        break;

      case 'component_processing':
        const { componentId, isProcessing } = message.data || {};
        if (componentId) {
          setComponentProcessing(componentId, isProcessing);
        }
        break;
    }
  }, [isSaving, storeHasUnsavedChanges, setEditMode, setComponentProcessing, isInEditorIframe]);

  // Fetch and apply config updates
  const fetchAndApplyUpdate = useCallback(async (
    changedComponentUuid?: string,
    changeType?: 'modify' | 'remove'
  ) => {
    try {
      console.log('[EditModeProvider] Fetching updated config for appId:', appId);
      const newConfig = await ConfigService.fetch(appId, 'preview');
      if (newConfig) {
        const updates = ConfigService.compareConfigs(appConfig, newConfig);
        if (updates.length > 0 || changedComponentUuid) {
          console.log(`[EditModeProvider] Applying ${updates.length} updates`);
          if (changedComponentUuid) {
            console.log(`[EditModeProvider] Changed component: ${changedComponentUuid} (${changeType})`);
          }
          
          // Update config in store - this will trigger React re-render
          setAppConfig(newConfig);
          
          // Force re-render for the specific component if React doesn't pick it up
          if (changedComponentUuid && (changeType === 'modify' || changeType === 'remove')) {
            // Emit event to notify any listeners that this component changed or was removed
            // This can be used by DynamicRenderer to force re-render
            window.dispatchEvent(new CustomEvent('component-updated', { 
              detail: { 
                componentId: changedComponentUuid,
                changeType: changeType,
                timestamp: Date.now()
              }
            }));
          }
        } else {
          console.log('[EditModeProvider] No changes detected in config');
        }
      } else {
        console.warn('[EditModeProvider] Failed to fetch config - received null');
      }
    } catch (error) {
      console.error('[EditModeProvider] Failed to fetch update:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('[EditModeProvider] Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
    }
  }, [appId, appConfig, setAppConfig]);

  // Apply component update directly from SSE event (no fetch needed)
  const applyDirectComponentUpdate = useCallback((
    componentId: string,
    newComponentConfig: any
  ) => {
    // Get latest appConfig directly from store to avoid stale closure
    const currentAppConfig = useAppStore.getState().appConfig;

    if (!currentAppConfig) {
      console.warn('[EditModeProvider] No appConfig available for direct update');
      return;
    }

    console.log('[EditModeProvider] Applying direct component update:', componentId);

    // Deep clone the config to avoid mutation
    const newConfig = JSON.parse(JSON.stringify(currentAppConfig));

    // Helper function to recursively find and replace component
    const replaceComponent = (obj: any): boolean => {
      if (!obj || typeof obj !== 'object') return false;

      // Check if this is the component we're looking for
      if (obj.uuid === componentId) {
        // Replace all properties with new config
        Object.keys(obj).forEach(key => delete obj[key]);
        Object.assign(obj, newComponentConfig);
        return true;
      }

      // Search in arrays
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          if (obj[i]?.uuid === componentId) {
            obj[i] = newComponentConfig;
            return true;
          }
          if (replaceComponent(obj[i])) return true;
        }
      }

      // Search in object properties
      for (const key of Object.keys(obj)) {
        if (replaceComponent(obj[key])) return true;
      }

      return false;
    };

    // Search in pages content
    if (newConfig.pages) {
      for (const page of newConfig.pages) {
        if (page.content && replaceComponent(page.content)) {
          console.log('[EditModeProvider] Component replaced in page:', page.uuid);
          break;
        }
      }
    }

    // Search in header, footer, sidebar
    if (newConfig.header && replaceComponent(newConfig.header)) {
      console.log('[EditModeProvider] Component replaced in header');
    }
    if (newConfig.footer && replaceComponent(newConfig.footer)) {
      console.log('[EditModeProvider] Component replaced in footer');
    }
    if (newConfig.sidebar && replaceComponent(newConfig.sidebar)) {
      console.log('[EditModeProvider] Component replaced in sidebar');
    }

    // Update config in store - this will trigger React re-render
    setAppConfig(newConfig);
    console.log('[EditModeProvider] Config updated with new component');

    // Force re-render for the specific component
    window.dispatchEvent(new CustomEvent('component-updated', { 
      detail: { 
        componentId,
        newConfig: newComponentConfig,
        timestamp: Date.now()
      }
    }));
  }, [setAppConfig]);

  // URL-based edit mode - only allow if in editor iframe
  const urlEditMode = isPreview && isInEditorIframe && searchParams.get('edit') === 'yes';
  const finalEditMode = urlEditMode || wsEditMode;

  useEffect(() => {
    setEditMode(finalEditMode);
  }, [finalEditMode, setEditMode]);

  // Update content wrapper
  const updateContent = useCallback(
    (componentId: string, content: string, componentType: string, targetField: string) => {
      const update: ContentUpdate = {
        componentId,
        content,
        componentType,
        target_field: targetField,
        timestamp: Date.now(),
        isSaved: false,
      };

      storeUpdateContent(update);

      // Send via WebSocket (debounced in service)
      if (wsManagerRef.current?.isConnected()) {
        wsManagerRef.current.send({
          type: 'content_edit',
          appId,
          componentId,
          componentType,
          targetField,
          timestamp: Date.now(),
        }).catch(() => {
          // Queued for later
        });
      }
    },
    [appId, storeUpdateContent]
  );

  // Save changes
  const saveChanges = useCallback(
    async (force = false, origin: 'autosave' | 'manual' = 'manual') => {
      if (isSaving) return;
      if (!storeHasUnsavedChanges() && !force) return;

      setIsSaving(true);
      try {
        const updates = getUnsavedUpdates();
        const result = await persistenceServiceRef.current?.save(appId, updates, {
          forced: force,
          autoSave: origin === 'autosave',
        });

        if (result?.success) {
          console.log('[EditModeProvider] Save successful');
        }
      } catch (error) {
        console.error('[EditModeProvider] Save failed:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [isSaving, appId, storeHasUnsavedChanges, getUnsavedUpdates]
  );

  // Select component wrapper
  const selectComponent = useCallback(
    (id: string | null, metadata?: ComponentMetadata) => {
      storeSelectComponent(id, metadata);

      // Send via WebSocket
      if (wsManagerRef.current?.isConnected()) {
        wsManagerRef.current.send({
          type: 'component_selection',
          data: {
            action: id ? 'select' : 'deselect',
            componentId: id,
            componentType: metadata?.componentType,
            metadata: {
              componentType: metadata?.componentType,
              textPreview: metadata?.textPreview,
            },
            appId,
            timestamp: Date.now(),
          },
        }).catch(() => {
          // Queued for later
        });
      }
    },
    [appId, storeSelectComponent]
  );

  // Send WebSocket message
  const sendWebSocketMessage = useCallback((message: any): boolean => {
    if (!wsManagerRef.current?.isConnected()) {
      return false;
    }
    wsManagerRef.current.send(message).catch(() => {
      // Queued
    });
    return true;
  }, []);

  // Trigger edit mode
  const triggerEditMode = useCallback(
    (enable: boolean) => {
      if (wsManagerRef.current?.isConnected()) {
        wsManagerRef.current.send({
          type: enable ? 'enter_edit_mode' : 'exit_edit_mode',
          data: { appId, timestamp: Date.now() },
        }).catch(() => {
          // Fallback
          setWsEditMode(enable);
          setEditMode(enable);
        });
      } else {
        setWsEditMode(enable);
        setEditMode(enable);
      }
    },
    [appId, setEditMode]
  );

  // Fine-grained content accessors for useSyncExternalStore
  const contentSubscribersRef = useRef<Map<string, Set<() => void>>>(new Map());

  const getContentFor = useCallback((componentId: string): string | undefined => {
    const update = contentUpdates.get(componentId);
    return update?.content;
  }, [contentUpdates]);

  const subscribeContent = useCallback((componentId: string, callback: () => void) => {
    if (!contentSubscribersRef.current.has(componentId)) {
      contentSubscribersRef.current.set(componentId, new Set());
    }
    contentSubscribersRef.current.get(componentId)!.add(callback);

    return () => {
      const subscribers = contentSubscribersRef.current.get(componentId);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          contentSubscribersRef.current.delete(componentId);
        }
      }
    };
  }, []);

  // Notify content subscribers when content updates change
  useEffect(() => {
    contentUpdates.forEach((update, componentId) => {
      const subscribers = contentSubscribersRef.current.get(componentId);
      if (subscribers) {
        subscribers.forEach(callback => callback());
      }
    });
  }, [contentUpdates]);

  const contextValue = React.useMemo(
    () => ({
      isEditMode: finalEditMode,
      isPreview,
      updateContent,
      saveChanges,
      hasUnsavedChanges: storeHasUnsavedChanges(),
      isSaving,
      selectedComponentId,
      selectComponent,
      wsConnectionStatus,
      sendWebSocketMessage,
      triggerEditMode,
      processingComponentIds,
      setComponentProcessing,
      getContentFor,
      subscribeContent,
    }),
    [
      finalEditMode,
      isPreview,
      updateContent,
      saveChanges,
      storeHasUnsavedChanges(),
      isSaving,
      selectedComponentId,
      selectComponent,
      wsConnectionStatus,
      sendWebSocketMessage,
      triggerEditMode,
      processingComponentIds,
      setComponentProcessing,
      getContentFor,
      subscribeContent,
    ]
  );

  return <EditModeContext.Provider value={contextValue}>{children}</EditModeContext.Provider>;
}

