/**
 * useErrorHandler Hook
 * For functional components to programmatically report errors
 */

import { useCallback, useState } from 'react';
import { ErrorReportingService } from '../../services/ErrorReportingService';
import { getRuntimeMode } from '../RuntimeMode';

interface ErrorHandlerOptions {
  componentType?: string;
  componentId?: string;
  appId?: string;
  onError?: (error: Error) => void;
  rethrow?: boolean;
}

interface ErrorState {
  error: Error | null;
  hasError: boolean;
  errorCount: number;
}

/**
 * useErrorHandler
 * 
 * A hook for handling errors in functional components
 * 
 * @example
 * ```tsx
 * const { handleError, resetError, error, hasError } = useErrorHandler({
 *   componentType: 'Button',
 *   componentId: 'submit-btn',
 * });
 * 
 * const handleClick = async () => {
 *   try {
 *     await riskyOperation();
 *   } catch (err) {
 *     handleError(err);
 *   }
 * };
 * ```
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    hasError: false,
    errorCount: 0,
  });

  /**
   * Handle an error and report it
   */
  const handleError = useCallback(
    (error: Error | unknown, context?: Record<string, any>) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const { componentType, componentId, appId, onError, rethrow = false } = options;

      console.error('[useErrorHandler] Error caught:', {
        componentType,
        componentId,
        error: errorObj.message,
      });

      // Update local error state
      setErrorState((prev) => ({
        error: errorObj,
        hasError: true,
        errorCount: prev.errorCount + 1,
      }));

      // Report error
      ErrorReportingService.report(errorObj, {
        componentType,
        componentId,
        appId,
        mode: getRuntimeMode(),
        timestamp: Date.now(),
        stackTrace: errorObj.stack,
        ...context,
      });

      // Call custom error handler if provided
      if (onError) {
        onError(errorObj);
      }

      // Rethrow if requested (useful for error boundaries)
      if (rethrow) {
        throw errorObj;
      }
    },
    [options]
  );

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    const { componentId } = options;

    if (componentId) {
      ErrorReportingService.clearErrors(componentId);
    }

    setErrorState({
      error: null,
      hasError: false,
      errorCount: 0,
    });
  }, [options]);

  /**
   * Clear error without resetting count
   */
  const clearError = useCallback(() => {
    setErrorState((prev) => ({
      ...prev,
      error: null,
      hasError: false,
    }));
  }, []);

  /**
   * Check if recovery is allowed based on error count
   */
  const canRecover = useCallback(() => {
    return ErrorReportingService.shouldRecover({
      componentId: options.componentId || 'unknown',
      componentType: options.componentType,
    });
  }, [options.componentId, options.componentType]);

  return {
    error: errorState.error,
    hasError: errorState.hasError,
    errorCount: errorState.errorCount,
    handleError,
    resetError,
    clearError,
    canRecover,
  };
}

