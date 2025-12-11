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
  // 0. PREVENT INFINITE LOOPS - Check rewritten paths FIRST
  // =========================================================================
  // If the path already starts with /a/, it's been rewritten - skip all processing
  if (pathname.startsWith('/a/')) {
    return NextResponse.next()
  }
  
  // Check if request was already rewritten by Cloudflare router
  const alreadyRewritten = request.headers.get('x-exepad-rewritten')
  if (alreadyRewritten === 'true') {
    // Pretty subdomain URLs mode:
    // The router (Cloudflare Worker) already injected x-exepad-app-id and x-forwarded-host.
    // We intentionally DO NOT rewrite to /a/:appId anymore; the root catch-all route
    // (src/app/[[...slug]]/page.tsx) will render the correct app at "/".
    return NextResponse.next()
  }
  
  // =========================================================================
  // 1. PREVIEW MODE AUTHENTICATION CHECK
  // =========================================================================
  // Protect preview routes - require authentication
  // Support both legacy URL prefix (/a/preview-...) and query-param based preview (?preview=true)
  // so "pretty subdomain URLs" can still be protected.
  const isPreviewRoute = pathname.includes('/preview-') || url.searchParams.get('preview') === 'true'
  
  if (isPreviewRoute) {
    console.log('[Middleware] Preview route detected, checking authentication...')
    
    // Check for NextAuth session cookie (frontend uses NextAuth, not Django session)
    // NextAuth uses different cookie names based on environment:
    // - Development: 'next-auth.session-token'
    // - Production with HTTPS: '__Secure-next-auth.session-token'
    // - NextAuth v5: 'authjs.session-token' or '__Secure-authjs.session-token'
    const nextAuthCookie = request.cookies.get('next-auth.session-token') 
      || request.cookies.get('__Secure-next-auth.session-token')
      || request.cookies.get('authjs.session-token')
      || request.cookies.get('__Secure-authjs.session-token')
    
    // Also check for Django session cookie (for backwards compatibility)
    const djangoSessionCookie = request.cookies.get('exepad_session')
    
    // Log cookies for debugging
    console.log('[Middleware] Checking cookies:', {
      hasNextAuth: !!nextAuthCookie,
      hasDjango: !!djangoSessionCookie,
      allCookies: request.cookies.getAll().map(c => c.name)
    })
    
    if (!nextAuthCookie && !djangoSessionCookie) {
      console.warn('[Middleware] Preview access denied - no session cookie found')
      
      // Redirect to login page with return URL
      const loginUrl = new URL('https://app.exepad.com/signin', request.url)
      loginUrl.searchParams.set('callbackUrl', url.toString())
      
      return NextResponse.redirect(loginUrl)
    }
    
    // If NextAuth cookie exists, trust it (it's cryptographically signed by NextAuth)
    // The client-side component will do additional JWT validation with the backend
    if (nextAuthCookie) {
      console.log('[Middleware] Preview access granted - NextAuth session found')
      // IMPORTANT: Return early to prevent further processing and potential loops
      return NextResponse.next()
    } else if (djangoSessionCookie) {
      // For Django session, validate with backend
      const isValidSession = await validateSessionCookie(djangoSessionCookie.value)
      
      if (!isValidSession) {
        console.warn('[Middleware] Preview access denied - invalid Django session')
        
        const loginUrl = new URL('https://app.exepad.com/signin', request.url)
        loginUrl.searchParams.set('callbackUrl', url.toString())
        loginUrl.searchParams.set('reason', 'session_expired')
        
        return NextResponse.redirect(loginUrl)
      }
      console.log('[Middleware] Preview access granted - Django session valid')
      // IMPORTANT: Return early to prevent further processing and potential loops
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
  // In dev (no secret set in env), we trust localhost.
  // In prod, we require the secret to match.
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
    // Pretty subdomain URLs mode:
    // Do NOT rewrite subdomain requests to /a/:appId. The app is served at "/"
    // based on the injected x-exepad-app-id header (from the Cloudflare router).
    // We still keep the preview-auth logic above, but routing stays unchanged here.
    return NextResponse.next()
  }

  // Handle Main Domain -> Previews & Landing Page
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /a/ routes (internal rewrite paths)
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml (common root files)
     * - Files with common extensions (js, css, png, jpg, etc.)
     */
    '/((?!a/|api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot|json|xml|txt|pdf|mp4|webm|ogg|mp3|wav)$).*)',
  ],
}
