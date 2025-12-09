// src/app/example/[app_id]/[[...slug]]/page.tsx

import React from 'react';
import { Metadata } from 'next';

// Import unified config utilities
import { getConfig } from '@/app/_shared/utils/unifiedConfig';
import { generateAppMetadata } from '@/app/_shared/utils/metadataGenerator';
import { UnifiedErrorDisplay } from '@/app/_shared/components/AppErrorDisplay';
import BaseAppPageRenderer from '@/app/_shared/components/BaseAppPageRenderer';

// Force dynamic rendering for example routes when clearCache param is present
// This is a proper Next.js approach instead of the headers() hack
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    app_id: string;
    slug?: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}


// generateMetadata uses unified config
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const paramsObj = await params;

  const result = await getConfig({
    source: 'example',
    appId: paramsObj.app_id,
    mode: 'deployed',
    slugSegments: paramsObj.slug,
    cache: 'no-store' // Force fresh for examples
  });

  if (!result) {
    return generateAppMetadata({
      appConfig: null,
      routeType: 'example',
      appId: paramsObj.app_id
    });
  }

  return generateAppMetadata({
    appConfig: result.config,
    pageSlug: result.pageSlug,
    routeType: 'example',
    appId: paramsObj.app_id
  });
}

// This is the main async Server Component for your example apps.
// Uses unified config to prevent redundant fetches
export default async function ExampleAppPage({ params, searchParams }: PageProps) {
  const paramsObj = await params;
  const searchParamsObj = await searchParams;

  // Log cache busting if requested
  if (searchParamsObj.clearCache === 'true') {
    console.log(`[ExampleApp] clearCache=true - using dynamic rendering`);
  }

  // Fetch config using unified config - reuses the fetch from generateMetadata
  // This handles nested path resolution automatically
  const result = await getConfig({
    source: 'example',
    appId: paramsObj.app_id,
    mode: 'deployed',
    slugSegments: paramsObj.slug,
    cache: 'no-store' // Force fresh for examples
  });

  // Handle the case where the app config could not be loaded
  if (!result) {
    return (
      <UnifiedErrorDisplay
        type="config-missing"
        appId={paramsObj.app_id}
        appType="example"
        details={`Path: /example/${[paramsObj.app_id, ...(paramsObj.slug || [])].join('/')}`}
        homeUrl="/"
      />
    );
  }

  // If still no page found (non-root path with no matching page), show error
  if (!result.currentPage) {
    return (
      <UnifiedErrorDisplay
        type="page-404"
        pageSlug={result.pageSlug}
        appId={paramsObj.app_id}
        appType="example"
        homeUrl={result.basePath}
      />
    );
  }

  // Use shared renderer component
  return (
    <BaseAppPageRenderer
      appConfig={result.config}
      currentPage={result.currentPage}
      appId={paramsObj.app_id}
      basePath={result.basePath}
    />
  );
}
