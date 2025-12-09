/**
 * App Error Boundary
 * Catches critical errors at the application level
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorReportingService } from '../../services/ErrorReportingService';
import { AppErrorFallback } from './ErrorFallback';
import { getRuntimeMode } from '../RuntimeMode';

interface Props {
  children: ReactNode;
  appId?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * AppErrorBoundary
 * 
 * Features:
 * - Catches critical application-level errors
 * - Full-screen error display
 * - Error reporting to Sentry
 * - App restart option
 * 
 * This is the top-level error boundary that should wrap the entire app.
 * Errors caught here are considered critical and typically require a full reload.
 */
export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { appId, onError } = this.props;

    console.error('[AppErrorBoundary] Critical app error caught:', {
      appId,
      error: error.message,
      stack: error.stack,
    });

    // Report critical error
    ErrorReportingService.report(error, {
      componentType: 'Application',
      componentId: 'app-root',
      appId,
      mode: getRuntimeMode(),
      timestamp: Date.now(),
      stackTrace: error.stack,
      userAction: 'app_init',
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // In production, you might want to send additional telemetry here
    if (process.env.NODE_ENV === 'production') {
      // Log to external monitoring service
      console.error('[AppErrorBoundary] Production error logged');
    }
  }

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Show critical app-level error fallback
      return <AppErrorFallback error={error} />;
    }

    return children;
  }
}

