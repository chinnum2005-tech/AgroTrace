import { motion } from 'framer-motion';
import { Users, TrendingUp, Activity, DollarSign } from 'lucide-react';
import { StatCard } from '../../components/charts/StatCard';
import { AnalyticsChart } from '../../components/charts/AnalyticsChart';
import AdminLayout from '../../components/AdminLayout';

export default function Dashboard() {
  const stats = [
    { title: 'Total Users', value: '1,667', change: 12.5, icon: <Users className="w-6 h-6" />, color: 'green' },
    { title: 'Total Farms', value: '142', change: 8.3, icon: <Activity className="w-6 h-6" />, color: 'blue' },
    { title: 'Products Tracked', value: '950', change: 15.2, icon: <TrendingUp className="w-6 h-6" />, color: 'purple' },
    { title: 'Revenue', value: '₹2.15L', change: 18.7, icon: <DollarSign className="w-6 h-6" />, color: 'amber' },
  ];

  const userData = [
    { label: 'Jan', value: 120 },
    { label: 'Feb', value: 180 },
    { label: 'Mar', value: 250 },
    { label: 'Apr', value: 340 },
    { label: 'May', value: 450 },
    { label: 'Jun', value: 580 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform overview and key metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsChart
            data={userData}
            title="User Growth"
            color="#16a34a"
            gradientFrom="#16a34a"
            gradientTo="#10b981"
            height={300}
            yAxisLabel="Users"
          />
          
          <AnalyticsChart
            data={[
              { label: 'Q1', value: 45000 },
              { label: 'Q2', value: 67000 },
              { label: 'Q3', value: 92000 },
              { label: 'Q4', value: 125000 },
            ]}
            title="Revenue Trends"
            color="#f59e0b"
            gradientFrom="#f59e0b"
            gradientTo="#fbbf24"
            height={300}
            yAxisLabel="Revenue (₹)"
          />
        </div>
      </div>
    </AdminLayout>
  );
}
