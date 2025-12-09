// src/components/DynamicRenderer.tsx

/**
 * Core Renderer Engine
 * Takes a Component configuration and renders it.
 * This version uses a more robust, explicit rendering strategy.
 */

"use client"

import React, { Suspense, lazy } from 'react';
import { getLayoutClasses } from '../utils/layoutPatterns';
import type { LayoutOption } from '@/app_runtime/interfaces/apps/core';
import { ComponentProps } from '@/app_runtime/interfaces/components/common/core';
import { getComponent } from '../registry';
import { areComponentsEqual } from '../utils/componentComparison';
// Correctly import ErrorBoundary as a default export
import ErrorBoundary from '@/app_runtime/runtime/components/custom/website/utils/ErrorBoundary';
import { useEditMode } from '../context/EditModeContext';
import { useConfigUpdate } from '../context/ConfigUpdateContext';
import { getEditableComponent, isEditableComponent } from './editable/editableRegistry';
import { ComponentWrapper } from './editable/ComponentWrapper';

interface DynamicRendererProps {
  /** Component configuration to render */
  component: ComponentProps;
  pageLayout?: LayoutOption; // Layout inherited from page
  children?: React.ReactNode; // Allow children to be passed
  isInHeader?: boolean; // Whether this component is being rendered inside a header context
}

// A mock registry for event handlers.
const eventHandlers: Record<string, (arg: string) => (...args: any[]) => void> = {
  showAlert: (message: string) => () => alert(message || 'Alert!'),
  consoleLog: (message: string) => () => console.log(message || 'Logged from event handler.'),
  navigate: (path: string) => () => { if(path) window.location.href = path; },
};

/**
 * Maps string identifiers from the JSON config to actual event handler functions.
 * @param props The props object for a component.
 * @returns A new props object with event handler strings replaced by functions.
 */
const mapEventHandlers = (props: any): any => {
    const eventProps = ['onClick', 'onSubmit', 'onChange', 'onFocus', 'onBlur']; // A more complete list
    const mappedProps = { ...props };
    for (const eventProp of eventProps) {
        if (mappedProps[eventProp] && typeof mappedProps[eventProp] === 'string') {
            const handlerName = mappedProps[eventProp];
            if (eventHandlers[handlerName]) {
                // The handler is created, but no arguments are passed from the JSON yet.
                mappedProps[eventProp] = eventHandlers[handlerName]('');
            } else {
                // If the handler is not found, remove the prop to avoid errors.
                console.warn(`[mapEventHandlers] Event handler "${handlerName}" not found for prop "${eventProp}".`);
                delete mappedProps[eventProp];
            }
        }
    }
    return mappedProps;
};

/**
 * A fallback component displayed when a component type is not found or fails to load.
 */
export const ComponentFallback: React.FC<{ componentType: string; classes?: string }> = ({
  componentType,
  classes
}) => (
  <div className={`p-4 border border-red-300 bg-red-50 text-red-700 rounded ${classes || ''}`}>
    <p className="font-semibold">Component not found: {componentType}</p>
    <p className="text-sm">This component type is not registered or failed to load.</p>
  </div>
);

/**
 * The inner rendering logic, wrapped for memoization.
 */
