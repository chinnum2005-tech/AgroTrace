import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import BlockchainBadge from '../components/BlockchainBadge';
import { Users, Package, Shield, TrendingUp, Leaf, CheckCircle, DollarSign, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const navigation = [
    { name: 'Dashboard', href: '#', icon: Activity },
    { name: 'Users', href: '#', icon: Users },
    { name: 'Batches', href: '#', icon: Package },
    { name: 'Blockchain', href: '#', icon: Shield },
    { name: 'Analytics', href: '#', icon: TrendingUp },
  ];

  const user = { firstName: 'Admin', lastName: '', role: 'ADMINISTRATOR' };

  const stats = [
    { title: 'Total Farmers', value: '156', icon: Users, color: 'bg-primary', change: '+12%' },
    { title: 'Total Batches', value: '1,248', icon: Package, color: 'bg-accent', change: '+24%' },
    { title: 'Blockchain Txns', value: '3,891', icon: Shield, color: 'bg-primary-dark', change: '+18%' },
    { title: 'Revenue', value: '₹3.75L', icon: TrendingUp, color: 'bg-primary-light', change: '+31%' }
  ];

  const recentBatches = [
    { id: 'B001', farmer: 'John Smith', crop: 'Organic Rice', status: 'Verified', hash: '0x8c3a2f...' },
    { id: 'B002', farmer: 'Mary Johnson', crop: 'Wheat', status: 'Pending', hash: 'Pending...' },
    { id: 'B003', farmer: 'Robert Brown', crop: 'Corn', status: 'Verified', hash: '0x5d7e9a...' },
    { id: 'B004', farmer: 'Patricia Davis', crop: 'Soybeans', status: 'Verified', hash: '0x2f4b8c...' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar navigation={navigation} user={user} />
      
      <div className="ml-64 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-accent mb-2">Admin Dashboard 🧑‍💻</h2>
          <p className="text-gray-600">Monitor system performance and blockchain transactions</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card gradient className="hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {stat.change} this month
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="text-white h-6 w-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card title="System Health" icon={<Activity className="h-6 w-6" />}>
            <div className="space-y-4">
              {[
                { label: 'API Status', value: 'Operational', color: 'text-green-600' },
                { label: 'Database', value: 'Connected', color: 'text-green-600' },
                { label: 'Blockchain Network', value: 'Polygon Mainnet', color: 'text-purple-600' },
                { label: 'Active Users', value: '47 online', color: 'text-blue-600' }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">{item.label}</span>
                  <span className={`font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Blockchain Status" icon={<Shield className="h-6 w-6" />}>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3 mb-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <p className="font-semibold text-green-800">All Systems Verified</p>
                </div>
                <p className="text-sm text-green-700">Last block sync: 30 seconds ago</p>
              </div>
              <BlockchainBadge 
                verified={true} 
                hash="0x9f2e8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f"
                network="Polygon"
              />
            </div>
          </Card>
        </div>

        {/* Recent Batches Table */}
        <Card title="Recent Crop Batches" icon={<Package className="h-6 w-6" />}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Batch ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Farmer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Crop</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Blockchain Hash</th>
                </tr>
              </thead>
              <tbody>
                {recentBatches.map((batch, index) => (
                  <motion.tr
                    key={batch.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 hover:bg-secondary-light/20 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-primary">{batch.id}</td>
                    <td className="py-3 px-4 text-gray-900">{batch.farmer}</td>
                    <td className="py-3 px-4 text-gray-600">{batch.crop}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        batch.status === 'Verified' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm text-gray-600">{batch.hash}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Manage Users', icon: Users, color: 'from-primary to-primary-light' },
            { label: 'View All Transactions', icon: Shield, color: 'from-accent to-accent-light' },
            { label: 'Generate Reports', icon: TrendingUp, color: 'from-secondary to-secondary-light' }
          ].map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-r ${action.color} text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 font-semibold`}
            >
              <action.icon className="h-5 w-5" />
              <span>{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
