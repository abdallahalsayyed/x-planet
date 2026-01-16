import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Stars, Text, Points, Float, Html, ScrollControls, useScroll } from '@react-three/drei';
import * as THREE from 'three';

// استيراد الصورة بالاسم الفعلي الموجود في جهازك
import planetTexture from './planet_surface.jpg.png'; 

function Rocks() {
  const rocks = useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
      position: [(Math.random() - 0.5) * 80, -4.5, (Math.random() - 0.5) * 150],
      scale: Math.random() * 1.5 + 0.5,
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0]
    }));
  }, []);

  return (
    <group>
      {rocks.map((props, i) => (
        <mesh key={i} position={props.position} scale={props.scale} rotation={props.rotation}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#151515" roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function MainPlanet() {
  // تحميل الخامة من الصورة المستوردة
  const texture = useLoader(THREE.TextureLoader, planetTexture);
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh position={[0, 10, -15]}>
        <sphereGeometry args={[7, 64, 64]} />
        <meshStandardMaterial 
          map={texture} 
          emissiveMap={texture} 
          emissive="#ffffff" 
          emissiveIntensity={0.15} 
        />
      </mesh>
    </Float>
  );
}

function Waterfall() {
  const ref = useRef();
  const count = 10000;
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 15;
      p[i * 3 + 1] = Math.random() * 50;
      p[i * 3 + 2] = -60; 
    }
    return p;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const p = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      p[i * 3 + 1] -= 0.6;
      if (p[i * 3 + 1] < -10) p[i * 3 + 1] = 40;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={points}>
      <pointsMaterial transparent color="#00ffff" size={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
    </Points>
  );
}

function JourneyManager({ setInWater }) {
  const scroll = useScroll();
  const { camera, scene } = useThree();

  useFrame((state) => {
    const r = scroll.range(0, 1);
    // تحريك الكاميرا للأمام باتجاه الشلال
    camera.position.z = THREE.MathUtils.lerp(35, -85, r);
    camera.position.y = 8 + Math.sin(state.clock.elapsedTime * 2) * 0.1;

    // تأثير دخول مياه الشلال
    if (camera.position.z < -55) {
      setInWater(true);
      scene.fog.far = 20;
      scene.fog.color.set('#002222');
    } else {
      setInWater(false);
      scene.fog.far = 100;
      scene.fog.color.set('black');
    }
  });
  return null;
}

export default function App() {
  const [inWater, setInWater] = useState(false);

  return (
    <div style={{ height: '100vh', width: '100vw', background: 'black', overflow: 'hidden' }}>
      
      {/* الواجهة الثابتة */}
      <div style={{ position: 'fixed', top: '30px', left: '40px', zIndex: 10, color: 'white', pointerEvents: 'none' }}>
        <h1 style={{ margin: 0, letterSpacing: '10px', fontSize: '2.5rem', color: '#00ffff' }}>LOWTTER</h1>
        <p style={{ opacity: 0.6 }}>SCROLL TO REACH THE CORE</p>
      </div>

      {inWater && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100, textAlign: 'center' }}>
          <h1 style={{ color: '#00ffff', fontSize: '3.5rem', textShadow: '0 0 20px #00ffff', animation: 'fade 1s infinite alternate' }}>WELCOME TO Lowtter</h1>
        </div>
      )}

      <Canvas camera={{ position: [0, 8, 35], fov: 45 }}>
        <fog attach="fog" args={['black', 10, 120]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 20, 10]} intensity={2} color="#00ffff" />
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />

        <Suspense fallback={<Html center style={{color:'white'}}>Entering LOWTTER-Planet...</Html>}>
          <ScrollControls pages={6} damping={0.2}>
            <JourneyManager setInWater={setInWater} />
            <mesh rotation-x={-Math.PI / 2} position={[0, -5, 0]}>
              <planeGeometry args={[200, 400]} />
              <meshStandardMaterial color="#050505" />
            </mesh>
            <Rocks />
            <MainPlanet />
            <Waterfall />
            
            <Float position={[-8, 6, 10]}><Text fontSize={0.7} color="#00ffff">Step 1: Discover</Text></Float>
            <Float position={[8, 5, -15]}><Text fontSize={0.7} color="gold">Step 2: Win-Win Engine</Text></Float>
          </ScrollControls>
        </Suspense>
      </Canvas>

      <style>{`
        @keyframes fade { from { opacity: 0.4; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}