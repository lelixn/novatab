import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

// ============================================
// Types
// ============================================
interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

// ============================================
// Constants
// ============================================
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

// ============================================
// Props
// ============================================
interface NovaBackgroundProps {
  showParticles?: boolean;
}

// ============================================
// NovaBackground Component
// ============================================
export const NovaBackground: React.FC<NovaBackgroundProps> = ({
  showParticles = true,
}) => {
  const particles = useRef<Particle[]>(generateParticles(24));
  const cursorGlowRef = useRef<HTMLDivElement>(null);
  const glowOrbRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // Cursor glow that follows mouse
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.left = `${e.clientX}px`;
        cursorGlowRef.current.style.top = `${e.clientY}px`;
      }
      // Subtle parallax on orb
      if (glowOrbRef.current) {
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        glowOrbRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      }
    });
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  return (
    <div className="nova-background" aria-hidden="true">
      {/* Star Layers */}
      <div className="nova-stars" />
      <div className="nova-stars-2" />

      {/* Aurora borealis */}
      <div className="nova-aurora" />

      {/* Grid overlay */}
      <div className="nova-grid" />

      {/* Noise texture */}
      <div className="nova-noise" />

      {/* Moon */}
      <motion.div
        className="nova-moon"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, ease: 'easeOut' }}
      />

      {/* Gradient Orbs - parallax */}
      <div
        ref={glowOrbRef}
        style={{
          position: 'absolute',
          top: '30%',
          left: '25%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          willChange: 'transform',
          transition: 'transform 0.4s ease-out',
        }}
      />

      <motion.div
        style={{
          position: 'absolute',
          bottom: '25%',
          right: '8%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      <motion.div
        style={{
          position: 'absolute',
          top: '55%',
          left: '55%',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />

      {/* Mountain silhouette */}
      <div className="nova-mountain" />

      {/* Pixel City Silhouette */}
      <div className="nova-city" />

      {/* Fog layer */}
      <div className="nova-fog" />

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

      {/* Cursor Glow */}
      <div
        ref={cursorGlowRef}
        style={{
          position: 'fixed',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          willChange: 'left, top',
          zIndex: 0,
          filter: 'blur(20px)',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Scanlines */}
      <div className="nova-scanlines" />
    </div>
  );
};
