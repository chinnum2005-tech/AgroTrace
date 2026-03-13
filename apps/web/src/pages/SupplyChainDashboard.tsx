import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Timeline from '../components/Timeline';
import { motion } from 'framer-motion';
import { Truck, Package, MapPin, CheckCircle, Leaf, ClipboardList, BarChart3 } from 'lucide-react';

const SupplyChainDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const navigation = [
    { name: 'Overview', href: '#', icon: BarChart3 },
    { name: 'Update Status', href: '#', icon: ClipboardList },
    { name: 'Track Batches', href: '#', icon: Package },
    { name: 'Transport Logs', href: '#', icon: Truck },
    { name: 'Locations', href: '#', icon: MapPin },
  ];

  const user = { firstName: 'Sarah', lastName: 'Distributor', role: 'DISTRIBUTOR' };

  const timelineEvents = [
    {
      icon: <Leaf className="h-8 w-8" />,
      title: '🌾 Farm Harvested',
      description: 'Organic Rice harvested at Green Valley Farm',
      date: 'Mar 12, 2026 - 09:30 AM',
      status: 'completed' as const
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: '📦 Packed & Processed',
      description: 'Graded, cleaned and packaged in 50kg bags',
      date: 'Mar 12, 2026 - 02:15 PM',
      status: 'completed' as const
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: '🚚 Transported to Warehouse',
      description: 'Shipped via refrigerated truck (Temp: 18°C)',
      date: 'Mar 13, 2026 - 08:00 AM',
      status: 'current' as const
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: '🏪 Retail Store Delivery',
      description: 'Scheduled delivery to FreshMart Retail',
      date: 'Mar 14, 2026 - 10:00 AM',
      status: 'pending' as const
    }
  ];

  const batches = [
    { id: 'B001', product: 'Organic Rice', from: 'Green Valley Farm', to: 'Central Warehouse', status: 'In Transit', temp: '18°C' },
    { id: 'B002', product: 'Wheat Grains', from: 'Sunny Farms', to: 'Processing Unit', status: 'Delivered', temp: '20°C' },
    { id: 'B003', product: 'Fresh Corn', from: 'Happy Acres', to: 'Retail Store', status: 'Pending', temp: '15°C' },
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
          <h2 className="text-3xl font-bold text-accent mb-2">Supply Chain Dashboard 🚚</h2>
          <p className="text-gray-600">Track and update product movement across the supply chain</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Active Shipments', value: '15', icon: Truck, color: 'bg-primary' },
            { title: 'Delivered', value: '42', icon: CheckCircle, color: 'bg-accent' },
            { title: 'In Transit', value: '8', icon: MapPin, color: 'bg-primary-dark' },
            { title: 'Total Distance', value: '2,450 km', icon: Truck, color: 'bg-primary-light' }
          ].map((stat, index) => (
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
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="text-white h-6 w-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Update Product Status', icon: ClipboardList, color: 'from-primary to-primary-light' },
            { label: 'Add Transport Log', icon: Truck, color: 'from-accent to-accent-light' },
            { label: 'View All Batches', icon: Package, color: 'from-secondary to-secondary-light' }
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timeline */}
          <Card title="Product Journey Timeline" icon={<Truck className="h-6 w-6" />}>
            <Timeline events={timelineEvents} />
          </Card>

          {/* Active Batches Table */}
          <Card title="Active Batches" icon={<Package className="h-6 w-6" />}>
            <div className="space-y-4">
              {batches.map((batch, index) => (
                <motion.div
                  key={batch.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900">{batch.product}</h4>
                      <p className="text-sm text-gray-500 font-mono">Batch: {batch.id}</p>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      batch.status === 'In Transit' 
                        ? 'bg-blue-100 text-blue-700' 
                        : batch.status === 'Delivered'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {batch.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      {batch.from} → {batch.to}
                    </p>
                    <p className="text-gray-600">
                      🌡️ {batch.temp}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainDashboard;
