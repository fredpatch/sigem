import React, { Component } from "react";

interface ErrorBoundaryProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKey?: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log the error to console for development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="text-center flex flex-col items-center justify-center h-screen w-screen text-gray-700 dark:bg-gray-900 dark:text-gray-300">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="text-red-500 mb-6">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold mb-4 text-red-500">
                Oops! <br /> Got some issues here Sherlocks
              </p>
              <p className="text-xl font-bold mb-2">
                "{this.state.error?.message || "An unexpected error occurred."}"
              </p>
              <p className="text-sm underline mb-6 text-gray-500 dark:text-gray-400">
                Our team has been notified and is working on it. Give us a
                minute we will fix it real quick !
              </p>
              <button
                onClick={this.handleRetry}
                className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                Try Again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
