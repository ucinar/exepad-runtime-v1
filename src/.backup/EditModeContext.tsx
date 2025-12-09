'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWebSocket } from '../hooks/useWebSocket';
import { useConfigUpdate } from './ConfigUpdateContext';
import { fetchAppConfig, compareConfigs } from '../lib/configFetcher';

interface ContentUpdate {
  componentId: string;
  content: string;
  componentType: string;
  target_field: string;
  timestamp: number;
  isSaved?: boolean;
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
  wsConnectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  sendWebSocketMessage: (message: { type: string; data?: any; [key: string]: any }) => boolean;
  triggerEditMode: (enable: boolean) => void;
  flushEditMessage: (componentId: string) => void;
  // New: fine-grained content accessors to avoid global rerenders
  getContentFor: (componentId: string) => string | undefined;
  subscribeContent: (componentId: string, callback: () => void) => () => void;
  // Processing state for AI modifications
  processingComponentIds: Set<string>;
  setComponentProcessing: (componentId: string, isProcessing: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
  isPreview: false,
  updateContent: () => {},
  saveChanges: async (force?: boolean) => {},
  hasUnsavedChanges: false,
  isSaving: false,
  selectedComponentId: null,
  selectComponent: () => {},
  wsConnectionStatus: 'disconnected',
  sendWebSocketMessage: () => false,
  triggerEditMode: () => {},
  flushEditMessage: () => {},
  getContentFor: () => undefined,
  subscribeContent: () => () => {},
  processingComponentIds: new Set(),
  setComponentProcessing: () => {},
});

export const useEditMode = () => useContext(EditModeContext);

interface EditModeProviderProps {
  children: React.ReactNode;
  isPreview: boolean;
  appId: string;
}

