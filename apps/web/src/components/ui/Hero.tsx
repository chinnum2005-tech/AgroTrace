import { motion } from 'framer-motion';
import { ArrowRight, Leaf } from 'lucide-react';
import { Button } from '../Button';

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  showIllustration?: boolean;
}

export default function Hero({ 
  title = "Welcome to FarmConnect",
  subtitle = "Intelligent Yield Forecasting and secure Farm-to-fork Tracking Framework",
  ctaText = "Get Started",
  onCtaClick,
  showIllustration = true
}: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 py-24 px-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          {/* Icon/Illustration */}
          {showIllustration && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-8 w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Leaf className="w-10 h-10 text-white" />
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto"
          >
            {subtitle}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              onClick={onCtaClick}
              className="shadow-xl hover:shadow-2xl transition-all"
            >
              {ctaText}
            </Button>
          </motion.div>

          {/* Stats/Social Proof */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            <div>
              <p className="text-3xl font-bold text-green-600">1,667+</p>
              <p className="text-sm text-gray-600 mt-1">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">142</p>
              <p className="text-sm text-gray-600 mt-1">Farms Tracked</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">₹8.5L</p>
              <p className="text-sm text-gray-600 mt-1">Revenue Generated</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
