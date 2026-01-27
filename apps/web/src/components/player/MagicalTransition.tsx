"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MagicalTransitionProps {
  readingMode: boolean;
}

function ParticleBurst({ readingMode }: { readingMode: boolean }) {
  const count = 2000;
  const mesh = useRef<THREE.Points>(null);
  const prevMode = useRef(readingMode);
  
  // Particles state
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      const z = Math.random() * 2 - 1;
      
      // Normalize to sphere surface
      const len = Math.sqrt(x*x + y*y + z*z);
      const nx = x/len; 
      const ny = y/len; 
      const nz = z/len;

      temp.push({ 
        t, factor, speed, 
        mx: 0, my: 0, mz: 0, // current position
        vx: nx, vy: ny, vz: nz, // velocity direction
        active: false,
        life: 0
      });
    }
    return temp;
  }, []);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const colors = useMemo(() => new Float32Array(count * 3), [count]);
  const sizes = useMemo(() => new Float32Array(count), [count]);
  const opacities = useMemo(() => new Float32Array(count), [count]);

  // Trigger burst on mode change
  useEffect(() => {
    if (readingMode !== prevMode.current) {
      // Trigger burst
      particles.forEach(p => {
        p.active = true;
        p.life = 1.0;
        // If entering reading mode (Explode out)
        if (readingMode) {
          p.mx = 0; p.my = 0; p.mz = 0;
        } else {
           // If entering RSVP mode (Implode in - optional, or just same burst)
           // Let's make both "Explosions" for excitement, or implode for RSVP?
           // Let's do Explode for Reading (Magic Reveal)
           // And Implode for RSVP (Magic Focus)
           if (!readingMode) {
             // Start far away
             p.mx = p.vx * 15;
             p.my = p.vy * 15;
             p.mz = p.vz * 15;
           }
        }
      });
      prevMode.current = readingMode;
    }
  }, [readingMode, particles]);

  useFrame((state, delta) => {
    if (!mesh.current) return;

    let activeCount = 0;

    particles.forEach((p, i) => {
      if (!p.active) {
        // Hide
        positions[i * 3] = 9999;
        return;
      }
      
      activeCount++;
      p.life -= delta * 1.5; // Fade out speed

      if (p.life <= 0) {
        p.active = false;
        return;
      }

      if (readingMode) {
        // EXPLODE OUT
        // Move along velocity vector
        const moveSpeed = 15 * (1.0 - p.life) * (1.0 - p.life) + 2; // Accelerate?
        p.mx += p.vx * delta * (p.factor * 0.1);
      } else {
        // IMPLODE IN
        // Move towards 0,0,0
        // Lerp current pos to 0
        const lerpFactor = delta * 5;
        p.mx += (0 - p.mx) * lerpFactor;
        p.my += (0 - p.my) * lerpFactor;
        p.mz += (0 - p.mz) * lerpFactor;
      }

      // Update position buffer
      positions[i * 3] = p.mx;
      positions[i * 3 + 1] = p.my;
      positions[i * 3 + 2] = p.mz;

      // Color (Gold/Rose mix)
      const colorMix = Math.random();
      if (colorMix > 0.5) {
        // Rose-500: #f43f5e (approx 0.96, 0.25, 0.37)
        colors[i * 3] = 0.96;
        colors[i * 3 + 1] = 0.25;
        colors[i * 3 + 2] = 0.37;
      } else {
        // Amber-400: #fbbf24 (approx 0.98, 0.75, 0.14)
        colors[i * 3] = 0.98;
        colors[i * 3 + 1] = 0.75;
        colors[i * 3 + 2] = 0.14;
      }

      // Size varies by life
      sizes[i] = (Math.sin(p.life * Math.PI) * 2) * Math.random();
    });

    mesh.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    mesh.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    mesh.current.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
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
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
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
