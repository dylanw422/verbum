"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MagicalTransitionProps {
  readingMode: boolean;
}

function ParticleBurst({ readingMode }: { readingMode: boolean }) {
  const count = 4000; // Increased density
  const mesh = useRef<THREE.Points>(null);
  const prevMode = useRef(readingMode);
  
  // Particles state
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 1/3); 
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      temp.push({ 
        baseX: x, baseY: y, baseZ: z,
        mx: 0, my: 0, mz: 0, 
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        vz: (Math.random() - 0.5) * 0.02,
        speed: 0.5 + Math.random() * 1.5,
        active: false,
        life: 0,
        phase: Math.random() * Math.PI * 2 
      });
    }
    return temp;
  }, []);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const colors = useMemo(() => new Float32Array(count * 3), [count]);
  const sizes = useMemo(() => new Float32Array(count), [count]);

  useEffect(() => {
    if (readingMode !== prevMode.current) {
      particles.forEach(p => {
        p.active = true;
        p.life = 1.0;
        if (readingMode) {
          if (!prevMode.current) {
             p.mx = 0; p.my = 0; p.mz = 0;
          }
        }
      });
      prevMode.current = readingMode;
    }
  }, [readingMode, particles]);

  useFrame((state, delta) => {
    if (!mesh.current) return;

    const time = state.clock.elapsedTime;
    let activeCount = 0;

    particles.forEach((p, i) => {
      const driftX = Math.sin(time * 0.5 + p.phase) * 0.02;
      const driftY = Math.cos(time * 0.3 + p.phase) * 0.02;
      const driftZ = Math.sin(time * 0.4 + p.phase) * 0.02;

      if (!p.active) {
        positions[i * 3] = 9999;
        return;
      }
      
      activeCount++;
      p.life -= delta * 0.8;

      if (p.life <= 0) {
        p.active = false;
        return;
      }

      if (readingMode) {
        // EXPLODE OUT
        const targetX = p.baseX * 12; // Reduced spread
        const targetY = p.baseY * 12;
        const targetZ = p.baseZ * 4;

        const ease = delta * (2.0 * p.speed); 
        p.mx += (targetX - p.mx) * ease + driftX;
        p.my += (targetY - p.my) * ease + driftY;
        p.mz += (targetZ - p.mz) * ease + driftZ;

      } else {
        // IMPLODE IN + SPIRAL
        const pull = delta * (5.0 * p.speed);
        
        // Spiral rotation force (around Z axis)
        const rotSpeed = 2.0 * delta;
        const oldX = p.mx;
        const oldY = p.my;
        const newX = oldX * Math.cos(rotSpeed) - oldY * Math.sin(rotSpeed);
        const newY = oldX * Math.sin(rotSpeed) + oldY * Math.cos(rotSpeed);
        
        // Apply spiral + pull
        p.mx = newX + (0 - newX) * pull + driftX * 0.1;
        p.my = newY + (0 - newY) * pull + driftY * 0.1;
        p.mz += (0 - p.mz) * pull + driftZ * 0.1;
      }

      positions[i * 3] = p.mx;
      positions[i * 3 + 1] = p.my;
      positions[i * 3 + 2] = p.mz;

      const flicker = 0.5 + 0.5 * Math.sin(time * 8 + p.phase); // Faster flicker
      const alpha = p.life * flicker; 

      const mix = (Math.sin(p.phase) + 1) / 2;
      colors[i * 3]     = 1.0 * mix + 1.0 * (1 - mix); // Boost red channel
      colors[i * 3 + 1] = 0.2 * mix + 0.8 * (1 - mix); 
      colors[i * 3 + 2] = 0.4 * mix + 0.1 * (1 - mix); 

      sizes[i] = (0.5 + 0.5 * Math.sin(time * 5 + p.phase)) * Math.random();
      sizes[i] *= alpha; 
    });

    mesh.current.geometry.attributes.position.needsUpdate = true;
    mesh.current.geometry.attributes.color.needsUpdate = true;
    mesh.current.geometry.attributes.size.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        vertexColors
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
}

export function MagicalTransition({ readingMode }: MagicalTransitionProps) {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <ParticleBurst readingMode={readingMode} />
      </Canvas>
    </div>
  );
}
