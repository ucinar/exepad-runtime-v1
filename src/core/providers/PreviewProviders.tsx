/**
 * Preview Providers (Preview-Only)
 * Full provider stack for preview mode with editing capabilities
 * 
 * IMPORTANT: This file should only be imported in preview mode
 * It will be dynamically loaded and tree-shaken from published builds
 */

'use client';

import { ReactNode } from 'react';
import { ConfigUpdateProvider } from '@/context/ConfigUpdateContext';
import { EditModeProvider } from '@/context/EditModeContext';
import { WebAppProps } from '@/app_runtime/interfaces/apps/webapp';

interface PreviewProvidersProps {
  appId: string;
  appConfig: WebAppProps;
  children: ReactNode;
}

/**
 * PreviewProviders - Full provider stack for preview mode
 * 
 * Includes:
 * - ConfigUpdateProvider: Manages config updates and hot reload
 * - EditModeProvider: Manages edit mode state and WebSocket connection
 */
export default function PreviewProviders({
  appId,
  appConfig,
  children,
}: PreviewProvidersProps) {
  console.log('[PreviewProviders] Initializing preview mode providers');
  //console.log('[PreviewProviders] AppConfig:', appConfig);
  return (
    <ConfigUpdateProvider initialConfig={appConfig}>
      <EditModeProvider isPreview={true} appId={appId}>
        {children}
      </EditModeProvider>
    </ConfigUpdateProvider>
  );
}

