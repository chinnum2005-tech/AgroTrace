import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, CheckCircle, XCircle, Leaf, MapPin, Calendar, User, Truck, Package } from 'lucide-react';
import { verifyService } from '../services';

export default function Verify() {
  const { id } = useParams<{ id: string }>(); // Get product/crop ID from URL
  const [qrCode, setQrCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-verify if ID is in URL (from QR scan)
  useEffect(() => {
    if (id && !qrCode) {
      setQrCode(id);
      handleAutoVerify(id);
    }
  }, [id]);

  const handleAutoVerify = async (productId: string) => {
    setError('');
    setLoading(true);

    try {
      const response = await verifyService.verifyProduct(productId);
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify product');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await verifyService.verifyProduct(qrCode);
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify product');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType?.toLowerCase()) {
      case 'planted': return <Leaf className="h-6 w-6" />;
      case 'harvested': return <Package className="h-6 w-6" />;
      case 'shipped': return <Truck className="h-6 w-6" />;
      case 'received': return <CheckCircle className="h-6 w-6" />;
      default: return <MapPin className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary-light to-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">AgroTrace</span>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-accent mb-4">
            {id ? '🔍 Verifying Product...' : 'Track Your Food Journey'}
          </h1>
          <p className="text-xl text-gray-600">
            {id 
              ? `Scanning product ID: ${id.slice(0, 8)}...`
              : 'Scan QR code to verify product authenticity and trace its journey from farm to table'
            }
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-secondary/20"
        >
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="qrCode" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Product ID or Scan QR Code
              </label>
              <div className="relative">
                <QrCode className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="qrCode"
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-lg"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="AGRITRACE-..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify Product'
              )}
            </button>
          </form>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl mb-8"
          >
            <div className="flex items-start">
              <XCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Verification Failed</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="h-16 w-16" />
                  <div>
                    <h2 className="text-3xl font-bold">Authentic Product Verified ✓</h2>
                    <p className="text-white/90 mt-1">This product has been successfully traced back to its origin</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Product ID</p>
                  <p className="text-xl font-mono font-bold">{result.id}</p>
                </div>
              </div>
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Crop Info */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-secondary/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Package className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold text-accent">Product Information</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Crop Name</p>
                    <p className="text-lg font-semibold text-gray-900">{result.crop.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="text-lg font-semibold text-gray-900">{result.crop.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Growth Stage</p>
                    <span className="inline-block px-3 py-1 bg-primary-light text-white rounded-full text-sm font-medium">
                      {result.crop.growthStage}
                    </span>
                  </div>
                </div>
              </div>

              {/* Farm Info */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-secondary/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Leaf className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold text-accent">Farm Origin</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Farm Name</p>
                    <p className="text-lg font-semibold text-gray-900">{result.farm.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Farmer</p>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <User className="h-4 w-4" />
                      <span className="font-semibold">
                        {result.farm.farmer.firstName} {result.farm.farmer.lastName}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <MapPin className="h-4 w-4" />
                      <span className="font-semibold">{result.farm.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Supply Chain Timeline */}
            {result.supplyChainEvents && result.supplyChainEvents.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8 border border-secondary/20">
                <div className="flex items-center space-x-3 mb-6">
                  <Truck className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold text-accent">Product Journey Timeline</h3>
                </div>
                
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-secondary"></div>
                  
                  <div className="space-y-6">
                    {result.supplyChainEvents.map((event: any, index: number) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex items-start space-x-4"
                      >
                        <div className="absolute left-0 w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center z-10 shadow-lg">
                          {getEventIcon(event.eventType)}
                        </div>
                        <div className="ml-20 flex-1 bg-gradient-to-r from-secondary-light/30 to-transparent p-4 rounded-xl border-l-4 border-primary">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">{event.eventType}</h4>
                              <p className="text-gray-600 mt-1">{event.description || 'Supply chain event recorded'}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  {new Date(event.timestamp).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(event.timestamp).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Footer CTA */}
        {!result && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-gray-600 mb-4">Want to track your products in real-time?</p>
            <a href="/login" className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Sign In to Your Account
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}
