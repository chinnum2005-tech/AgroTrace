import { Link } from 'react-router-dom';
import { User } from '../types';

interface CropsProps {
  user: User;
  onLogout: () => void;
}

export default function Crops({ user, onLogout }: CropsProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Crop Management</h1>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">Crop management interface - Coming soon</p>
            <Link to="/dashboard" className="mt-4 inline-block text-primary-600 hover:text-primary-500">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
