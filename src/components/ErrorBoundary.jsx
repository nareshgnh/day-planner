// src/components/ErrorBoundary.jsx
import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log while keeping UI usable
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center bg-[var(--color-bg)] text-[var(--color-text)]">
          <div className="max-w-md">
            <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-sm opacity-80 mb-4">
              Please refresh the page. If the issue persists, clear the app's
              offline cache (Service Worker) and try again.
            </p>
            <button
              className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-[var(--color-primary)] text-white"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

