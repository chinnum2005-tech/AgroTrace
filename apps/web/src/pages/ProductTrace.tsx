import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supplyChainService } from '../services/supplyChainService';
import { ArrowLeft, CheckCircle, MapPin, Calendar, User, Truck, Package, Sprout, ShoppingCart } from 'lucide-react';
import SupplyChainMap from '../components/SupplyChainMap';

interface SupplyChainEvent {
  id: string;
  eventType: string;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  date: string;
  actor: string;
  actorRole: string;
  verified: boolean;
  transactionHash?: string;
}

export default function ProductTrace() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [events, setEvents] = useState<SupplyChainEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState('');

  useEffect(() => {
    if (productId) {
      loadTraceability(productId);
    }
  }, [productId]);

  const loadTraceability = async (id: string) => {
    try {
      setLoading(true);
      const response = await supplyChainService.getProductTraceability(id);
      
      if (response.success && response.data) {
        setEvents(response.data);
        
        // Extract product name from first event or use default
        if (response.data.length > 0) {
          setProductName(`Product #${id.slice(0, 8).toUpperCase()}`);
        }
      }
    } catch (error) {
      console.error('Failed to load traceability:', error);
      alert('Failed to load product journey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case '🌱 Planted':
        return <Sprout className="w-6 h-6" />;
      case '🌾 Harvested':
        return <Sprout className="w-6 h-6" />;
      case '⚙️ Processed':
        return <Package className="w-6 h-6" />;
      case '📦 Packaged':
        return <Package className="w-6 h-6" />;
      case '🚚 Shipped':
        return <Truck className="w-6 h-6" />;
      case '✅ Received':
        return <CheckCircle className="w-6 h-6" />;
      case '✓ Quality Check':
        return <CheckCircle className="w-6 h-6" />;
      case '🏪 Available for Purchase':
        return <ShoppingCart className="w-6 h-6" />;
      case '💰 Sold':
        return <ShoppingCart className="w-6 h-6" />;
      default:
        return <Package className="w-6 h-6" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case '🌱 Planted':
      case '🌾 Harvested':
        return 'bg-green-100 text-green-600 border-green-200';
      case '⚙️ Processed':
      case '📦 Packaged':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case '🚚 Shipped':
      case '✅ Received':
        return 'bg-amber-100 text-amber-600 border-amber-200';
      case '🏪 Available for Purchase':
      case '💰 Sold':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        <div className="mt-6 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Product Journey
          </h1>
          <p className="text-lg text-gray-600">
            Complete traceability from farm to table
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
            <span className="font-semibold">{productName}</span>
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        {productId && <SupplyChainMap productId={productId} height="450px" />}
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-4">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Journey Recorded Yet
            </h3>
            <p className="text-gray-500">
              This product hasn't started its journey yet.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 via-amber-500 to-purple-500 hidden md:block"></div>

            {/* Events */}
            <div className="space-y-8">
              {events.map((event, index) => (
                <div key={event.id} className="relative flex gap-6">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-full ${getEventColor(event.eventType)} border-4 flex items-center justify-center shadow-lg z-10`}>
                    {getEventIcon(event.eventType)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-gray-600">{event.description}</p>
                        )}
                      </div>
                      
                      {event.verified && (
                        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">{event.date}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">{event.actor} ({event.actorRole})</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Card */}
        {events.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Complete Transparency</h2>
              <p className="text-green-100 mb-6">
                This product's complete journey has been recorded and verified on the blockchain.
              </p>
              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold">{events.length}</div>
                  <div className="text-green-100 text-sm">Events Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-green-100 text-sm">Transparent</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">✓</div>
                  <div className="text-green-100 text-sm">Verified</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
