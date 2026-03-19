import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'green' | 'blue' | 'purple' | 'amber';
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon,
  color = 'green'
}: StatCardProps) {
  const colors = {
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600',
    purple: 'from-purple-500 to-pink-600',
    amber: 'from-amber-500 to-orange-600'
  };

  const bgColors = {
    green: 'bg-green-50',
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    amber: 'bg-amber-50'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      className={`${bgColors[color]} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white shadow-lg`}>
            {icon}
          </div>
        )}
      </div>
      
      {change !== undefined && (
        <div className="flex items-center gap-2">
          {change > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : change < 0 ? (
            <TrendingDown className="w-4 h-4 text-red-600" />
          ) : (
            <Minus className="w-4 h-4 text-gray-600" />
          )}
          <span className={`text-sm font-semibold ${
            change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span className="text-xs text-gray-500">{changeLabel}</span>
        </div>
      )}
    </motion.div>
  );
}
