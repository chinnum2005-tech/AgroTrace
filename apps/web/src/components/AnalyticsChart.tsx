import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, DollarSign, Users, Package } from 'lucide-react';

interface AnalyticsData {
  date: string;
  revenue: number;
  rentals: number;
  activeUsers: number;
}

interface AnalyticsChartProps {
  title?: string;
  chartType?: 'line' | 'bar' | 'area';
  metric?: 'revenue' | 'rentals' | 'users';
}

export default function AnalyticsChart({ 
  title = 'Revenue Trends',
  chartType = 'line',
  metric = 'revenue'
}: AnalyticsChartProps) {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'6M' | '1Y' | 'ALL'>('6M');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Demo data (replace with actual API call)
      const demoData: AnalyticsData[] = [
        { date: 'Jan', revenue: 12000, rentals: 45, activeUsers: 120 },
        { date: 'Feb', revenue: 15000, rentals: 52, activeUsers: 145 },
        { date: 'Mar', revenue: 18500, rentals: 68, activeUsers: 178 },
        { date: 'Apr', revenue: 22000, rentals: 75, activeUsers: 210 },
        { date: 'May', revenue: 28000, rentals: 92, activeUsers: 265 },
        { date: 'Jun', revenue: 35000, rentals: 115, activeUsers: 320 },
      ];

      // Simulate API delay
      setTimeout(() => {
        setData(demoData);
        setLoading(false);
      }, 500);

      // Real API call example:
      // const res = await fetch(`/api/analytics?range=${timeRange}`);
      // const data = await res.json();
      // setData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const getMetricData = (item: AnalyticsData) => {
    switch (metric) {
      case 'revenue':
        return item.revenue;
      case 'rentals':
        return item.rentals;
      case 'users':
        return item.activeUsers;
      default:
        return item.revenue;
    }
  };

  const getMetricColor = () => {
    switch (metric) {
      case 'revenue': return '#16a34a';
      case 'rentals': return '#3b82f6';
      case 'users': return '#8b5cf6';
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-dark-surface rounded-xl p-4 shadow-lg"
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-8 h-8 ${color}`} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalRentals = data.reduce((sum, item) => sum + item.rentals, 0);
  const avgUsers = Math.round(data.reduce((sum, item) => sum + item.activeUsers, 0) / data.length);

  const ChartComponent = {
    line: LineChart,
    bar: BarChart,
    area: AreaChart,
  }[chartType];

  const SeriesComponent = {
    line: Line,
    bar: Bar,
    area: Area,
  }[chartType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex gap-2">
          {(['6M', '1Y', 'ALL'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`₹${(totalRevenue / 1000).toFixed(1)}K`}
          color="text-green-600"
        />
        <StatCard
          icon={Package}
          label="Total Rentals"
          value={totalRentals}
          color="text-blue-600"
        />
        <StatCard
          icon={Users}
          label="Avg Active Users"
          value={avgUsers}
          color="text-purple-600"
        />
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => metric === 'revenue' ? `₹${value/1000}K` : `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number) => [
                metric === 'revenue' ? `₹${value.toLocaleString()}` : value.toString(),
                metric === 'revenue' ? 'Revenue' : metric === 'rentals' ? 'Rentals' : 'Users'
              ]}
            />
            <Line
              type="monotone"
              dataKey={metric === 'users' ? 'activeUsers' : metric}
              stroke={getMetricColor()}
              fill={getMetricColor()}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Growth Indicator */}
      <div className="mt-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-600" />
        <span className="text-sm font-medium text-green-600">
          {(() => {
            const currentValue = metric === 'users' 
              ? data[data.length - 1]?.activeUsers || 0
              : metric === 'revenue'
                ? data[data.length - 1]?.revenue || 0
                : data[data.length - 1]?.rentals || 0;
            const prevValue = metric === 'users'
              ? data[0]?.activeUsers || 0
              : metric === 'revenue'
                ? data[0]?.revenue || 0
                : data[0]?.rentals || 0;
            const growth = ((currentValue - prevValue) / (prevValue || 1)) * 100;
            return `${growth.toFixed(1)}%`;
          })()}
        </span>
        <span className="text-sm text-gray-500">growth over last period</span>
      </div>
    </motion.div>
  );
}
