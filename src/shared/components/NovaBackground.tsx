import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

const PARTICLE_COLORS = [
  'rgba(168, 85, 247, 0.6)',
  'rgba(59, 130, 246, 0.5)',
  'rgba(6, 182, 212, 0.5)',
  'rgba(168, 85, 247, 0.3)',
  'rgba(255, 255, 255, 0.3)',
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 15,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  }));
}

interface NovaBackgroundProps {
  showParticles?: boolean;
}

export const NovaBackground: React.FC<NovaBackgroundProps> = ({
  showParticles = true,
}) => {
  const particles = useRef<Particle[]>(generateParticles(20));

  return (
    <div className="nova-background" aria-hidden="true">
      {/* Star Layers */}
      <div className="nova-stars" />
      <div className="nova-stars-2" />

      {/* Grid overlay */}
      <div className="nova-grid" />

      {/* Moon */}
      <motion.div
        className="nova-moon"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />

      {/* Gradient Orbs */}
      <motion.div
        style={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        style={{
          position: 'absolute',
          bottom: '25%',
          right: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      <motion.div
        style={{
          position: 'absolute',
          top: '60%',
          left: '40%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />

      {/* Pixel City Silhouette */}
      <div className="nova-city" />

      {/* Floating Particles */}
      {showParticles &&
        particles.current.map((p) => (
          <div
            key={p.id}
            className="nova-particle"
            style={{
              left: `${p.x}%`,
              bottom: '-20px',
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        ))}

      {/* Scanline effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 4px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
    </div>
  );
};
