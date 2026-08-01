import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Shield, Search, Edit2, Trash2, ToggleLeft } from 'lucide-react';
import { StatCard } from '../../components/charts/StatCard';
import { Button } from '../../components/Button';
import { toast } from '../../components/Toast';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([
    { id: 1, name: 'John Farmer', email: 'farmer@farmconnect.in', role: 'FARMER', status: 'Active', joined: 'Mar 2024' },
    { id: 2, name: 'Sarah Distributor', email: 'distributor@farmconnect.in', role: 'DISTRIBUTOR', status: 'Active', joined: 'Apr 2024' },
    { id: 3, name: 'Mike Consumer', email: 'consumer@farmconnect.in', role: 'CONSUMER', status: 'Active', joined: 'May 2024' },
    { id: 4, name: 'Admin User', email: 'admin@farmconnect.in', role: 'ADMIN', status: 'Active', joined: 'Jan 2024' },
    { id: 5, name: 'Jane Smith', email: 'jane@example.com', role: 'CONSUMER', status: 'Inactive', joined: 'Jun 2024' },
    { id: 6, name: 'Ravi Kumar', email: 'ravi@farmconnect.in', role: 'FARMER', status: 'Active', joined: 'Jul 2024' },
    { id: 7, name: 'Priya Sharma', email: 'priya@farmconnect.in', role: 'DISTRIBUTOR', status: 'Pending', joined: 'Jul 2024' },
  ]);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (user: any) => {
    toast.info(`Editing user: ${user.name}`);
  };

  const handleDelete = (user: any) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      setUsers(users.filter(u => u.id !== user.id));
      toast.success(`User ${user.name} deleted successfully`);
    }
  };

  const handleToggleStatus = (user: any) => {
    setUsers(users.map(u => 
      u.id === user.id 
        ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
        : u
    ));
    toast.success(`User status updated`);
  };

  const stats = [
    { title: 'Total Users', value: '1,667', change: 12.5, icon: <Users className="w-6 h-6" />, color: 'green' },
    { title: 'Active Users', value: '1,542', change: 8.3, icon: <UserCheck className="w-6 h-6" />, color: 'blue' },
    { title: 'Farmers', value: '320', change: 5.2, icon: <Shield className="w-6 h-6" />, color: 'purple' },
    { title: 'Consumers', value: '1,250', change: 15.7, icon: <Users className="w-6 h-6" />, color: 'amber' },
  ];

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-700',
      FARMER: 'bg-green-100 text-green-700',
      DISTRIBUTOR: 'bg-blue-100 text-blue-700',
      CONSUMER: 'bg-gray-100 text-gray-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">👥 Users Management</h1>
        <p className="text-gray-600 mt-1">Manage all registered users, roles, and activity</p>
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

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{filteredUsers.length}</span> of {users.length} users
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">All Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name?.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.joined}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit2}
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={ToggleLeft}
                        onClick={() => handleToggleStatus(user)}
                        className={user.status === 'Active' ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'}
                      >
                        {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
