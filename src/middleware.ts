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
  // 1. PREVIEW MODE AUTHENTICATION CHECK
  // =========================================================================
  // Protect preview routes - require authentication
  const isPreviewRoute = pathname.includes('/preview-')
  
  if (isPreviewRoute) {
    console.log('[Middleware] Preview route detected, checking authentication...')
    
    // Check for session cookie
    const sessionCookie = request.cookies.get('exepad_session')
    
    if (!sessionCookie || !sessionCookie.value) {
      console.warn('[Middleware] Preview access denied - no session cookie')
      
      // Redirect to login page with return URL
      const loginUrl = new URL('https://app.exepad.com/signin', request.url)
      loginUrl.searchParams.set('callbackUrl', url.toString())
      
      return NextResponse.redirect(loginUrl)
    }
    
    // Validate session with backend (optional but recommended)
    // Comment out if you want to skip backend validation for performance
    const isValidSession = await validateSessionCookie(sessionCookie.value)
    
    if (!isValidSession) {
      console.warn('[Middleware] Preview access denied - invalid session')
      
      const loginUrl = new URL('https://app.exepad.com/signin', request.url)
      loginUrl.searchParams.set('callbackUrl', url.toString())
      loginUrl.searchParams.set('reason', 'session_expired')
      
      return NextResponse.redirect(loginUrl)
    }
    
    console.log('[Middleware] Preview access granted - session valid')
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
