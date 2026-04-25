import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, Award, Check, X, Eye } from 'lucide-react';
import { StatCard } from '../../components/charts/StatCard';
import { Button } from '../../components/Button';
import { toast } from '../../components/Toast';

export default function VerificationPage() {
  const [verifications, setVerifications] = useState([
    { id: 1, product: 'Premium Wheat Flour', farm: 'Green Valley Farm', date: '2024-07-20', status: 'Verified', blockchain: true },
    { id: 2, product: 'Organic Rice', farm: 'Sunny Acres', date: '2024-07-19', status: 'Verified', blockchain: true },
    { id: 3, product: 'Sweet Corn', farm: 'Harvest Fields', date: '2024-07-18', status: 'Pending', blockchain: false },
    { id: 4, product: 'Soybeans', farm: 'Mountain View Farm', date: '2024-07-17', status: 'Verified', blockchain: true },
    { id: 5, product: 'Basmati Rice', farm: "Ravi's Farm", date: '2024-07-16', status: 'Pending', blockchain: false },
    { id: 6, product: 'Organic Tomatoes', farm: "Priya's Fields", date: '2024-07-15', status: 'Rejected', blockchain: false },
  ]);

  const handleApprove = (id: number) => {
    setVerifications(verifications.map(v => 
      v.id === id ? { ...v, status: 'Verified', blockchain: true } : v
    ));
    toast.success('Verification approved and recorded on blockchain');
  };

  const handleReject = (id: number) => {
    setVerifications(verifications.map(v => 
      v.id === id ? { ...v, status: 'Rejected' } : v
    ));
    toast.error('Verification rejected');
  };

  const handleViewDetails = (verification: any) => {
    toast.info(`Viewing details for ${verification.product}`);
  };

  const stats = [
    { title: 'Total Verified', value: '892', change: 18.5, icon: <CheckCircle className="w-6 h-6" />, color: 'green' },
    { title: 'Blockchain Records', value: '847', change: 22.1, icon: <Shield className="w-6 h-6" />, color: 'blue' },
    { title: 'Pending Review', value: '23', change: -5.2, icon: <Award className="w-6 h-6" />, color: 'amber' },
    { title: 'Success Rate', value: '97.4%', change: 2.3, icon: <CheckCircle className="w-6 h-6" />, color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">✅ Verification Panel</h1>
        <p className="text-gray-600 mt-1">Review and verify product certifications</p>
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

      {/* Verifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Recent Verifications</h2>
        </div>
        <div className="space-y-4 p-6">
          {verifications.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-3 rounded-lg ${
                  item.status === 'Verified' ? 'bg-green-100' : item.status === 'Rejected' ? 'bg-red-100' : 'bg-yellow-100'
                }`}>
                  {item.status === 'Verified' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : item.status === 'Rejected' ? (
                    <X className="w-6 h-6 text-red-600" />
                  ) : (
                    <Award className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.product}</h3>
                  <p className="text-sm text-gray-600">{item.farm} • {item.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {item.blockchain && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Blockchain
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.status === 'Verified' ? 'bg-green-100 text-green-700' : 
                  item.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.status}
                </span>
                {item.status === 'Pending' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Check}
                      onClick={() => handleApprove(item.id)}
                      className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={X}
                      onClick={() => handleReject(item.id)}
                      className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100"
                    >
                      Reject
                    </Button>
                  </div>
                )}
                {item.status !== 'Pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => handleViewDetails(item)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Details
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
