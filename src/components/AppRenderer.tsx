// src/components/AppRenderer.tsx
// NO "use client" directive. This is now a Server Component by default.

import React from 'react';
import { WebAppProps } from '@/app_runtime/interfaces/apps/webapp';
import { DynamicRendererList } from './DynamicRenderer';
import { PageTransition } from './PageTransition';
import { getLayoutClasses, resolveLayout } from '@/utils/layoutPatterns';
import type { PageProps } from '@/app_runtime/interfaces/apps/page';
import type { BlogMainPageProps, BlogPostPageProps } from '@/app_runtime/interfaces/components/website/blog/blog';
import type { ComponentProps } from '@/app_runtime/interfaces/components/common/core';
import EditModeToolbar from './editable/EditModeToolbar';
import { BlogMain } from '@/app_runtime/runtime/components/custom/website/blog/BlogMain';
import { BlogPost } from '@/app_runtime/runtime/components/custom/website/blog/BlogPost';
import { PageUuidTracker } from './PageUuidTracker';
import PersistentHeader from './PersistentHeader';
import PersistentFooter from './PersistentFooter';

interface AppRendererProps {
  // The component now receives the full, resolved appConfig as a prop.
  // It no longer needs appId, mode, or source.
  appConfig: WebAppProps;
  cleanAppId?: string;
  pageId?: string; // pageId can still be passed for routing within the app
}

/**
 * A "presentational" Server Component that renders a WebApp configuration.
 * It receives all necessary data via props and contains no internal state or data-fetching logic.
 */
const AppRenderer: React.FC<AppRendererProps> = async ({ appConfig, cleanAppId, pageId }) => {
  // No more useState, useEffect, isLoading, error, or data fetching logic.
  // The component is now simple and predictable.

  let currentPage = pageId
    ? appConfig.pages?.find(page => page.uuid === pageId)
    : appConfig.pages?.find(page => page.slug === '/') || appConfig.pages?.[0];

  // If no page found and pages array is empty, create a minimal fallback page
  if (!currentPage && (!appConfig.pages || appConfig.pages.length === 0)) {
    currentPage = {
      uuid: 'empty-page-fallback',
      pageType: 'WebPageProps',
      title: appConfig.name || 'Home',
      slug: '/',
      summary: '',
      shortSummary: '',
      lastUpdatedEpoch: Date.now() / 1000,
      content: []
    } as PageProps;
  }

  // Debug logging for page resolution
  console.log('AppRenderer Debug:', {
    pageId,
    currentPageUuid: currentPage?.uuid,
    currentPageSlug: currentPage?.slug,
    currentPageTitle: currentPage?.title,
    currentPageType: currentPage?.pageType || 'WebPageProps',
    hasContent: !!currentPage?.content,
    contentLength: currentPage?.content?.length || 0
  });

  if (!currentPage) {
    return (
      <div className="p-4 m-4 border border-yellow-300 bg-yellow-50 text-yellow-700 rounded-lg">
        <p className="font-bold text-lg">Page Not Found</p>
        <p>The requested page "{pageId || 'default'}" was not found within the app config.</p>
      </div>
    );
  }

  const isSidebarLayout = appConfig.menuPosition === 'SidebarMenuLeft';

  // Render different content based on page type
  const renderPageContent = () => {
    switch (currentPage.pageType) {
      case 'BlogMainPageProps':
        const blogMainPage = currentPage as BlogMainPageProps;
        return <BlogMain {...blogMainPage} app_uuid={cleanAppId} />;
      
      case 'BlogPostPageProps':
        const blogPostPage = currentPage as BlogPostPageProps;
        // Extract the post slug from the page slug (e.g., "/blog/my-post" -> "my-post")
        const postSlug = blogPostPage.slug?.split('/').filter(Boolean).pop() || '';
        return <BlogPost {...blogPostPage} postSlug={postSlug} app_uuid={cleanAppId} />;
      
      case 'WebPageProps':
      default:
        return <DynamicRendererList components={currentPage.content} />;
    }
  };

  const MainContent = (
    <main className={`app-main flex-1 ${currentPage.classes || ''}`}>
      <div className={getLayoutClasses(currentPage.layout, appConfig.layout)}>
        {renderPageContent()}
      </div>
    </main>
  );

  const AppContent = isSidebarLayout && appConfig.sidebar && appConfig.sidebar.length > 0 ? (
    <DynamicRendererList
      components={appConfig.sidebar}
      mainContent={MainContent}
    />
  ) : (
    MainContent
  );

  // Header and Footer configuration (for example routes where layout doesn't handle them)
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

  const footerConfig = appConfig.footer && appConfig.footer.length > 0 ? {
    components: appConfig.footer
  } : null;

  const appContent = (
    <>
      <div className="min-h-screen flex flex-col">
        {/* Header - rendered for example routes */}
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

        <div className={`app-container app-${appConfig.uuid} flex-1`}>
          <PageTransition
            globalConfig={appConfig.transitions}
            pageOverride={currentPage.transitions}>
            {AppContent}
          </PageTransition>
        </div>

        {/* Footer - rendered for example routes */}
        {footerConfig && (
          <div style={{ zIndex: 100, position: 'relative' }}>
            <PersistentFooter components={footerConfig.components} />
          </div>
        )}
      </div>

      {/* Page UUID tracker - sends page changes to parent window */}
      {currentPage && <PageUuidTracker pageUuid={currentPage.uuid} appId={appConfig.uuid} />}
      
      {/* Edit mode toolbar - always included, but only shows when in edit mode */}
      <EditModeToolbar />
    </>
  );

  return appContent;
};

export default AppRenderer;
