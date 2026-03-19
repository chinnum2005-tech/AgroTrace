import { useRef } from 'react';

interface CropPlant {
  id: number;
  left: string;
  height: number;
  delay: number;
  duration: number;
  scale: number;
  type: 'wheat' | 'corn' | 'rice';
}

// Wheat/Corn plant SVG component
function CropPlant({ type, windOffset }: { type: string; windOffset: number }) {
  if (type === 'wheat') {
    return (
      <svg viewBox="0 0 40 120" className="w-full h-full">
        {/* Stem */}
        <path 
          d="M20 120 Q20 80 20 40" 
          stroke="#16a34a" 
          strokeWidth="2" 
          fill="none"
          style={{ transform: `rotate(${windOffset}deg)`, transformOrigin: 'bottom center' }}
        />
        {/* Wheat grains/heads */}
        {[...Array(5)].map((_, i) => (
          <g key={i} style={{ 
            transform: `rotate(${windOffset * (1.2 + i * 0.1)}deg)`,
            transformOrigin: `${20 + Math.sin(i * 0.5) * 5}px ${35 + i * 12}px`
          }}>
            <ellipse 
              cx={20 + Math.sin(i * 0.5) * 8} 
              cy={35 + i * 12} 
              rx="4" 
              ry="8" 
              fill="#fbbf24"
              opacity="0.9"
            />
            <ellipse 
              cx={20 - Math.sin(i * 0.5) * 8} 
              cy={35 + i * 12} 
              rx="4" 
              ry="8" 
              fill="#f59e0b"
              opacity="0.9"
            />
          </g>
        ))}
        {/* Leaves */}
        {[...Array(3)].map((_, i) => (
          <path 
            key={i}
            d={`M20 ${80 + i * 15} Q${10 + i * 5} ${70 + i * 10} ${5 + i * 3} ${60 + i * 8}`}
            stroke="#15803d"
            strokeWidth="2"
            fill="#16a34a"
            style={{ transform: `rotate(${windOffset * 0.8}deg)`, transformOrigin: '20px 85px' }}
          />
        ))}
      </svg>
    );
  }
  
  // Corn plant
  return (
    <svg viewBox="0 0 60 150" className="w-full h-full">
      {/* Stem */}
      <rect x="28" y="40" width="4" height="110" fill="#15803d" rx="2" />
      
      {/* Long corn leaves */}
      {[...Array(5)].map((_, i) => (
        <path 
          key={i}
          d={`M30 ${90 - i * 12} Q${45 + i * 3} ${85 - i * 10} ${60 + i * 5} ${80 - i * 15}`}
          stroke="#16a34a"
          strokeWidth="3"
          fill="#15803d"
          style={{ 
            transform: `rotate(${windOffset * (0.9 + i * 0.05)}deg)`,
            transformOrigin: '30px 90px'
          }}
        />
      ))}
      {[...Array(5)].map((_, i) => (
        <path 
          key={i}
          d={`M30 ${90 - i * 12} Q${15 - i * 3} ${85 - i * 10} ${-i * 5} ${80 - i * 15}`}
          stroke="#16a34a"
          strokeWidth="3"
          fill="#15803d"
          style={{ 
            transform: `rotate(${-windOffset * (0.9 + i * 0.05)}deg)`,
            transformOrigin: '30px 90px'
          }}
        />
      ))}
      
      {/* Corn cob */}
      <ellipse cx="30" cy="70" rx="6" ry="15" fill="#fbbf24" />
      <ellipse cx="30" cy="70" rx="5" ry="14" fill="#f59e0b" opacity="0.6" />
    </svg>
  );
}

export default function FarmWindBackgroundCSS() {
  const plants = useRef<CropPlant[]>(
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: `${(i / 80) * 100 + Math.random() * 2}%`,
      height: 80 + Math.random() * 60,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      scale: 0.8 + Math.random() * 0.4,
      type: Math.random() > 0.5 ? 'wheat' : 'corn',
    }))
  ).current;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-200 to-green-200" />
      
      {/* Sun */}
      <div className="absolute top-8 right-20 w-32 h-32 bg-yellow-300 rounded-full blur-xl opacity-60 animate-pulse" />
      
      {/* Clouds */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute w-40 h-16 bg-white rounded-full blur-2xl opacity-40"
          style={{
            left: `${20 + i * 25}%`,
            top: `${10 + Math.random() * 20}%`,
            animation: `floatCloud ${10 + i * 5}s ease-in-out infinite`,
            animationDelay: `${i * 2}s`,
          }}
        />
      ))}
      
      {/* Distant hills/trees line */}
      <div className="absolute bottom-1/3 left-0 right-0 h-24">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0"
            style={{
              left: `${i * 3.5}%`,
              width: '60px',
              height: `${60 + Math.random() * 40}px`,
            }}
          >
            <svg viewBox="0 0 60 100" preserveAspectRatio="none">
              <polygon points="30,0 60,100 0,100" fill="#065f46" />
            </svg>
          </div>
        ))}
      </div>
      
      {/* Main crop field */}
      <div className="absolute bottom-0 left-0 right-0 h-80">
        {/* Back row of crops */}
        <div className="absolute bottom-8 left-0 right-0 h-40">
          {plants.map((plant, i) => (
            <div
              key={`back-${plant.id}`}
              className="absolute bottom-0"
              style={{
                left: plant.left,
                width: `${plant.scale * 50}px`,
                height: `${plant.height * 0.7}px`,
                opacity: 0.6,
                filter: 'blur(1px)',
              }}
            >
              <CropPlant type={plant.type} windOffset={Math.sin(Date.now() / 1000 + plant.delay) * 3} />
            </div>
          ))}
        </div>
        
        {/* Middle row */}
        <div className="absolute bottom-4 left-0 right-0 h-56">
          {plants.map((plant, i) => (
            <div
              key={`mid-${plant.id}`}
              className="absolute bottom-0"
              style={{
                left: `${parseFloat(plant.left) + 1}%`,
                width: `${plant.scale * 60}px`,
                height: `${plant.height}px`,
                animation: `sway ${plant.duration}s ease-in-out infinite alternate`,
                animationDelay: `${plant.delay}s`,
              }}
            >
              <CropPlant type={plant.type} windOffset={0} />
            </div>
          ))}
        </div>
        
        {/* Front row - detailed */}
        <div className="absolute bottom-0 left-0 right-0 h-72">
          {plants.slice(0, 40).map((plant, i) => (
            <div
              key={`front-${plant.id}`}
              className="absolute bottom-0"
              style={{
                left: `${parseFloat(plant.left) * 1.5}%`,
                width: `${plant.scale * 70}px`,
                height: `${plant.height * 1.2}px`,
                animation: `sway ${plant.duration + 1}s ease-in-out infinite alternate`,
                animationDelay: `${plant.delay * 0.8}s`,
                zIndex: 10,
              }}
            >
              <CropPlant type={plant.type} windOffset={0} />
            </div>
          ))}
        </div>
        
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-900 via-green-800 to-transparent opacity-80" />
      </div>
      
      {/* Wind/dust particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${30 + Math.random() * 50}%`,
              animation: `windFloat ${8 + Math.random() * 4}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes sway {
          0% {
            transform: rotate(-4deg);
          }
          50% {
            transform: rotate(6deg);
          }
          100% {
            transform: rotate(-4deg);
          }
        }
        
        @keyframes floatCloud {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(20px);
          }
        }
        
        @keyframes windFloat {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateX(150px) translateY(-30px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
