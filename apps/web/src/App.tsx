import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import SupplyChainDashboard from './pages/SupplyChainDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DistributorDashboard from './pages/DistributorDashboard';
import Marketplace from './pages/Marketplace';
import Farms from './pages/Farms';
import Crops from './pages/Crops';
import SupplyChain from './pages/SupplyChain';
import Verify from './pages/Verify';
import ProductTrace from './pages/ProductTrace';
import MapDemo from './pages/MapDemo';

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
    <Router>
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
        <Route path="/trace/:productId" element={<ProductTrace />} />

        {/* Map demo page (for testing) */}
        <Route path="/map-demo" element={<MapDemo />} />

        {/* Default redirect */}
        <Route path="/*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
