import React, { type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled application error', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh items-center justify-center bg-background p-6">
          <div className="w-full max-w-xl rounded-lg border border-destructive/40 bg-card p-6 text-card-foreground shadow-sm">
            <h1 className="mb-2 text-xl font-semibold text-destructive">Unable to render page</h1>
            <p className="mb-4 text-sm text-muted-foreground">
              Something went wrong while loading the app. Refresh the page to try again.
            </p>
            {this.state.errorMessage ? (
              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
                {this.state.errorMessage}
              </pre>
            ) : null}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
