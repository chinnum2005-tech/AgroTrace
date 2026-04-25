import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Palette, Database, Key, Loader2, CheckCircle } from 'lucide-react';
import { toast } from '../../components/Toast';

export default function SettingsPage() {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const settingsCategories = [
    { name: 'General Settings', icon: <Settings className="w-6 h-6" />, description: 'Basic platform configuration' },
    { name: 'Notifications', icon: <Bell className="w-6 h-6" />, description: 'Email and push notification settings' },
    { name: 'Security', icon: <Shield className="w-6 h-6" />, description: 'Password, 2FA, and access control' },
    { name: 'Appearance', icon: <Palette className="w-6 h-6" />, description: 'Theme and display preferences' },
    { name: 'Database', icon: <Database className="w-6 h-6" />, description: 'Backup and data management' },
    { name: 'API Keys', icon: <Key className="w-6 h-6" />, description: 'Manage API credentials' },
  ];

  const handleCategoryClick = (name: string) => {
    toast.info(`Opening ${name} configuration module...`);
  };

  const handleAction = async (action: string) => {
    setLoadingAction(action);
    toast.info(`Initializing ${action}...`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoadingAction(null);
    
    if (action === 'Export Data') {
      toast.success('Platform data exported successfully! Download starting...');
    } else if (action === 'Backup Database') {
      toast.success('Database snapshot created successfully! Securely stored in AWS S3.');
    } else if (action === 'System Health') {
      toast.success('System is 100% healthy. All microservices are online.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">⚙️ Settings</h1>
        <p className="text-gray-600 mt-1">Configure your platform preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCategories.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleCategoryClick(category.name)}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white">
                {category.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleAction('Export Data')}
            disabled={loadingAction !== null}
            className={`p-4 rounded-xl transition-colors text-left relative overflow-hidden ${loadingAction === 'Export Data' ? 'bg-green-100 opacity-80' : 'bg-green-50 hover:bg-green-100'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {loadingAction === 'Export Data' ? <Loader2 className="w-5 h-5 text-green-800 animate-spin" /> : <Database className="w-5 h-5 text-green-800" />}
              <h3 className="font-semibold text-green-800">Export Data</h3>
            </div>
            <p className="text-sm text-green-600">Download all platform data</p>
          </button>
          
          <button 
            onClick={() => handleAction('Backup Database')}
            disabled={loadingAction !== null}
            className={`p-4 rounded-xl transition-colors text-left relative overflow-hidden ${loadingAction === 'Backup Database' ? 'bg-blue-100 opacity-80' : 'bg-blue-50 hover:bg-blue-100'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {loadingAction === 'Backup Database' ? <Loader2 className="w-5 h-5 text-blue-800 animate-spin" /> : <Shield className="w-5 h-5 text-blue-800" />}
              <h3 className="font-semibold text-blue-800">Backup Database</h3>
            </div>
            <p className="text-sm text-blue-600">Create database snapshot</p>
          </button>
          
          <button 
            onClick={() => handleAction('System Health')}
            disabled={loadingAction !== null}
            className={`p-4 rounded-xl transition-colors text-left relative overflow-hidden ${loadingAction === 'System Health' ? 'bg-purple-100 opacity-80' : 'bg-purple-50 hover:bg-purple-100'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {loadingAction === 'System Health' ? <Loader2 className="w-5 h-5 text-purple-800 animate-spin" /> : <CheckCircle className="w-5 h-5 text-purple-800" />}
              <h3 className="font-semibold text-purple-800">System Health</h3>
            </div>
            <p className="text-sm text-purple-600">Check system status</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
