import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Share2, Search, TrendingUp, Clock, Star, Download, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import AdvancedBackground from '../components/AdvancedBackground';

const PrepHomePage = () => {
  const categories = [
    { name: 'SQL Mastery', count: 12, color: 'from-blue-500 to-cyan-400', path: '/placement-prep/sql' },
    { name: 'Data Structures', count: 24, color: 'from-purple-500 to-pink-500', path: '#' },
    { name: 'System Design', count: 8, color: 'from-amber-500 to-orange-500', path: '#' },
    { name: 'Python Basics', count: 15, color: 'from-emerald-500 to-teal-500', path: '#' },
  ];

  const recentNotes = [
    { title: 'Window Functions Deep Dive', author: 'Sateesh Sahu', date: '2 hours ago', likes: 124, category: 'SQL' },
    { title: 'AVL Trees Visual Guide', author: 'Rahul Verma', date: '5 hours ago', likes: 89, category: 'DSA' },
    { title: 'Redis Caching Patterns', author: 'Priya Das', date: 'Yesterday', likes: 215, category: 'Backend' },
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
                        <BookOpen className="w-6 h-6" />
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

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl font-bold">Trending Notes</h2>
              <button className="text-primary font-semibold flex items-center gap-1 hover:underline">
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {recentNotes.map((note, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 rounded-3xl hover:bg-muted/30 transition-all cursor-pointer group border-l-4 border-l-transparent hover:border-l-primary"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 inline-block">
                      {note.category}
                    </span>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{note.title}</h3>
                  </div>
                  <button className="p-2 rounded-xl hover:bg-surface transition-colors">
                    <Download className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {note.author[0]}
                      </div>
                      <span>{note.author}</span>
                    </div>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {note.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Star className="w-4 h-4 fill-primary" /> {note.likes}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="glass-card p-8 rounded-3xl bg-primary/5 border-primary/20">
              <Share2 className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-white">Share Your Notes</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Help your fellow students by sharing your study materials. Top contributors get featured on the global leaderboard.
              </p>
              <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/30">
                Upload Document
              </button>
            </div>

            <div className="glass-card p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                Upcoming Exams
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex flex-col items-center justify-center text-orange-500">
                    <span className="text-xs font-bold leading-none">MAY</span>
                    <span className="text-lg font-bold leading-none mt-1">15</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Database Management</h4>
                    <p className="text-xs text-muted-foreground">Final Semester Exam</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center text-blue-500">
                    <span className="text-xs font-bold leading-none">JUN</span>
                    <span className="text-lg font-bold leading-none mt-1">02</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Network Security</h4>
                    <p className="text-xs text-muted-foreground">Unit Test II</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrepHomePage;
