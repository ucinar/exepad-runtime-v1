/**
 * Unified Config Fetcher
 * Single source of truth for all config fetching across the application
 *
 * ARCHITECTURE:
 * - Uses React cache() ONLY for request-level deduplication
 * - Delegates actual fetching to ConfigService (fs-based for server components)
 * - No additional caching layers (prevents cache invalidation issues)
 * - Consistent return type for all routes
 * - Handles all sources: backend, demo, example
 */

import { cache } from 'react';
import { WebAppProps } from '@/interfaces/apps/webapp';
import { PageProps as AppPageProps } from '@/interfaces/apps/page';
import { ConfigService } from '@/services/ConfigService';

export type ConfigSource = 'backend' | 'demo' | 'example';
export type ConfigMode = 'published' | 'preview';

export interface UnifiedConfigParams {
  source: ConfigSource;
  appId: string;
  mode: ConfigMode;
  slugSegments?: string[];
  cache?: RequestCache; // Next.js fetch cache: 'force-cache' | 'no-store' | 'default'
}

export interface UnifiedConfigResult {
  config: WebAppProps;
  pageSlug: string;
  basePath: string;
  currentPage: AppPageProps | null;
}

/**
 * Internal fetch implementation (not cached)
 * Delegates to ConfigService for actual fetching
 */
async function fetchConfigInternal(
  params: UnifiedConfigParams
): Promise<UnifiedConfigResult | null> {
  const { source, appId, mode, slugSegments = [], cache: cacheStrategy = 'default' } = params;

  try {
    // Use ConfigService for actual fetching
    const config = await ConfigService.fetch(appId, mode, {
      source,
      cache: cacheStrategy,
      slugSegments,
    });

    if (!config) {
      console.warn(`[UnifiedConfig] No config found for ${source}:${appId}`);
      return null;
    }

    // Calculate actual path based on source
    // For example, if nested path resolution found config at different depth
    const actualPath = calculateActualPath(source, appId, slugSegments);

    // Calculate pageSlug and basePath
    const { pageSlug, basePath } = calculatePaths(source, actualPath, slugSegments, mode);

    // Find current page
    const currentPage = findPageBySlug(config, pageSlug);

    console.log(`[UnifiedConfig] Fetched:`, {
      source,
      appId,
      mode,
      pageSlug,
      basePath,
      hasPage: !!currentPage,
    });

    return {
      config,
      pageSlug,
      basePath,
      currentPage,
    };
  } catch (error) {
    console.error(`[UnifiedConfig] Error fetching config:`, error);
    return null;
  }
}

/**
 * Cached version using React cache()
 * This ensures multiple calls in the same request only fetch once
 *
 * IMPORTANT: This is the ONLY caching layer
 * - Request-scoped (auto-cleared between requests)
 * - Deduplicates calls within generateMetadata + page component
 * - No TTL, no manual invalidation needed
 */
export const getConfig = cache(fetchConfigInternal);

// ============================================================================
// PATH CALCULATION HELPERS
// ============================================================================

/**
 * Calculate the actual path where config was found
 * For backend/demo: just appId
 * For example: ConfigService handles nested path resolution internally
 */
