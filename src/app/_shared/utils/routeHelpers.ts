/**
 * Shared Route Helpers
 * Common utilities used across all application routes
 */

import { WebAppProps } from '@/interfaces/apps/webapp';
import { PageProps as AppPageProps } from '@/interfaces/apps/page';

/**
 * Type-safe search params interface
 */
export interface ParsedSearchParams {
  preview: boolean;
  clearCache: boolean;
  [key: string]: string | boolean | undefined;
}

/**
 * Parse and validate search params in a type-safe way
 * @param params Raw search params from Next.js
 * @returns Typed and validated search params
 */
export function parseSearchParams(
  params?: { [key: string]: string | string[] | undefined }
): ParsedSearchParams {
  if (!params) {
    return { preview: false, clearCache: false };
  }

  return {
    preview: params.preview === 'true',
    clearCache: params.clearCache === 'true',
  };
}

/**
 * Normalizes a slug to ensure it always starts with a forward slash.
 * Supports both "slug" and "/slug" formats in page data.
 * @param slug The slug to normalize
 * @returns The normalized slug with a leading slash
 */
export function normalizeSlug(slug: string | undefined): string {
  if (!slug || slug === '') return '/';
  return slug.startsWith('/') ? slug : `/${slug}`;
}

/**
 * Converts slug array to normalized path string
 * @param slugSegments Array of slug segments from Next.js params
 * @returns Normalized path string
 */
export function slugArrayToPath(slugSegments?: string[]): string {
  if (!slugSegments || slugSegments.length === 0) return '/';
  return `/${slugSegments.join('/')}`;
}

/**
 * Finds a page in the app config by slug
 * @param appConfig The application configuration
 * @param pageSlug The normalized page slug to find
 * @returns The matching page or a fallback page for root path
 */
export function findPageBySlug(
  appConfig: WebAppProps,
  pageSlug: string
): AppPageProps | null {
  // Try to find exact match
  let currentPage = appConfig.pages?.find(
    (page: AppPageProps) => normalizeSlug(page.slug) === pageSlug
  );

  // If no explicit match is found and we're looking for root, default to the first page
  if (!currentPage && pageSlug === '/') {
    currentPage = appConfig.pages?.[0];
  }

  // If pages array is empty or undefined, create a minimal empty page for root path
  // This allows rendering header/footer even without page content
  if (!currentPage && pageSlug === '/') {
    currentPage = {
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

  return currentPage || null;
}

/**
 * Calculates the base path for navigation
 * Removes page slug segments from the full path to get the app base path
 * @param fullPathSegments Full path segments including page slug
 * @param pageSlug The resolved page slug
 * @returns The base path for the application
 */
export function calculateBasePath(
  fullPathSegments: string[],
  pageSlug: string,
  prefix: string = '/example'
): string {
  const pageSlugSegments = pageSlug.split('/').filter(Boolean);
  const basePathSegments = fullPathSegments.slice(
    0,
    fullPathSegments.length - pageSlugSegments.length
  );
  return `${prefix}/${basePathSegments.join('/')}`;
}

/**
 * Determines if the app is in preview mode
 * Supports both query param (?preview=true) and URL prefix (preview-{appId})
 * Query param takes precedence for better flexibility
 *
 * @param appId The application ID from params
 * @param searchParams Optional search params from the route
 * @returns Boolean indicating preview mode and cleaned app ID
 */
export function parsePreviewMode(
  appId: string,
  searchParams?: { [key: string]: string | string[] | undefined }
): {
  isPreview: boolean;
  cleanAppId: string;
  detectionMethod: 'query-param' | 'url-prefix' | 'none';
} {
  // Method 1: Check query parameter (preferred method)
  if (searchParams?.preview === 'true') {
    return {
      isPreview: true,
      cleanAppId: appId,
      detectionMethod: 'query-param'
    };
  }

  // Method 2: Check URL prefix (backward compatibility)
  // Use strict validation to avoid false positives
  const PREVIEW_PREFIX = 'preview-';

  if (appId.startsWith(PREVIEW_PREFIX)) {
    const cleanAppId = appId.substring(PREVIEW_PREFIX.length);

    // Validate cleaned ID is not empty and has reasonable length
    if (!cleanAppId || cleanAppId.length === 0) {
      console.error(
        `[RouteHelpers] Invalid preview URL: app ID is empty after removing prefix. ` +
        `Original: "${appId}". Use ?preview=true query param instead.`
      );
      // Return as non-preview with original ID to avoid breaking
      return {
        isPreview: false,
        cleanAppId: appId,
        detectionMethod: 'none'
      };
    }

    // Warn about short IDs that might be legitimate app names
    if (cleanAppId.length < 3) {
      console.warn(
        `[RouteHelpers] Preview mode detected but cleaned ID is very short: "${cleanAppId}". ` +
        `If this is an actual app named "preview-${cleanAppId}", use ?preview=false to override.`
      );
    }

    return {
      isPreview: true,
      cleanAppId,
      detectionMethod: 'url-prefix'
    };
  }

  // Not preview mode
  return {
    isPreview: false,
    cleanAppId: appId,
    detectionMethod: 'none'
  };
}

/**
 * Constructs error response for missing configurations
 * @param appId The application ID that failed to load
 * @param attempted Optional attempted path for more detailed error
 * @returns Standardized error response object
 */
export function createConfigError(
  appId: string,
  attempted?: string
): {
  title: string;
  message: string;
  details?: string;
} {
  return {
    title: 'Error Loading Application',
    message: `Could not find or load the configuration for app: "${appId}"`,
    details: attempted ? `Attempted path: ${attempted}` : undefined
  };
}

/**
 * Creates a 404 page response
 * @param pageSlug The page slug that was not found
 * @returns Standardized 404 response object
 */
export function create404Response(pageSlug: string): {
  title: string;
  message: string;
} {
  return {
    title: '404 - Page Not Found',
    message: `The requested page "${pageSlug}" was not found in the application.`
  };
}