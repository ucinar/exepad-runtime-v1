/**
 * Published Page Component
 * Minimal, production-optimized rendering without edit features
 *
 * This component is used for deployed apps and should have:
 * - No WebSocket connection
 * - No Zustand store
 * - No edit mode components
 * - Minimal bundle size
 * - Server-side rendering
 * - Receives data as props (no fetching)
 */

import React from 'react';
import { redirect } from 'next/navigation';
import { DynamicRendererList } from '@/components/DynamicRenderer';
import { WebAppProps } from '@/interfaces/apps/webapp';
import { PageProps as AppPageProps } from '@/interfaces/apps/page';
import StaticHeaderLayout from '@/components/StaticHeaderLayout';
import { UnifiedErrorDisplay } from '@/app/_shared/components/AppErrorDisplay';

interface PublishedPageProps {
  appId: string;
  appConfig: WebAppProps | null;
  currentPage: AppPageProps | null;
  basePath: string;
  currentPath: string;
}

/**
 * PublishedPage - Minimal rendering for production
 * Now accepts config as props instead of fetching
 * This eliminates redundant data fetching
 */
export default function PublishedPage({
  appId,
  appConfig,
  currentPage,
  basePath,
  currentPath,
}: PublishedPageProps) {
  // Handle missing config
  if (!appConfig) {
    return (
      <UnifiedErrorDisplay
        type="config-missing"
        appId={appId}
        appType="production"
        homeUrl="/"
      />
    );
  }

  // Handle missing page
  if (!currentPage) {
    // In "pretty subdomain URLs" mode, basePath can be empty (""),
    // so fall back to "/" to avoid redirecting to an invalid URL.
    redirect(basePath || '/');
  }

  // Use StaticHeaderLayout to render header, footer, and main content
  return (
    <StaticHeaderLayout
      appConfig={appConfig}
      basePath={basePath}
      currentPath={currentPath}
      isPreview={false}
      cleanAppId={appId}
    >
      {/* Main content - header and footer are rendered by StaticHeaderLayout */}
      <main className={`app-main flex-1 ${currentPage.classes || ''}`}>
        <DynamicRendererList
          components={currentPage.content}
          pageLayout={appConfig.layout}
        />
      </main>
    </StaticHeaderLayout>
  );
}

