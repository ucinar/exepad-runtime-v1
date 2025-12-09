/**
 * Page Error Boundary
 * Catches errors at the page level
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorReportingService } from '../../services/ErrorReportingService';
import { PageErrorFallback } from './ErrorFallback';
import { getRuntimeMode } from '../RuntimeMode';

interface Props {
  children: ReactNode;
  pageId?: string;
  appId?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * PageErrorBoundary
 * 
 * Features:
 * - Catches page-level errors
 * - Full-page error display
 * - Error reporting to Sentry
 * - Navigation recovery options
 */
export class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { pageId, appId, onError } = this.props;

    console.error('[PageErrorBoundary] Page error caught:', {
      pageId,
      appId,
      error: error.message,
      stack: error.stack,
    });

    // Store error info
    this.setState({ errorInfo });

    // Report error
    ErrorReportingService.report(error, {
      componentType: 'Page',
      componentId: pageId,
      appId,
      mode: getRuntimeMode(),
      timestamp: Date.now(),
      stackTrace: error.stack,
      userAction: 'page_load',
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  }

  /**
   * Retry loading the page
   */
  private handleRetry = (): void => {
    console.log('[PageErrorBoundary] Retrying page load');
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Reset and navigate back
   */
  private handleReset = (): void => {
    const { onReset } = this.props;

    console.log('[PageErrorBoundary] Resetting page');

    if (onReset) {
      onReset();
    } else {
      // Default: go back in history
      window.history.back();
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Show page-level error fallback
      return (
        <PageErrorFallback
          error={error}
          errorInfo={errorInfo || undefined}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
        />
      );
    }

    return children;
  }
}

