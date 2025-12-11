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
import { getJWTTokenAsync } from '@/lib/jwt-helper';

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
  // =========================================================================
  // ALL HOOKS MUST BE AT THE TOP - React Rules of Hooks
  // =========================================================================
  const [appConfig, setAppConfig] = useState<WebAppProps | null>(initialConfig);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const router = useRouter();  // MOVED: Must be before any conditional returns

  // Compute currentPage early (needed for useEffect dependency)
  const currentPage = appConfig ? (initialPage || findPageBySlug(appConfig, currentPath)) : null;

  // Client-side authentication check (defense-in-depth)
  // This runs in addition to middleware protection
  useEffect(() => {
    (async () => {
      try {
        console.log('[PreviewPage] Verifying authentication...');
        const token = await getJWTTokenAsync();
        
        if (token) {
          console.log('[PreviewPage] ✅ Authentication verified');
          setIsAuthenticated(true);
        } else {
          console.warn('[PreviewPage] ❌ No authentication token available');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('[PreviewPage] Authentication check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setAuthChecking(false);
      }
    })();
  }, []);

  // MOVED: Handle missing page navigation - must be before conditional returns
  useEffect(() => {
    if (appConfig && !currentPage && !authChecking) {
      // Only redirect if we're not already on the basePath to prevent infinite loops
      const currentPath = window.location.pathname;
      if (currentPath !== basePath) {
        router.replace(basePath);
      }
    }
  }, [currentPage, basePath, router, appConfig, authChecking]);

  // =========================================================================
  // CONDITIONAL RETURNS - Safe to return early after all hooks
  // =========================================================================

  // Show loading while checking authentication
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show auth required message if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Authentication Required</h1>
            <p className="text-gray-600 mb-6">
              Preview mode requires authentication. Please log in to continue.
            </p>
            <a 
              href={`https://app.exepad.com/signin?callbackUrl=${encodeURIComponent(window.location.href)}`}
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

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

  // Handle missing page
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

