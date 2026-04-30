import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Search } from 'lucide-react';

const steps = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-primary" />,
    title: 'Configure Secure Assessment',
    description: 'Teachers create React-based assignments, set time limits, and upload reference design mockups for pixel-perfect grading.',
  },
  {
    icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
    title: 'Students Code in the Sandbox',
    description: 'Students take the exam in a locked-down browser environment with real-time proctoring and live visual previews.',
  },
  {
    icon: <Search className="w-6 h-6 text-orange-500" />,
    title: 'Review with Forensic Clarity',
    description: 'Teachers use time-lapse session replays and transparency overlays to grade the authentic skill of the student.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container relative z-10 px-6 mx-auto max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-foreground">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From creation to forensic review, FairPlay secures every step of the process.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-border/50 z-0">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
              className="h-full bg-primary/50"
            />
          </div>
          
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.3, duration: 0.6, type: "spring", stiffness: 100 }}
              whileHover={{ y: -10 }}
              className="relative z-10 flex flex-col items-center text-center group cursor-default"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-24 h-24 rounded-full bg-card border-4 border-background flex items-center justify-center mb-6 shadow-xl ring-2 ring-border group-hover:ring-primary/50 transition-all duration-300 relative"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                >
                  {step.icon}
                </motion.div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-lg group-hover:scale-110 transition-transform">
                  {index + 1}
                </div>
              </motion.div>
              <h3 className="text-xl font-bold text-foreground mb-4">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
