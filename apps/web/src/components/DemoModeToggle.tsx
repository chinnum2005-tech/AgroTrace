import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Database, Lightbulb, Settings, X } from 'lucide-react';

interface DemoModeToggleProps {
  onToggle?: (enabled: boolean) => void;
}

export function DemoModeToggle({ onToggle }: DemoModeToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [demoMode, setDemoMode] = useState(() => {
    return localStorage.getItem('demoMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('demoMode', demoMode.toString());
    onToggle?.(demoMode);
  }, [demoMode, onToggle]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="bg-white rounded-2xl shadow-2xl p-4 border-2 border-green-500 mb-4 w-72"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Play className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Demo Mode</h4>
                  <p className="text-xs text-gray-600">Perfect for presentations</p>
                </div>
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 rounded-md text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
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
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-12 h-12 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition-colors"
        title="Settings & Demo Mode"
      >
        <Settings className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
