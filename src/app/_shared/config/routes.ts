/**
 * Centralized Route Configuration
 * Single source of truth for all route-related settings
 */

import { ConfigSource } from '@/app/_shared/utils/unifiedConfig';

export type RouteType = 'production' | 'preview' | 'demo' | 'example';

export interface RouteConfig {
  /** URL prefix for this route type */
  prefix: string;
  /** Config source to use */
  source: ConfigSource;
  /** Cache strategy for data fetching */
  cache: 'no-store' | 'force-cache' | 'default';
  /** Mode for config fetching */
  mode: 'published' | 'preview';
  /** Whether this route type requires authentication */
  requiresAuth?: boolean;
  /** Whether this is a client-rendered route */
  isClientRendered?: boolean;
}

export const ROUTE_CONFIG: Record<RouteType, RouteConfig> = {
  production: {
    prefix: '/a',
    source: 'backend',
    cache: 'default',
    mode: 'published',
    requiresAuth: false,
    isClientRendered: false,
  },
  preview: {
    prefix: '/a',
    source: 'backend',
    cache: 'no-store',
    mode: 'preview',
    requiresAuth: false,
    isClientRendered: true,
  },
  demo: {
    prefix: '/demo',
    source: 'demo',
    cache: 'default',
    mode: 'published',
    requiresAuth: false,
    isClientRendered: false,
  },
  example: {
    prefix: '/example',
    source: 'example',
    cache: 'no-store', // Force fresh data for examples
    mode: 'published',
    requiresAuth: false,
    isClientRendered: false,
  },
} as const;

/**
 * Get route configuration by type
 */
export function getRouteConfig(type: RouteType): RouteConfig {
  return ROUTE_CONFIG[type];
}

/**
 * Build base path for navigation based on route type and app ID
 */
export function buildBasePath(
  routeType: RouteType,
  appId: string,
  additionalSegments: string[] = []
): string {
  const config = getRouteConfig(routeType);

  if (routeType === 'preview') {
    // Preview mode uses special prefix
    return `${config.prefix}/preview-${appId}`;
  }

  const segments = [config.prefix, appId, ...additionalSegments].filter(Boolean);
  return segments.join('/');
}

/**
 * Determine route type from URL components
 */
export function detectRouteType(
  urlPrefix: string,
  appId: string,
  searchParams?: { [key: string]: string | string[] | undefined }
): RouteType {
  // Check for preview mode via query param (preferred)
  if (searchParams?.preview === 'true') {
    return 'preview';
  }

  // Check for preview mode via URL prefix
  if (appId.startsWith('preview-')) {
    return 'preview';
  }

  // Detect by URL prefix
  if (urlPrefix === '/demo') return 'demo';
  if (urlPrefix === '/example') return 'example';
  if (urlPrefix === '/a') return 'production';

  // Default to production
  return 'production';
}
