import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Code2, PlayCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-32 pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 dark:bg-grid-white/[0.02] bg-grid-black/[0.02]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-50 dark:mix-blend-screen mix-blend-multiply" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container relative z-10 px-6 mx-auto max-w-6xl text-center">
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
          <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-95 group">
            <Code2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Get Started
          </button>
          <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-secondary border border-border text-foreground font-semibold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all active:scale-95">
            <PlayCircle className="w-5 h-5" />
            See How It Works
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
