import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: any;
}

interface AnalyticsChartProps {
  data: ChartDataPoint[];
  title: string;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  height?: number;
  showLegend?: boolean;
  yAxisLabel?: string;
}

export function AnalyticsChart({
  data,
  title,
  color = '#16a34a',
  gradientFrom = '#16a34a',
  gradientTo = '#10b981',
  height = 300,
  showLegend = true,
  yAxisLabel = 'Value'
}: AnalyticsChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradientFrom} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={gradientTo} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="label" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          {showLegend && <Legend />}
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            fillOpacity={1}
            fill={`url(#gradient-${title})`}
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
