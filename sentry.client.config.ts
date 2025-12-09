/**
 * Sentry Client Configuration
 * Error tracking for client-side (browser) errors
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
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Additional configuration
    integrations: [
      new Sentry.BrowserTracing({
        // Trace specific routes
        tracePropagationTargets: [
          'localhost',
          /^\//,
          process.env.NEXT_PUBLIC_BACKEND_URL,
        ].filter(Boolean) as any[],
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      // Network errors
      'NetworkError',
      'Failed to fetch',
      // WebSocket expected disconnections
      'WebSocket connection',
    ],
    
    // Before send hook - filter sensitive data
    beforeSend(event, hint) {
      // Don't send errors in development unless explicitly enabled
      if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_SENTRY) {
        return null;
      }
      
      // Filter out sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      
      return event;
    },
  });
  
  console.log('[Sentry] Client initialized');
} else {
  console.log('[Sentry] Client not initialized (no DSN provided)');
}

