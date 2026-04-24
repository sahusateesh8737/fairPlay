import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Audience from "../components/Audience";
import HowItWorks from "../components/HowItWorks";
import { motion } from "framer-motion";

const Stats = () => {
  const stats = [
    { label: "Submissions Secured", value: "12,000+" },
    { label: "Accuracy in Integrity", value: "99.9%" },
    { label: "Partner Institutions", value: "50+" },
    { label: "Fraud Attempts Blocked", value: "1,500+" },
  ];

  return (
    <section className="py-20 border-y border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="container px-6 mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight">{stat.value}</div>
              <div className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  return (
    <>
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
    </>
  );
};

export default Home;
