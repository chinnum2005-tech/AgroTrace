import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Users } from 'lucide-react';
import { AnalyticsChart } from '../../components/charts/AnalyticsChart';
import { StatCard } from '../../components/charts/StatCard';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6M');

  const revenueData = [
    { label: 'Jan', value: 45000 },
    { label: 'Feb', value: 67000 },
    { label: 'Mar', value: 92000 },
    { label: 'Apr', value: 125000 },
    { label: 'May', value: 168000 },
    { label: 'Jun', value: 215000 },
  ];

  const growthData = [
    { label: 'Q1', value: 35 },
    { label: 'Q2', value: 48 },
    { label: 'Q3', value: 62 },
    { label: 'Q4', value: 78 },
  ];

  const userGrowthData = [
    { label: 'Jan', value: 120 },
    { label: 'Feb', value: 180 },
    { label: 'Mar', value: 250 },
    { label: 'Apr', value: 340 },
    { label: 'May', value: 450 },
    { label: 'Jun', value: 580 },
  ];

  const stats = [
    { title: 'Total Revenue', value: '₹8.5L', change: 22.3, icon: <DollarSign className="w-6 h-6" />, color: 'green' },
    { title: 'Growth Rate', value: '78%', change: 12.5, icon: <BarChart3 className="w-6 h-6" />, color: 'blue' },
    { title: 'Active Users', value: '1,667', change: 18.2, icon: <Users className="w-6 h-6" />, color: 'purple' },
    { title: 'Avg Order Value', value: '₹2,450', change: 8.7, icon: <TrendingUp className="w-6 h-6" />, color: 'amber' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Platform performance and insights</p>
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

      {/* Time Range Selector */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Select Time Range</h2>
          <div className="flex gap-2">
            {['1M', '3M', '6M', '1Y', 'ALL'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          data={revenueData}
          title="Revenue Trends"
          color="#16a34a"
          gradientFrom="#16a34a"
          gradientTo="#10b981"
          height={300}
          yAxisLabel="Revenue (₹)"
        />

        <AnalyticsChart
          data={userGrowthData}
          title="User Growth"
          color="#3b82f6"
          gradientFrom="#3b82f6"
          gradientTo="#2563eb"
          height={300}
          yAxisLabel="Users"
        />
      </div>

      {/* Additional Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-xl">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Conversion Rate</h3>
            <p className="text-2xl font-bold text-blue-900">3.24%</p>
            <p className="text-xs text-blue-600 mt-1">↑ 12% vs last month</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <h3 className="text-sm font-medium text-green-800 mb-2">Customer Retention</h3>
            <p className="text-2xl font-bold text-green-900">87.5%</p>
            <p className="text-xs text-green-600 mt-1">↑ 5% vs last month</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <h3 className="text-sm font-medium text-purple-800 mb-2">Avg Session Duration</h3>
            <p className="text-2xl font-bold text-purple-900">4m 32s</p>
            <p className="text-xs text-purple-600 mt-1">↑ 18s vs last month</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
