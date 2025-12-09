'use client';

/**
 * Error Boundary for Production/Preview Routes
 * Handles runtime errors with user-friendly messaging and recovery options
 */

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Route Error:', error);
    }

    // TODO: Send error to monitoring service (Sentry, LogRocket, etc.)
    // logErrorToService(error);
  }, [error]);

  const isNetworkError = error.message?.toLowerCase().includes('fetch') ||
                        error.message?.toLowerCase().includes('network');

  const isConfigError = error.message?.toLowerCase().includes('config') ||
                       error.message?.toLowerCase().includes('json');

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        {/* Error Icon and Title */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Something went wrong!
          </h2>
          <p className="text-lg text-gray-600 mt-2">
            {isNetworkError && 'Unable to connect to the server'}
            {isConfigError && 'Failed to load application configuration'}
            {!isNetworkError && !isConfigError && 'An unexpected error occurred'}
          </p>
        </div>

        {/* Error details in development mode */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm font-mono text-gray-700 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Helpful suggestions */}
        <div className="mb-6 space-y-2 text-sm text-gray-600">
          <p className="font-semibold">What you can try:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {isNetworkError && (
              <>
                <li>Check your internet connection</li>
                <li>Verify the server is running</li>
                <li>Try refreshing the page</li>
              </>
            )}
            {isConfigError && (
              <>
                <li>Verify the application exists</li>
                <li>Check the application configuration</li>
                <li>Contact your administrator</li>
              </>
            )}
            {!isNetworkError && !isConfigError && (
              <>
                <li>Try refreshing the page</li>
                <li>Clear your browser cache</li>
                <li>Return to the home page</li>
              </>
            )}
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
          <Link href="/" className="flex-1">
            <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
