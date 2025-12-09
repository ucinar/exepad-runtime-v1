'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { WebAppProps } from '../interfaces/apps/webapp';
import { ComponentProps } from '../interfaces/components/common/core';

interface ComponentUpdate {
  componentId: string;
  lastUpdatedEpoch: number;
  componentData?: ComponentProps;
  timestamp: number;
}

interface ConfigUpdateContextType {
  appConfig: WebAppProps | null;
  setAppConfig: (config: WebAppProps) => void;
  getComponent: (componentId: string) => ComponentProps | undefined;
  subscribeToComponent: (componentId: string, callback: (component: ComponentProps) => void) => () => void;
  handlePartialUpdate: (updates: ComponentUpdate[]) => void;
  getComponentEpoch: (componentId: string) => number | undefined;
}

const ConfigUpdateContext = createContext<ConfigUpdateContextType>({
  appConfig: null,
  setAppConfig: () => {},
  getComponent: () => undefined,
  subscribeToComponent: () => () => {},
  handlePartialUpdate: () => {},
  getComponentEpoch: () => undefined,
});

export const useConfigUpdate = () => useContext(ConfigUpdateContext);

interface ConfigUpdateProviderProps {
  children: React.ReactNode;
  initialConfig: WebAppProps | null;
}

export function ConfigUpdateProvider({ children, initialConfig }: ConfigUpdateProviderProps) {
  const [appConfig, setAppConfigState] = useState<WebAppProps | null>(initialConfig);
  
  // Map of component UUIDs to their data for quick lookup
  const componentMapRef = useRef<Map<string, ComponentProps>>(new Map());
  
  // Subscribers for component updates
  const subscribersRef = useRef<Map<string, Set<(component: ComponentProps) => void>>>(new Map());

  // Build component map when config changes
  useEffect(() => {
    if (!appConfig) return;

    const newComponentMap = new Map<string, ComponentProps>();
    
    // Helper function to traverse and index all components
    const indexComponents = (items: any[] | undefined) => {
      if (!items || !Array.isArray(items)) return;
      
      for (const item of items) {
        if (item && typeof item === 'object') {
          // If this is a component with uuid, add it to the map
          if (item.uuid && item.componentType) {
            newComponentMap.set(item.uuid, item as ComponentProps);
          }
          
          // Recursively check nested structures
          Object.values(item).forEach(value => {
            if (Array.isArray(value)) {
              indexComponents(value);
            } else if (value && typeof value === 'object' && value.uuid && value.componentType) {
              newComponentMap.set(value.uuid, value as ComponentProps);
            }
          });
        }
      }
    };

    // Index all components from different parts of the config
    indexComponents(appConfig.header);
    indexComponents(appConfig.footer);
    indexComponents(appConfig.sidebar);
    
    // Index components from all pages
    if (appConfig.pages) {
      for (const page of appConfig.pages) {
        if ('content' in page && Array.isArray(page.content)) {
          indexComponents(page.content);
        }
      }
    }

    componentMapRef.current = newComponentMap;
    console.log(`[ConfigUpdateContext] Indexed ${newComponentMap.size} components`);
  }, [appConfig]);

  const setAppConfig = useCallback((config: WebAppProps) => {
    setAppConfigState(config);
  }, []);

  const getComponent = useCallback((componentId: string): ComponentProps | undefined => {
    return componentMapRef.current.get(componentId);
  }, []);

  const getComponentEpoch = useCallback((componentId: string): number | undefined => {
    const component = componentMapRef.current.get(componentId);
    return component?.lastUpdatedEpoch;
  }, []);

  const subscribeToComponent = useCallback(
    (componentId: string, callback: (component: ComponentProps) => void) => {
      if (!subscribersRef.current.has(componentId)) {
        subscribersRef.current.set(componentId, new Set());
      }
      subscribersRef.current.get(componentId)!.add(callback);

      // Return unsubscribe function
      return () => {
        const subscribers = subscribersRef.current.get(componentId);
        if (subscribers) {
          subscribers.delete(callback);
          if (subscribers.size === 0) {
            subscribersRef.current.delete(componentId);
          }
        }
      };
    },
    []
  );

  const notifySubscribers = useCallback((componentId: string, component: ComponentProps) => {
    const subscribers = subscribersRef.current.get(componentId);
    if (subscribers && subscribers.size > 0) {
      subscribers.forEach(callback => {
        try {
          callback(component);
        } catch (error) {
          console.error(`[ConfigUpdateContext] Error in subscriber callback for ${componentId}:`, error);
        }
      });
    }
  }, []);

  const handlePartialUpdate = useCallback((updates: ComponentUpdate[]) => {
    if (!appConfig) {
      console.warn('[ConfigUpdateContext] No app config available for partial update');
      return;
    }

    console.log(`[ConfigUpdateContext] ============ PARTIAL UPDATE START ============`);
    console.log(`[ConfigUpdateContext] Processing ${updates.length} component update(s)`);
    
    let configChanged = false;
    const updatedComponents = new Map<string, ComponentProps>();

    // Process each update
    for (const update of updates) {
      const { componentId, lastUpdatedEpoch, componentData } = update;
      console.log(`[ConfigUpdateContext] Processing update for component:`, componentId);
      
      const currentComponent = componentMapRef.current.get(componentId);

      if (!currentComponent) {
        console.warn(`[ConfigUpdateContext] ❌ Component ${componentId} not found in config`);
        continue;
      }

      const currentEpoch = currentComponent.lastUpdatedEpoch || 0;
      
      // Check if update is newer
      if (lastUpdatedEpoch > currentEpoch) {
        console.log(
          `[ConfigUpdateContext] ✅ Component ${componentId} updated: epoch ${currentEpoch} -> ${lastUpdatedEpoch}`
        );

        // Merge the update with existing component data
        const updatedComponent: ComponentProps = componentData 
          ? { ...currentComponent, ...componentData, lastUpdatedEpoch }
          : { ...currentComponent, lastUpdatedEpoch };

        updatedComponents.set(componentId, updatedComponent);
        configChanged = true;
      } else {
        console.log(
          `[ConfigUpdateContext] ⏭️  Component ${componentId} skipped: epoch ${lastUpdatedEpoch} not newer than ${currentEpoch}`
        );
      }
    }

    if (!configChanged) {
      console.log('[ConfigUpdateContext] ⚠️  No components needed updating');
      console.log(`[ConfigUpdateContext] ============ PARTIAL UPDATE END (NO CHANGES) ============`);
      return;
    }

    console.log(`[ConfigUpdateContext] 🔄 Updating ${updatedComponents.size} component(s) in config`);

    // Create a new config with updated components
    const updateComponentsInStructure = (items: any[]): any[] => {
      return items.map(item => {
        if (!item || typeof item !== 'object') return item;

        // If this item has a uuid that needs updating
        if (item.uuid && updatedComponents.has(item.uuid)) {
          const updated = updatedComponents.get(item.uuid)!;
          console.log(`[ConfigUpdateContext]   → Updating component in structure: ${item.uuid}`);
          // Recursively update nested components
          const result = { ...updated };
          Object.keys(result).forEach(key => {
            if (Array.isArray(result[key])) {
              result[key] = updateComponentsInStructure(result[key]);
            }
          });
          return result;
        }

        // Recursively update nested structures
        const result = { ...item };
        Object.keys(result).forEach(key => {
          if (Array.isArray(result[key])) {
            result[key] = updateComponentsInStructure(result[key]);
          }
        });
        return result;
      });
    };

    // Update the config
    const newConfig: WebAppProps = {
      ...appConfig,
      header: updateComponentsInStructure(appConfig.header),
      footer: updateComponentsInStructure(appConfig.footer),
      sidebar: updateComponentsInStructure(appConfig.sidebar),
      pages: appConfig.pages.map(page => {
        if ('content' in page && Array.isArray(page.content)) {
          return {
            ...page,
            content: updateComponentsInStructure(page.content),
          };
        }
        return page;
      }),
    };

    // Update the config state
    setAppConfigState(newConfig);
    console.log(`[ConfigUpdateContext] ✅ Config state updated`);

    // Notify subscribers of the updated components
    updatedComponents.forEach((component, componentId) => {
      console.log(`[ConfigUpdateContext] 📢 Notifying subscribers for component: ${componentId}`);
      notifySubscribers(componentId, component);
    });

    console.log(`[ConfigUpdateContext] ✅ Updated ${updatedComponents.size} component(s) and notified subscribers`);
    console.log(`[ConfigUpdateContext] ============ PARTIAL UPDATE END (SUCCESS) ============`);
  }, [appConfig, notifySubscribers]);

  const contextValue = React.useMemo(
    () => ({
      appConfig,
      setAppConfig,
      getComponent,
      subscribeToComponent,
      handlePartialUpdate,
      getComponentEpoch,
    }),
    [appConfig, setAppConfig, getComponent, subscribeToComponent, handlePartialUpdate, getComponentEpoch]
  );

  return (
    <ConfigUpdateContext.Provider value={contextValue}>
      {children}
    </ConfigUpdateContext.Provider>
  );
}

