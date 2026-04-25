import { motion } from 'framer-motion';
import { ArrowRight, Leaf, TrendingUp, Users, Award } from 'lucide-react';
import { Button } from '../Button';

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  showStats?: boolean;
  variant?: 'default' | 'centered' | 'split';
}

export default function Hero({ 
  title = "Transform Agriculture with Technology",
  subtitle = "Empowering farmers through AI-powered insights and blockchain traceability",
  ctaText = "Get Started",
  onCtaClick,
  showStats = true,
  variant = 'centered'
}: HeroProps) {
  const stats = [
    { icon: Users, value: "1,667+", label: "Active Users" },
    { icon: TrendingUp, value: "₹8.5L", label: "Revenue Generated" },
    { icon: Award, value: "142", label: "Farms Tracked" },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-dark dark:via-dark-surface dark:to-dark py-20 md:py-32 px-6">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 left-0 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 100, 0],
          }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute -bottom-32 left-20 w-96 h-96 bg-secondary/30 rounded-full mix-blend-multiply filter blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {variant === 'centered' ? (
          /* Centered Layout */
          <div className="text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-8 w-20 h-20 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-2xl"
            >
              <Leaf className="w-10 h-10 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6"
            >
              {title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto"
            >
              {subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                onClick={onCtaClick}
                className="shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                {ctaText}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 hover:bg-primary hover:text-white transition-all"
              >
                Learn More
              </Button>
            </motion.div>

            {/* Stats */}
            {showStats && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    className="flex flex-col items-center p-4"
                  >
                    <stat.icon className="w-8 h-8 text-primary mb-2" />
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        ) : (
          /* Split Layout */
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                {title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                {subtitle}
              </p>
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                onClick={onCtaClick}
                className="shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                {ctaText}
              </Button>
            </motion.div>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="hidden md:block"
            >
              {/* Illustration placeholder */}
              <div className="relative w-full aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl transform rotate-3"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl transform -rotate-3"></div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
