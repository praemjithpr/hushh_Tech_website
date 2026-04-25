/**
 * kai - Financial Intelligence Agent
 * KaiAvatar - Professional Multi-Ring Orbital System with Particle Field
 * 
 * HIGH-PERFORMANCE: Uses requestAnimationFrame + direct DOM manipulation
 * to avoid React re-renders on every audio frame.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AgentSentiment } from '../types';

interface KaiAvatarProps {
  volumeRef: React.MutableRefObject<number>;
  audioDataRef: React.MutableRefObject<Uint8Array>;
  active: boolean;
  sentiment: AgentSentiment;
}

// --- Color palettes per sentiment ---
const PALETTES: Record<AgentSentiment, { primary: string; secondary: string; glow: string; particleColor: string }> = {
  [AgentSentiment.NEUTRAL]: {
    primary: '#6366f1', secondary: '#4338ca', glow: 'rgba(99,102,241,0.4)',
    particleColor: 'rgba(129,140,248,0.6)',
  },
  [AgentSentiment.BULLISH]: {
    primary: '#22c55e', secondary: '#15803d', glow: 'rgba(34,197,94,0.4)',
    particleColor: 'rgba(74,222,128,0.6)',
  },
  [AgentSentiment.BEARISH]: {
    primary: '#ef4444', secondary: '#b91c1c', glow: 'rgba(239,68,68,0.4)',
    particleColor: 'rgba(248,113,113,0.6)',
  },
  [AgentSentiment.THINKING]: {
    primary: '#a855f7', secondary: '#7c3aed', glow: 'rgba(168,85,247,0.4)',
    particleColor: 'rgba(192,132,252,0.6)',
  },
};

// --- Particle system ---
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  angle: number;
  radius: number;
  speed: number;
}

const PARTICLE_COUNT = 60;

const createParticle = (cx: number, cy: number): Particle => {
  const angle = Math.random() * Math.PI * 2;
  const radius = 80 + Math.random() * 80;
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
    vx: 0,
    vy: 0,
    size: 1 + Math.random() * 2,
    alpha: 0.1 + Math.random() * 0.5,
    angle,
    radius,
    speed: 0.002 + Math.random() * 0.004,
  };
};

const KaiAvatar: React.FC<KaiAvatarProps> = ({ volumeRef, audioDataRef, active, sentiment }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const ring1Ref = useRef<SVGSVGElement>(null);
  const ring2Ref = useRef<SVGSVGElement>(null);
  const ring3Ref = useRef<SVGSVGElement>(null);
  const innerPulseRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const rotationRef = useRef({ r1: 0, r2: 0, r3: 0 });

  const palette = PALETTES[sentiment];

  // Initialize particles
  useEffect(() => {
    const cx = 200;
    const cy = 200;
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => createParticle(cx, cy));
  }, []);

  // High-performance animation loop
  useEffect(() => {
    let animFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.016;
      const vol = volumeRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      // --- Core orb scaling ---
      if (coreRef.current) {
        const breathe = active ? Math.sin(time * 1.5) * 0.03 : Math.sin(time * 0.8) * 0.015;
        const volumeScale = active ? vol * 0.35 : 0;
        const scale = 1 + breathe + volumeScale;
        coreRef.current.style.transform = `scale(${scale})`;
      }

      // --- Glow intensity ---
      if (glowRef.current) {
        const glowIntensity = active ? 0.3 + vol * 0.5 : 0.15;
        const glowSize = active ? 80 + vol * 40 : 60;
        glowRef.current.style.opacity = `${glowIntensity}`;
        glowRef.current.style.filter = `blur(${glowSize}px)`;
      }

      // --- Inner pulse ---
      if (innerPulseRef.current) {
        const pulseOpacity = active ? 0.15 + vol * 0.4 : 0.1;
        innerPulseRef.current.style.opacity = `${pulseOpacity}`;
      }

      // --- Orbital rings ---
      const ringSpeed = active ? 1 + vol * 3 : 0.3;
      rotationRef.current.r1 += 0.3 * ringSpeed;
      rotationRef.current.r2 -= 0.2 * ringSpeed;
      rotationRef.current.r3 += 0.15 * ringSpeed;

      if (ring1Ref.current) {
        const strokeW = active ? 1 + vol * 2 : 0.8;
        ring1Ref.current.style.transform = `rotate(${rotationRef.current.r1}deg)`;
        ring1Ref.current.style.opacity = `${active ? 0.5 + vol * 0.3 : 0.2}`;
        const circle = ring1Ref.current.querySelector('circle');
        if (circle) circle.setAttribute('stroke-width', `${strokeW}`);
      }
      if (ring2Ref.current) {
        const strokeW = active ? 0.8 + vol * 1.5 : 0.5;
        ring2Ref.current.style.transform = `rotate(${rotationRef.current.r2}deg)`;
        ring2Ref.current.style.opacity = `${active ? 0.4 + vol * 0.25 : 0.15}`;
        const circle = ring2Ref.current.querySelector('circle');
        if (circle) circle.setAttribute('stroke-width', `${strokeW}`);
      }
      if (ring3Ref.current) {
        const strokeW = active ? 0.5 + vol * 1 : 0.3;
        ring3Ref.current.style.transform = `rotate(${rotationRef.current.r3}deg)`;
        ring3Ref.current.style.opacity = `${active ? 0.3 + vol * 0.2 : 0.1}`;
        const circle = ring3Ref.current.querySelector('circle');
        if (circle) circle.setAttribute('stroke-width', `${strokeW}`);
      }

      // --- Canvas particle field ---
      if (canvas && ctx) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesRef.current.forEach(p => {
          // Orbital motion
          p.angle += p.speed * (1 + vol * 4);
          const radiusShift = active ? Math.sin(time * 2 + p.angle * 3) * (10 + vol * 20) : Math.sin(time + p.angle) * 5;
          const r = p.radius + radiusShift;
          p.x = cx + Math.cos(p.angle) * r;
          p.y = cy + Math.sin(p.angle) * r;

          // Draw particle
          const alpha = p.alpha * (active ? 0.5 + vol * 0.8 : 0.3);
          const size = p.size * (active ? 1 + vol * 1.5 : 0.8);
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fillStyle = palette.particleColor.replace(/[\d.]+\)$/, `${alpha})`);
          ctx.fill();

          // Subtle connecting lines to nearby particles
          if (active && vol > 0.2) {
            particlesRef.current.forEach(p2 => {
              const dx = p.x - p2.x;
              const dy = p.y - p2.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 40 && dist > 0) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = palette.particleColor.replace(/[\d.]+\)$/, `${0.08 * vol})`);
                ctx.lineWidth = 0.5;
                ctx.stroke();
              }
            });
          }
        });
      }

      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [active, palette]);

  return (
    <div className="relative w-80 h-80 md:w-[420px] md:h-[420px] flex items-center justify-center">

      {/* LAYER 0: Canvas particle field */}
      <canvas
        ref={canvasRef}
        width={420}
        height={420}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* LAYER 1: Ambient glow */}
      <div
        ref={glowRef}
        className="absolute rounded-full transition-colors duration-1000"
        style={{
          width: '60%',
          height: '60%',
          background: `radial-gradient(circle, ${palette.glow} 0%, transparent 70%)`,
          zIndex: 0,
          opacity: 0.2,
          filter: 'blur(60px)',
        }}
      />

      {/* LAYER 2: Orbital Ring 3 (outermost) */}
      <svg
        ref={ring3Ref}
        className="absolute w-full h-full transition-all duration-75"
        style={{ zIndex: 2, opacity: 0.1 }}
        viewBox="0 0 400 400"
      >
        <circle
          cx="200"
          cy="200"
          r="185"
          fill="none"
          stroke={palette.primary}
          strokeWidth="0.3"
          strokeDasharray="8 16"
          strokeLinecap="round"
        />
      </svg>

      {/* LAYER 3: Orbital Ring 2 */}
      <svg
        ref={ring2Ref}
        className="absolute transition-all duration-75"
        style={{ width: '82%', height: '82%', zIndex: 3, opacity: 0.15 }}
        viewBox="0 0 400 400"
      >
        <circle
          cx="200"
          cy="200"
          r="185"
          fill="none"
          stroke={palette.secondary}
          strokeWidth="0.5"
          strokeDasharray="4 12"
          strokeLinecap="round"
        />
      </svg>

      {/* LAYER 4: Orbital Ring 1 (innermost) */}
      <svg
        ref={ring1Ref}
        className="absolute transition-all duration-75"
        style={{ width: '68%', height: '68%', zIndex: 4, opacity: 0.2 }}
        viewBox="0 0 400 400"
      >
        <circle
          cx="200"
          cy="200"
          r="185"
          fill="none"
          stroke={palette.primary}
          strokeWidth="0.8"
          strokeDasharray="12 8"
          strokeLinecap="round"
        />
      </svg>

      {/* LAYER 5: Core orb */}
      <div
        ref={coreRef}
        className="relative rounded-full overflow-hidden transition-all duration-75 ease-out"
        style={{
          width: '45%',
          height: '45%',
          background: `linear-gradient(145deg, ${palette.primary} 0%, ${palette.secondary} 60%, #1a1a2e 100%)`,
          boxShadow: `
            0 0 40px ${palette.glow},
            0 0 80px ${palette.glow.replace('0.4', '0.15')},
            inset 0 -20px 40px rgba(0,0,0,0.4),
            inset 0 10px 20px rgba(255,255,255,0.1)
          `,
          zIndex: 5,
        }}
      >
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />

        {/* Inner spotlight */}
        <div
          ref={innerPulseRef}
          className="absolute rounded-full bg-white/30 blur-xl transition-opacity duration-100"
          style={{ top: '15%', left: '20%', width: '50%', height: '50%' }}
        />

        {/* "K" Monogram */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-white font-bold tracking-[-0.05em] select-none"
            style={{
              fontSize: 'clamp(1.2rem, 3.5vw, 2.2rem)',
              textShadow: `0 0 20px ${palette.glow}`,
              fontFamily: "'Outfit', sans-serif",
            }}
            animate={active ? {
              opacity: [0.8, 1, 0.8],
              textShadow: [
                `0 0 15px ${palette.glow}`,
                `0 0 35px ${palette.glow}`,
                `0 0 15px ${palette.glow}`,
              ],
            } : {
              opacity: 0.7,
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            KAI
          </motion.span>
        </div>
      </div>

      {/* LAYER 6: Outer ring pulse (only when actively speaking) */}
      {active && (
        <motion.div
          className="absolute rounded-full border"
          style={{
            width: '55%',
            height: '55%',
            borderColor: palette.primary + '40',
            zIndex: 4,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
};

export default KaiAvatar;
