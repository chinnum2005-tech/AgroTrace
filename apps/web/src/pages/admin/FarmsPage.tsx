import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, Leaf, Droplets, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { StatCard } from '../../components/charts/StatCard';
import { Button } from '../../components/Button';
import { toast } from '../../components/Toast';

export default function FarmsPage() {
  const [farms, setFarms] = useState([
    { id: 1, name: 'Green Valley Farm', owner: 'John Farmer', location: 'California, USA', size: '150.5 ha', certification: 'USDA Organic', crops: 3 },
    { id: 2, name: 'Sunny Acres', owner: 'Sarah Johnson', location: 'Texas, USA', size: '85.2 ha', certification: 'Non-GMO', crops: 2 },
    { id: 3, name: 'Harvest Fields', owner: 'Mike Brown', location: 'Iowa, USA', size: '220.8 ha', certification: 'Organic', crops: 4 },
    { id: 4, name: 'Mountain View Farm', owner: 'Emily Davis', location: 'Colorado, USA', size: '95.0 ha', certification: 'USDA Organic', crops: 2 },
    { id: 5, name: "Ravi's Farm", owner: 'Ravi Kumar', location: 'Punjab, India', size: '45.0 ha', certification: 'India Organic', crops: 3 },
    { id: 6, name: "Priya's Fields", owner: 'Priya Sharma', location: 'Maharashtra, India', size: '62.5 ha', certification: 'Fair Trade', crops: 2 },
  ]);

  const handleEdit = (farm: any) => {
    toast.info(`Editing farm: ${farm.name}`);
  };

  const handleDelete = (farm: any) => {
    if (confirm(`Are you sure you want to delete ${farm.name}?`)) {
      setFarms(farms.filter(f => f.id !== farm.id));
      toast.success(`Farm ${farm.name} deleted successfully`);
    }
  };

  const handleViewMap = (farm: any) => {
    toast.success(`Opening map for ${farm.name}`);
  };

  const stats = [
    { title: 'Total Farms', value: '142', change: 8.3, icon: <MapPin className="w-6 h-6" />, color: 'green' },
    { title: 'Certified Organic', value: '89', change: 12.5, icon: <Leaf className="w-6 h-6" />, color: 'blue' },
    { title: 'Total Area', value: '12.5K ha', change: 15.2, icon: <TrendingUp className="w-6 h-6" />, color: 'purple' },
    { title: 'Avg. Water Savings', value: '245 L', change: 5.7, icon: <Droplets className="w-6 h-6" />, color: 'amber' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🌾 Farms Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage all registered farms</p>
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

      {/* Farms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farms.map((farm, index) => (
          <motion.div
            key={farm.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{farm.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{farm.owner}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-gray-900">{farm.location}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium text-gray-900">{farm.size}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Crops:</span>
                <span className="font-medium text-gray-900">{farm.crops} active</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {farm.certification}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={ExternalLink}
                  onClick={() => handleViewMap(farm)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Map
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit2}
                  onClick={() => handleEdit(farm)}
                  className="text-green-600 hover:text-green-800"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Trash2}
                  onClick={() => handleDelete(farm)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
