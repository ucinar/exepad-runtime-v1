/**
 * Error Fallback Components
 * Reusable UI components for error states
 */

import React from 'react';

export interface ErrorFallbackProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
  componentType?: string;
  componentId?: string;
  onRetry?: () => void;
  onReset?: () => void;
}

/**
 * Component-level error fallback
 * Compact error display for individual components
 */
export function ComponentErrorFallback({
  error,
  componentType,
  componentId,
  onRetry,
}: ErrorFallbackProps) {
  return (
    <div className="p-4 border-2 border-red-300 bg-red-50 rounded-lg">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800">
            Component Error
          </h3>
          {componentType && (
            <p className="text-xs text-red-600 mt-1">
              Type: {componentType}
            </p>
          )}
          <p className="text-sm text-red-700 mt-2">
            {error.message || 'An unexpected error occurred'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Page-level error fallback
 * Full-width error display for page errors
 */
export function PageErrorFallback({
  error,
  errorInfo,
  onRetry,
  onReset,
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-red-200">
          {/* Header */}
          <div className="bg-red-600 px-6 py-4">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h1 className="ml-3 text-2xl font-bold text-white">
                Something Went Wrong
              </h1>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <p className="text-gray-700 text-lg mb-4">
              We encountered an error while loading this page.
            </p>
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-sm font-mono text-red-800">
                {error.message || 'Unknown error'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mb-4">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Try Again
                </button>
              )}
              {onReset && (
                <button
                  onClick={onReset}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Go Back
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reload Page
              </button>
            </div>

            {/* Error Details Toggle */}
            {errorInfo && (
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                >
                  {showDetails ? 'Hide' : 'Show'} Error Details
                  <svg
                    className={`ml-2 h-4 w-4 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDetails && (
                  <div className="mt-3 bg-gray-100 rounded p-4 overflow-auto max-h-64">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                      {error.stack}
                      {errorInfo.componentStack && `\n\nComponent Stack:${errorInfo.componentStack}`}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * App-level error fallback
 * Critical error display for app-wide failures
 */
export function AppErrorFallback({ error }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="text-center px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-6">
          <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Application Error
        </h1>
        
        <p className="text-xl text-gray-700 mb-6 max-w-md mx-auto">
          The application encountered a critical error and needs to restart.
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 max-w-xl mx-auto">
          <p className="text-sm font-mono text-red-600 break-words">
            {error.message || 'Unknown critical error'}
          </p>
        </div>
        
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-lg font-semibold shadow-lg"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}

