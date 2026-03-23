import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Shield, GraduationCap, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case 'admin': return <Shield className="w-4 h-4 text-red-400" anchor="admin" />;
      case 'teacher': return <GraduationCap className="w-4 h-4 text-purple-400" anchor="teacher" />;
      default: return <User className="w-4 h-4 text-blue-400" anchor="student" />;
    }
  };

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-white/5 transition-all duration-300 group"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-600 p-[2px] shadow-lg group-hover:scale-105 transition-transform">
          <div className="w-full h-full rounded-[10px] bg-[#0a0a0c] flex items-center justify-center border-2 border-[#0a0a0c]">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-start mr-1">
          <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">{user.name}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">{user.role}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full w-72 bg-[#111115]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            {/* Header / Profile Info */}
            <div className="p-5 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                  {initials}
                </div>
                <div>
                  <h4 className="text-white font-semibold leading-none mb-1">{user.name}</h4>
                  <p className="text-gray-400 text-xs truncate w-40">{user.email}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/10">
                  {getRoleIcon()}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">{user.role}</span>
                </div>
                {user.section?.name && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-lg border border-primary/20">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{user.section.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button 
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all text-sm group"
                onClick={() => { /* Navigate to profile settings if implemented */ setIsOpen(false); }}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <User className="w-4 h-4 group-hover:text-primary transition-colors" />
                </div>
                Profile Settings
              </button>
            </div>

            {/* Logout Footer */}
            <div className="p-2 bg-red-500/5 border-t border-white/5">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all text-sm group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                  <LogOut className="w-4 h-4" />
                </div>
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
