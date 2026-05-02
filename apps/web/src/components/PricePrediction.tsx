import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, AlertTriangle, Leaf, Info } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

interface PricePrediction {
  crop: string;
  currentMSP: number;
  predictedPrice: number;
  bestSellDate: string;
  trend: 'rising' | 'falling' | 'stable';
  confidence: number;
  monthlyData: { month: string; predicted: number; msp: number }[];
  recommendation: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  factors: { name: string; impact: 'positive' | 'negative' | 'neutral'; description: string }[];
}

const cropPredictions: Record<string, PricePrediction> = {
  WHEAT: {
    crop: 'Wheat',
    currentMSP: 2275,
    predictedPrice: 2680,
    bestSellDate: 'June 2026',
    trend: 'rising',
    confidence: 87.3,
    recommendation: 'Hold your harvest. Wheat prices are expected to rise 17.8% over the next 6 weeks due to reduced supply from Maharashtra and Rajasthan.',
    riskLevel: 'Low',
    monthlyData: [
      { month: 'Now', predicted: 2275, msp: 2275 },
      { month: 'Jun', predicted: 2420, msp: 2275 },
      { month: 'Jul', predicted: 2560, msp: 2275 },
      { month: 'Aug', predicted: 2680, msp: 2275 },
      { month: 'Sep', predicted: 2590, msp: 2275 },
      { month: 'Oct', predicted: 2480, msp: 2275 },
    ],
    factors: [
      { name: 'Supply Deficit', impact: 'positive', description: '8% lower production in major wheat states' },
      { name: 'Export Demand', impact: 'positive', description: 'Strong export inquiries from Middle East' },
      { name: 'Monsoon Forecast', impact: 'neutral', description: 'Normal monsoon expected — no immediate impact' },
      { name: 'Government Stock', impact: 'negative', description: 'Buffer stock release possible if prices spike further' },
    ],
  },
  RICE: {
    crop: 'Rice',
    currentMSP: 2183,
    predictedPrice: 2050,
    bestSellDate: 'Sell Now',
    trend: 'falling',
    confidence: 79.6,
    recommendation: 'Sell your rice stock within the next 2 weeks. Prices are expected to drop 6% due to record procurement by government agencies and upcoming Kharif arrivals.',
    riskLevel: 'Medium',
    monthlyData: [
      { month: 'Now', predicted: 2183, msp: 2183 },
      { month: 'Jun', predicted: 2150, msp: 2183 },
      { month: 'Jul', predicted: 2100, msp: 2183 },
      { month: 'Aug', predicted: 2050, msp: 2183 },
      { month: 'Sep', predicted: 2080, msp: 2183 },
      { month: 'Oct', predicted: 2120, msp: 2183 },
    ],
    factors: [
      { name: 'Record Kharif Output', impact: 'negative', description: 'Record 130 MT production forecast' },
      { name: 'FCI Procurement', impact: 'negative', description: 'Government procurement hitting 5-year high' },
      { name: 'Global Demand', impact: 'positive', description: 'Bangladesh and Sri Lanka import orders rising' },
      { name: 'Storage Costs', impact: 'negative', description: 'Holding beyond Oct adds ₹40/quintal in costs' },
    ],
  },
  CORN: {
    crop: 'Corn / Maize',
    currentMSP: 1962,
    predictedPrice: 2180,
    bestSellDate: 'July–August 2026',
    trend: 'rising',
    confidence: 82.1,
    recommendation: 'Moderate hold strategy. Ethanol blending policy driving demand. Poultry sector expansion creates additional floor price support.',
    riskLevel: 'Low',
    monthlyData: [
      { month: 'Now', predicted: 1962, msp: 1962 },
      { month: 'Jun', predicted: 2050, msp: 1962 },
      { month: 'Jul', predicted: 2140, msp: 1962 },
      { month: 'Aug', predicted: 2180, msp: 1962 },
      { month: 'Sep', predicted: 2160, msp: 1962 },
      { month: 'Oct', predicted: 2090, msp: 1962 },
    ],
    factors: [
      { name: 'Ethanol Policy', impact: 'positive', description: '20% ethanol blending target driving maize demand' },
      { name: 'Poultry Expansion', impact: 'positive', description: '12% growth in poultry sector' },
      { name: 'Import Competition', impact: 'negative', description: 'Ukraine origin corn availability globally' },
      { name: 'Rabi Harvest', impact: 'neutral', description: 'Average rabi maize crop expected' },
    ],
  },
};

