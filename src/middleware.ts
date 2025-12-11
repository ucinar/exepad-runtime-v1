import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Validate session cookie with backend API
 * Returns true if session is valid and user is authenticated
 */
async function validateSessionCookie(sessionCookie: string): Promise<boolean> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend.exepad.com'
    
    // Call backend to validate session and get user info
    const response = await fetch(`${backendUrl}/api/auth/ws-token/`, {
      method: 'GET',
      headers: {
        'Cookie': `exepad_session=${sessionCookie}`,
        'Accept': 'application/json',
      },
      // Note: credentials: 'include' not needed here since we're manually setting Cookie header
    })
    
    // If 200 OK, session is valid
    if (response.ok) {
      const data = await response.json()
      console.log('[Middleware] Session validated for user:', data.user?.email || 'unknown')
      return true
    }
    
    console.warn('[Middleware] Session validation failed:', response.status)
    return false
  } catch (error) {
    console.error('[Middleware] Session validation error:', error)
    return false
  }
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const pathname = url.pathname
  const hostname = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  
  // =========================================================================
  // 0. PREVENT INFINITE LOOPS - CRITICAL FIX
  // =========================================================================
  
  // 1. Check for our custom internal flag. If this is present, we have already 
  // processed this request in a previous iteration of the middleware.
  if (request.headers.get('x-next-rewrite-done') === 'true') {
    return NextResponse.next()
  }

  // 2. If the path already starts with /a/, it's likely been rewritten or is an internal access.
  // We skip processing to avoid double-rewriting.
  if (pathname.startsWith('/a/')) {
    return NextResponse.next()
  }
  
  // Check if request was already rewritten by Cloudflare router (Upstream)
  const alreadyRewritten = request.headers.get('x-exepad-rewritten')
  
  if (alreadyRewritten === 'true') {
    // RSC (React Server Components) requests use the 'next-url' header for routing.
    // Don't rewrite these - let Next.js handle them directly.
    const isRscRequest = request.headers.get('rsc') === '1' || url.searchParams.has('_rsc')
    if (isRscRequest) {
      return NextResponse.next()
    }
    
    // Request came from router and has already been processed.
    // We need to map it to the internal /a/[appId] structure.
    const edgeAppId = request.headers.get('x-exepad-app-id')
    
    if (edgeAppId && !pathname.startsWith('/a/')) {
      const newUrl = request.nextUrl.clone()
      
      // FIX: Handle root path correctly to avoid double slashes or trailing slash issues
      // If pathname is '/', use empty string so we get '/a/id' instead of '/a/id/'
      const cleanPath = pathname === '/' ? '' : pathname
      newUrl.pathname = `/a/${edgeAppId}${cleanPath}`
      
      // FIX: Set a custom header on the rewritten request to signal completion
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-next-rewrite-done', 'true')
      
      return NextResponse.rewrite(newUrl, {
        request: {
          headers: requestHeaders,
        },
      })
    }
    return NextResponse.next()
  }
  
  // =========================================================================
  // 1. PREVIEW MODE AUTHENTICATION CHECK
  // =========================================================================
  const isPreviewRoute = pathname.includes('/preview-')
  
  if (isPreviewRoute) {
    console.log('[Middleware] Preview route detected, checking authentication...')
    
    // Check for NextAuth session cookie
    const nextAuthCookie = request.cookies.get('next-auth.session-token') 
      || request.cookies.get('__Secure-next-auth.session-token')
      || request.cookies.get('authjs.session-token')
      || request.cookies.get('__Secure-authjs.session-token')
    
    const djangoSessionCookie = request.cookies.get('exepad_session')
    
    console.log('[Middleware] Checking cookies:', {
      hasNextAuth: !!nextAuthCookie,
      hasDjango: !!djangoSessionCookie,
      allCookies: request.cookies.getAll().map(c => c.name)
    })
    
    if (!nextAuthCookie && !djangoSessionCookie) {
      console.warn('[Middleware] Preview access denied - no session cookie found')
      
      const loginUrl = new URL('https://app.exepad.com/signin', request.url)
      loginUrl.searchParams.set('callbackUrl', url.toString())
      
      return NextResponse.redirect(loginUrl)
    }
    
    if (nextAuthCookie) {
      console.log('[Middleware] Preview access granted - NextAuth session found')
      return NextResponse.next()
    } else if (djangoSessionCookie) {
      const isValidSession = await validateSessionCookie(djangoSessionCookie.value)
      
      if (!isValidSession) {
        console.warn('[Middleware] Preview access denied - invalid Django session')
        
        const loginUrl = new URL('https://app.exepad.com/signin', request.url)
        loginUrl.searchParams.set('callbackUrl', url.toString())
        loginUrl.searchParams.set('reason', 'session_expired')
        
        return NextResponse.redirect(loginUrl)
      }
      console.log('[Middleware] Preview access granted - Django session valid')
      return NextResponse.next()
    }
  }
  
  // =========================================================================
  // 2. SECURITY & IDENTITY CHECK
  // =========================================================================
  const edgeAppId = request.headers.get('x-exepad-app-id')
  const edgeSecret = request.headers.get('x-exepad-secret')
  const internalSecret = process.env.EXEPAD_ROUTER_SECRET
  
  // Determine if the request is trusted
  const isTrustedRequest = process.env.NODE_ENV === 'development' || (internalSecret && edgeSecret === internalSecret)

  // =========================================================================
  // 3. SUBDOMAIN DETECTION
  // =========================================================================
  const appDomain = 'exepad.app' 
  const currentHost = hostname.split(':')[0]
  
  const isSubdomain = 
    (currentHost.endsWith(`.${appDomain}`) && currentHost !== `www.${appDomain}`) ||
    (currentHost.endsWith('.localhost') && currentHost !== 'www.localhost');

  if (isSubdomain) {
    // Avoid rewrite loops: if already under /a/, skip rewriting again
    if (pathname.startsWith('/a/')) {
      return NextResponse.next()
    }

    const subdomain = currentHost.split('.')[0]
    
    // =========================================================================
    // 4. RESOLVE APP ID
    // =========================================================================
    let targetAppId = subdomain

    // Only accept the header-injected ID if the secret is valid
    if (edgeAppId && isTrustedRequest) {
      targetAppId = edgeAppId
    } else if (edgeAppId && !isTrustedRequest) {
      console.warn(`[Middleware] Blocked spoof attempt for ${edgeAppId}. Invalid secret.`)
    }

    console.log(`[Middleware] Rewriting ${hostname} -> /a/${targetAppId}`)
    const newUrl = request.nextUrl.clone()
    newUrl.pathname = `/a/${targetAppId}${url.pathname}`
    
    // FIX: Set header to prevent loop on rewrite
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-next-rewrite-done', 'true')

    return NextResponse.rewrite(newUrl, {
      request: {
        headers: requestHeaders,
      }
    })
  }

  // Handle Main Domain -> Previews & Landing Page
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, etc.
     */
    '/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot|json|xml|txt|pdf|mp4|webm|ogg|mp3|wav)$).*)',
  ],
}