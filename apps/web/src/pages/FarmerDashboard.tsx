import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import BlockchainBadge from '../components/BlockchainBadge';
import { motion } from 'framer-motion';
import { Leaf, Plus, QrCode, Upload, CheckCircle, Package, TrendingUp } from 'lucide-react';
import { cropService, farmService, verifyService, orderService } from '../services';
import { QRCodeSVG } from 'qrcode.react';

const FarmerDashboard = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<any>(null);

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    try {
      setLoading(true);
      const response = await cropService.getMyCrops();
      setBatches(response.data || []);
    } catch (error) {
      console.error('Failed to load crops:', error);
      // Mock data for demo
      setBatches([
        { id: '1', name: 'Organic Rice Batch 1', type: 'RICE', growthStage: 'READY_FOR_HARVEST', plantedAt: '2026-03-01' },
        { id: '2', name: 'Wheat Field A', type: 'WHEAT', growthStage: 'MATURING', plantedAt: '2026-03-05' },
        { id: '3', name: 'Corn Section B', type: 'CORN', growthStage: 'FLOWERING', plantedAt: '2026-03-10' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (cropId: string) => {
    try {
      const response = await verifyService.generateQRCode(cropId);
      setSelectedCrop(response.data);
      setShowQRModal(true);
    } catch (error) {
      console.error('Failed to generate QR:', error);
      alert('Failed to generate QR code. Please try again.');
    }
  };

  const handleViewOrders = async () => {
    try {
      const response = await orderService.getFarmerOrders();
      if (response.success && response.data) {
        const orders = response.data;
        if (orders.length === 0) {
          alert('📦 No orders yet for your products');
        } else {
          const orderList = orders.map((o: any) => 
            `Order #${o.id}\nProduct: ${o.productName}\nQuantity: ${o.quantity}\nAmount: ₹${o.totalAmount}\nDate: ${new Date(o.date).toLocaleDateString()}`
          ).join('\n\n');
          alert(`Your Orders:\n\n${orderList}`);
        }
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      alert('Failed to load orders');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Leaf },
    { name: 'Add Crop Batch', href: '#', icon: Plus },
    { name: 'My Products', href: '#', icon: Package },
    { name: 'Generate QR', href: '#', icon: QrCode },
    { name: 'Blockchain Status', href: '#', icon: CheckCircle },
  ];

  const user = { firstName: 'John', lastName: 'Farmer', role: 'FARMER' };

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
          <h2 className="text-3xl font-bold text-accent mb-2">Welcome Farmer John! 👋</h2>
          <p className="text-gray-600">Manage your crops and track blockchain verification</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Batches', value: '12', icon: Package, color: 'bg-primary' },
            { title: 'Verified', value: '8', icon: CheckCircle, color: 'bg-accent' },
            { title: 'Pending', value: '4', icon: TrendingUp, color: 'bg-primary-dark' },
            { title: 'Total Area', value: '45.3 ha', icon: Leaf, color: 'bg-primary-light' }
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Add New Crop Batch', icon: Plus, color: 'from-primary to-primary-light', action: () => alert('📝 Add Crop - Feature coming soon!') },
            { label: 'Generate QR Code', icon: QrCode, color: 'from-accent to-accent-light', action: () => handleGenerateQR(batches[0]?.id || '1') },
            { label: 'View My Orders', icon: TrendingUp, color: 'from-secondary to-secondary-light', action: handleViewOrders },
            { label: 'Upload Farm Images', icon: Upload, color: 'from-primary-dark to-primary', action: () => alert('📸 Upload Images - Feature coming soon!') }
          ].map((action, index) => (
            <motion.button
              key={index}
              onClick={action.action}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-r ${action.color} text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 font-semibold cursor-pointer`}
            >
              <action.icon className="h-5 w-5" />
              <span>{action.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Batches Table */}
        <Card title="Your Crop Batches" icon={<Package className="h-6 w-6" />} className="mb-8">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading crops...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Batch ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Growth Stage</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Planted Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch, index) => (
                    <motion.tr
                      key={batch.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 hover:bg-secondary-light/20 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-primary">#{batch.id}</td>
                      <td className="py-3 px-4 text-gray-900">{batch.name}</td>
                      <td className="py-3 px-4 text-gray-600">{batch.type}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          batch.growthStage === 'READY_FOR_HARVEST' 
                            ? 'bg-green-100 text-green-700' 
                            : batch.growthStage === 'MATURING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {batch.growthStage.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(batch.plantedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 space-x-2">
                        <button 
                          onClick={() => handleGenerateQR(batch.id)}
                          className="text-primary hover:text-primary-dark font-medium flex items-center"
                        >
                          <QrCode className="h-4 w-4 mr-1" />
                          Generate QR
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* QR Code Modal */}
        {showQRModal && selectedCrop && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-accent">QR Code Generated</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 flex justify-center">
                  {selectedCrop.qrCode ? (
                    <img 
                      src={selectedCrop.qrCode} 
                      alt="QR Code"
                      className="w-64 h-64 object-contain"
                    />
                  ) : (
                    <QRCodeSVG 
                      value={selectedCrop.qrData || `AGRITRACE-${selectedCrop.cropId}`}
                      size={256}
                      level="H"
                      includeMargin={true}
                    />
                  )}
                </div>
                
                <div className="text-center">
                  <p className="font-semibold text-gray-900">Product ID: {selectedCrop.cropId}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Data: {selectedCrop.qrData || 'Loading...'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Scan this QR code to verify product authenticity and traceability
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    // Create a download link for the QR code image
                    const link = document.createElement('a');
                    link.href = selectedCrop.qrCode;
                    link.download = `qrcode-${selectedCrop.cropId}.png`;
                    link.click();
                  }}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Download QR Code
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Blockchain Status */}
        <Card title="Blockchain Verification Status" icon={<CheckCircle className="h-6 w-6" />}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">All Batches Verified</p>
                  <p className="text-sm text-gray-600">Latest sync: 2 minutes ago</p>
                </div>
              </div>
              <BlockchainBadge hash="0x8c3a2f9e1b4d7c6a5e3f2d1c0b9a8e7d6c5b4a3f" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FarmerDashboard;
