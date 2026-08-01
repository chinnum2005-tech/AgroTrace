import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Farm } from '../types';
import { farmService } from '../services/farmService';
import { toast } from '../components/Toast';
import { MapPin, Leaf, Plus, ShieldCheck, Map } from 'lucide-react';

interface FarmsProps {
  user: User;
  onLogout: () => void;
}

export default function Farms({ user, onLogout }: FarmsProps) {
  const navigate = useNavigate();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    lat: 21.1458, // Nagpur, India
    lng: 79.0882, // Nagpur, India
    size: '',
    certification: 'None'
  });

  useEffect(() => {
    loadFarm();
  }, []);

  const loadFarm = async () => {
    try {
      setLoading(true);
      const res = await farmService.getMyFarm();
      if (res.success && res.data) {
        setFarm(res.data);
      } else {
        setFarm(null);
      }
    } catch (err) {
      console.error('Error loading farm:', err);
      setFarm(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleReverseGeocode = async () => {
    if (!formData.lat || !formData.lng) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${formData.lat}&lon=${formData.lng}&format=json`);
      const data = await res.json();
      if (data && data.display_name) {
        setFormData(prev => ({ ...prev, address: data.display_name }));
      }
    } catch (err) {
      console.error('Failed to reverse geocode', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await farmService.createFarm({
        name: formData.name,
        description: formData.description,
        location: {
          address: formData.address,
          lat: Number(formData.lat),
          lng: Number(formData.lng)
        },
        size: Number(formData.size),
        certification: formData.certification === 'None' ? undefined : formData.certification
      });

      if (res.success) {
        toast.success('Farm registered successfully!');
        navigate('/farmer/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to register farm');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Dashboard View
  if (farm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Farm Management</h1>
            <Link to="/farmer/dashboard" className="text-green-600 hover:text-green-800 font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="bg-green-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Leaf className="w-6 h-6" />
                {farm.name}
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Description</p>
                <p className="text-gray-900 mb-4">{farm.description || 'No description provided.'}</p>
                
                <p className="text-sm text-gray-500 font-medium mb-1">Size</p>
                <p className="text-gray-900 font-semibold">{farm.size} Hectares</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Location</p>
                    <p className="text-gray-900">{farm.location.address}</p>
                    <p className="text-xs text-gray-500 mt-1">Lat: {farm.location.lat}, Lng: {farm.location.lng}</p>
                  </div>
                </div>
                
                {farm.certification && (
                  <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
                    <ShieldCheck className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Certification</p>
                      <p className="text-green-700 font-semibold">{farm.certification}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Fields & Crops</h3>
          </div>
          
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">Manage your fields and crops from the main Dashboard.</p>
            <div className="mt-6">
              <Link to="/farmer/dashboard" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition inline-flex items-center gap-2 font-semibold">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration View
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Register Your Farm</h1>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto py-10 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Farm Details</h2>
              <p className="text-sm text-gray-500 mt-1">Provide information about your farm to start tracking crops and utilizing AI predictions.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name *</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Sunrise Organic Farm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Tell us a bit about your farm..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address / Region *</label>
                  <input
                    required
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Wardha Road, Nagpur, Maharashtra"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Map className="w-4 h-4" /> Latitude *
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    name="lat"
                    value={formData.lat}
                    onChange={handleChange}
                    onBlur={handleReverseGeocode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Map className="w-4 h-4" /> Longitude *
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    name="lng"
                    value={formData.lng}
                    onChange={handleChange}
                    onBlur={handleReverseGeocode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                  />
                </div>
                <p className="md:col-span-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                  <strong>Note:</strong> Coordinates must map to a valid location within India. We have pre-filled Nagpur's coordinates for your convenience.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Size (Hectares) *</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    min="0"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 5.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organic Certification</label>
                  <select
                    name="certification"
                    value={formData.certification}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  >
                    <option value="None">None</option>
                    <option value="NPOP (India)">NPOP (India)</option>
                    <option value="PGS-India">PGS-India</option>
                    <option value="USDA Organic">USDA Organic</option>
                    <option value="EU Organic">EU Organic</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <Link
                  to="/farmer/dashboard"
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Registering...' : 'Register Farm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
