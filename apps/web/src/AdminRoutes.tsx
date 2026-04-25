import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/admin/Dashboard';
import UsersPage from './pages/admin/UsersPage';
import FarmsPage from './pages/admin/FarmsPage';
import ProductsPage from './pages/admin/ProductsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import VerificationPage from './pages/admin/VerificationPage';
import SettingsPage from './pages/admin/SettingsPage';

export default function AdminRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/farms" element={<FarmsPage />} />
        <Route path="/admin/products" element={<ProductsPage />} />
        <Route path="/admin/analytics" element={<AnalyticsPage />} />
        <Route path="/admin/verifications" element={<VerificationPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}