const trendConfig = {
  rising: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: TrendingUp, label: 'Rising' },
  falling: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: TrendingDown, label: 'Falling' },
  stable: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: BarChart3, label: 'Stable' },
};

const riskConfig = {
  Low: 'bg-green-100 text-green-700 border-green-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  High: 'bg-red-100 text-red-700 border-red-200',
};

export default function PricePrediction() {
  const [selectedCrop, setSelectedCrop] = useState<keyof typeof cropPredictions>('WHEAT');
  const prediction = cropPredictions[selectedCrop];
  const TrendIcon = trendConfig[prediction.trend].icon;
  const priceChange = ((prediction.predictedPrice - prediction.currentMSP) / prediction.currentMSP * 100).toFixed(1);
  const isPriceUp = prediction.predictedPrice > prediction.currentMSP;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">📈 AI Market Price Prediction</h2>
            <p className="text-purple-100 text-sm">Optimal selling time powered by market intelligence</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(cropPredictions).map(crop => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop as keyof typeof cropPredictions)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCrop === crop
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {cropPredictions[crop as keyof typeof cropPredictions].crop}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Price Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current MSP</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{prediction.currentMSP}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">per quintal</p>
          </div>
          <div className={`rounded-2xl p-4 ${trendConfig[prediction.trend].bg} border ${trendConfig[prediction.trend].border}`}>
            <p className={`text-xs mb-1 ${trendConfig[prediction.trend].color}`}>Peak Predicted Price</p>
            <p className={`text-2xl font-bold ${trendConfig[prediction.trend].color}`}>₹{prediction.predictedPrice}</p>
            <div className="flex items-center gap-1">
              <TrendIcon className={`h-4 w-4 ${trendConfig[prediction.trend].color}`} />
              <span className={`text-xs font-semibold ${trendConfig[prediction.trend].color}`}>
                {isPriceUp ? '+' : ''}{priceChange}%
              </span>
            </div>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Best Sell Time</p>
            <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">{prediction.bestSellDate}</p>
            <p className="text-xs text-indigo-500 dark:text-indigo-500 mt-1">AI Confidence: {prediction.confidence}%</p>
          </div>
        </div>

        {/* Price Chart */}
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3 text-sm">6-Month Price Forecast</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={prediction.monthlyData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: any) => [`₹${value}/q`, '']} />
              <ReferenceLine y={prediction.currentMSP} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'MSP', fill: '#94a3b8', fontSize: 10 }} />
              <Area type="monotone" dataKey="predicted" stroke="#8b5cf6" fill="url(#priceGradient)" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} name="Predicted Price" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Recommendation */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex-shrink-0">
              <Info className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-purple-800 dark:text-purple-300 text-sm">AI Recommendation</p>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${riskConfig[prediction.riskLevel]}`}>
                  {prediction.riskLevel} Risk
                </span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-400">{prediction.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Market Factors */}
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3 text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gray-500" />
            Key Market Factors
          </h3>
          <div className="space-y-2">
            {prediction.factors.map((factor, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <span className={`text-lg ${factor.impact === 'positive' ? '📈' : factor.impact === 'negative' ? '📉' : '➡️'}`}>
                  {factor.impact === 'positive' ? '📈' : factor.impact === 'negative' ? '📉' : '➡️'}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{factor.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{factor.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
