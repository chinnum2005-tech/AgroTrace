import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in react
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FieldSetupModalProps {
  onClose: () => void;
  onSubmit: (name: string, polygon: any) => Promise<void>;
}

export default function FieldSetupModal({ onClose, onSubmit }: FieldSetupModalProps) {
  const [name, setName] = useState('My First Field');
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Initialize map
    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current).setView([21.1458, 79.0882], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(leafletMap.current);

      leafletMap.current.on('click', (e: L.LeafletMouseEvent) => {
        setPosition(e.latlng);
        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng);
        } else {
          markerRef.current = L.marker(e.latlng).addTo(leafletMap.current!);
        }
      });
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !leafletMap.current) return;
    setIsSearching(true);
    try {
      // Open-Meteo only has major cities. Nominatim has precise street/sub-city data.
      // We pass an email parameter to comply with Nominatim's fair-use policy so it doesn't block us.
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&email=hello@agrotrace.com`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        leafletMap.current.flyTo([lat, lon], 14, { animate: true, duration: 1.5 });
      } else {
        alert("Location not found. Try adding a broader region (e.g., city or state).");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to search location.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSubmit = async () => {
    if (!position) return alert("Please drop a pin on the map to mark your field.");
    setLoading(true);
    try {
      await onSubmit(name, { lat: position.lat, lng: position.lng });
    } catch (e) {
      console.error(e);
      alert("Failed to create field.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Setup Your Field</h2>
        <p className="text-gray-600 mb-6">Drop a pin on the map to define your field's location. We'll automatically ingest 30-day historical weather and 60-day satellite NDVI data based on these coordinates.</p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-xl"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Location</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 p-3 border border-gray-300 rounded-xl"
              placeholder="e.g., Nagpur, Maharashtra"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        <div className="h-64 mb-6 rounded-xl overflow-hidden border border-gray-200" ref={mapRef}>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? 'Creating & Ingesting Data...' : 'Save Field'}
          </button>
        </div>
      </div>
    </div>
  );
}
