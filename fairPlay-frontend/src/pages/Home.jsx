import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Audience from "../components/Audience";
import HowItWorks from "../components/HowItWorks";
import { motion, useScroll, useSpring } from "framer-motion";

const Stats = () => {
  const stats = [
    { label: "Submissions Secured", value: "12,000+" },
    { label: "Accuracy in Integrity", value: "99.9%" },
    { label: "Partner Institutions", value: "50+" },
    { label: "Fraud Attempts Blocked", value: "1,500+" },
  ];

  return (
    <section className="py-20 border-y border-border/50 bg-card/30 backdrop-blur-sm relative z-10">
      <div className="container px-6 mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5, type: "spring", stiffness: 100 }}
              className="text-center group"
            >
              <motion.div 
                whileHover={{ scale: 1.1, color: "var(--primary)" }}
                className="text-3xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight transition-colors duration-300"
              >
                {stat.value}
              </motion.div>
              <div className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors duration-300">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="bg-background text-foreground selection:bg-primary/30 selection:text-white">
      {/* Global Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left z-[100]"
        style={{ scaleX }}
      />
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Audience />

      {/* Simple Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>&copy; {new Date().getFullYear()} fairPlay. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
