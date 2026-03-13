import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  gradient?: boolean;
}

export default function Card({ title, icon, children, className = '', gradient = false }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`bg-white rounded-xl shadow-lg p-6 border-t-4 ${
        gradient ? 'border-primary' : 'border-secondary/20'
      } ${className}`}
    >
      {(title || icon) && (
        <div className="flex items-center space-x-3 mb-4">
          {icon && <div className="text-primary">{icon}</div>}
          {title && <h3 className="text-xl font-bold text-accent">{title}</h3>}
        </div>
      )}
      {children}
    </motion.div>
  );
}