function calculateActualPath(
  source: ConfigSource,
  appId: string,
  slugSegments: string[]
): string[] {
  // For backend and demo, path is just the appId
  if (source === 'backend' || source === 'demo') {
    return [appId];
  }

  // For example, the path could be nested
  // ConfigService resolves this internally, so we approximate based on slug
  // This is used for basePath calculation
  return [appId, ...slugSegments];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate pageSlug and basePath from actual path and requested segments
 */
function calculatePaths(
  source: ConfigSource,
  actualPath: string[],
  requestedSegments: string[],
  mode: ConfigMode
): { pageSlug: string; basePath: string } {
  switch (source) {
    case 'backend': {
      const pageSlug = requestedSegments.length > 0
        ? `/${requestedSegments.join('/')}`
        : '/';
      // Preserve preview prefix in basePath
      const prefix = mode === 'preview' ? 'preview-' : '';
      const basePath = `/a/${prefix}${actualPath[0]}`;
      return { pageSlug, basePath };
    }

    case 'demo': {
      const pageSlug = requestedSegments.length > 0
        ? `/${requestedSegments.join('/')}`
        : '/';
      const basePath = `/demo/${actualPath[0]}`;
      return { pageSlug, basePath };
    }

    case 'example': {
      // actualPath is where we found the JSON file
      // requestedSegments is the full requested path
      // pageSlug is the difference
      const fullPath = requestedSegments;
      const remainingSegments = fullPath.slice(actualPath.length - 1); // -1 because actualPath includes appId

      const pageSlug = remainingSegments.length > 0
        ? `/${remainingSegments.join('/')}`
        : '/';
      const basePath = `/example/${actualPath.join('/')}`;

      return { pageSlug, basePath };
    }

    default:
      return { pageSlug: '/', basePath: '/' };
  }
}

/**
 * Find page by slug with fallback behavior
 * Handles both regular pages and dynamic blog post routes
 */
function findPageBySlug(
  appConfig: WebAppProps,
  pageSlug: string
): AppPageProps | null {
  const normalizedSlug = normalizeSlug(pageSlug);
  
  // #region agent log
  console.log('[DEBUG:UC:findPage]',JSON.stringify({pageSlug,normalizedSlug,availableSlugs:appConfig.pages?.map((p:AppPageProps)=>p.slug)||[]}));
  // #endregion

  // Try to find exact match
  let page = appConfig.pages?.find(
    (p: AppPageProps) => normalizeSlug(p.slug) === normalizedSlug
  );

  // If no exact match found, check if this could be a blog post URL
  // Blog posts are stored separately and not included in the pages array
  // Example: /blog/ai should match BlogMainPageProps at /blog
  if (!page) {
    const segments = normalizedSlug.split('/').filter(Boolean);
    
    // Check if URL has at least 2 segments (e.g., /blog/post-slug)
    if (segments.length >= 2) {
      // Try to find a BlogMainPageProps at the parent path
      const parentPath = '/' + segments.slice(0, -1).join('/');
      const blogMainPage = appConfig.pages?.find(
        (p: AppPageProps) => 
          normalizeSlug(p.slug) === parentPath && 
          p.pageType === 'BlogMainPageProps'
      );
      
      // If we found a blog main page at the parent path, create a virtual blog post page
      if (blogMainPage) {
        const postSlug = segments[segments.length - 1];
        console.log(`[UnifiedConfig] Creating virtual BlogPostPageProps for: ${normalizedSlug}`);
        return {
          uuid: `blog-post-${postSlug}`,
          pageType: 'BlogPostPageProps',
          title: 'Blog Post', // Will be replaced by actual content from BlogPost component
          slug: normalizedSlug,
          summary: '',
          shortSummary: '',
          lastUpdatedEpoch: Date.now() / 1000,
          content: []
        } as AppPageProps;
      }
    }
  }

  // If no match and looking for root, use first page
  if (!page && normalizedSlug === '/') {
    page = appConfig.pages?.[0];
  }

  // Create fallback empty page for root if no pages exist
  if (!page && normalizedSlug === '/') {
    page = {
      uuid: 'empty-page-fallback',
      pageType: 'WebPageProps',
      title: appConfig.name || 'Home',
      slug: '/',
      summary: '',
      shortSummary: '',
      lastUpdatedEpoch: Date.now() / 1000,
      content: []
    } as AppPageProps;
  }

  // #region agent log
  console.log('[DEBUG:UC:pageResult]',JSON.stringify({normalizedSlug,foundPage:!!page,pageTitle:page?.title,pageSlug:page?.slug}));
  // #endregion

  return page || null;
}

/**
 * Normalize slug to always start with /
 */
function normalizeSlug(slug: string | undefined): string {
  if (!slug || slug === '') return '/';
  return slug.startsWith('/') ? slug : `/${slug}`;
}

// ============================================================================
// UTILITY FUNCTIONS FOR ROUTES
// ============================================================================

/**
 * Parse preview mode from URL and query params
 * Query param takes precedence
 */
export function parsePreviewMode(
  appId: string,
  searchParams?: { [key: string]: string | string[] | undefined }
): {
  isPreview: boolean;
  cleanAppId: string;
} {
  // Check query parameter (preferred method)
  if (searchParams?.preview === 'true') {
    return {
      isPreview: true,
      cleanAppId: appId,
    };
  }

  // Check URL prefix (backward compatibility)
  const PREVIEW_PREFIX = 'preview-';
  if (appId.startsWith(PREVIEW_PREFIX)) {
    const cleanAppId = appId.substring(PREVIEW_PREFIX.length);

    if (!cleanAppId || cleanAppId.length === 0) {
      console.error(`[UnifiedConfig] Invalid preview URL: empty app ID after prefix`);
      return { isPreview: false, cleanAppId: appId };
    }

    return { isPreview: true, cleanAppId };
  }

  return { isPreview: false, cleanAppId: appId };
}

/**
 * Helper to convert slug array to path string
 */
export function slugArrayToPath(slugSegments?: string[]): string {
  if (!slugSegments || slugSegments.length === 0) return '/';
  return `/${slugSegments.join('/')}`;
}