export function EditModeProvider({ children, isPreview, appId }: EditModeProviderProps) {
  const searchParams = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [previousComponentId, setPreviousComponentId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Track components being processed by AI
  const [processingComponentIds, setProcessingComponentIds] = useState<Set<string>>(new Set());
  
  // In-memory content updates to avoid provider rerenders on each keystroke
  const contentUpdatesRef = useRef<Record<string, ContentUpdate>>({});
  const subscribersRef = useRef<Record<string, Set<() => void>>>({});
  const dirtyNotifiedRef = useRef<Record<string, boolean>>({});
  
  // Add state for websocket-triggered edit mode
  const [wsEditMode, setWsEditMode] = useState(false);
  
  // Debounce refs for websocket messaging
  const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const lastSentContent = useRef<Record<string, string>>({});
  
  // Edit mode can be triggered by URL parameter OR websocket message
  const urlEditMode = isPreview && searchParams.get('edit') === 'yes';
  const isEditMode = urlEditMode || wsEditMode;

  // Get config update context
  const { appConfig, handlePartialUpdate, setAppConfig } = useConfigUpdate();

  // Function to set component processing state
  const setComponentProcessing = useCallback((componentId: string, isProcessing: boolean) => {
    setProcessingComponentIds(prev => {
      const newSet = new Set(prev);
      if (isProcessing) {
        newSet.add(componentId);
      } else {
        newSet.delete(componentId);
      }
      return newSet;
    });
  }, []);

  // Function to fetch and apply partial config updates
  const fetchAndApplyPartialUpdate = useCallback(async () => {
    try {
      console.log('[EditModeContext] Fetching updated config for hot reload...');
      
      // Fetch new config from backend
      const newConfig = await fetchAppConfig(appId, 'preview');
      
      if (!newConfig) {
        console.error('[EditModeContext] Failed to fetch new config');
        return;
      }

      // Compare with current config to find changed components
      const updates = compareConfigs(appConfig, newConfig);
      
      if (updates.length > 0) {
        console.log(`[EditModeContext] Applying ${updates.length} component update(s) via hot reload`);
        handlePartialUpdate(updates);
      } else {
        console.log('[EditModeContext] No component changes detected, updating config only');
        // Update config anyway to ensure we have latest data
        setAppConfig(newConfig);
      }
    } catch (error) {
      console.error('[EditModeContext] Error during partial update:', error);
    }
  }, [appId, appConfig, handlePartialUpdate, setAppConfig]);

  // Function to update URL edit parameter
  const updateUrlEditMode = (shouldEdit: boolean) => {
    const currentUrl = new URL(window.location.href);
    if (shouldEdit) {
      currentUrl.searchParams.set('edit', 'yes');
    } else {
      currentUrl.searchParams.delete('edit');
    }
    // Update URL without reloading page
    window.history.replaceState({}, '', currentUrl.toString());
  };

  // WebSocket integration - now connects for all preview pages
  const {
    connectionStatus: wsConnectionStatus,
    sendMessage: sendWebSocketMessage,
    isConnected: wsConnected,
  } = useWebSocket({
    shouldConnect: isPreview, // Connect for all preview pages, not just edit mode
    appUuid: appId,
    onMessage: (message) => {
      console.log('Received WebSocket message:', message);
      
      // Handle edit mode control messages
      switch (message.type) {
        case 'enter_edit_mode':
          console.log('WebSocket triggered: entering edit mode');
          setWsEditMode(true);
          // Optionally update URL for consistency
          updateUrlEditMode(true);
          break;
          
        case 'exit_edit_mode':
          console.log('WebSocket triggered: exiting edit mode');
          setWsEditMode(false);
          // Update URL for consistency
          updateUrlEditMode(false);
          // Keep in-memory edited content so the preview remains updated without reload
          setSelectedComponentId(null);
          setHasUnsavedChanges(false);
          break;
          
        case 'save_changes':
          console.log('WebSocket triggered: save changes');
          const origin = (message?.data && message.data.reason === 'autosave') ? 'autosave' : 'manual';
          if (hasUnsavedChanges && !isSaving) {
            console.log('Triggering save operation...');
            saveChanges(false, origin);
          } else if (isSaving) {
            console.log('Save already in progress, skipping');
          } else {
            console.log('No unsaved changes detected - forcing save anyway to ensure backend sync');
            saveChanges(true, origin); // Force save
          }
          break;
          
        case 'app_config_updated':
          console.log('WebSocket triggered: app config updated');
          // Check if full reload is required
          const reloadApp = message.reload_app || message.data?.reload_app;
          
          if (reloadApp) {
            console.log('[EditModeContext] Full reload required for structural changes');
            window.location.reload();
          } else {
            console.log('[EditModeContext] Performing hot reload for component updates');
            fetchAndApplyPartialUpdate();
            
            // Clear processing state for all components
            setProcessingComponentIds(new Set());
            
            // Deselect component after update
            setSelectedComponentId(null);
          }
          break;
          
        case 'component_processing':
          const { componentId: processingId, isProcessing } = message.data || {};
          if (processingId) {
            console.log(`[EditModeContext] Component ${processingId} processing state: ${isProcessing}`);
            setComponentProcessing(processingId, isProcessing);
          }
          break;
          
        default:
          // Handle other message types as needed
          break;
      }
    },
    onConnect: () => {
      console.log('WebSocket connected successfully');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
  });

  // New: fine-grained subscription helpers
  const notifySubscribers = useCallback((componentId: string) => {
    const set = subscribersRef.current[componentId];
    if (set) {
      // Copy to array to avoid issues if a callback unsubscribes during iteration
      Array.from(set).forEach(cb => {
        try { cb(); } catch {}
      });
    }
  }, []);

  const subscribeContent = useCallback((componentId: string, callback: () => void) => {
    if (!subscribersRef.current[componentId]) {
      subscribersRef.current[componentId] = new Set();
    }
    subscribersRef.current[componentId].add(callback);
    return () => {
      const set = subscribersRef.current[componentId];
      if (set) {
        set.delete(callback);
        if (set.size === 0) delete subscribersRef.current[componentId];
      }
    };
  }, []);

  const getContentFor = useCallback((componentId: string) => {
    return contentUpdatesRef.current[componentId]?.content;
  }, []);

  // Debounced websocket message sender with smart filtering
  const sendDebouncedEditMessage = useCallback((
    componentId: string, 
    content: string, 
    componentType: string, 
    targetField: string,
    timestamp: number
  ) => {
    // Clear existing timeout for this component
    if (debounceTimeouts.current[componentId]) {
      clearTimeout(debounceTimeouts.current[componentId]);
    }
    
    // Set new timeout to send message after 2 seconds of no further edits
    debounceTimeouts.current[componentId] = setTimeout(() => {
      // Only send if content has actually changed and meets minimum requirements
      const lastContent = lastSentContent.current[componentId];
      const contentChanged = lastContent !== content;
      const hasMinimumContent = content && content.trim().length > 2; // At least 3 characters
      
      if (wsConnected && isEditMode && contentChanged && hasMinimumContent) {
        sendWebSocketMessage({
          type: 'content_edit',
          appId,
          componentId,
          componentType,
          targetField,
          timestamp,
          editType: 'content_update'
        });
        
        // Remember the content we just sent
        lastSentContent.current[componentId] = content;
      }
      
      // Clean up the timeout reference
      delete debounceTimeouts.current[componentId];
    }, 2000);
  }, [wsConnected, isEditMode, appId, sendWebSocketMessage]);

  const updateContent = useCallback((componentId: string, content: string, componentType: string, targetField: string) => {
    const timestamp = Date.now();
    
    // Update in-memory store
    contentUpdatesRef.current[componentId] = {
      componentId,
      content,
      componentType,
      target_field: targetField,
      timestamp,
      isSaved: false,
    };

    setHasUnsavedChanges(true);

    // Immediately notify dashboard to enable Save button on first keystroke
    if (wsConnected && isEditMode && !dirtyNotifiedRef.current[componentId]) {
      try {
        sendWebSocketMessage({
          type: 'content_dirty',
          appId,
          componentId,
          componentType,
          targetField,
          timestamp,
          editType: 'content_update_dirty'
        });
        dirtyNotifiedRef.current[componentId] = true;
      } catch {}
    }

    // Notify subscribers of this specific component
    notifySubscribers(componentId);

    // Send debounced edit event via WebSocket
    sendDebouncedEditMessage(componentId, content, componentType, targetField, timestamp);
  }, [notifySubscribers, sendDebouncedEditMessage]);

  const saveChanges = useCallback(async (force = false, origin?: 'autosave' | 'manual') => {
    if (isSaving) {
      console.log('Save already in progress, skipping');
      return;
    }
    
    if (!hasUnsavedChanges && !force) {
      console.log('No unsaved changes and not forced, skipping save');
      return;
    }
    
    setIsSaving(true);
    try {
      // Get only unsaved updates to send
      const allUpdates = Object.values(contentUpdatesRef.current);
      const unsavedUpdates = allUpdates.filter(update => !update.isSaved);
      
      console.log('Saving changes:', {
        force,
        hasUnsavedChanges,
        updatesCount: unsavedUpdates.length,
        wsConnected
      });
      
      // Send WebSocket message with the changes (no API call)
      if (wsConnected) {
        sendWebSocketMessage({
          type: 'app_config_saved',
          data: {
            appId,
            updatesCount: unsavedUpdates.length,
            updates: unsavedUpdates,
            timestamp: Date.now(),
            forced: force,
            isAutoSaved: origin === 'autosave'
          },
        });
        
        console.log('app_config_saved message sent to backend');
      } else {
        console.log('WebSocket not connected, cannot send save message');
      }
      
      // Mark all updates as saved
      Object.keys(contentUpdatesRef.current).forEach(key => {
        contentUpdatesRef.current[key] = { ...contentUpdatesRef.current[key], isSaved: true };
      });
      setHasUnsavedChanges(false);
      dirtyNotifiedRef.current = {};
      
      console.log('Changes sent successfully via WebSocket');
    } catch (error) {
      console.error('Error sending changes:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, hasUnsavedChanges, wsConnected, sendWebSocketMessage, appId]);

  // Add helper function to manually trigger edit mode via websocket
  const triggerEditMode = useCallback((enable: boolean) => {
    if (wsConnected) {
      sendWebSocketMessage({
        type: enable ? 'enter_edit_mode' : 'exit_edit_mode',
        data: {
          appId,
          timestamp: Date.now(),
        },
      });
    } else {
      console.warn('Cannot trigger edit mode via websocket: not connected');
      // Fallback to direct state update if websocket not available
      setWsEditMode(enable);
      updateUrlEditMode(enable);

      // Auto-save on manual exit if there are unsaved changes
      if (!enable && hasUnsavedChanges && !isSaving) {
        saveChanges(true);
      }
    }
  }, [wsConnected, sendWebSocketMessage, appId, hasUnsavedChanges, isSaving, saveChanges]);

  // Component selection methods
  const selectComponent = useCallback((componentId: string | null, metadata?: ComponentMetadata) => {
    // If the selected component is the same, do nothing
    if (componentId === selectedComponentId) {
      return;
    }
    const previous = selectedComponentId;
    
    // Update selection state
    setSelectedComponentId(componentId);
    setPreviousComponentId(previous);
    
    // Determine action type
    let action = 'select';
    if (componentId === null) {
      action = 'deselect';
    } else if (previous !== null) {
      action = 'change';
    }
    
    // Send enhanced component selection message via WebSocket
    if (wsConnected) {
      sendWebSocketMessage({
        type: 'component_selection',
        data: {
          previousComponentId: previous,
          selectedComponentId: componentId,
          componentType: metadata?.componentType,
          textPreview: metadata?.textPreview,
          appId,
          action,
          timestamp: Date.now(),
        },
      });
    }
  }, [selectedComponentId, wsConnected, sendWebSocketMessage, appId]);

  // Function to immediately flush/send any pending edit message for a component
  const flushEditMessage = useCallback((componentId: string) => {
    // If there's a pending timeout, trigger it immediately
    if (debounceTimeouts.current[componentId]) {
      clearTimeout(debounceTimeouts.current[componentId]);
      delete debounceTimeouts.current[componentId];
      
      // Get the current content for this component
      const currentUpdate = contentUpdatesRef.current[componentId];
      if (currentUpdate && wsConnected && isEditMode) {
        const lastContent = lastSentContent.current[componentId];
        const contentChanged = lastContent !== currentUpdate.content;
        const hasMinimumContent = currentUpdate.content && currentUpdate.content.trim().length > 2;
        
        if (contentChanged && hasMinimumContent) {
          sendWebSocketMessage({
            type: 'content_edit',
            appId,
            componentId,
            componentType: currentUpdate.componentType,
            targetField: currentUpdate.target_field,
            timestamp: currentUpdate.timestamp,
            editType: 'content_update_immediate'
          });
          
          // Remember the content we just sent
          lastSentContent.current[componentId] = currentUpdate.content;
        }
      }
    }
  }, [wsConnected, isEditMode, appId, sendWebSocketMessage]);

  // Cleanup timeouts and references on unmount
  useEffect(() => {
    return () => {
      // Clear all pending debounce timeouts
      Object.values(debounceTimeouts.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      debounceTimeouts.current = {};
      lastSentContent.current = {};
      subscribersRef.current = {};
    };
  }, []);

  // Stable wrapper to avoid recreating in context value
  const sendWs = useCallback((message: { type: string; data?: any; [key: string]: any }) => sendWebSocketMessage(message), [sendWebSocketMessage]);

  const contextValue = React.useMemo(() => ({
    isEditMode,
    isPreview,
    updateContent,
    saveChanges,
    hasUnsavedChanges,
    isSaving,
    selectedComponentId,
    selectComponent,
    wsConnectionStatus,
    sendWebSocketMessage: sendWs,
    triggerEditMode,
    flushEditMessage,
    getContentFor,
    subscribeContent,
    processingComponentIds,
    setComponentProcessing,
  }), [
    isEditMode,
    isPreview,
    updateContent,
    saveChanges,
    hasUnsavedChanges,
    isSaving,
    selectedComponentId,
    selectComponent,
    wsConnectionStatus,
    sendWs,
    triggerEditMode,
    flushEditMessage,
    getContentFor,
    subscribeContent,
    processingComponentIds,
    setComponentProcessing,
  ]);

  return (
    <EditModeContext.Provider value={contextValue}>
      {children}
    </EditModeContext.Provider>
  );
}
