import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Package, MapPin, CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import Card from '../components/Card';
import Timeline from '../components/Timeline';
import BlockchainBadge from '../components/BlockchainBadge';
import Sidebar from '../components/Sidebar';

interface Shipment {
  id: string;
  productName: string;
  farmName: string;
  destination: string;
  status: 'IN_TRANSIT' | 'DELIVERED' | 'PENDING';
  estimatedDelivery: string;
  blockchainTx?: string;
}

export default function DistributorDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load shipments from backend
    setShipments([
      {
        id: 'SHP001',
        productName: 'Organic Rice - 500kg',
        farmName: 'Green Valley Farm, Kerala',
        destination: 'FreshMart, Bangalore',
        status: 'IN_TRANSIT',
        estimatedDelivery: '2026-03-15',
        blockchainTx: '0x8c3a2f9e1b4d7c6a5e3f2d1c0b9a8e7d6c5b4a3f',
      },
      {
        id: 'SHP002',
        productName: 'Wheat Flour - 1000kg',
        farmName: 'Punjab Grains Co.',
        destination: 'Distribution Center, Delhi',
        status: 'PENDING',
        estimatedDelivery: '2026-03-18',
      },
      {
        id: 'SHP003',
        productName: 'Fresh Vegetables - 200kg',
        farmName: 'Sunrise Organics, Karnataka',
        destination: 'Retail Hub, Mumbai',
        status: 'DELIVERED',
        estimatedDelivery: '2026-03-10',
        blockchainTx: '0x7b2a1e8d0c3b6a5f4e2d1c0b9a8e7d6c5b4a3f2e',
      },
    ]);
    setLoading(false);
  }, []);

  const handleUpdateStatus = async (shipmentId: string, newStatus: string) => {
    // Call backend API to update shipment status and record on blockchain
    alert(`Shipment ${shipmentId} updated to ${newStatus}`);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Truck },
    { name: 'New Shipment', href: '#', icon: Package },
    { name: 'Track Shipments', href: '#', icon: MapPin },
    { name: 'History', href: '#', icon: Clock },
    { name: 'Blockchain Log', href: '#', icon: CheckCircle },
  ];

  const user = { firstName: 'Sarah', lastName: 'Distributor', role: 'DISTRIBUTOR' };

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
          <h2 className="text-3xl font-bold text-accent mb-2">
            Transport Dashboard 🚚
          </h2>
          <p className="text-gray-600">Manage shipments and update supply chain events</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Active Shipments', value: '12', icon: Truck, color: 'bg-primary' },
            { title: 'Delivered', value: '45', icon: CheckCircle, color: 'bg-accent' },
            { title: 'Pending', value: '8', icon: Clock, color: 'bg-primary-dark' },
            { title: 'Total Distance', value: '2,450 km', icon: MapPin, color: 'bg-primary-light' }
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

        {/* Active Shipments */}
        <Card 
          title="Active Shipments" 
          icon={<Truck className="h-6 w-6" />}
          action={
            <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm transition-colors">
              + New Shipment
            </button>
          }
        >
          <div className="space-y-4">
            {shipments.map((shipment) => (
              <motion.div
                key={shipment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Package className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-gray-900">{shipment.productName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        shipment.status === 'IN_TRANSIT' 
                          ? 'bg-blue-100 text-blue-700'
                          : shipment.status === 'DELIVERED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {shipment.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>From: {shipment.farmName}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Truck className="h-4 w-4" />
                        <span>To: {shipment.destination}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>ETA: {shipment.estimatedDelivery}</span>
                      </div>
                      {shipment.blockchainTx && (
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <BlockchainBadge hash={shipment.blockchainTx} compact />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    {shipment.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() => handleUpdateStatus(shipment.id, 'DELIVERED')}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Mark Delivered</span>
                      </button>
                    )}
                    {shipment.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(shipment.id, 'IN_TRANSIT')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-1"
                      >
                        <Truck className="h-4 w-4" />
                        <span>Start Transit</span>
                      </button>
                    )}
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Supply Chain Timeline */}
        <div className="mt-8">
          <Card title="Recent Supply Chain Events" icon={<TrendingUp className="h-6 w-6" />}>
            <Timeline events={[
              {
                icon: <Package className="h-8 w-8" />,
                title: "Shipment Picked Up",
                description: "Organic Rice collected from Green Valley Farm",
                date: "Mar 12, 2026 - 09:30 AM",
                status: "completed"
              },
              {
                icon: <Truck className="h-8 w-8" />,
                title: "In Transit",
                description: "En route to Bangalore Distribution Center",
                date: "Mar 13, 2026 - 02:15 PM",
                status: "current"
              },
              {
                icon: <CheckCircle className="h-8 w-8" />,
                title: "Quality Check",
                description: "Inspection scheduled at checkpoint",
                date: "Mar 14, 2026 - 10:00 AM",
                status: "pending"
              },
              {
                icon: <MapPin className="h-8 w-8" />,
                title: "Final Delivery",
                description: "Delivery to FreshMart Retail Store",
                date: "Mar 15, 2026 - 04:00 PM",
                status: "pending"
              }
            ]} />
          </Card>
        </div>

        {/* Blockchain Recording */}
        <div className="mt-8">
          <Card 
            title="Blockchain Event Recording" 
            icon={<CheckCircle className="h-6 w-6" />}
            gradient
          >
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-primary/20">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-6 w-6 text-primary mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Record Supply Chain Event
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Update shipment location and status on the Polygon blockchain for immutable tracking
                    </p>
                    
                    <div className="flex gap-3">
                      <select className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>Select Event Type</option>
                        <option>Pickup Confirmed</option>
                        <option>In Transit</option>
                        <option>Quality Check Passed</option>
                        <option>Delivered</option>
                      </select>
                      <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors font-semibold">
                        Record on Blockchain
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Last Sync Successful</p>
                      <p className="text-sm text-green-700">All events recorded on blockchain</p>
                    </div>
                  </div>
                  <BlockchainBadge hash="0x9d4b3c0e2f1a8e7d6c5b4a3f2e1d0c9b8a7f6e5d" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
