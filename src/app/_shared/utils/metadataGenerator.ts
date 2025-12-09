/**
 * Metadata Generator
 * Unified metadata generation for all application routes
 */

import { Metadata } from 'next';
import { WebAppProps } from '@/interfaces/apps/webapp';
import { PageProps as AppPageProps } from '@/interfaces/apps/page';

export type RouteType = 'example' | 'production' | 'preview' | 'demo';

export interface MetadataOptions {
  appConfig: WebAppProps | null;
  currentPage?: AppPageProps | null;
  pageSlug?: string;
  routeType: RouteType;
  appId: string;
}

/**
 * Generate metadata for application pages
 * Handles all route types with consistent formatting
 * Enhanced with validation and error handling
 */
export function generateAppMetadata(options: MetadataOptions): Metadata {
  const { appConfig, currentPage, pageSlug = '/', routeType, appId } = options;

  // Handle missing config
  if (!appConfig) {
    console.warn(`[MetadataGenerator] Config missing for app: ${appId}, route: ${routeType}`);
    return generateErrorMetadata(appId, routeType);
  }

  // Validate required fields
  if (!appConfig.uuid) {
    console.warn(`[MetadataGenerator] Config missing uuid for app: ${appId}`);
  }

  if (!appConfig.name && !appConfig.theme?.metadata?.title) {
    console.warn(`[MetadataGenerator] Config missing name and metadata title for app: ${appId}`);
  }

  try {
    // Extract metadata from various sources with safe access
    const siteMetadata = appConfig.theme?.metadata || {};
    const pageMetadata = currentPage?.metadata || {};

  // Determine title prefix based on route type
  const titlePrefix = getTitlePrefix(routeType);

  // Build final metadata values
  const finalTitle = buildTitle(
    titlePrefix,
    pageMetadata.title,
    currentPage?.title,
    siteMetadata.title,
    appConfig.name
  );

  const finalDescription = buildDescription(
    pageMetadata.description,
    currentPage?.summary,
    siteMetadata.description
  );

  // Build OpenGraph metadata
  const openGraph = buildOpenGraph(
    pageMetadata,
    siteMetadata,
    finalTitle,
    finalDescription,
    pageSlug,
    appConfig.name
  );

  // Determine robots settings based on route type
  const robots = getRobotsSettings(routeType);

  // Safely handle favicon - ensure it's a string
  const faviconUrl = pageMetadata.favicon || siteMetadata.favicon || '/favicon.svg';
  const iconValue = typeof faviconUrl === 'string' ? faviconUrl : '/favicon.svg';

  const baseMetadata: Metadata = {
    title: finalTitle,
    description: finalDescription,
    keywords: pageMetadata.keywords || siteMetadata.keywords,
    icons: {
      icon: iconValue
    },
    openGraph,
    robots,
  };

  // Add optional production-only metadata if available
  if (routeType === 'production' && (siteMetadata as any).verification) {
    (baseMetadata as any).verification = (siteMetadata as any).verification;
  }

  if (routeType === 'production' && (siteMetadata as any).alternates) {
    (baseMetadata as any).alternates = (siteMetadata as any).alternates;
  }

    return baseMetadata;
  } catch (error) {
    console.error(`[MetadataGenerator] Error generating metadata for ${appId}:`, error);
    return generateErrorMetadata(appId, routeType);
  }
}

/**
 * Generate error metadata for missing configurations
 */
function generateErrorMetadata(appId: string, routeType: RouteType): Metadata {
  const prefix = getTitlePrefix(routeType);
  return {
    title: `${prefix} Error: ${appId} Not Found`,
    description: `Could not load configuration for application: ${appId}`,
    robots: {
      index: false,
      follow: false,
      nocache: true
    }
  };
}

/**
 * Get title prefix based on route type
 */
function getTitlePrefix(routeType: RouteType): string {
  switch (routeType) {
    case 'example':
      return '[Preview]';
    case 'preview':
      return '[Preview]';
    case 'demo':
      return '[Demo]';
    case 'production':
      return '';
    default:
      return '';
  }
}

/**
 * Build final title with fallbacks
 */
function buildTitle(
  prefix: string,
  ...titles: (string | undefined)[]
): string {
  const title = titles.find(t => t) || 'Application';
  return prefix ? `${prefix} ${title}` : title;
}

/**
 * Build description with fallbacks
 */
function buildDescription(...descriptions: (string | undefined)[]): string {
  return descriptions.find(d => d) || 'No description provided.';
}

/**
 * Build OpenGraph metadata
 */
function buildOpenGraph(
  pageMetadata: any,
  siteMetadata: any,
  title: string,
  description: string,
  pageSlug: string,
  siteName?: string
): Metadata['openGraph'] {
  const ogTitle = pageMetadata.openGraph?.title || title;
  const ogDescription = pageMetadata.openGraph?.description || description;
  const ogImage = pageMetadata.openGraph?.image || siteMetadata.openGraph?.image;
  const ogUrl = siteMetadata.openGraph?.url;

  return {
    title: ogTitle,
    description: ogDescription,
    ...(ogImage && { images: [ogImage] }),
    ...(ogUrl && { url: `${ogUrl}${pageSlug === '/' ? '' : pageSlug}` }),
    ...(siteName && { siteName }),
    type: 'website'
  };
}

/**
 * Get robots settings based on route type
 */
function getRobotsSettings(routeType: RouteType): Metadata['robots'] {
  // Production routes can be indexed
  if (routeType === 'production') {
    return {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true
      }
    };
  }

  // All other routes should not be indexed
  return {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      nocache: true
    }
  };
}

