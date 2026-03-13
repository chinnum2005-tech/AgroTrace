import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { supplyChainService } from '../services/supplyChainService';
import { MapPin } from 'lucide-react';

interface SupplyChainEvent {
  id: string;
  eventType: string;
  title: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  timestamp: string;
}

interface SupplyChainMapProps {
  productId: string;
  height?: string;
}

// Custom marker icons for different event types
const getEventIcon = (eventType: string) => {
  const colors: Record<string, string> = {
    '🌾 Harvested': '#16a34a',
    '📦 Packaged': '#2563eb',
    '🚚 Shipped': '#f59e0b',
    '✅ Received': '#dc2626',
    '🏪 Available': '#9333ea',
  };

  const color = colors[eventType] || '#6b7280';

  return new L.DivIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      ">
        📍
      </div>
    `,
    className: 'custom-marker',
    iconSize: [30, 30] as [number, number],
    iconAnchor: [15, 15] as [number, number],
  });
};

export default function SupplyChainMap({ productId, height = '400px' }: SupplyChainMapProps) {
  const [events, setEvents] = useState<SupplyChainEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productId) {
      loadMapData(productId);
    }
  }, [productId]);

  const loadMapData = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await supplyChainService.getProductTraceability(id);
      
      if (response.success && response.data) {
        setEvents(response.data);
      } else {
        // No data available - this is normal for demo
        setEvents([]);
      }
    } catch (err: any) {
      console.error('Error loading map:', err);
      // Don't show error, just show empty state
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter events that have coordinates
  const eventsWithCoordinates = events.filter(
    (event) => event.latitude && event.longitude
  );

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-xl"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-red-50 rounded-xl border border-red-200"
        style={{ height }}
      >
        <div className="text-center text-red-600">
          <p className="font-semibold">⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (eventsWithCoordinates.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200"
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="font-medium">No location data available</p>
          <p className="text-sm">Locations will appear here as products move through the supply chain</p>
        </div>
      </div>
    );
  }

  // Calculate map center based on all markers
  const avgLat = eventsWithCoordinates.reduce((sum, e) => sum + (e.latitude || 0), 0) / eventsWithCoordinates.length;
  const avgLng = eventsWithCoordinates.reduce((sum, e) => sum + (e.longitude || 0), 0) / eventsWithCoordinates.length;

  // Create path between locations
  const pathCoordinates = eventsWithCoordinates.map(e => [e.latitude || 0, e.longitude || 0] as [number, number]);

  return (
    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          Product Journey Map
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Track the movement from farm to customer
        </p>
      </div>

      <MapContainer
        center={[avgLat, avgLng]}
        zoom={6}
        scrollWheelZoom={true}
        className="w-full"
        style={{ height }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Path line connecting all locations */}
        {pathCoordinates.length > 1 && (
          <Polyline
            positions={pathCoordinates}
            color="#16a34a"
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}

        {/* Markers for each event */}
        {eventsWithCoordinates.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude || 0, event.longitude || 0]}
            icon={getEventIcon(event.title)}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-bold text-gray-900 mb-1">{event.title}</h4>
                <p className="text-sm text-gray-700 mb-1">
                  <MapPin className="inline w-3 h-3 mr-1" />
                  {event.location}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleDateString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="bg-white px-6 py-3 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>Harvested</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span>Processed</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-amber-600"></div>
            <span>In Transit</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>Delivered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
