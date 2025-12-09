/**
 * Base App Page Renderer
 * Shared component for rendering static apps (demo, example routes)
 * Handles theme, fonts, and layout rendering with minimal duplication
 * Uses unified font loading utilities
 */

import React from 'react';
import DynamicTheme from '@/components/DynamicTheme';
import DynamicFontLoader from '@/components/DynamicFontLoader';
import FontVariables from '@/components/FontVariables';
import { AppContextProvider } from '@/context/AppContext';
import AppRenderer from '@/components/AppRenderer';
import { WebAppProps } from '@/interfaces/apps/webapp';
import { PageProps as AppPageProps } from '@/interfaces/apps/page';

interface BaseAppPageRendererProps {
  appConfig: WebAppProps;
  currentPage: AppPageProps;
  appId: string;
  basePath: string;
}

/**
 * Shared renderer for static app routes
 * Used by /demo and /example routes
 */
export default function BaseAppPageRenderer({
  appConfig,
  currentPage,
  appId,
  basePath,
}: BaseAppPageRendererProps) {
  return (
    <>
      {/* Theme components - rendered at page level */}
      {appConfig.theme && <DynamicTheme theme={appConfig.theme} />}
      {appConfig.theme?.fonts && <DynamicFontLoader fonts={appConfig.theme.fonts} />}

      {/* Inject font CSS variables using unified component */}
      {appConfig.theme?.fonts && <FontVariables fonts={appConfig.theme.fonts} />}

      {/* Provide basePath for navigation */}
      <AppContextProvider basePath={basePath}>
        {/* AppRenderer handles header, footer, and content */}
        <AppRenderer appConfig={appConfig} cleanAppId={appId} pageId={currentPage.uuid} />
      </AppContextProvider>
    </>
  );
}
