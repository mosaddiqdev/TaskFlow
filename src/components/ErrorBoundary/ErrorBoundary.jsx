import React from "react";
import styles from "./ErrorBoundary.module.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error reporting service in production
    // e.g., Sentry.captureException(error, { extra: errorInfo });
    console.error("Application Error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <div className={styles.errorIcon}>⚠️</div>
            <h1 className={styles.errorTitle}>Something went wrong</h1>
            <p className={styles.errorMessage}>
              We're sorry, but something unexpected happened. Your data is safe.
            </p>
            <div className={styles.errorActions}>
              <button className={styles.primaryBtn} onClick={this.handleReset}>
                Reload Application
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
              >
                Clear Data & Reload
              </button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className={styles.errorDetails}>
                <summary>Error Details (Development Only)</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
