import React, { Component, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In a real production app, we would log this to Sentry or Datadog here.
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: 'var(--bg-app)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(225, 29, 72, 0.1)',
              padding: '20px',
              borderRadius: '50%',
              color: 'var(--brand-danger)',
              marginBottom: '24px',
            }}
          >
            <AlertTriangle size={48} />
          </div>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginBottom: '12px',
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              color: 'var(--text-muted)',
              maxWidth: '400px',
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            We've encountered an unexpected error. Our team has been notified. Please try refreshing
            the page to continue.
          </p>

          <Button variant="primary" onClick={this.handleReload} leftIcon={<RefreshCcw size={18} />}>
            Reload Application
          </Button>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div
              style={{
                marginTop: '40px',
                padding: '16px',
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
                borderRadius: '8px',
                textAlign: 'left',
                maxWidth: '800px',
                width: '100%',
                overflowX: 'auto',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            >
              <strong>{this.state.error.name}:</strong> {this.state.error.message}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
