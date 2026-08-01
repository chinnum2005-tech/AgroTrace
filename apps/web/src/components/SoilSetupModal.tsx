import React, { useState } from 'react';

interface SoilSetupModalProps {
  fieldId: string;
  fieldName: string;
  onClose: () => void;
  onSubmit: (fieldId: string, data: any) => Promise<void>;
}

export default function SoilSetupModal({ fieldId, fieldName, onClose, onSubmit }: SoilSetupModalProps) {
  const [N, setN] = useState('45');
  const [P, setP] = useState('20');
  const [K, setK] = useState('30');
  const [pH, setPH] = useState('6.5');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(fieldId, { N: Number(N), P: Number(P), K: Number(K), pH: Number(pH) });
    } catch (e) {
      console.error(e);
      alert("Failed to submit soil data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Soil Data Required</h2>
        <p className="text-gray-600 mb-6">Your field "{fieldName}" is missing recent soil test results required for AI crop recommendations.</p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nitrogen (N) mg/kg</label>
            <input type="number" className="w-full p-3 border border-gray-300 rounded-xl" value={N} onChange={e => setN(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phosphorus (P) mg/kg</label>
            <input type="number" className="w-full p-3 border border-gray-300 rounded-xl" value={P} onChange={e => setP(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Potassium (K) mg/kg</label>
            <input type="number" className="w-full p-3 border border-gray-300 rounded-xl" value={K} onChange={e => setK(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">pH Level</label>
            <input type="number" step="0.1" className="w-full p-3 border border-gray-300 rounded-xl" value={pH} onChange={e => setPH(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold">Skip for now</button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Soil Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
