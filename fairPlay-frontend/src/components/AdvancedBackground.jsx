import React, { useState, useEffect, useMemo } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const AdvancedBackground = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth mouse movement
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Generate random binary streams
  const binaryStreams = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      left: `${(i * 7) + 2}%`,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 5,
      opacity: 0.05 + Math.random() * 0.1,
      content: Array.from({ length: 20 }).map(() => (Math.random() > 0.5 ? '1' : '0')).join('\n')
    }));
  }, []);

  // Generate random particles
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 1,
      duration: 3 + Math.random() * 7,
      delay: Math.random() * 5
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* 1. Dynamic Mouse Spotlight */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full z-10"
        style={{
          left: smoothX,
          top: smoothY,
          x: '-50%',
          y: '-50%',
          background: 'radial-gradient(circle at center, rgba(59,130,246,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
      />

      {/* 2. Forensic Scanner Line */}
      <motion.div
        initial={{ top: '-10%' }}
        animate={{ top: '110%' }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent z-20"
      >
        <div className="absolute inset-0 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
      </motion.div>

      {/* 3. Binary Data Streams */}
      <div className="absolute inset-0 flex justify-around">
        {binaryStreams.map((stream, i) => (
          <motion.div
            key={i}
            initial={{ y: '-100%' }}
            animate={{ y: '100%' }}
            transition={{ duration: stream.duration, repeat: Infinity, ease: "linear", delay: stream.delay }}
            className="text-[10px] font-mono whitespace-pre leading-none tracking-tighter"
            style={{ 
              position: 'absolute',
              left: stream.left,
              opacity: stream.opacity,
              color: '#3b82f6'
            }}
          >
            {stream.content}
          </motion.div>
        ))}
      </div>

      {/* 4. Floating Particles (Code Dust) */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            y: [0, -40, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
          className="absolute bg-blue-400/20 rounded-sm"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size
          }}
        />
      ))}

      {/* 5. Digital Heartbeat Waveform (Bottom) */}
      <div className="absolute bottom-0 left-0 w-full h-32 opacity-20 overflow-hidden">
        <svg viewBox="0 0 1440 320" className="w-full h-full preserve-3d">
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,213.3C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160"
          />
        </svg>
      </div>

      {/* Background Grid (Base Layer) */}
      <div className="absolute inset-0 dark:bg-grid-white/[0.02] bg-grid-black/[0.02] z-0" />
    </div>
  );
};

export default AdvancedBackground;
