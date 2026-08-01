import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Crop } from '../types';
import { cropService } from '../services/cropService';
import { toast } from '../components/Toast';
import { Leaf, Plus, Calendar, Ruler, TrendingUp, X, Edit2, Lock } from 'lucide-react';

interface CropsProps {
  user: User;
  onLogout: () => void;
}

export default function Crops({ user, onLogout }: CropsProps) {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCropId, setEditingCropId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'WHEAT',
    variety: '',
    plantingDate: new Date().toISOString().split('T')[0],
    expectedHarvest: '',
    area: ''
  });

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    try {
      setLoading(true);
      const res = await cropService.getMyCrops();
      if (res.success && res.data) {
        setCrops(res.data);
      }
    } catch (err) {
      console.error('Error loading crops:', err);
      toast.error('Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openEditModal = (crop: Crop) => {
    setEditingCropId(crop.id);
    setFormData({
      name: crop.name,
      type: crop.type,
      variety: crop.variety || '',
      plantingDate: new Date(crop.plantingDate).toISOString().split('T')[0],
      expectedHarvest: crop.expectedHarvest ? new Date(crop.expectedHarvest).toISOString().split('T')[0] : '',
      area: (crop.area / 0.404686).toFixed(2)
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      let res;
      if (editingCropId) {
        res = await cropService.updateCrop(editingCropId, {
          name: formData.name,
          type: formData.type,
          variety: formData.variety || undefined,
          plantingDate: new Date(formData.plantingDate).toISOString(),
          expectedHarvest: formData.expectedHarvest ? new Date(formData.expectedHarvest).toISOString() : undefined,
          area: Number(formData.area),
        });
      } else {
        res = await cropService.createCrop({
          name: formData.name,
          type: formData.type,
          variety: formData.variety || undefined,
          plantingDate: new Date(formData.plantingDate).toISOString(),
          expectedHarvest: formData.expectedHarvest ? new Date(formData.expectedHarvest).toISOString() : undefined,
          area: Number(formData.area),
          farmId: 'will-be-auto-resolved-by-backend'
        });
      }

      if (res.success) {
        toast.success(`Crop ${editingCropId ? 'updated' : 'added'} successfully!`);
        setIsModalOpen(false);
        setEditingCropId(null);
        setFormData({
          name: '',
          type: 'WHEAT',
          variety: '',
          plantingDate: new Date().toISOString().split('T')[0],
          expectedHarvest: '',
          area: ''
        });
        loadCrops();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add crop');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow relative z-10">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Crop Management</h1>
          <Link to="/farmer/dashboard" className="text-green-600 hover:text-green-800 font-medium">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6 px-4 sm:px-0">
          <h2 className="text-xl font-semibold text-gray-900">Your Crops</h2>
          <button 
            onClick={() => {
              setEditingCropId(null);
              setFormData({
                name: '',
                type: 'WHEAT',
                variety: '',
                plantingDate: new Date().toISOString().split('T')[0],
                expectedHarvest: '',
                area: ''
              });
              setIsModalOpen(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Crop
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : crops.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center shadow-sm">
            <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No crops planted yet.</p>
            <p className="text-gray-400 text-sm mt-1">Start by adding your first crop to track its lifecycle.</p>
            <button 
              onClick={() => {
                setEditingCropId(null);
                setFormData({
                  name: '',
                  type: 'WHEAT',
                  variety: '',
                  plantingDate: new Date().toISOString().split('T')[0],
                  expectedHarvest: '',
                  area: ''
                });
                setIsModalOpen(true);
              }}
              className="mt-6 inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700 bg-green-50 px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-4 h-4" /> Create Crop
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
            {crops.map((crop) => (
              <div key={crop.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group">
                <div className="bg-green-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center relative">
                  <h3 className="font-bold text-gray-900 text-lg pr-12">{crop.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full uppercase tracking-wider">
                      {crop.type}
                    </span>
                    {(crop as any).predictions && (crop as any).predictions.length > 0 ? (
                      <button
                        className="text-gray-400 p-1 rounded-md cursor-not-allowed"
                        title="Locked: AI Prediction anchored on Blockchain"
                        disabled
                      >
                        <Lock className="w-4 h-4 text-orange-400" />
                      </button>
                    ) : (
                      <button
                        onClick={() => openEditModal(crop)}
                        className="text-gray-400 hover:text-green-600 p-1 rounded-md hover:bg-green-100 transition"
                        title="Edit Crop"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="flex-1">Stage:</span>
                    <span className="font-medium text-gray-900 capitalize">{crop.growthStage.replace(/_/g, ' ').toLowerCase()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Ruler className="w-4 h-4 text-gray-400" />
                    <span className="flex-1">Area:</span>
                    <span className="font-medium text-gray-900">{crop.area.toFixed(2)} Hectares</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="flex-1">Planted:</span>
                    <span className="font-medium text-gray-900">{new Date(crop.plantingDate).toLocaleDateString()}</span>
                  </div>
                  {crop.variety && (
                    <div className="pt-3 mt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Variety</p>
                      <p className="text-sm font-medium text-gray-900">{crop.variety}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Crop Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingCropId ? 'Edit Crop' : 'Add New Crop'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name *</label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Summer Wheat Field A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type *</label>
                    <select
                      required
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    >
                      <option value="WHEAT">Wheat</option>
                      <option value="RICE">Rice</option>
                      <option value="CORN">Corn</option>
                      <option value="SOYBEANS">Soybeans</option>
                      <option value="BARLEY">Barley</option>
                      <option value="OATS">Oats</option>
                      <option value="CANOLA">Canola</option>
                      <option value="SORGHUM">Sorghum</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Variety (Optional)</label>
                    <input
                      type="text"
                      name="variety"
                      value={formData.variety}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Durum"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area (Hectares) *</label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      min="0.1"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date *</label>
                    <input
                      required
                      type="date"
                      name="plantingDate"
                      value={formData.plantingDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Harvest (Optional)</label>
                    <input
                      type="date"
                      name="expectedHarvest"
                      value={formData.expectedHarvest}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : (editingCropId ? 'Save Changes' : 'Save Crop')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
