'use client';

/**
 * Error Boundary for Demo Routes
 * Handles runtime errors with demo-specific messaging
 */

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function DemoErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Demo Route Error:', error);
    }
  }, [error]);

  const isDemoNotFound = error.message?.toLowerCase().includes('not found') ||
                         error.message?.toLowerCase().includes('404');

  const isConfigError = error.message?.toLowerCase().includes('config') ||
                       error.message?.toLowerCase().includes('json');

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl p-8">
        {/* Demo Badge */}
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-4">
            DEMO MODE
          </span>

          {/* Error Icon */}
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Demo Error
          </h2>
          <p className="text-lg text-gray-600 mt-2">
            {isDemoNotFound && 'Demo application not found'}
            {isConfigError && 'Demo configuration is invalid'}
            {!isDemoNotFound && !isConfigError && 'Unable to load the demo'}
          </p>
        </div>

        {/* Error details in development mode */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Debug Information
            </p>
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

        {/* Demo-specific helpful suggestions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="font-semibold text-blue-900 mb-2">About Demo Mode:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Demo applications are read-only examples</li>
            <li>• They showcase different component configurations</li>
            <li>• No backend connection is required</li>
            <li>• Configuration files are stored in /public/demo</li>
          </ul>
        </div>

        {/* Troubleshooting */}
        {isDemoNotFound && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="font-semibold text-yellow-900 mb-2">Available Demos:</p>
            <p className="text-sm text-yellow-800">
              Check the /public/demo directory for available demo applications.
              Make sure the demo ID matches an existing JSON file.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry Demo
          </button>
          <Link href="/" className="flex-1">
            <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}