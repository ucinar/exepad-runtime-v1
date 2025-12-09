/**
 * Runtime Providers
 * Conditional provider mounting based on runtime mode
 * 
 * This is the key to decoupling published and preview modes:
 * - Published mode: Only minimal AppContext
 * - Preview mode (in iframe): Full provider stack with edit capabilities
 * - Preview mode (new tab): Minimal providers only (read-only)
 */

'use client';

import dynamic from 'next/dynamic';
import { ReactNode, useState, useEffect } from 'react';
import { RuntimeMode } from '../RuntimeMode';
import { AppContextProvider } from '@/context/AppContext';
import { WebAppProps } from '@/app_runtime/interfaces/apps/webapp';

// Lazy load preview-only providers (will be tree-shaken in published builds)
const PreviewProviders = dynamic(() => import('./PreviewProviders'), {
  ssr: false,
  loading: () => <div>Loading preview features...</div>,
});

/**
 * Check if we're running inside an iframe (the editor embeds preview in iframe)
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

interface RuntimeProvidersProps {
  mode: RuntimeMode;
  appId: string;
  appConfig: WebAppProps;
  basePath: string;
  children: ReactNode;
}

/**
 * RuntimeProviders - Conditionally mount providers based on mode
 * 
 * Published mode: Minimal providers only
 * Preview mode (in iframe): Full feature set with edit capabilities
 * Preview mode (new tab): Minimal providers only (read-only)
 */
export function RuntimeProviders({
  mode,
  appId,
  appConfig,
  basePath,
  children,
}: RuntimeProvidersProps) {
  // Check if we're in the editor iframe - initialize as false to match SSR
  const [isInEditorIframe, setIsInEditorIframe] = useState(false);
  
  // Update after hydration to avoid mismatch
  useEffect(() => {
    setIsInEditorIframe(getIsInEditorIframe());
  }, []);
  
  // Always provide AppContext (minimal, shared between both modes)
  return (
    <AppContextProvider basePath={basePath} mode={mode}>
      {mode === 'preview' && isInEditorIframe ? (
        // Only load preview providers when in preview mode AND inside the editor iframe
        // This prevents loading heavy edit components when preview is opened in a new tab
        <PreviewProviders appId={appId} appConfig={appConfig}>
          {children}
        </PreviewProviders>
      ) : (
        // Published mode OR preview in new tab: no extra providers, minimal overhead
        children
      )}
    </AppContextProvider>
  );
}