const DynamicRendererInner: React.FC<DynamicRendererProps> = ({
  component, pageLayout, children, isInHeader
}) => {
  // Get edit mode state
  const { isEditMode } = useEditMode();
  
  // Get config update context for hot reload
  const { subscribeToComponent } = useConfigUpdate();
  
  // Track render key for forcing updates
  const [renderKey, setRenderKey] = React.useState(0);
  
  // Track the current component data (may be updated via hot reload)
  const [currentComponent, setCurrentComponent] = React.useState(component);
  
  // Track if component is deleted
  const [isDeleted, setIsDeleted] = React.useState(false);

  const { componentType, ...props } = currentComponent;

  // Handle cases where the component data is invalid.
  if (!componentType) {
    console.error(`[DynamicRenderer] Received component without componentType:`, currentComponent);
    return <ComponentFallback componentType="undefined" classes={(props as any).classes} />;
  }

  // Determine if we have an editable version and whether we should always use it
  const EditableComp = isEditableComponent(componentType) ? getEditableComponent(componentType) : null;
  const useEditableAlways = !!EditableComp && (componentType === 'TextProps' || componentType === 'HeadingProps');

  // Async-loaded runtime component state (only used when not using editable always)
  const [ReactComponent, setReactComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = React.useState(!useEditableAlways);
  const [error, setError] = React.useState<string | null>(null);

  // Subscribe to component updates for hot reload (only in edit mode)
  React.useEffect(() => {
    // Only subscribe if we're in edit mode and have a valid uuid
    // This prevents unnecessary subscriptions in read-only mode (new tab)
    if (!component.uuid || !isEditMode) return;
    
    console.log(`[DynamicRenderer] Subscribing to updates for component ${component.uuid}`);
    
    const unsubscribe = subscribeToComponent(component.uuid, (updatedComponent) => {
      console.log(`[DynamicRenderer] Component ${component.uuid} received update, applying new data`);
      // Update the component data with the new data from ConfigUpdateContext
      setCurrentComponent(updatedComponent);
      setRenderKey(k => k + 1);
    });
    
    return unsubscribe;
  }, [component.uuid, subscribeToComponent, isEditMode]);
  
  // Listen for direct component update events (for hot reload)
  React.useEffect(() => {
    if (!component.uuid) return;
    
    const handleComponentUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.componentId === component.uuid) {
        console.log(`[DynamicRenderer] Force re-render for component ${component.uuid}`);
        
        // Handle removal
        if (customEvent.detail?.changeType === 'remove') {
          console.log(`[DynamicRenderer] Component ${component.uuid} removed, unmounting`);
          setIsDeleted(true);
          return;
        }
        
        // Update component data directly if provided in event
        if (customEvent.detail.newConfig) {
          setCurrentComponent(customEvent.detail.newConfig);
        }
        
        // Force re-render by incrementing key
        setRenderKey(k => k + 1);
      }
    };
    
    window.addEventListener('component-updated', handleComponentUpdate);
    return () => window.removeEventListener('component-updated', handleComponentUpdate);
  }, [component.uuid]);
  
  // Update currentComponent when component prop changes
  React.useEffect(() => {
    setCurrentComponent(component);
  }, [component]);

  // Load async component only when needed
  React.useEffect(() => {
    if (useEditableAlways) return; // Skip loading when using editable version always
    let isMounted = true;
    const loadComponent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const loadedComp = await getComponent(componentType);
        if (isMounted) {
          if (loadedComp) {
            setReactComponent(() => loadedComp);
          } else {
            setError(`Component type "${componentType}" not found in registry.`);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(`Failed to load component ${componentType}: ${err.message}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadComponent();
    return () => { isMounted = false; };
  }, [componentType, useEditableAlways]);

  // If deleted, do not render anything
  if (isDeleted) {
    return null;
  }

  // Display a loading skeleton while the component is being fetched (only for non-editable path)
  if (!useEditableAlways && isLoading) {
    return <div className="animate-pulse bg-gray-200 rounded h-8 w-32" />;
  }

  // If loading failed or the component is not found, show the fallback UI.
  if (!useEditableAlways && (error || !ReactComponent)) {
    return <ComponentFallback componentType={componentType} classes={(props as any).classes} />;
  }

  // Prepare props and decide FinalComponent
  const baseComponentProps = currentComponent.componentType === 'NavbarProps' 
    ? { ...currentComponent, pageLayout, asWrapper: !isInHeader }
    : currentComponent;

  // Extract uuid separately for ComponentWrapper reference
  const { uuid, componentType: _, ...cleanProps } = baseComponentProps;

  const FinalComponent = useEditableAlways ? (EditableComp as React.ComponentType<any>) : (ReactComponent as React.ComponentType<any>);

  // Prepare final props - always include uuid for components that need it (like FormProps)
  const finalProps = { ...cleanProps, uuid };

  const content = (
    <ErrorBoundary fallbackUI={<ComponentFallback componentType={componentType} classes={(props as any).classes} />}>
      <FinalComponent key={`${uuid}-${renderKey}`} {...finalProps}>
        {children}
      </FinalComponent>
    </ErrorBoundary>
  );

  // Always render ComponentWrapper when we have a uuid to keep the tree shape stable
  if (uuid) {
    return (
      <ComponentWrapper 
        componentId={uuid} 
        componentType={componentType}
      >
        {content}
      </ComponentWrapper>
    );
  }

  // Regular rendering when no uuid (non-selectable)
  return content;
};

// Memoize the renderer to prevent unnecessary re-renders.
export const DynamicRenderer = React.memo(DynamicRendererInner);

/**
 * A helper component to render a list of components.
 */
const DynamicRendererListInner: React.FC<{
  components: ComponentProps[];
  className?: string;
  pageLayout?: LayoutOption;
  mainContent?: React.ReactNode; // Renamed for clarity
  isInHeader?: boolean; // Whether these components are being rendered inside a header context
}> = ({ components, className, pageLayout, mainContent, isInHeader }) => {
  if (!components || !Array.isArray(components) || components.length === 0) {
    return null;
  }

  const renderComponent = (component: ComponentProps, index: number) => (
    <DynamicRenderer
      key={component.uuid || `${component.componentType}-${index}`}
      component={component}
      pageLayout={pageLayout}
      isInHeader={isInHeader}
    >
      {component.componentType === 'SidebarProps' ? mainContent : undefined}
    </DynamicRenderer>
  );

  // If there's only one component, render it directly without a wrapper div.
  // This is crucial for layout components like Sidebar to work correctly.
  if (components.length === 1 && !className) {
    return renderComponent(components[0], 0);
  }

  return (
    <div className={className}>
      {components.map(renderComponent)}
    </div>
  );
};

// Memoized version of DynamicRendererList to prevent unnecessary re-renders
// Uses optimized epoch-based comparison instead of expensive JSON.stringify
export const DynamicRendererList = React.memo(DynamicRendererListInner, (prevProps, nextProps) => {
  // Fast comparison using epoch-based detection
  return (
    prevProps.className === nextProps.className &&
    prevProps.pageLayout === nextProps.pageLayout &&
    prevProps.isInHeader === nextProps.isInHeader &&
    prevProps.mainContent === nextProps.mainContent &&
    areComponentsEqual(prevProps.components, nextProps.components)
  );
});

export default DynamicRenderer;
