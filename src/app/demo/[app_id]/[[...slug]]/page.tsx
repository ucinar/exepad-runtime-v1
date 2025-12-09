/**
 * Demo Page Route
 * Loads app configurations from public/demo directory
 * Perfect for showcasing example apps without backend connection
 */

import React from 'react';
import { Metadata } from 'next';

// Import unified config utilities
import { getConfig } from '@/app/_shared/utils/unifiedConfig';
import { generateAppMetadata } from '@/app/_shared/utils/metadataGenerator';
import { UnifiedErrorDisplay } from '@/app/_shared/components/AppErrorDisplay';
import BaseAppPageRenderer from '@/app/_shared/components/BaseAppPageRenderer';

interface PageProps {
  params: Promise<{
    app_id: string;
    slug?: string[];
  }>;
}

/**
 * Generate metadata for demo pages using unified config
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { app_id, slug } = await params;

  const result = await getConfig({
    source: 'demo',
    appId: app_id,
    mode: 'deployed',
    slugSegments: slug,
    cache: 'default'
  });

  if (!result) {
    return generateAppMetadata({
      appConfig: null,
      routeType: 'demo',
      appId: app_id
    });
  }

  return generateAppMetadata({
    appConfig: result.config,
    pageSlug: result.pageSlug,
    routeType: 'demo',
    appId: app_id
  });
}

/**
 * Demo Page Component
 * Renders apps from public/demo directory using published mode
 * Uses unified config to prevent redundant fetches
 */
export default async function DemoPage({ params }: PageProps) {
  const { app_id, slug } = await params;

  // Fetch config using unified config - reuses the fetch from generateMetadata
  const result = await getConfig({
    source: 'demo',
    appId: app_id,
    mode: 'deployed',
    slugSegments: slug,
    cache: 'default'
  });

  if (!result) {
    return (
      <UnifiedErrorDisplay
        type="config-missing"
        appId={app_id}
        appType="demo"
        details={`Make sure the file exists at: /public/demo/${app_id}.json`}
        homeUrl="/"
      />
    );
  }

  if (!result.currentPage) {
    return (
      <UnifiedErrorDisplay
        type="page-404"
        pageSlug={result.pageSlug}
        appId={app_id}
        appType="demo"
        homeUrl={result.basePath}
      />
    );
  }

  // Use shared renderer component
  return (
    <BaseAppPageRenderer
      appConfig={result.config}
      currentPage={result.currentPage}
      appId={app_id}
      basePath={result.basePath}
    />
  );
}
