/**
 * Main App Routing (Refactored)
 * Routes to either Published or Preview mode based on URL prefix
 *
 * - /a/{app_id} → Published mode (minimal, production)
 * - /a/preview-{app_id} → Preview mode (full features, editing)
 */

import React from 'react';
import { Metadata } from 'next';
import PublishedPage from '@/core/published/PublishedPage';
import PreviewPage from '@/core/preview/PreviewPage';

// Import unified config utilities
import { getConfig, parsePreviewMode, slugArrayToPath } from '@/app/_shared/utils/unifiedConfig';
import { generateAppMetadata } from '@/app/_shared/utils/metadataGenerator';

interface PageProps {
  params: Promise<{
    app_id: string;
    slug?: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Generate metadata for the page using unified config
 * Uses React cache() to prevent redundant fetches
 */
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { app_id, slug } = await params;
  const searchParamsObj = await searchParams;

  // Parse preview mode with query param support
  const { isPreview, cleanAppId } = parsePreviewMode(app_id, searchParamsObj);

  // Fetch config using unified config - this will be reused by the page component
  const result = await getConfig({
    source: 'backend',
    appId: cleanAppId,
    mode: isPreview ? 'preview' : 'deployed',
    slugSegments: slug,
    cache: isPreview ? 'no-store' : 'default'
  });

  if (!result) {
    return generateAppMetadata({
      appConfig: null,
      routeType: isPreview ? 'preview' : 'production',
      appId: cleanAppId
    });
  }

  return generateAppMetadata({
    appConfig: result.config,
    currentPage: result.currentPage,
    pageSlug: result.pageSlug,
    routeType: isPreview ? 'preview' : 'production',
    appId: cleanAppId
  });
}

/**
 * Main App Page Component
 * Fetches data ONCE and passes to child components
 * Uses React cache() to deduplicate with generateMetadata
 */
export default async function AppPage({ params, searchParams }: PageProps) {
  const { app_id, slug } = await params;
  const searchParamsObj = await searchParams;

  // Determine if this is preview or published mode using shared utility
  const { isPreview, cleanAppId } = parsePreviewMode(app_id, searchParamsObj);

  // Fetch config using unified config - this reuses the fetch from generateMetadata
  const result = await getConfig({
    source: 'backend',
    appId: cleanAppId,
    mode: isPreview ? 'preview' : 'deployed',
    slugSegments: slug,
    cache: isPreview ? 'no-store' : 'default'
  });

  //console.log('[AppPage] Result:', result);

  console.log('[AppPage] Rendering:', {
    app_id,
    cleanAppId,
    isPreview,
    mode: isPreview ? 'preview' : 'published',
    hasConfig: !!result,
    hasPage: !!result?.currentPage,
    currentPath: result?.pageSlug,
    basePath: result?.basePath,
  });

  if (isPreview) {
    // Preview mode: Load full-featured preview page with initial data
    // This prevents redundant fetching while maintaining reactivity
    return (
      <PreviewPage
        appId={cleanAppId}
        slug={slug}
        initialConfig={result?.config || null}
        initialPage={result?.currentPage || null}
        basePath={result?.basePath || `/a/preview-${cleanAppId}`}
        currentPath={result?.pageSlug || slugArrayToPath(slug)}
      />
    );
  } else {
    // Published mode: Load minimal published page with data
    // This is server-side rendered and optimized for production
    return (
      <PublishedPage
        appId={cleanAppId}
        appConfig={result?.config || null}
        currentPage={result?.currentPage || null}
        basePath={result?.basePath || `/a/${cleanAppId}`}
        currentPath={result?.pageSlug || slugArrayToPath(slug)}
      />
    );
  }
}

