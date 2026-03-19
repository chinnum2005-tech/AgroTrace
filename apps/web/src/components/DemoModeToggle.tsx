import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Database, Lightbulb } from 'lucide-react';

interface DemoModeToggleProps {
  onToggle?: (enabled: boolean) => void;
}

export function DemoModeToggle({ onToggle }: DemoModeToggleProps) {
  const [demoMode, setDemoMode] = useState(() => {
    return localStorage.getItem('demoMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('demoMode', demoMode.toString());
    onToggle?.(demoMode);
  }, [demoMode, onToggle]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-4 border-2 border-green-500">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Play className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Demo Mode</h4>
            <p className="text-xs text-gray-600">Perfect for presentations</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-medium text-gray-700">Enable Demo Data</span>
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                demoMode ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  demoMode ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </label>

          {demoMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-xs text-gray-600 space-y-1 mt-2"
            >
              <div className="flex items-center gap-2">
                <Database className="w-3 h-3" />
                <span>Pre-loaded with sample data</span>
              </div>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-3 h-3" />
                <span>Auto-fills forms for demos</span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {demoMode 
              ? '✨ Demo mode active - showing sample data' 
              : '🔒 Live mode - using real data'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
