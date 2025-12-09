/**
 * Component Error Boundary
 * Catches errors at the component level with automatic recovery
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorReportingService } from '../../services/ErrorReportingService';
import { ComponentErrorFallback } from './ErrorFallback';
import { getRuntimeMode } from '../RuntimeMode';

interface Props {
  children: ReactNode;
  componentType?: string;
  componentId?: string;
  appId?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * ComponentErrorBoundary
 * 
 * Features:
 * - Catches component-level errors
 * - Automatic recovery (up to 3 attempts)
 * - Error reporting to Sentry
 * - Graceful fallback UI
 * - Recovery on user action
 */
export class ComponentErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { componentType, componentId, appId, onError } = this.props;
    const { retryCount } = this.state;

    console.error('[ComponentErrorBoundary] Error caught:', {
      componentType,
      componentId,
      error: error.message,
      stack: error.stack,
    });

    // Store error info
    this.setState({ errorInfo });

    // Report error
    ErrorReportingService.report(error, {
      componentType,
      componentId,
      appId,
      errorCount: retryCount + 1,
      mode: getRuntimeMode(),
      timestamp: Date.now(),
      stackTrace: error.stack,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Attempt automatic recovery if allowed
    if (
      ErrorReportingService.shouldRecover({
        componentId: componentId || 'unknown',
        componentType,
      })
    ) {
      this.attemptRecovery();
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  /**
   * Attempt automatic recovery after a delay
   */
  private attemptRecovery = (): void => {
    const { retryCount } = this.state;
    const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Max 5 seconds

    console.log(
      `[ComponentErrorBoundary] Attempting recovery in ${delay}ms (attempt ${retryCount + 1}/3)`
    );

    this.retryTimeout = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  /**
   * Manual retry triggered by user
   */
  private handleRetry = (): void => {
    const { componentId } = this.props;
    const { retryCount } = this.state;

    console.log('[ComponentErrorBoundary] Retrying component render');

    // Clear error if successful recovery after multiple attempts
    if (retryCount >= 2 && componentId) {
      ErrorReportingService.clearErrors(componentId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: retryCount + 1,
    });
  };

  /**
   * Reset error boundary completely
   */
  private handleReset = (): void => {
    const { componentId } = this.props;

    if (componentId) {
      ErrorReportingService.clearErrors(componentId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  render(): ReactNode {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback, componentType, componentId } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Check if we've exceeded retry attempts
      if (retryCount >= 3) {
        return (
          <div className="p-4 border-2 border-red-400 bg-red-100 rounded-lg">
            <p className="text-red-800 font-semibold">
              Component failed to load after multiple attempts
            </p>
            {componentType && (
              <p className="text-sm text-red-600 mt-1">Type: {componentType}</p>
            )}
            <button
              onClick={this.handleReset}
              className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reset
            </button>
          </div>
        );
      }

      // Show error fallback with retry option
      return (
        <ComponentErrorFallback
          error={error}
          componentType={componentType}
          componentId={componentId}
          onRetry={this.handleRetry}
        />
      );
    }

    return children;
  }
}

