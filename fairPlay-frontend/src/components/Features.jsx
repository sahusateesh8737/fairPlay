import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, MonitorPlay, Layers, Zap } from 'lucide-react';
import AdvancedBackground from './AdvancedBackground';

const features = [
  {
    icon: <Wifi className="w-8 h-8 text-blue-400" />,
    title: 'Campus-Locked Security',
    description: 'Ensure integrity with dynamic IP-whitelisting. Assessments are only accessible when students are connected to the authorized college network.',
  },
  {
    icon: <MonitorPlay className="w-8 h-8 text-indigo-400" />,
    title: 'Post-Exam Forensic Playback',
    description: "Don't just see the code; watch it being built. Teachers can replay every keystroke and mouse movement to detect copy-paste patterns.",
  },
  {
    icon: <Layers className="w-8 h-8 text-purple-400" />,
    title: 'Pixel-Perfect Grading',
    description: "Our unique overlay engine allows teachers to toggle reference designs with adjustable transparency to grade frontend accuracy like a pro.",
  },
  {
    icon: <Zap className="w-8 h-8 text-yellow-400" />,
    title: 'Real-Time Proctoring',
    description: "Instant alerts for tab switching, DevTools opening, and screen-sharing violations. Our dashboard keeps teachers updated live.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const Features = () => {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      {/* 1. Advanced Background (Scanner, Mouse Spotlight, Particles, Binary, Grid) */}
      <div className="absolute inset-0 z-0">
        <AdvancedBackground />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none z-10" />
      <div className="container relative z-20 px-6 mx-auto max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-foreground">
            Built for <span className="text-gradient">Integrity</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Four powerful pillars designed to ensure 100% fair and authentic technical assessments.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-card p-8 rounded-3xl group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary/20">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
