import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Server, Smartphone, Check, X } from 'lucide-react';
import api from '../services/api';

interface ConflictData {
  url: string;
  method: string;
  data: any; // The payload the user tried to send
  serverData: any; // The state of the record currently in the DB
}

export default function ConflictResolutionModal() {
  const [conflict, setConflict] = useState<ConflictData | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    const handleConflict = (event: CustomEvent<ConflictData>) => {
      setConflict(event.detail);
    };

    window.addEventListener('api-conflict' as any, handleConflict);
    return () => {
      window.removeEventListener('api-conflict' as any, handleConflict);
    };
  }, []);

  if (!conflict) return null;

  const handleForceOverwrite = async () => {
    setIsResolving(true);
    try {
      // Re-send the request but use the server's version number to bypass optimistic locking
      const updatedPayload = {
        ...conflict.data,
        version: conflict.serverData.version
      };

      await api({
        method: conflict.method,
        url: conflict.url,
        data: updatedPayload
      });
      
      // Clear the modal on success
      setConflict(null);
      // Reload the page to reflect changes
      window.location.reload();
    } catch (err) {
      console.error("Failed to overwrite conflict", err);
      alert("Failed to resolve conflict. Please refresh the page and try again.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleDiscardLocal = () => {
    setConflict(null);
    window.location.reload();
  };

  const renderDifferences = () => {
    const localKeys = Object.keys(conflict.data || {});
    return (
      <div className="space-y-4">
        {localKeys.map((key) => {
          if (key === 'version') return null;
          const localVal = JSON.stringify(conflict.data[key]);
          const serverVal = JSON.stringify(conflict.serverData[key]);
          
          if (localVal === serverVal) return null;

          return (
            <div key={key} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{key}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                  <div className="flex items-center gap-1 text-red-800 text-xs font-bold mb-1">
                    <Server className="h-3 w-3" /> SERVER HAS
                  </div>
                  <div className="text-sm text-red-900 break-all">{serverVal || 'null'}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                  <div className="flex items-center gap-1 text-green-800 text-xs font-bold mb-1">
                    <Smartphone className="h-3 w-3" /> YOU TRIED TO SAVE
                  </div>
                  <div className="text-sm text-green-900 break-all">{localVal || 'null'}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-orange-500 p-6 text-white flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">Sync Conflict Detected</h2>
              <p className="text-orange-100 text-sm">
                Another user or device has modified this record while you were offline or editing. 
                Please choose how to resolve this conflict to maintain data integrity.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 bg-white">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Conflicting Fields</h3>
            {renderDifferences()}
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4 justify-end">
            <button
              onClick={handleDiscardLocal}
              disabled={isResolving}
              className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <X className="h-5 w-5" />
              Discard Local Changes
            </button>
            <button
              onClick={handleForceOverwrite}
              disabled={isResolving}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2"
            >
              <Check className="h-5 w-5" />
              {isResolving ? 'Resolving...' : 'Force Overwrite Server'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
