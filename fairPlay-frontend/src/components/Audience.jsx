import React from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap } from 'lucide-react';

const Audience = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] dark:mix-blend-screen mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] dark:mix-blend-screen mix-blend-multiply" />

      <div className="container relative z-10 px-6 mx-auto max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card rounded-[3rem] p-8 md:p-12 lg:p-16"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-foreground">Who is it for?</h2>
            <p className="text-muted-foreground text-lg">Designed to empower both sides of the classroom.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 relative">
            {/* Divider line for large screens */}
            <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-border to-transparent -translate-x-1/2" />

            {/* Educators */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col relative group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">For Educators</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg flex-1">
                Grade the skills, not the prompt. Regain confidence in your classroom assessments. Create section-specific exams, monitor your students in real time, and securely review their fully rendered UI components with <strong className="text-foreground">zero backend setup.</strong>
              </p>
            </motion.div>

            {/* Students */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col relative group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                  <Users className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">For Students</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg flex-1">
                Prove what you know. Code in a smooth, crash-free environment that looks and feels like the tools you already use. Focus on building great components on a completely <strong className="text-foreground">level playing field.</strong>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Audience;
