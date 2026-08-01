import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, AlertTriangle, Loader2 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { marketService, MarketPrediction } from '../services/marketService';

const trendConfig = {
  rising: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: TrendingUp, label: 'Rising' },
  falling: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: TrendingDown, label: 'Falling' },
  stable: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: BarChart3, label: 'Stable' },
};

export default function PricePrediction({ address }: { address?: string }) {
  const [selectedCrop, setSelectedCrop] = useState<'WHEAT' | 'RICE' | 'CORN'>('WHEAT');
  const [prediction, setPrediction] = useState<MarketPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');
    
    // Map CORN back to maize for the API
    const cropKey = selectedCrop === 'CORN' ? 'maize' : selectedCrop.toLowerCase();
    
    marketService.getMarketPrediction(cropKey, address)
      .then(data => {
        if (isMounted) {
          setPrediction(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch market data');
          setLoading(false);
        }
      });
      
    return () => { isMounted = false; };
  }, [selectedCrop, address]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500 min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
          <p>Analyzing live Agmarknet data...</p>
        </div>
      );
    }
    
    if (error || !prediction) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-red-500 min-h-[400px]">
          <AlertTriangle className="h-8 w-8 mb-4" />
          <p>{error || 'No data available'}</p>
        </div>
      );
    }

    const currentPrice = prediction.currentModalPrice || prediction.currentMSP;
    const isPriceUp = currentPrice > prediction.currentMSP;
    const priceChange = (((currentPrice - prediction.currentMSP) / prediction.currentMSP) * 100).toFixed(1);
    
    // Determine trend based on projection
    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    let futurePrice = currentPrice;
    if (prediction.projectedSeries && prediction.projectedSeries.length > 0) {
      futurePrice = prediction.projectedSeries[prediction.projectedSeries.length - 1].price;
      if (futurePrice > currentPrice * 1.05) trend = 'rising';
      else if (futurePrice < currentPrice * 0.95) trend = 'falling';
    }

    const TrendIcon = trendConfig[trend].icon;

    // Format chart data combining historical and projected
    const chartData = [
      ...prediction.historicalSeries.map(h => ({ 
        month: new Date(h.date).toLocaleDateString('en-IN', { month: 'short' }), 
        historical: h.price,
        msp: prediction.currentMSP
      })),
      ...prediction.projectedSeries.map(p => ({ 
        month: new Date(p.date).toLocaleDateString('en-IN', { month: 'short' }), 
        projected: p.price,
        msp: prediction.currentMSP
      }))
    ];

    const hasEnoughHistory = prediction.historicalSeries.length > 1;

    return (
      <div className="p-6 space-y-6 animate-in fade-in duration-500">
        {/* Price Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current MSP</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{prediction.currentMSP}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">per quintal</p>
          </div>
          <div className={`rounded-2xl p-4 ${trendConfig[trend].bg} border ${trendConfig[trend].border}`}>
            <p className={`text-xs mb-1 ${trendConfig[trend].color}`}>Live Mandi Modal Price</p>
            <p className={`text-2xl font-bold ${trendConfig[trend].color}`}>
              {prediction.currentModalPrice ? `₹${prediction.currentModalPrice}` : 'N/A'}
            </p>
            {prediction.currentModalPrice && (
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon className={`h-4 w-4 ${trendConfig[trend].color}`} />
                <span className={`text-xs font-semibold ${trendConfig[trend].color}`}>
                  {isPriceUp ? '+' : ''}{priceChange}% vs MSP
                </span>
              </div>
            )}
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">6-Month Trend Outlook</p>
            <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
              {trend === 'rising' ? 'Expected to rise' : trend === 'falling' ? 'Expected to decline' : 'Stable'}
            </p>
            <p className="text-xs text-indigo-500 dark:text-indigo-500 mt-1">{prediction.trendFitMetric}</p>
          </div>
        </div>

        {/* Price Chart */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">6-Month Price Trend</h3>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span> Historical
              <span className="w-2 h-2 rounded-full bg-indigo-300 inline-block ml-2"></span> Projected
            </span>
          </div>
          
          {!hasEnoughHistory && (
             <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg border border-yellow-200 mb-4">
                Building historical trend — full 6-month view available after sufficient daily data accumulates.
             </div>
          )}

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="projGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: any) => [`₹${value}/q`, 'Price']} />
                <ReferenceLine y={prediction.currentMSP} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'MSP', fill: '#94a3b8', fontSize: 10 }} />
                <Area type="monotone" dataKey="historical" stroke="#8b5cf6" fill="url(#priceGradient)" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} name="Historical" />
                <Area type="monotone" dataKey="projected" stroke="#818cf8" strokeDasharray="4 4" fill="url(#projGradient)" strokeWidth={2} dot={{ fill: '#818cf8', r: 3 }} name="Projected" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Source Details */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-xs text-gray-500 dark:text-gray-400">
          <p className="flex justify-between items-center">
            <span><strong>Data Source:</strong> {prediction.dataSource}</span>
            <span><strong>Last Updated:</strong> {prediction.lastUpdated}</span>
          </p>
          <p className="mt-2 text-gray-400">
            Note: The trend forecast is a statistical projection based on recent modal prices and should not be considered guaranteed future pricing.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">📊 Market Price Trends</h2>
            <p className="text-purple-100 text-sm">Real-time daily mandi prices & statistical projections</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['WHEAT', 'RICE', 'CORN'].map(crop => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCrop === crop
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {crop === 'CORN' ? 'Corn / Maize' : crop.charAt(0) + crop.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {renderContent()}
    </div>
  );
}
