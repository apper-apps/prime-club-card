import { Route, Routes, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import React, { Component, createContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, setUser } from "./store/userSlice";
import Login from "@/components/pages/Login";
import Signup from "@/components/pages/Signup";
import Callback from "@/components/pages/Callback";
import ErrorPage from "@/components/pages/ErrorPage";
import ResetPassword from "@/components/pages/ResetPassword";
import PromptPassword from "@/components/pages/PromptPassword";
import Hotlist from "@/components/pages/Hotlist";
import Leaderboard from "@/components/pages/Leaderboard";
import Calendar from "@/components/pages/Calendar";
import Pipeline from "@/components/pages/Pipeline";
import Contacts from "@/components/pages/Contacts";
import WebsiteUrlReport from "@/components/pages/WebsiteUrlReport";
import Dashboard from "@/components/pages/Dashboard";
import Leads from "@/components/pages/Leads";
import Teams from "@/components/pages/Teams";
import Analytics from "@/components/pages/Analytics";
import Layout from "@/components/organisms/Layout";
import Error from "@/components/ui/Error";

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

// Create auth context
export const AuthContext = createContext(null);

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get authentication status with proper error handling
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;
  
  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK;
    
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true);
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        // DO NOT simplify or modify this pattern as it ensures proper redirection flow
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get('redirect');
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || 
                           currentPath.includes('/callback') || currentPath.includes('/error') || 
                           currentPath.includes('/prompt-password') || currentPath.includes('/reset-password');
        
        if (user) {
          // User is authenticated
          if (redirectPath) {
            navigate(redirectPath);
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath);
            } else {
              navigate('/');
            }
          } else {
            navigate('/');
          }
          // Store user information in Redux
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
        } else {
          // User is not authenticated
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
                ? `/signup?redirect=${currentPath}`
                : currentPath.includes('/login')
                ? `/login?redirect=${currentPath}`
                : '/login'
            );
          } else if (redirectPath) {
            if (
              !['error', 'signup', 'login', 'callback', 'prompt-password', 'reset-password'].some((path) => currentPath.includes(path))
            ) {
              navigate(`/login?redirect=${redirectPath}`);
            } else {
              navigate(currentPath);
            }
          } else if (isAuthPage) {
            navigate(currentPath);
          } else {
            navigate('/login');
          }
          dispatch(clearUser());
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error);
      }
    });
  }, []);// No props and state should be bound
  
  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };
  
  // Don't render routes until initialization is complete
  if (!isInitialized) {
    return <div className="loading flex items-center justify-center p-6 h-full w-full"><svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M12 2v4"></path><path d="m16.2 7.8 2.9-2.9"></path><path d="M18 12h4"></path><path d="m16.2 16.2 2.9 2.9"></path><path d="M12 18v4"></path><path d="m4.9 19.1 2.9-2.9"></path><path d="M2 12h4"></path><path d="m4.9 4.9 2.9 2.9"></path></svg></div>;
  }
  
  return (
    <ErrorBoundary>
      <AuthContext.Provider value={authMethods}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/prompt-password/:appId/:emailAddress/:provider" element={<PromptPassword />} />
          <Route path="/reset-password/:appId/:fields" element={<ResetPassword />} />
          <Route path="/" element={
            <Layout>
              <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3
              }}>
                <Dashboard />
              </motion.div>
            </Layout>
          } />
          <Route path="/leads" element={
            <Layout>
              <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3
              }}>
                <Leads />
              </motion.div>
            </Layout>
          } />
          <Route path="/hotlist" element={
            <Layout>
              <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3
              }}>
                <Hotlist />
              </motion.div>
            </Layout>
          } />
          <Route path="/pipeline" element={
            <Layout>
              <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3
              }}>
                <Pipeline />
              </motion.div>
            </Layout>
          } />
          <Route path="/analytics" element={
            <Layout>
              <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3
              }}>
                <Analytics />
              </motion.div>
            </Layout>
          } />
          <Route path="/calendar" element={
            <Layout>
              <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3
              }}>
                <Calendar />
              </motion.div>
            </Layout>
          } />
          <Route path="/leaderboard" element={
            <Layout>
              <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3
              }}>
                <Leaderboard />
              </motion.div>
            </Layout>
          } />
          <Route path="/contacts" element={
            <Layout>
              <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3
              }}>
                <Contacts />
              </motion.div>
            </Layout>
          } />
          <Route path="/teams" element={
            <Layout>
              <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3
              }}>
                <Teams />
              </motion.div>
            </Layout>
          } />
          <Route path="/reports/website-url" element={
            <Layout>
              <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3
              }}>
                <WebsiteUrlReport />
              </motion.div>
            </Layout>
          } />
        </Routes>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

export default App;