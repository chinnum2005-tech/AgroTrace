import { motion } from 'framer-motion';
import { Package, TrendingUp, DollarSign, Shield } from 'lucide-react';
import { StatCard } from '../../components/charts/StatCard';

export default function ProductsPage() {
  const products = [
    { id: 1, name: 'Premium Wheat Flour', category: 'Grains', quantity: '1,000 kg', price: '₹48,500', status: 'Active', traced: true },
    { id: 2, name: 'Organic Rice', category: 'Grains', quantity: '850 kg', price: '₹37,800', status: 'Active', traced: true },
    { id: 3, name: 'Sweet Corn', category: 'Vegetables', quantity: '2,200 kg', price: '₹64,000', status: 'Active', traced: true },
    { id: 4, name: 'Soybeans', category: 'Legumes', quantity: '1,600 kg', price: '₹32,000', status: 'Pending', traced: false },
  ];

  const stats = [
    { title: 'Total Products', value: '950', change: 15.2, icon: <Package className="w-6 h-6" />, color: 'green' },
    { title: 'Products Traced', value: '892', change: 18.5, icon: <Shield className="w-6 h-6" />, color: 'blue' },
    { title: 'Total Value', value: '₹8.5L', change: 22.3, icon: <DollarSign className="w-6 h-6" />, color: 'purple' },
    { title: 'This Month', value: '142', change: 8.7, icon: <TrendingUp className="w-6 h-6" />, color: 'amber' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📦 Products Management</h1>
        <p className="text-gray-600 mt-1">Track and manage all agricultural products</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color as any}
          />
        ))}
      </div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">All Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Traced</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.traced ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
