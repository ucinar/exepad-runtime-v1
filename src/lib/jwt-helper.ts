/**
 * JWT Token Helper for Runtime
 * Handles fetching JWT tokens for WebSocket authentication in preview mode
 */

/**
 * Get JWT token from environment variable
 * This should be set when the runtime is loaded in preview mode
 */
export function getJWTTokenFromEnv(): string | undefined {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_JWT_TOKEN) {
    return process.env.NEXT_PUBLIC_JWT_TOKEN;
  }
  return undefined;
}

/**
 * Get JWT token from window global (set by parent iframe)
 * The frontend can inject the token via postMessage or script injection
 */
export function getJWTTokenFromWindow(): string | undefined {
  if (typeof window !== 'undefined' && (window as any).__JWT_TOKEN) {
    return (window as any).__JWT_TOKEN;
  }
  return undefined;
}

/**
 * Get JWT token from session storage
 * For preview mode, the token might be stored in session storage
 */
export function getJWTTokenFromStorage(): string | undefined {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      return window.sessionStorage.getItem('jwt_token') || undefined;
    } catch (e) {
      console.warn('[JWT Helper] Cannot access session storage:', e);
    }
  }
  return undefined;
}

/**
 * Set JWT token in session storage
 */
export function setJWTTokenInStorage(token: string): void {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem('jwt_token', token);
    } catch (e) {
      console.warn('[JWT Helper] Cannot write to session storage:', e);
    }
  }
}

/**
 * Clear JWT token from session storage
 */
export function clearJWTToken(): void {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.removeItem('jwt_token');
    } catch (e) {
      console.warn('[JWT Helper] Cannot clear session storage:', e);
    }
  }
}

/**
 * Get JWT token with fallback chain
 * Priority: window global > session storage > environment variable
 */
export function getJWTToken(): string | undefined {
  // Try window global first (fastest, set by parent)
  const windowToken = getJWTTokenFromWindow();
  if (windowToken) {
    console.log('[JWT Helper] Using token from window global');
    return windowToken;
  }

  // Try session storage
  const storageToken = getJWTTokenFromStorage();
  if (storageToken) {
    console.log('[JWT Helper] Using token from session storage');
    return storageToken;
  }

  // Try environment variable (for local development)
  const envToken = getJWTTokenFromEnv();
  if (envToken) {
    console.log('[JWT Helper] Using token from environment');
    return envToken;
  }

  console.warn('[JWT Helper] No JWT token found in any location');
  return undefined;
}

/**
 * Fetch JWT from backend using cookie authentication
 * This allows separate tabs to authenticate without postMessage
 * 
 * How it works:
 * - Browser automatically sends session cookies with the request
 * - Backend validates the session cookie
 * - Backend returns a fresh JWT for WebSocket authentication
 * 
 * Benefits:
 * - Works in separate tabs (cookies shared across tabs)
 * - Works across subdomains (if cookie domain is set to .exepad.com)
 * - No need for postMessage or parent window
 */
export async function getJWTTokenFromCookieAPI(): Promise<string | undefined> {
  try {
    console.log('[JWT Helper] Fetching JWT via cookie-authenticated API...');
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend.exepad.com';
    const response = await fetch(`${backendUrl}/api/auth/ws-token/`, {
      method: 'GET',
      credentials: 'include',  // CRITICAL: Include cookies in request
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.warn('[JWT Helper] Not authenticated (no valid session cookie)');
      } else {
        console.warn('[JWT Helper] Cookie auth failed:', response.status, response.statusText);
      }
      return undefined;
    }
    
    const data = await response.json();
    
    if (data.token) {
      console.log('[JWT Helper] ✅ Got JWT via cookie authentication');
      console.log('[JWT Helper] User:', data.user?.email || 'unknown');
      
      // Store for future use (faster than API call)
      setJWTTokenInStorage(data.token);
      
      return data.token;
    }
    
    console.warn('[JWT Helper] API response missing token field');
    return undefined;
    
  } catch (error) {
    console.warn('[JWT Helper] Failed to fetch JWT via cookies:', error);
    return undefined;
  }
}

/**
 * Request JWT token from parent window via postMessage
 * Returns a promise that resolves when the token is received
 */
export function requestJWTTokenFromParent(timeout: number = 5000): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || window.parent === window) {
      console.log('[JWT Helper] Not in iframe, cannot request token from parent');
      resolve(undefined);
      return;
    }

    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn('[JWT Helper] Token request timed out');
        resolve(undefined);
      }
    }, timeout);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'jwt_token_response' && event.data?.token) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          window.removeEventListener('message', handleMessage);
          console.log('[JWT Helper] Received JWT token from parent');
          
          // Store the token for future use
          setJWTTokenInStorage(event.data.token);
          
          resolve(event.data.token);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Request token from parent
    console.log('[JWT Helper] Requesting JWT token from parent window');
    window.parent.postMessage({ type: 'request_jwt_token' }, '*');
  });
}

/**
 * Get JWT token with async parent request fallback
 * First checks immediate sources, then requests from parent if needed
 * 
 * Fallback chain (in order):
 * 1. Memory/session storage (instant)
 * 2. Cookie-authenticated API (works in separate tabs)
 * 3. postMessage from parent (works in iframe)
 * 4. Environment variable (development only)
 */
export async function getJWTTokenAsync(): Promise<string | undefined> {
  // 1. Try immediate sources first (fastest - no network call)
  const immediateToken = getJWTToken();
  if (immediateToken) {
    return immediateToken;
  }

  // 2. Try cookie-authenticated API (works in separate tabs AND iframe)
  console.log('[JWT Helper] No cached token, trying cookie-authenticated API...');
  const cookieToken = await getJWTTokenFromCookieAPI();
  if (cookieToken) {
    return cookieToken;
  }

  // 3. If in iframe, try postMessage from parent (fallback for cross-domain issues)
  if (typeof window !== 'undefined' && window.parent !== window) {
    console.log('[JWT Helper] Cookie API failed, trying postMessage from parent iframe...');
    const parentToken = await requestJWTTokenFromParent();
    if (parentToken) {
      return parentToken;
    }
  }

  console.error('[JWT Helper] ❌ Could not obtain JWT token from any source');
  console.error('[JWT Helper] Tried: cached storage → cookie API → postMessage');
  return undefined;
}

