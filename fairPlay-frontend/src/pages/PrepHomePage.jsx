import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, TrendingUp, Star, Cpu, Globe, ShieldCheck, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

import AdvancedBackground from '../components/AdvancedBackground';

const PrepHomePage = () => {
  const categories = [
    { name: 'SQL Mastery', count: 12, icon: <BookOpen />, color: 'from-blue-500 to-cyan-400', path: '/placement-prep/sql' },
    { name: 'Operating Systems', count: 18, icon: <Cpu />, color: 'from-red-500 to-orange-400', path: '#' },
    { name: 'Computer Networks', count: 22, icon: <Globe />, color: 'from-blue-600 to-indigo-400', path: '#' },
    { name: 'Data Structures', count: 24, icon: <Hash />, color: 'from-purple-500 to-pink-500', path: '#' },
    { name: 'Industry Ethics', count: 6, icon: <ShieldCheck />, color: 'from-emerald-600 to-teal-400', path: '#' },
    { name: 'Combinatorics', count: 10, icon: <TrendingUp />, color: 'from-pink-600 to-rose-400', path: '#' },
  ];


  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">

      
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <AdvancedBackground />
      </div>

      <main className="relative z-10 pt-32 pb-20 px-6 container mx-auto max-w-7xl">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
              <Star className="w-4 h-4 fill-primary" />
              <span>Prep Mode Active</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Master Your Exams <br />
              <span className="text-gradient">Share Your Knowledge</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              The ultimate destination for technical exam preparation. Access premium SQL notes, share your own summaries, and practice in real-time.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="relative flex-1 max-w-md min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search topics, notes, or creators..."
                  className="w-full bg-surface border border-border rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-xl"
                />
              </div>
              <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Search
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative"
          >
            <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Prep Categories</h3>
                <TrendingUp className="text-primary w-6 h-6" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat, i) => (
                  <Link to={cat.path} key={i}>
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="p-6 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/50 transition-all cursor-pointer group/item"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} mb-4 flex items-center justify-center text-white`}>
                        {cat.icon}
                      </div>
                      <h4 className="font-bold mb-1 group-hover/item:text-primary transition-colors">{cat.name}</h4>
                      <p className="text-xs text-muted-foreground">{cat.count} modules</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

      </main>
    </div>
  );
};

export default PrepHomePage;
