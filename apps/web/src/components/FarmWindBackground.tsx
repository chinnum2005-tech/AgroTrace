import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, Canvas } from "@react-three/fiber";
import * as THREE from "three";

// Realistic Wheat Ear with grains
function WheatEar({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={groupRef} position={position}>
      {/* Main wheat ear structure */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const y = i * 0.12;
        const radius = 0.06;
        
        return (
          <group key={i} position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}>
            {/* Individual grain */}
            <mesh rotation={[Math.PI / 4, angle, 0]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshStandardMaterial 
                color="#fbbf24" 
                roughness={0.4}
                metalness={0.1}
              />
            </mesh>
            {/* Awn (tiny hair) */}
            <mesh position={[0, 0.03, 0]} rotation={[0, angle, 0]}>
              <cylinderGeometry args={[0.003, 0.003, 0.08, 6]} />
              <meshStandardMaterial color="#fcd34d" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Complete Wheat Plant
function WheatPlant({ position, windOffset }: { position: [number, number, number]; windOffset: number }) {
  const stemRef = useRef<THREE.Group>(null);
  const leafGroupRefs = useRef<(THREE.Group | null)[]>([]);
  
  useFrame(({ clock }) => {
    if (stemRef.current) {
      const time = clock.elapsedTime + windOffset;
      // Natural wind sway - complex motion
      const swayZ = Math.sin(time * 1.2) * 0.08 + Math.sin(time * 0.5) * 0.04;
      const swayX = Math.cos(time * 1.1) * 0.05 + Math.sin(time * 0.7) * 0.03;
      
      stemRef.current.rotation.z = swayZ;
      stemRef.current.rotation.x = swayX;
      
      // Leaves flutter independently
      leafGroupRefs.current.forEach((leaf, i) => {
        if (leaf) {
          leaf.rotation.z = Math.sin(time * 2 + i) * 0.15;
          leaf.rotation.x = Math.cos(time * 1.8 + i * 0.5) * 0.1;
        }
      });
    }
  });

  return (
    <group ref={stemRef} position={position}>
      {/* Stem with nodes */}
      {[0, 0.3, 0.6, 0.9].map((y, i) => (
        <mesh key={`node-${i}`} position={[0, y, 0]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#16a34a" roughness={0.7} />
        </mesh>
      ))}
      
      {/* Internode segments */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.012, 0.015, 0.3, 8]} />
        <meshStandardMaterial color="#22c55e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.01, 0.012, 0.3, 8]} />
        <meshStandardMaterial color="#22c55e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.008, 0.01, 0.25, 8]} />
        <meshStandardMaterial color="#22c55e" roughness={0.6} />
      </mesh>
      
      {/* Long slender leaves at nodes */}
      {[0.3, 0.6, 0.9].map((height, i) => (
        <group 
          key={i} 
          ref={(el) => (leafGroupRefs.current[i] = el)}
          position={[0, height, 0]}
        >
          {/* Leaf blade */}
          <mesh rotation={[0.3, 0, -0.8]}>
            <boxGeometry args={[0.02, 0.25, 0.005]} />
            <meshStandardMaterial color="#15803d" side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[0.3, Math.PI / 2, 0.8]}>
            <boxGeometry args={[0.02, 0.25, 0.005]} />
            <meshStandardMaterial color="#15803d" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      
      {/* Wheat ear at top */}
      <WheatEar position={[0, 1.25, 0]} />
    </group>
  );
}

// Corn Stalk with detailed features
function CornStalk({ position, windOffset }: { position: [number, number, number]; windOffset: number }) {
  const stalkRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (stalkRef.current) {
      const time = clock.elapsedTime + windOffset;
      const swayZ = Math.sin(time * 0.9) * 0.06 + Math.sin(time * 0.4) * 0.03;
      const swayX = Math.cos(time * 0.85) * 0.04;
      
      stalkRef.current.rotation.z = swayZ;
      stalkRef.current.rotation.x = swayX;
    }
  });

  return (
    <group ref={stalkRef} position={position}>
      {/* Thick segmented stalk */}
      {[0.2, 0.5, 0.8, 1.1, 1.4].map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          {/* Node */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.035, 0.012, 8, 16]} />
            <meshStandardMaterial color="#15803d" roughness={0.8} />
          </mesh>
          {/* Internode */}
          {i < 4 && (
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.032, 0.035, 0.3, 10]} />
              <meshStandardMaterial color="#16a34a" roughness={0.7} />
            </mesh>
          )}
        </group>
      ))}
      
      {/* Large corn leaves */}
      {[0.4, 0.7, 1.0, 1.3].map((height, i) => {
        const leafAngle = i * Math.PI / 2;
        return (
          <group key={height} position={[0, height, 0]} rotation={[0, leafAngle, 0]}>
            {/* Leaf sheath */}
            <mesh position={[0.02, 0, 0]} rotation={[0.1, 0, -0.5 + i * 0.15]}>
              <boxGeometry args={[0.6, 0.08, 0.01]} />
              <meshStandardMaterial color="#16a34a" side={THREE.DoubleSide} />
            </mesh>
            {/* Leaf blade */}
            <mesh position={[0.35, 0.02, 0]} rotation={[0.2, 0, -0.3 + i * 0.1]}>
              <boxGeometry args={[0.5, 0.06, 0.008]} />
              <meshStandardMaterial color="#15803d" side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
      
      {/* Corn cobs */}
      {[0.7, 1.0].map((y, i) => (
        <group key={i} position={[0.05, y, 0]} rotation={[0, 0, -0.4]}>
          {/* Cob */}
          <mesh>
            <cylinderGeometry args={[0.03, 0.025, 0.18, 10]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.5} />
          </mesh>
          {/* Husk leaves */}
          {[0, 1, 2].map((h) => (
            <mesh 
              key={h} 
              position={[0, 0.09 - h * 0.05, 0]} 
              rotation={[h * 0.3, 0, -0.3]}
            >
              <coneGeometry args={[0.025, 0.08, 8]} />
              <meshStandardMaterial color="#16a34a" />
            </mesh>
          ))}
          {/* Silk */}
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Farm Field Manager
function FarmField() {
  const [plants, setPlants] = useState<Array<{
    id: number;
    position: [number, number, number];
    type: 'wheat' | 'corn';
    windOffset: number;
  }>>([]);

  useEffect(() => {
    const temp = [];
    for (let i = 0; i < 120; i++) {
      const x = (Math.random() - 0.5) * 70;
      const z = (Math.random() - 0.5) * 70;
      const type: 'wheat' | 'corn' = Math.random() > 0.4 ? 'wheat' : 'corn';
      const windOffset = Math.random() * Math.PI * 2;
      
      temp.push({
        id: i,
        position: [x, 0, z] as [number, number, number],
        type,
        windOffset,
      });
    }
    setPlants(temp);
  }, []);

  return (
    <>
      {plants.map((plant) => (
        plant.type === 'wheat' ? (
          <WheatPlant
            key={plant.id}
            position={plant.position}
            windOffset={plant.windOffset}
          />
        ) : (
          <CornStalk
            key={plant.id}
            position={plant.position}
            windOffset={plant.windOffset}
          />
        )
      ))}
    </>
  );
}

export default function FarmWindBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Beautiful sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-500 via-sky-300 to-green-200" />
      
      {/* Radiant sun */}
      <div className="absolute top-12 right-16 w-40 h-40 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full blur-2xl opacity-60" />
      
      {/* Fluffy clouds */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${10 + i * 18}%`,
            top: `${5 + (i % 2) * 8}%`,
            width: `${120 + i * 20}px`,
            height: '60px',
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
            filter: 'blur(8px)',
            animation: `driftCloud ${15 + i * 3}s ease-in-out infinite`,
            animationDelay: `${i * 2}s`,
          }}
        />
      ))}
      
      {/* 3D Canvas with realistic farm */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 4, 18], fov: 45 }}>
          {/* Professional lighting setup */}
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[30, 20, 15]} 
            intensity={1.5}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <hemisphereLight 
            args={['#fef3c7', '#064e3b', 0.4]} 
          />
          
          {/* Realistic farm plants */}
          <FarmField />
          
          {/* Rich soil ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial 
              color="#064e3b" 
              roughness={0.95}
              metalness={0.05}
            />
          </mesh>
          
          {/* Distant tree line */}
          {[...Array(20)].map((_, i) => (
            <group 
              key={i} 
              position={[(i - 10) * 3.5, 0, -40 + Math.random() * 5]}
            >
              {/* Tree trunk */}
              <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
                <meshStandardMaterial color="#5D4037" roughness={0.9} />
              </mesh>
              {/* Tree foliage */}
              <mesh position={[0, 4, 0]}>
                <coneGeometry args={[2.5, 6, 8]} />
                <meshStandardMaterial color="#065f46" roughness={0.8} />
              </mesh>
              <mesh position={[0, 5.5, 0]}>
                <coneGeometry args={[2, 5, 8]} />
                <meshStandardMaterial color="#047857" roughness={0.8} />
              </mesh>
            </group>
          ))}
          
          {/* Rolling hills in far distance */}
          {[...Array(8)].map((_, i) => (
            <mesh
              key={i}
              position={[(i - 4) * 15, -2, -60]}
              rotation={[0.1, 0, 0]}
            >
              <sphereGeometry args={[12, 16, 16]} />
              <meshStandardMaterial color="#065f46" roughness={1} />
            </mesh>
          ))}
        </Canvas>
      </div>
      
      {/* Atmospheric foreground */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-green-950/60 via-green-900/30 to-transparent" />
      
      {/* CSS Animations */}
      <style>{`
        @keyframes driftCloud {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(30px);
          }
        }
      `}</style>
    </div>
  );
}
