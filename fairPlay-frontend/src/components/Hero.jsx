import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Code2, PlayCircle, Terminal, Cpu, Database, Braces, Atom } from 'lucide-react';
import FlowAnimation from './FlowAnimation';

const Hero = () => {
  const [isFlowOpen, setIsFlowOpen] = useState(false);
  const navigate = useNavigate();

  const floatingElements = [
    { Icon: Code2, size: 40, top: '15%', left: '10%', delay: 0, color: 'text-blue-500/80' },
    { Icon: Terminal, size: 32, top: '25%', right: '15%', delay: 1, color: 'text-purple-500/80' },
    { Icon: Cpu, size: 48, bottom: '20%', left: '15%', delay: 2, color: 'text-green-500/80' },
    { Icon: Database, size: 36, bottom: '30%', right: '10%', delay: 1.5, color: 'text-orange-500/80' },
    { Icon: Braces, size: 56, top: '40%', left: '5%', delay: 0.5, color: 'text-pink-500/80' },
    // React Specific Elements
    { Icon: Atom, size: 52, top: '10%', right: '25%', delay: 0.2, color: 'text-cyan-400/80', animate: 'spin' },
    { Icon: Atom, size: 38, bottom: '15%', right: '35%', delay: 1.2, color: 'text-cyan-400/80', animate: 'spin' },
    { type: 'text', content: 'useState', top: '60%', left: '12%', size: 'text-[10px]', color: 'text-cyan-500/80' },
    { type: 'text', content: 'useEffect', top: '20%', left: '40%', size: 'text-[12px]', color: 'text-blue-400/80' },
    { type: 'text', content: '<Component />', bottom: '40%', right: '20%', size: 'text-[14px]', color: 'text-cyan-300/80' },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-32 pb-32">
      {/* 1. Premium Spotlight Effect (Static version) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] pointer-events-none z-0">
        <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[100%] h-[100%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.25)_0%,rgba(59,130,246,0.1)_40%,transparent_70%)] blur-[100px]" />
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[70%] h-[50%] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[40%] h-[30%] bg-blue-400/30 rounded-full blur-[80px]" />
      </div>

      {/* 2. Floating Coding & React Elements */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {floatingElements.map((el, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, opacity: 0 }}
            animate={{ 
              y: [0, -20, 0],
              opacity: 1,
              rotate: el.animate === 'spin' ? [0, 360] : [0, 10, -10, 0]
            }}
            transition={{ 
              duration: el.animate === 'spin' ? 10 + i : 5 + i, 
              repeat: Infinity, 
              delay: el.delay,
              ease: el.animate === 'spin' ? "linear" : "easeInOut"
            }}
            className={`absolute font-mono font-bold ${el.color} ${el.size || ''}`}
            style={{ 
              top: el.top, 
              left: el.left, 
              right: el.right, 
              bottom: el.bottom 
            }}
          >
            {el.type === 'text' ? (
              <span>{el.content}</span>
            ) : (
              <el.Icon size={el.size} strokeWidth={1} />
            )}
          </motion.div>
        ))}
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 dark:bg-grid-white/[0.02] bg-grid-black/[0.02]" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container relative z-20 px-6 mx-auto max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-muted border border-border text-sm font-medium text-primary shadow-sm"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>The New Standard in Technical Assessments</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-foreground"
        >
          Authentic Coding Assessments, <br className="hidden md:block" />
          <span className="text-gradient">Built for the AI Era.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed"
        >
          Evaluate true student potential with a secure, cloud-based React sandbox. We eliminate AI-assisted cheating, enforce campus-only access, and provide real-time monitoring to guarantee <strong className="text-foreground font-semibold">100% fair results.</strong>
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={() => navigate('/practice')}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-95 group"
          >
            <Code2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Get Started
          </button>
          <button 
            onClick={() => setIsFlowOpen(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-secondary border border-border text-foreground font-semibold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all active:scale-95"
          >
            <PlayCircle className="w-5 h-5" />
            See How It Works
          </button>
        </motion.div>
      </div>

      <FlowAnimation isOpen={isFlowOpen} onClose={() => setIsFlowOpen(false)} />
    </section>
  );
};

export default Hero;
