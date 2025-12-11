import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import PublishedPage from '@/core/published/PublishedPage'
import PreviewPage from '@/core/preview/PreviewPage'
import { getConfig, slugArrayToPath } from '@/app/_shared/utils/unifiedConfig'
import { UnifiedErrorDisplay } from '@/app/_shared/components/AppErrorDisplay'

// Cloudflare Pages / Edge runtime
export const runtime = 'edge'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const h = await headers()
  const forwardedHost = (h.get('x-forwarded-host') || h.get('host') || '').split(':')[0]
  const appIdHeader = h.get('x-exepad-app-id') || ''

  const isExepadSubdomain =
    !!forwardedHost &&
    forwardedHost.endsWith('.exepad.app') &&
    forwardedHost !== 'www.exepad.app' &&
    forwardedHost !== 'exepad.app'

  // If this is a pretty subdomain request (sample4.exepad.app),
  // serve the app directly at "/".
  if (isExepadSubdomain) {
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
      slugSegments: [],
      cache: isPreview ? 'no-store' : 'default',
    })

    if (isPreview) {
      return (
        <PreviewPage
          appId={appIdHeader}
          slug={[]}
          initialConfig={result?.config || null}
          initialPage={result?.currentPage || null}
          // Pretty URLs: serve at "/" so basePath is empty for link prefixing.
          basePath=""
          currentPath={result?.pageSlug || '/'}
        />
      )
    }

    return (
      <PublishedPage
        appId={appIdHeader}
        appConfig={result?.config || null}
        currentPage={result?.currentPage || null}
        basePath=""
        currentPath={result?.pageSlug || slugArrayToPath([])}
      />
    )
  }

  // Default landing page (pages.dev / root domain access)
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <Link href="https://exepad.com" target="_blank" rel="noopener noreferrer">
          <Image
            src="/images/logo.svg"
            alt="Exepad"
            width={350}
            height={120}
            priority
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        </Link>
      </div>
    </div>
  )
}
