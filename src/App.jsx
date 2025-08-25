import { Route, Routes } from "react-router-dom";
import { motion } from "framer-motion";
import React, { Component } from "react";
import Layout from "@/components/organisms/Layout";
import Error from "@/components/ui/Error";
import Leaderboard from "@/components/pages/Leaderboard";
import Calendar from "@/components/pages/Calendar";
import Analytics from "@/components/pages/Analytics";
import Pipeline from "@/components/pages/Pipeline";
import Dashboard from "@/components/pages/Dashboard";
import Leads from "@/components/pages/Leads";
import Hotlist from "@/components/pages/Hotlist";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false, 
      error: null, 
      errorInfo: null,
      isCanvasError: false 
    };
  }

static getDerivedStateFromError(error) {
// Check if it's a canvas-related error from external scripts
const isCanvasError = error.message?.includes('canvas') || 
error.message?.includes('viewport') ||
error.message?.includes('drawImage') ||
error.message?.includes('InvalidStateError');

// For canvas errors, don't show error UI
if (isCanvasError) {
return { 
hasError: false, 
error: null,
isCanvasError: true 
};
}

return { 
hasError: true, 
error,
isCanvasError: false
};
}

componentDidCatch(error, errorInfo) {
// Enhanced error logging with categorization
const errorDetails = {
message: error.message,
stack: error.stack,
componentStack: errorInfo.componentStack,
timestamp: new Date().toISOString(),
userAgent: navigator.userAgent,
url: window.location.href
};

// Handle canvas and viewport errors from external scripts
if (error.message?.includes('canvas') || 
error.message?.includes('viewport') || 
error.message?.includes('drawImage') ||
error.message?.includes('InvalidStateError')) {
console.warn('External script canvas error caught:', {
...errorDetails,
type: 'CANVAS_ERROR',
source: 'EXTERNAL_SCRIPT'
});
return;
}

    // Log other application errors
    console.error('Application error:', errorDetails);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isCanvasError: false 
    });
  }

  render() {
    // Don't render error UI for canvas errors from external scripts
    if (this.state.isCanvasError && !this.state.hasError) {
      return this.props.children;
    }

    if (this.state.hasError && !this.state.isCanvasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="mb-4">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Please try again or reload the page.
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reload Page
</button>
            </div>
            {import.meta.env?.DEV && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard />
            </motion.div>
          } />
          <Route path="/leads" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Leads />
            </motion.div>
          } />
          <Route path="/hotlist" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Hotlist />
            </motion.div>
} />
          <Route path="/pipeline" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Pipeline />
            </motion.div>
          } />
          <Route path="/analytics" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Analytics />
            </motion.div>
          } />
          <Route path="/calendar" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Calendar />
            </motion.div>
          } />
          <Route path="/leaderboard" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Leaderboard />
            </motion.div>
          } />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;