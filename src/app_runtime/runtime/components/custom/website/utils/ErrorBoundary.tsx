// src/app_runtime/runtime/components/custom/website/utils/ErrorBoundary.tsx

"use client"

import React, { ReactNode } from 'react';

/**
 * Props for the ErrorBoundary component.
 * It accepts a fallback UI to display when an error is caught.
 */
interface ErrorBoundaryProps {
  fallbackUI: ReactNode;
  children: ReactNode;
}

/**
 * State for the ErrorBoundary component.
 * Tracks whether an error has occurred.
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * A standard React Error Boundary component.
 * It catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the crashed tree.
 */
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Initialize the state so it has not caught an error yet
    this.state = { hasError: false };
  }

  /**
   * This lifecycle method is used to update the state when an error is thrown
   * by a descendant component.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  /**
   * This lifecycle method is used for logging the error information.
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    // If an error was caught, render the fallback UI.
    if (this.state.hasError) {
      return this.props.fallbackUI;
    }

    // If there are no errors, render the children as normal.
    return this.props.children;
  }
}