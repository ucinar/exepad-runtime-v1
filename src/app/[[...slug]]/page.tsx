import { headers } from 'next/headers'
import PublishedPage from '@/core/published/PublishedPage'
import PreviewPage from '@/core/preview/PreviewPage'
import { getConfig, slugArrayToPath } from '@/app/_shared/utils/unifiedConfig'
import { UnifiedErrorDisplay } from '@/app/_shared/components/AppErrorDisplay'

export const runtime = 'edge'

interface PageProps {
  params: Promise<{ slug?: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PrettySubdomainCatchAll({ params, searchParams }: PageProps) {
  const h = await headers()
  const forwardedHost = (h.get('x-forwarded-host') || h.get('host') || '').split(':')[0]
  const appIdHeader = h.get('x-exepad-app-id') || ''

  const isExepadSubdomain =
    !!forwardedHost &&
    forwardedHost.endsWith('.exepad.app') &&
    forwardedHost !== 'www.exepad.app' &&
    forwardedHost !== 'exepad.app'

  // Not a pretty-subdomain request: let other routes handle (or 404).
  // Note: / is handled by src/app/page.tsx landing page.
  if (!isExepadSubdomain) {
    return (
      <UnifiedErrorDisplay
        type="config-missing"
        appId="unknown"
        appType="production"
        homeUrl="/"
      />
    )
  }

  const { slug = [] } = await params
  const sp = await searchParams
  const isPreview = sp.preview === 'true'

  if (!appIdHeader) {
    return (
      <UnifiedErrorDisplay
        type="config-missing"
        appId="unknown"
        appType={isPreview ? 'preview' : 'production'}
        homeUrl="/"
      />
    )
  }

  const result = await getConfig({
    source: 'backend',
    appId: appIdHeader,
    mode: isPreview ? 'preview' : 'published',
    slugSegments: slug,
    cache: isPreview ? 'no-store' : 'default',
  })

  const currentPath = result?.pageSlug || slugArrayToPath(slug)

  if (isPreview) {
    return (
      <PreviewPage
        appId={appIdHeader}
        slug={slug}
        initialConfig={result?.config || null}
        initialPage={result?.currentPage || null}
        // Pretty URLs: serve at "/" so basePath is empty for link prefixing.
        basePath=""
        currentPath={currentPath}
      />
    )
  }

  return (
    <PublishedPage
      appId={appIdHeader}
      appConfig={result?.config || null}
      currentPage={result?.currentPage || null}
      basePath=""
      currentPath={currentPath}
    />
  )
}

