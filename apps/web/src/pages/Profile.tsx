import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Phone, Mail, Save, Home, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService, farmService } from '../services';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // User Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Farm Details State
  const [hasFarm, setHasFarm] = useState(false);
  const [farmName, setFarmName] = useState('');
  const [farmSize, setFarmSize] = useState(0);
  const [farmAddress, setFarmAddress] = useState('');
  const [farmLat, setFarmLat] = useState<number | undefined>();
  const [farmLng, setFarmLng] = useState<number | undefined>();
  const [isManualLatLngChange, setIsManualLatLngChange] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const user = await authService.getMe();
      if (user) {
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setPhone(user.phone || '');
        setEmail(user.email || '');
      }

      // Load farm details
      try {
        const farmRes = await farmService.getMyFarm();
        if (farmRes.data) {
          setHasFarm(true);
          setFarmName(farmRes.data.name || '');
          setFarmSize(farmRes.data.size || 0);
          setFarmAddress(farmRes.data.location?.address || '');
          setFarmLat(farmRes.data.location?.lat);
          setFarmLng(farmRes.data.location?.lng);
        }
      } catch (e: any) {
        // If they don't have a farm yet, that's fine
        if (e.response?.status !== 404) {
          console.warn("Could not load farm details:", e);
        }
      }
      
    } catch (err: any) {
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Update user profile
      await authService.updateProfile({
        firstName,
        lastName,
        phone
      });

      // 2. Update farm details if they have one
      if (hasFarm) {
        const locationData = {
          address: farmAddress,
          lat: farmLat,
          lng: farmLng
        };

        if (farmLat !== undefined && farmLng !== undefined) {
           locationData.lat = farmLat;
           locationData.lng = farmLng;
        }

        await farmService.updateMyFarm({
          name: farmName,
          size: Number(farmSize),
          location: locationData
        });
      }

      setSuccessMsg("Profile and Farm details saved successfully! Your dashboard real-time data will now reflect your new location.");
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMsg(null), 5000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFarmAddress(e.target.value);
    setIsManualLatLngChange(false);
  };

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFarmLat(e.target.value ? Number(e.target.value) : undefined);
    setIsManualLatLngChange(true);
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFarmLng(e.target.value ? Number(e.target.value) : undefined);
    setIsManualLatLngChange(true);
  };

  useEffect(() => {
    if (isManualLatLngChange && farmLat !== undefined && farmLng !== undefined) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${farmLat}&lon=${farmLng}&zoom=10`, {
             headers: { 'User-Agent': 'AgroTrace-App/1.0.0' }
          });
          const data = await res.json();
          if (data && data.display_name) {
            setFarmAddress(data.display_name);
          }
        } catch (e) {
          console.warn("Auto geocoding failed", e);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [farmLat, farmLng, isManualLatLngChange]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-10 text-white flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className="text-green-100 mt-2">Manage your personal information and farm details.</p>
            </div>
            <button 
              onClick={() => window.location.href = '/farmer/dashboard'}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm transition flex items-center gap-2"
            >
              <Home className="h-5 w-5" />
              Back to Dashboard
            </button>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <p className="text-green-700">{successMsg}</p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-10">
              
              {/* Personal Details Section */}
              <section>
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
                  <User className="h-6 w-6 text-green-600" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </section>

              {/* Farm Details Section */}
              {hasFarm && (
                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
                    <Home className="h-6 w-6 text-blue-600" />
                    Farm Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Farm Name</label>
                      <input
                        type="text"
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Farm Size (Hectares)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={farmSize}
                        onChange={(e) => setFarmSize(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-500" /> 
                          Farm Location (Address / City)
                        </label>
                        <input
                          type="text"
                          value={farmAddress}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                          placeholder="e.g. Rajanukunte, Yelahanka, Bengaluru"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={farmLat ?? ''}
                          onChange={handleLatChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                          placeholder="e.g. 13.0827"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={farmLng ?? ''}
                          onChange={handleLngChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                          placeholder="e.g. 77.5877"
                          required
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">
                        Note: Updating this location will automatically update your dashboard's real-time weather and visualizations to the new coordinates.
                      </p>
                    </div>
                  </div>
                </section>
              )}
              
              {!hasFarm && (
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                  <h4 className="text-yellow-800 font-bold mb-2">No Farm Profile Found</h4>
                  <p className="text-yellow-700 text-sm">
                    You haven't registered a farm yet. To access full dashboard features, please register your farm from the Dashboard.
                  </p>
                </div>
              )}

              <div className="pt-6 border-t flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
