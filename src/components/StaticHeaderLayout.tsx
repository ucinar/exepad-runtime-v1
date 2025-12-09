// Server Component - no "use client" directive needed

import React from 'react';
import { WebAppProps } from '@/app_runtime/interfaces/apps/webapp';
import ClientWrapper from './ClientWrapper';
import PersistentHeader from './PersistentHeader';
import PersistentFooter from './PersistentFooter';
import { Toaster } from '@/app_runtime/runtime/components/ui/toaster';
import { getLayoutClasses, resolveLayout } from '../utils/layoutPatterns';
import { ComponentProps } from '@/app_runtime/interfaces/components/common/core';
import DynamicTheme from './DynamicTheme';
import DynamicFontLoader from './DynamicFontLoader';

interface StaticHeaderLayoutProps {
  children: React.ReactNode;
  appConfig: WebAppProps;
  basePath: string;
  currentPath?: string; // Pass pathname as prop instead of using usePathname
  isPreview?: boolean;
  cleanAppId?: string;
}

// Server Component - renders headers and footers on the server
const StaticHeaderLayout = ({ children, appConfig, basePath, currentPath = '/', isPreview = false, cleanAppId }: StaticHeaderLayoutProps) => {
  // Calculate header configuration (computed once on server)
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

  // Footer configuration (computed once on server)
  const footerConfig = appConfig.footer && appConfig.footer.length > 0 ? {
    components: appConfig.footer
  } : null;

  // Generate font CSS variables on the server for immediate availability
  const fontVariables = appConfig.theme?.fonts ? (
    `
    :root {
      ${appConfig.theme.fonts.body ? `--font-sans: ${appConfig.theme.fonts.body.family};` : ''}
      ${appConfig.theme.fonts.heading ? `--font-heading: ${appConfig.theme.fonts.heading.family};` : ''}
    }
    `
  ) : null;

  return (
    <>
      {/* Theme components - rendered on server OUTSIDE ClientWrapper for proper style injection */}
      {appConfig.theme && <DynamicTheme theme={appConfig.theme} />}
      {appConfig.theme?.fonts && <DynamicFontLoader fonts={appConfig.theme.fonts} />}

      {/* Inject font CSS variables on the server for immediate availability */}
      {fontVariables && (
        <style dangerouslySetInnerHTML={{ __html: fontVariables.trim() }} />
      )}

      <ClientWrapper
        basePath={basePath}
        currentPageSlug={currentPath}
        isPreview={isPreview}
        cleanAppId={cleanAppId}
        appConfig={appConfig}
      >
        <div className="min-h-screen flex flex-col">
        {/* Static header - rendered on server */}
        {headerConfig && (
          <div 
            style={{
              zIndex: 100,
              position: 'relative',
            }}
          >
            <PersistentHeader
              components={headerConfig.components}
              isSticky={headerConfig.isSticky}
              layoutClasses={headerConfig.layoutClasses}
              pageLayout={headerConfig.pageLayout}
            />
          </div>
        )}
        
        {/* Page content container */}
        <div className="flex-1">
          {children}
        </div>

        {/* Static footer - rendered on server */}
        {footerConfig && (
          <div 
            style={{
              zIndex: 100,
              position: 'relative',
            }}
          >
            <PersistentFooter components={footerConfig.components} />
          </div>
        )}
      </div>
      <Toaster />
      </ClientWrapper>
    </>
  );
};

// No need for displayName in server components

export default StaticHeaderLayout;