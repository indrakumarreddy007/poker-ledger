import React from 'react';
import { RouterProvider, Routes, Route, Navigate, useRouter } from '@/lib/router';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PokerProvider } from '@/contexts/PokerContext';
import Navigation from '@/components/poker/Navigation';
import FloatingChips from '@/components/poker/FloatingChips';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Sessions from '@/pages/Sessions';
import GameSession from '@/pages/GameSession';
import Analytics from '@/pages/Analytics';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { navigate } = useRouter();
  
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
};

// App Layout with Navigation
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <FloatingChips />
      <Navigation />
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
};

// App Routes
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { currentPath } = useRouter();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
      />
      
      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Sessions />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/session/:sessionId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <GameSession />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Analytics />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <PokerProvider>
        <RouterProvider>
          <AppRoutes />
        </RouterProvider>
      </PokerProvider>
    </AuthProvider>
  );
}

export default App;
