import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FarmerDashboard from './pages/FarmerDashboardNew';
import SupplyChainDashboard from './pages/SupplyChainDashboard';
import AdminDashboard from './pages/AdminDashboardNew';
import DistributorDashboard from './pages/DistributorDashboard';
import Marketplace from './pages/Marketplace';
import Farms from './pages/Farms';
import Crops from './pages/Crops';
import SupplyChain from './pages/SupplyChain';
import Verify from './pages/Verify';
import ProductTracePro from './pages/ProductTracePro';
import MapDemo from './pages/MapDemo';
import Chatbot from './pages/Chatbot';

// Admin Pages

import UsersPage from './pages/admin/UsersPage';
import FarmsPage from './pages/admin/FarmsPage';
import ProductsPage from './pages/admin/ProductsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import VerificationPage from './pages/admin/VerificationPage';
import SettingsPage from './pages/admin/SettingsPage';

// Components
import { ToastContainer } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import { NetworkStatus } from './components/NetworkStatus';
import { DemoModeToggle } from './components/DemoModeToggle';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Types
import { User } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <NetworkStatus />
        <DemoModeToggle />
        <Router>
          <div className="min-h-screen bg-background dark:bg-dark">
            <Navbar user={user} onLogout={handleLogout} />
            <main className="flex-1">
              <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Role-based dashboard routes */}
        <Route
          path="/farmer/dashboard"
          element={
            isAuthenticated && user?.role === 'FARMER' ? (
              <FarmerDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        <Route
          path="/distributor/dashboard"
          element={
            isAuthenticated && user?.role === 'DISTRIBUTOR' ? (
              <DistributorDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        <Route
          path="/admin/dashboard"
          element={
            isAuthenticated && user?.role === 'ADMIN' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        {/* Generic dashboard route - redirects based on role */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              user?.role === 'FARMER' ? (
                <Navigate to="/farmer/dashboard" />
              ) : user?.role === 'DISTRIBUTOR' ? (
                <Navigate to="/distributor/dashboard" />
              ) : user?.role === 'ADMIN' ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <Navigate to="/marketplace" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        {/* Marketplace - Public route */}
        <Route path="/marketplace" element={<Marketplace />} />
        
        <Route
          path="/farms"
          element={
            isAuthenticated ? (
              <Farms user={user!} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        <Route
          path="/crops"
          element={
            isAuthenticated ? (
              <Crops user={user!} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        <Route
          path="/supply-chain"
          element={
            isAuthenticated ? (
              <SupplyChain user={user!} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Public verification page */}
        <Route path="/verify" element={<Verify />} />

        {/* Product traceability page (public) */}
        <Route path="/trace/:productId" element={<ProductTracePro />} />

        {/* Map demo page (for testing) */}
        <Route path="/map-demo" element={<MapDemo />} />

        {/* Protected Admin Routes */}

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/farms"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <FarmsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verifications"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <VerificationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* AI Chatbot (Public) */}
        <Route path="/chatbot" element={<Chatbot />} />

        {/* Default redirect */}
        <Route path="/*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </main>
          </div>
        </Router>
        <ToastContainer />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
