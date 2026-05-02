import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Leaf, AlertTriangle, CheckCircle, X, Camera, RefreshCw, FileImage, Microscope, Zap, BookOpen, BarChart3 } from 'lucide-react';

interface Prediction {
  disease_id: string;
  confidence: number;
}

interface DetectionResult {
  disease: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  symptoms: string[];
  treatments: string[];
  preventions: string[];
  affectedCrop: string;
  top3?: Prediction[];
}

// Smart parser to generate dynamic content for 38 classes
const generateContentForDisease = (rawId: string, confidence: number, top3?: Prediction[]): DetectionResult => {
  // e.g., "Tomato___Early_blight" -> "Tomato", "Early blight"
  const parts = rawId.split('___');
  const crop = parts[0]?.replace(/_/g, ' ') || 'Unknown Crop';
  let diseaseName = parts[1]?.replace(/_/g, ' ') || rawId;
  
  const isHealthy = rawId.toLowerCase().includes('healthy');
  
  if (isHealthy) {
    return {
      disease: 'Healthy Crop',
      confidence,
      severity: 'Low',
      description: `Your ${crop} crop appears healthy! The CNN model detected no significant visual disease symptoms. Continue good agricultural practices.`,
      affectedCrop: crop,
      symptoms: ['No visible disease lesions', 'Normal leaf color and structure'],
      treatments: ['No chemical treatments required at this time'],
      preventions: [
        'Maintain balanced fertilization',
        'Monitor soil moisture levels',
        'Continue regular visual scouting'
      ],
      top3
    };
  }

  // Determine severity based on common disease types
  let severity: 'Medium' | 'High' | 'Critical' = 'Medium';
  if (diseaseName.toLowerCase().includes('blight') || diseaseName.toLowerCase().includes('rust')) severity = 'High';
  if (diseaseName.toLowerCase().includes('virus')) severity = 'Critical';

  return {
    disease: `${diseaseName}`,
    confidence,
    severity,
    description: `The AI model identified ${diseaseName} on your ${crop}. This is a common agricultural issue that can reduce yield if left untreated.`,
    affectedCrop: crop,
    symptoms: [
      'Discoloration or spots on leaf surface',
      'Potential curling or wilting of leaf edges',
      'Spreading lesions in humid conditions'
    ],
    treatments: [
      'Isolate severely infected plants if possible',
      `Apply broad-spectrum fungicide approved for ${crop}`,
      'Improve air circulation in the canopy'
    ],
    preventions: [
      `Use certified disease-resistant ${crop} seeds next season`,
      'Practice crop rotation to break pathogen life cycles',
      'Avoid overhead watering to keep foliage dry'
    ],
    top3
  };
};

const severityConfig = {
  Low:      { color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300', icon: CheckCircle },
  Medium:   { color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-300', icon: AlertTriangle },
  High:     { color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300', icon: AlertTriangle },
  Critical: { color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', icon: AlertTriangle },
};

export default function DiseaseDetection() {
  const [image, setImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setFileName(file.name);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const AI_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';
      
      const response = await fetch(`${AI_URL}/predict/disease`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Prediction failed');

      const data = await response.json();
      
      // { disease_id: "Tomato___Early_blight", confidence: 95.5, top_3: [...] }
      const content = generateContentForDisease(data.disease_id, data.confidence, data.top_3);
      setResult(content);
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      // Fallback
      setResult(generateContentForDisease('Network___Connection_Error', 0));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const SeverityIcon = result ? severityConfig[result.severity].icon : CheckCircle;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-6 pb-28">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gradient-to-r from-green-600 to-teal-600 rounded-3xl p-8 text-white shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Microscope className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">🔬 Deep-CNN Disease Analysis</h1>
              <p className="text-green-100 text-lg">Upload a photo of your crop leaf for instant AI-powered 38-class diagnosis</p>
              <div className="flex items-center gap-4 mt-3 text-green-50 text-sm">
                <span className="flex items-center gap-1"><Zap className="h-4 w-4" /> PlantVillage CNN Model</span>
                <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Top-3 Confidence</span>
                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> 38 Disease Classes</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Camera className="h-6 w-6 text-green-600" />
              Upload Crop Image
            </h2>

            {!image ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 scale-105'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10'
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-2xl">
                    <Upload className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Drop your crop image here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  or click to browse your files
                </p>
                <div className="flex justify-center gap-3">
                  {['🌾', '🌽', '🍃', '🌿'].map((emoji, i) => (
                    <span key={i} className="text-2xl">{emoji}</span>
                  ))}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden shadow-inner border-2 border-green-200 dark:border-green-800">
                  <img src={image} alt="Uploaded crop" className="w-full h-64 object-cover" />
                  <button
                    onClick={handleReset}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  {analyzing ? (
                    <><RefreshCw className="h-6 w-6 animate-spin" /> Deep Network Inferencing...</>
                  ) : (
                    <><Microscope className="h-6 w-6" /> Run Convolutional Neural Network</>
                  )}
                </button>
              </div>
            )}
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {!result && !analyzing && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 h-full flex items-center justify-center"
                >
                  <div className="text-center text-gray-400 dark:text-gray-600">
                    <Leaf className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">Awaiting Input Tensor</p>
                    <p className="text-sm mt-2">Upload an image to process through the 38-class ResNet/MobileNet model.</p>
                  </div>
                </motion.div>
              )}

              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden"
                >
                  <div className={`p-6 ${
                    result.disease === 'Healthy Crop'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                      : 'bg-gradient-to-r from-orange-500 to-red-600'
                  } text-white`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{result.disease}</h3>
                        <p className="text-white/80 text-sm mt-1">Host Crop: {result.affectedCrop}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">{result.confidence}%</div>
                        <div className="text-white/80 text-sm">Top-1 Confidence</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-5 max-h-[600px] overflow-y-auto">
                    
                    {/* Top 3 Predictions Panel */}
                    {result.top3 && result.top3.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <h4 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-indigo-500" />
                          Model Probability Distribution (Top 3)
                        </h4>
                        <div className="space-y-3">
                          {result.top3.map((pred, idx) => (
                            <div key={idx} className="relative">
                              <div className="flex justify-between text-xs mb-1 text-gray-600 dark:text-gray-300">
                                <span className="truncate pr-4">{pred.disease_id.replace(/___/g, ' - ').replace(/_/g, ' ')}</span>
                                <span className="font-bold">{pred.confidence}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pred.confidence}%` }}
                                  transition={{ delay: 0.5 + (idx * 0.2) }}
                                  className={`h-full rounded-full ${idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-blue-400' : 'bg-gray-400'}`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${severityConfig[result.severity].bg} ${severityConfig[result.severity].border}`}>
                      <SeverityIcon className={`h-4 w-4 ${severityConfig[result.severity].color}`} />
                      <span className={`font-semibold text-sm ${severityConfig[result.severity].color}`}>
                        {result.severity} Severity
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{result.description}</p>

                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" /> Recommended Actions
                      </h4>
                      <ul className="space-y-2">
                        {result.treatments.map((t, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                            <span className="text-blue-600 font-bold">{i + 1}.</span> {t}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={handleReset}
                      className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Scan Another Image
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
