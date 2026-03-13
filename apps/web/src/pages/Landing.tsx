import { motion } from 'framer-motion';
import { Leaf, Shield, TrendingUp, Truck, QrCode, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-white shadow-md border-b border-secondary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Leaf className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">AgroTrace</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center space-x-6"
            >
              <Link to="/marketplace" className="text-gray-700 hover:text-primary font-medium">
                Marketplace
              </Link>
              <Link to="/verify" className="text-gray-700 hover:text-primary font-medium">
                Verify Product
              </Link>
              <Link
                to="/login"
                className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-primary">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium"
            >
              🌱 Powered by AI & Blockchain Technology
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
              Track Your Food From<br />
              <span className="text-yellow-300 drop-shadow-md">Farm to Table</span>
            </h1>
            <p className="text-xl text-white/95 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
              Blockchain-based food traceability ensuring transparency, authenticity, and trust in every product you consume. 
              Verified on Polygon Mumbai Testnet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/verify"
                className="group bg-white text-green-600 hover:bg-slate-50 px-10 py-5 rounded-xl transition-all duration-200 font-bold text-lg shadow-2xl hover:shadow-3xl flex items-center justify-center transform hover:scale-105"
              >
                <QrCode className="inline-block mr-3 h-6 w-6" />
                Scan Product QR
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/marketplace"
                className="btn-secondary px-10 py-5 rounded-xl font-bold text-lg transform hover:scale-105 flex items-center"
              >
                🛒 Browse Marketplace
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
              {[
                { value: '500+', label: 'Farmers' },
                { value: '10K+', label: 'Products Tracked' },
                { value: '50K+', label: 'Verifications' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-white/80 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F8FAFC"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-extrabold text-green-600 mb-4">
              Why Choose AgroTrace?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Complete farm-to-fork transparency powered by cutting-edge technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'Blockchain Security',
                description: 'Immutable records on Polygon ensure data integrity and build trust across the entire supply chain.',
                gradient: 'from-green-500 to-emerald-600'
              },
              {
                icon: TrendingUp,
                title: 'AI Crop Insights',
                description: 'Machine learning predictions help farmers optimize yield and make data-driven decisions.',
                gradient: 'from-amber-500 to-orange-600'
              },
              {
                icon: Truck,
                title: 'Supply Chain Tracking',
                description: 'Real-time GPS tracking of products from harvest through distribution to retail stores.',
                gradient: 'from-blue-500 to-cyan-600'
              },
              {
                icon: CheckCircle,
                title: 'Consumer Transparency',
                description: 'Scan QR codes to verify product authenticity, origin, and complete journey instantly.',
                gradient: 'from-purple-500 to-pink-600'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-8 hover:-translate-y-2 group"
              >
                <div className={`mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-accent mb-4">
              How AgroTrace Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to complete transparency
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Farmer', description: 'Registers crops and generates unique QR codes', icon: '🌾' },
              { step: '2', title: 'Distributor', description: 'Tracks transport and storage conditions', icon: '🚚' },
              { step: '3', title: 'Retailer', description: 'Updates product availability and location', icon: '🏪' },
              { step: '4', title: 'Consumer', description: 'Scans QR to verify complete product journey', icon: '🔍' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary to-secondary"></div>
                )}
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-light text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Supply Chain?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of farmers, distributors, and consumers who trust AgroTrace for transparency.
            </p>
            <Link
              to="/login"
              className="inline-block bg-white text-primary hover:bg-secondary-light px-10 py-4 rounded-xl transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Get Started Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-6 w-6" />
                <span className="text-xl font-bold">AgroTrace</span>
              </div>
              <p className="text-white/80 leading-relaxed">
                Blockchain-based food traceability platform ensuring transparency from farm to fork.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">Quick Links</h3>
              <ul className="space-y-2 text-white/80">
                <li><Link to="/verify" className="hover:text-white transition-colors">Verify Product</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">Contact</h3>
              <p className="text-white/80 leading-relaxed">
                Building trust through transparency<br />
                © 2026 AgroTrace. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
