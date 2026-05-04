import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdvancedBackground from '../components/AdvancedBackground';

const SQLDay4 = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen w-screen overflow-hidden relative bg-[#080b14]"
    >
      <AdvancedBackground />
      
      {/* Floating Back Button */}
      <div className="absolute top-4 left-6 z-50">
        <Link 
          to="/placement-prep/sql" 
          className="group flex items-center gap-2 text-white transition-all text-sm font-bold bg-primary hover:bg-primary/90 px-6 py-2.5 rounded-full shadow-lg shadow-primary/40 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Hub
        </Link>
      </div>

      <div className="w-full h-full relative z-10">
        <iframe
          src="/content/sql-day-4.html"
          title="SQL Joins Day 4"
          className="w-full h-full border-none"
        />
      </div>
    </motion.div>
  );
};

export default SQLDay4;
