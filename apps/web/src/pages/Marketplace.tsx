import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Leaf, Star, Truck, CheckCircle, Search, Filter, IndianRupee, Eye } from 'lucide-react';
import Card from '../components/Card';
import Navbar from '../components/Navbar';
import { productService, orderService } from '../services';

interface Product {
  id: string;
  name: string;
  farmName: string;
  price: number;
  unit: string;
  rating: number;
  image: string;
  certified: boolean;
  location: string;
  cropType?: string;
  batchNumber?: string;
}

export default function Marketplace() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cart, setCart] = useState<any[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        // Use mock data as fallback
        setProducts(getMockProducts());
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts(getMockProducts());
    } finally {
      setLoading(false);
    }
  };

  const getMockProducts = (): Product[] => [
    {
      id: '1',
      name: 'Organic Rice - Premium Quality',
      farmName: 'Green Valley Farm',
      price: 120,
      unit: '5kg',
      rating: 4.8,
      image: '🌾',
      certified: true,
      location: 'Kerala',
      cropType: 'RICE',
    },
    {
      id: '2',
      name: 'Fresh Vegetables Combo',
      farmName: 'Sunrise Organics',
      price: 250,
      unit: '3kg mix',
      rating: 4.6,
      image: '🥬',
      certified: true,
      location: 'Karnataka',
      cropType: 'OTHER',
    },
    {
      id: '3',
      name: 'Pure Farm Honey',
      farmName: 'Mountain Bee Farms',
      price: 350,
      unit: '500ml',
      rating: 4.9,
      image: '🍯',
      certified: true,
      location: 'Himachal Pradesh',
      cropType: 'OTHER',
    },
    {
      id: '4',
      name: 'Whole Wheat Flour',
      farmName: 'Punjab Grains Co.',
      price: 80,
      unit: '10kg',
      rating: 4.5,
      image: '🌾',
      certified: false,
      location: 'Punjab',
      cropType: 'WHEAT',
    },
    {
      id: '5',
      name: 'Organic Spices Kit',
      farmName: 'Spice Garden',
      price: 450,
      unit: '6 spices x 100g',
      rating: 4.7,
      image: '🌶️',
      certified: true,
      location: 'Tamil Nadu',
      cropType: 'OTHER',
    },
    {
      id: '6',
      name: 'Fresh Fruits Basket',
      farmName: 'Orchard Fresh',
      price: 600,
      unit: '5kg mixed',
      rating: 4.8,
      image: '🍎',
      certified: true,
      location: 'Maharashtra',
      cropType: 'OTHER',
    },
  ];

  const categories = [
    { id: 'ALL', name: 'All Products', icon: '🛒' },
    { id: 'GRAINS', name: 'Grains & Cereals', icon: '🌾' },
    { id: 'VEGETABLES', name: 'Vegetables', icon: '🥬' },
    { id: 'FRUITS', name: 'Fruits', icon: '🍎' },
    { id: 'SPICES', name: 'Spices', icon: '🌶️' },
    { id: 'DAIRY', name: 'Dairy & Honey', icon: '🍯' },
  ];

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
    alert(`✅ ${product.name} added to cart!`);
  };

  const handleBuyNow = async (product: Product) => {
    setSelectedProduct(product);
    setShowOrderModal(true);
  };

  const placeOrder = async () => {
    if (!selectedProduct) return;

    try {
      const orderData = {
        productId: selectedProduct.id,
        quantity: orderQuantity,
        totalAmount: selectedProduct.price * orderQuantity,
        shippingAddress: 'Default Address (Update in profile)', // Would come from user profile
      };

      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        alert('✅ Order placed successfully!');
        setShowOrderModal(false);
        setOrderQuantity(1);
        setSelectedProduct(null);
      } else {
        alert('❌ Failed to place order. Please try again.');
      }
    } catch (error: any) {
      console.error('Order error:', error);
      alert(`❌ ${error.response?.data?.message || 'Failed to place order'}`);
    }
  };

  const handleViewTraceability = (productId: string) => {
    navigate(`/trace/${productId}`);
  };

  const handleTrackOrder = async () => {
    try {
      const response = await orderService.getMyOrders();
      if (response.success && response.data) {
        const orders = response.data;
        if (orders.length === 0) {
          alert('📦 No orders yet. Start shopping!');
        } else {
          const orderList = orders.map((o: any) => 
            `Order #${o.id}\nProduct: ${o.productName}\nFarmer: ${o.farmerName}\nAmount: ₹${o.totalAmount}\nDate: ${new Date(o.date).toLocaleDateString()}`
          ).join('\n\n');
          alert(`Your Orders:\n\n${orderList}`);
        }
      }
    } catch (error) {
      alert('Failed to load orders');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.farmName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || 
                           (selectedCategory === 'GRAINS' && product.image === '🌾') ||
                           (selectedCategory === 'VEGETABLES' && product.image === '🥬') ||
                           (selectedCategory === 'FRUITS' && product.image === '🍎') ||
                           (selectedCategory === 'SPICES' && product.image === '🌶️') ||
                           (selectedCategory === 'DAIRY' && product.image === '🍯');
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-light text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4">
              🌾 Direct from Farmers to You
            </h1>
            <p className="text-xl mb-8">
              Fresh, organic, and blockchain-verified agricultural products
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <input
                type="text"
                placeholder="Search for products, farms, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 rounded-full text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Search className="absolute right-4 top-4 h-6 w-6 text-gray-400" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-accent">
              Featured Products ({filteredProducts.length})
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={handleTrackOrder}
                className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200"
              >
                <Truck className="h-5 w-5" />
                <span>Track Orders</span>
              </button>
              <button className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">
                <Filter className="h-5 w-5" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card gradient className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-6">
                    {/* Product Image & Badge */}
                    <div className="relative mb-4">
                      <div className="text-8xl text-center">{product.image}</div>
                      {product.certified && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Organic Certified</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <Leaf className="h-4 w-4 text-primary" />
                      <span className="text-sm text-gray-600">{product.farmName}</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{product.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500 flex items-center space-x-1">
                        <Truck className="h-3 w-3" />
                        <span>{product.location}</span>
                      </span>
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                          <span className="text-sm text-gray-500 ml-1">/ {product.unit}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => addToCart(product)}
                            className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            <span>Add to Cart</span>
                          </button>
                          <button
                            onClick={() => handleBuyNow(product)}
                            className="flex-1 bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          >
                            <IndianRupee className="h-4 w-4" />
                            <span>Buy Now</span>
                          </button>
                        </div>
                        <button
                          onClick={() => handleViewTraceability(product.id)}
                          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 border border-blue-200"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Traceability</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500">No products found</p>
              <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      {/* Order Modal */}
      {showOrderModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-accent">Place Order</h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-4xl text-center mb-2">{selectedProduct.image}</div>
                <h4 className="font-bold text-lg text-gray-900 text-center">{selectedProduct.name}</h4>
                <p className="text-sm text-gray-600 text-center">{selectedProduct.farmName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Price per unit:</span>
                  <span className="font-semibold">₹{selectedProduct.price}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Quantity:</span>
                  <span className="font-semibold">{orderQuantity} x {selectedProduct.unit}</span>
                </div>
                <div className="border-t border-gray-300 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">₹{selectedProduct.price * orderQuantity}</span>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>📦 Delivery in 3-5 business days</p>
                <p>✓ Blockchain verified product</p>
                <p>✓ Direct from farmer</p>
              </div>
              
              <button
                onClick={placeOrder}
                className="w-full bg-accent hover:bg-accent-dark text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <IndianRupee className="h-5 w-5" />
                <span>Confirm Order</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer CTA */}
      <section className="bg-accent text-white py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Want to sell your products directly?
          </h2>
          <p className="text-xl mb-6">
            Join our farmer community and reach customers nationwide
          </p>
          <button className="bg-white text-accent hover:bg-secondary-light px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105">
            Register as Farmer →
          </button>
        </div>
      </section>
    </div>
  );
}
