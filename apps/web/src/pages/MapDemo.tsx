import { useEffect, useState } from 'react';
import SupplyChainMap from '../components/SupplyChainMap';

export default function MapDemo() {
  const [productId, setProductId] = useState('');

  // Sample product IDs for testing
  const sampleProducts = [
    { id: 'sample-1', name: 'Organic Rice - Kerala' },
    { id: 'sample-2', name: 'Wheat - Punjab' },
    { id: 'sample-3', name: 'Coffee - Karnataka' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🗺️ Live Supply Chain Map Demo
          </h1>
          <p className="text-xl text-gray-600">
            Interactive logistics tracking from farm to customer
          </p>
        </div>

        {/* Product Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Select a Product to Track:</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => setProductId(product.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  productId === product.id
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🌾</div>
                  <div className="font-semibold text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500 mt-1">ID: {product.id}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Map Display */}
        {productId ? (
          <div className="space-y-8">
            <SupplyChainMap productId={productId} height="500px" />
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 mb-2">ℹ️ About This Feature</h3>
              <ul className="space-y-2 text-blue-800">
                <li>✅ Real-time GPS tracking of products</li>
                <li>✅ Color-coded markers for different event types</li>
                <li>✅ Complete journey visualization</li>
                <li>✅ Interactive map with zoom and pan</li>
                <li>✅ Click markers to see location details</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              Select a product above to see the map
            </h3>
            <p className="text-gray-500">
              The interactive supply chain map will appear here
            </p>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-bold text-xl mb-2">Complete Transparency</h3>
            <p className="text-gray-600">
              See exactly where your food comes from and every stop it made along the way
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="font-bold text-xl mb-2">Blockchain Verified</h3>
            <p className="text-gray-600">
              All locations and events are recorded on blockchain for authenticity
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="font-bold text-xl mb-2">Real-Time Tracking</h3>
            <p className="text-gray-600">
              Live updates as products move through the supply chain
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
