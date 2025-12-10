import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  
  // =========================================================================
  // 1. SECURITY & IDENTITY CHECK
  // =========================================================================
  const edgeAppId = request.headers.get('x-exepad-app-id')
  const edgeSecret = request.headers.get('x-exepad-secret')
  const internalSecret = process.env.EXEPAD_ROUTER_SECRET
  
  // Determine if the request is trusted
  // In dev (no secret set in env), we trust localhost.
  // In prod, we require the secret to match.
  const isTrustedRequest = process.env.NODE_ENV === 'development' || (internalSecret && edgeSecret === internalSecret)

  // =========================================================================
  // 2. SUBDOMAIN DETECTION
  // =========================================================================
  const appDomain = 'exepad.app' 
  const currentHost = hostname.split(':')[0]
  
  const isSubdomain = 
    (currentHost.endsWith(`.${appDomain}`) && currentHost !== `www.${appDomain}`) ||
    (currentHost.endsWith('.localhost') && currentHost !== 'www.localhost');

  if (isSubdomain) {
    const subdomain = currentHost.split('.')[0]
    
    // =========================================================================
    // 3. RESOLVE APP ID
    // =========================================================================
    let targetAppId = subdomain

    // Only accept the header-injected ID if the secret is valid
    if (edgeAppId && isTrustedRequest) {
      targetAppId = edgeAppId
    } else if (edgeAppId && !isTrustedRequest) {
      console.warn(`[Middleware] Blocked spoof attempt for ${edgeAppId}. Invalid secret.`)
      // We fall back to subdomain, effectively ignoring the spoofed header
      // or you could return a 403 here to be stricter
    }

    console.log(`[Middleware] Rewriting ${hostname} -> /a/${targetAppId}`)
    url.pathname = `/a/${targetAppId}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // Handle Main Domain -> Previews & Landing Page
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml (common root files)
     * - Files with common extensions (js, css, png, jpg, etc.)
     */
    '/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot|json|xml|txt|pdf|mp4|webm|ogg|mp3|wav)$).*)',
  ],
}
