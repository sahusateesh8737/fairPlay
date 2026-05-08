import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, Database, Layers, Terminal, MonitorPlay, ChevronRight, Home } from 'lucide-react';
import AdvancedBackground from './AdvancedBackground';

const SQLModuleLayout = ({ children, currentDay }) => {
  const location = useLocation();

  const menuItems = [
    { id: 1, title: 'Day 1: Basics', path: '/placement-prep/sql/day-1', icon: <Database className="w-4 h-4" /> },
    { id: 2, title: 'Day 2: Where Clause', path: '/placement-prep/sql/day-2', icon: <BookOpen className="w-4 h-4" /> },
    { id: 3, title: 'Day 3: Aggregates', path: '/placement-prep/sql/day-3', icon: <Database className="w-4 h-4" /> },
    { id: 4, title: 'Day 4: Joins', path: '/placement-prep/sql/day-4', icon: <Layers className="w-4 h-4" /> },
    { id: 5, title: 'Day 5: Subqueries', path: '/placement-prep/sql/day-5', icon: <Terminal className="w-4 h-4" /> },
    { id: 6, title: 'Day 6: Window Fn', path: '/placement-prep/sql/day-6', icon: <MonitorPlay className="w-4 h-4" /> },
    { id: 7, title: 'Day 7: CTEs', path: '/placement-prep/sql/day-7', icon: <Layers className="w-4 h-4" /> },
    { id: 8, title: 'Day 8: Interview', path: '/placement-prep/sql/day-8', icon: <Terminal className="w-4 h-4" /> },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#080b14] relative">
      <AdvancedBackground />
      
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="w-72 h-full bg-[#0c101d]/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-50 relative"
      >
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3 mb-8 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Home className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">FairPlay Prep</h2>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">SQL Masterclass</p>
            </div>
          </Link>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 ml-2">Curriculum</p>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.id} to={item.path} replace>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer mb-1 ${
                      isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${isActive ? 'text-white' : 'text-primary'}`}>
                        {item.icon}
                      </div>
                      <span className="text-sm font-bold">{item.title}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-auto p-6">
          <Link 
            to="/placement-prep/sql" 
            replace
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Hub
          </Link>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full relative z-10 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default SQLModuleLayout;
