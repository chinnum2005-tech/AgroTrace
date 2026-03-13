import { Home, Leaf, Package, Truck, LogOut, User as UserIcon, Shield, TrendingUp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Farms', href: '/farms', icon: Leaf },
    { name: 'Crops', href: '/crops', icon: Package },
    { name: 'Supply Chain', href: '/supply-chain', icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl border-r border-secondary/20">
        <div className="flex items-center justify-between h-16 bg-primary px-6">
          <div className="flex items-center space-x-2">
            <Leaf className="text-white h-7 w-7" />
            <h1 className="text-white text-xl font-bold">AgroTrace</h1>
          </div>
          <button onClick={onLogout} className="text-white hover:bg-primary-dark p-2 rounded-lg transition-colors" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
        
        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary-light rounded-full flex items-center justify-center">
              <UserIcon className="text-primary-dark h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-500 flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                {user.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-700 hover:bg-secondary-light hover:text-primary-dark'
                }`}
              >
                <Icon size={20} className="mr-3" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-accent">Welcome back, {user.firstName}! 👋</h2>
          <p className="text-gray-600 mt-2">Here's what's happening with your crops today.</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Farms', value: '0', icon: Leaf, color: 'bg-primary' },
            { title: 'Active Crops', value: '0', icon: Package, color: 'bg-accent' },
            { title: 'Predictions', value: '0', icon: TrendingUp, color: 'bg-primary-dark' },
            { title: 'Supply Events', value: '0', icon: Truck, color: 'bg-primary-light' }
          ].map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="text-white h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-accent mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {user.role === 'FARMER' && (
              <>
                <Link to="/farms" className="p-4 bg-gradient-to-br from-primary to-primary-light rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <h4 className="font-semibold text-white text-lg">Register Farm</h4>
                  <p className="text-sm text-white/90 mt-1">Add your farm details</p>
                </Link>
                
                <Link to="/crops" className="p-4 bg-gradient-to-br from-accent to-accent-light rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <h4 className="font-semibold text-white text-lg">Add Crop Batch</h4>
                  <p className="text-sm text-white/90 mt-1">Record new crop data</p>
                </Link>
              </>
            )}
            {user.role === 'DISTRIBUTOR' && (
              <Link to="/supply-chain" className="p-4 bg-gradient-to-br from-primary-dark to-primary rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <h4 className="font-semibold text-white text-lg">Update Shipment</h4>
                <p className="text-sm text-white/90 mt-1">Track product movement</p>
              </Link>
            )}
            <Link to="/verify" className="p-4 bg-gradient-to-br from-secondary to-secondary-light rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <h4 className="font-semibold text-primary-dark text-lg">Verify Product</h4>
              <p className="text-sm text-gray-700 mt-1">Scan QR code</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-secondary/20">
          <h3 className="text-xl font-bold text-accent mb-4">Recent Activity</h3>
          <div className="text-gray-500 text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No recent activity. Get started by adding your first farm or crop!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
