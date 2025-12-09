/**
 * Sentry Server Configuration  
 * Error tracking for server-side (Node.js) errors
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Environment
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV,
    
    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || 'runtime@1.0.0',
    
    // Performance Monitoring (lower rate for server)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0.5,
    
    // Additional configuration
    integrations: [],
    
    // Ignore specific errors
    ignoreErrors: [
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
    ],
    
    // Before send hook
    beforeSend(event, hint) {
      // Don't send errors in development unless explicitly enabled
      if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_SENTRY) {
        return null;
      }
      
      // Filter sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      
      return event;
    },
  });
  
  console.log('[Sentry] Server initialized');
} else {
  console.log('[Sentry] Server not initialized (no DSN provided)');
}

