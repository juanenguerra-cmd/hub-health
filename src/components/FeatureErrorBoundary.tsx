import React, { type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

interface FeatureErrorBoundaryProps {
  children: ReactNode;
  featureName: string;
  fallbackComponent?: ReactNode;
  showHomeButton?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface FeatureErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Feature-specific error boundary that provides graceful degradation
 * for individual features without crashing the entire application.
 * 
 * @example
 * <FeatureErrorBoundary featureName="Audit Sessions">
 *   <SessionsPage />
 * </FeatureErrorBoundary>
 */
export class FeatureErrorBoundary extends React.Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  public state: FeatureErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<FeatureErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { featureName, onError } = this.props;
    
    // Log to console
    console.error(`Error in ${featureName}:`, error, errorInfo);
    
    // Log to external error tracking service (e.g., Sentry, LogRocket)
    // Uncomment when error tracking is set up
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     contexts: {
    //       react: {
    //         componentStack: errorInfo.componentStack,
    //       },
    //     },
    //     tags: {
    //       feature: featureName,
    //     },
    //   });
    // }

    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call optional error handler
    if (onError) {
      onError(error, errorInfo);
    }
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render(): ReactNode {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { children, featureName, fallbackComponent, showHomeButton = true } = this.props;

    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallbackComponent) {
        return fallbackComponent;
      }

      // Otherwise, show default error UI
      return (
        <ErrorFallback
          featureName={featureName}
          error={error}
          errorInfo={errorInfo}
          errorCount={errorCount}
          onReset={this.handleReset}
          showHomeButton={showHomeButton}
        />
      );
    }

    return children;
  }
}

interface ErrorFallbackProps {
  featureName: string;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  onReset: () => void;
  showHomeButton: boolean;
}

function ErrorFallback({
  featureName,
  error,
  errorInfo,
  errorCount,
  onReset,
  showHomeButton,
}: ErrorFallbackProps) {
  const navigate = useNavigate();

  // If error keeps happening, show more severe warning
  const isCritical = errorCount > 2;

  return (
    <div 
      className="flex min-h-[400px] w-full items-center justify-center p-6"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="w-full max-w-2xl space-y-4">
        <Alert variant={isCritical ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-lg font-semibold">
            {isCritical 
              ? `Critical Error in ${featureName}` 
              : `${featureName} Temporarily Unavailable`
            }
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>
              {isCritical
                ? `This feature has encountered multiple errors and may need attention. Please navigate to another section or contact support.`
                : `We're sorry, but the ${featureName} feature encountered an unexpected error. Your data is safe.`
              }
            </p>
            
            {error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium hover:underline">
                  Technical Details
                </summary>
                <div className="mt-2 space-y-2 rounded-md bg-muted p-3 text-xs font-mono">
                  <div>
                    <strong>Error:</strong> {error.message}
                  </div>
                  {errorInfo?.componentStack && (
                    <div className="max-h-40 overflow-y-auto">
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-[10px]">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                  {error.stack && (
                    <div className="max-h-40 overflow-y-auto">
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-[10px]">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-3">
          {!isCritical && (
            <Button 
              onClick={onReset}
              variant="default"
              className="gap-2"
              aria-label={`Retry loading ${featureName}`}
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          
          {showHomeButton && (
            <Button
              onClick={() => navigate('/dashboard')}
              variant={isCritical ? 'default' : 'outline'}
              className="gap-2"
              aria-label="Return to dashboard"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          )}

          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            aria-label="Reload the application"
          >
            Reload App
          </Button>
        </div>

        {isCritical && (
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Need help?</strong> If this error persists, try:
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Clearing your browser cache and cookies</li>
                <li>Using a different browser</li>
                <li>Checking for browser extensions that might interfere</li>
                <li>Contacting your system administrator</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
