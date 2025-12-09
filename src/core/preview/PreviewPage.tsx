/**
 * Preview Page Component (Preview-Only)
 * Full-featured rendering with edit capabilities
 * 
 * This component is used for preview/editing mode and includes:
 * - WebSocket connection for live updates
 * - Zustand store for state management
 * - Edit mode components and toolbar
 * - Debugging tools
 * - Real-time collaboration features
 * 
 * IMPORTANT: This should only be loaded in preview mode
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { RuntimeProviders } from '@/core/providers/RuntimeProviders';
import { DynamicRendererList } from '@/components/DynamicRenderer';
import { WebAppProps } from '@/interfaces/apps/webapp';
import { PageProps as AppPageProps } from '@/interfaces/apps/page';
import DynamicTheme from '@/components/DynamicTheme';
import ClientFontLoader from '@/components/ClientFontLoader';
import FontVariables from '@/components/FontVariables';
import { PageUuidTracker } from '@/components/PageUuidTracker';
import { findPageBySlug } from '@/app/_shared/utils/routeHelpers';
import { UnifiedErrorDisplay } from '@/app/_shared/components/AppErrorDisplay';
import PersistentHeader from '@/components/PersistentHeader';
import PersistentFooter from '@/components/PersistentFooter';
import { getLayoutClasses, resolveLayout } from '@/utils/layoutPatterns';
import type { ComponentProps } from '@/app_runtime/interfaces/components/common/core';
import { Toaster } from '@/app_runtime/runtime/components/ui/toaster';
import { BlogMain } from '@/app_runtime/runtime/components/custom/website/blog/BlogMain';
import { BlogPost } from '@/app_runtime/runtime/components/custom/website/blog/BlogPost';
import type { BlogMainPageProps, BlogPostPageProps } from '@/app_runtime/interfaces/components/website/blog/blog';
import { HashScrollHandler } from '@/components/HashScrollHandler';

// Lazy load preview-only components to optimize bundle
const EditModeToolbar = dynamic(() => import('@/components/editable/EditModeToolbar'), {
  ssr: false,
  loading: () => <div className="fixed top-4 right-4 text-xs text-gray-500">Loading toolbar...</div>,
});

interface PreviewPageProps {
  appId: string;
  slug?: string[];
  initialConfig: WebAppProps | null;
  initialPage: AppPageProps | null;
  basePath: string;
  currentPath: string;
}

/**
 * PreviewPage - Full-featured rendering for editing
 * Includes WebSocket, state management, and edit tools
 * Now accepts initial config to prevent redundant fetching
 */
export default function PreviewPage({
  appId,
  slug,
  initialConfig,
  initialPage,
  basePath,
  currentPath,
}: PreviewPageProps) {
  const [appConfig, setAppConfig] = useState<WebAppProps | null>(initialConfig);

  //console.log('[PreviewPage] AppConfig:', appConfig);

  // Handle missing config (error state is handled by parent route)
  if (!appConfig) {
    return (
      <UnifiedErrorDisplay
        type="config-missing"
        appId={appId}
        appType="preview"
        homeUrl="/"
        showRetry
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Handle missing page (use initialPage or fallback)
  const currentPage = initialPage || findPageBySlug(appConfig, currentPath);
  const router = useRouter();

  useEffect(() => {
    if (!currentPage) {
      router.replace(basePath);
    }
  }, [currentPage, basePath, router]);

  if (!currentPage) {
    return null;
  }

  // Calculate header configuration
  const isHeaderLayout = appConfig.menuPosition === 'HeaderMenuTop';
  const hasHeaderStickyNavbar = isHeaderLayout && appConfig.header &&
    appConfig.header.some((component: ComponentProps) =>
      component.componentType === 'NavbarProps' && (component as any).sticky === true
    );

  const headerConfig = isHeaderLayout && appConfig.header ? {
    components: appConfig.header,
    isSticky: hasHeaderStickyNavbar,
    layoutClasses: getLayoutClasses(appConfig.layout, appConfig.layout),
    pageLayout: resolveLayout(appConfig.layout, appConfig.layout)
  } : null;

  // Footer configuration
  const footerConfig = appConfig.footer && appConfig.footer.length > 0 ? {
    components: appConfig.footer
  } : null;

  return (
    <RuntimeProviders mode="preview" appId={appId} appConfig={appConfig} basePath={basePath}>
      {/* Hash anchor scroll handler */}
      <HashScrollHandler />
      
      {/* Theme components */}
      {appConfig.theme && <DynamicTheme theme={appConfig.theme} />}

      {/* Font loading - unified client-side approach */}
      {appConfig.theme?.fonts && <ClientFontLoader fonts={appConfig.theme.fonts} />}

      {/* Inject font CSS variables using unified component */}
      {appConfig.theme?.fonts && <FontVariables fonts={appConfig.theme.fonts} />}

      <div className="min-h-screen flex flex-col">
        {/* Header - rendered for preview mode */}
        {headerConfig && (
          <div style={{ zIndex: 100, position: 'relative' }}>
            <PersistentHeader
              components={headerConfig.components}
              isSticky={headerConfig.isSticky}
              layoutClasses={headerConfig.layoutClasses}
              pageLayout={headerConfig.pageLayout}
            />
          </div>
        )}

        {/* Main content */}
        <main className={`app-main flex-1 ${currentPage.classes || ''}`}>
          {currentPage.pageType === 'BlogMainPageProps' ? (
            <BlogMain {...(currentPage as BlogMainPageProps)} app_uuid={appId} />
          ) : currentPage.pageType === 'BlogPostPageProps' ? (
            <BlogPost 
              {...(currentPage as BlogPostPageProps)} 
              postSlug={currentPage.slug?.split('/').filter(Boolean).pop() || ''} 
              app_uuid={appId} 
            />
          ) : (
            <DynamicRendererList
              components={currentPage.content}
              pageLayout={appConfig.layout}
            />
          )}
        </main>

        {/* Footer - rendered for preview mode */}
        {footerConfig && (
          <div style={{ zIndex: 100, position: 'relative' }}>
            <PersistentFooter components={footerConfig.components} />
          </div>
        )}
      </div>

      {/* Toaster for notifications */}
      <Toaster />

      {/* Page UUID tracker - sends page changes to parent window */}
      <PageUuidTracker pageUuid={currentPage.uuid} appId={appConfig.uuid} />

      {/* Edit mode toolbar */}
      <EditModeToolbar />
    </RuntimeProviders>
  );
}

