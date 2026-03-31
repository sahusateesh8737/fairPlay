import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Shield, GraduationCap, ChevronDown, CheckCircle2, Hash, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileSettingsModal from './ProfileSettingsModal';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
    setIsOpen(false);
    navigate('/auth');
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case 'admin': return <Shield className="w-4 h-4 text-red-400" />;
      case 'teacher': return <GraduationCap className="w-4 h-4 text-purple-400" />;
      default: return <User className="w-4 h-4 text-blue-400" />;
    }
  };

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-muted transition-all duration-300 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-600 p-[2px] shadow-lg group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center border-2 border-background">
              <span className="text-foreground text-xs font-black">{initials}</span>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-start mr-1 text-left">
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{user.name}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">{user.role}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 8, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 top-full w-80 bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-xl z-[110] overflow-hidden"
            >
              {/* Header / Profile Info */}
              <div className="p-5 border-b border-border bg-muted/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {initials}
                  </div>
                  <div>
                    <h4 className="text-foreground font-semibold leading-none mb-1">{user.name}</h4>
                    <p className="text-muted-foreground text-xs truncate w-48">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-lg border border-border">
                    {getRoleIcon()}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{user.role}</span>
                  </div>
                  {user.section?.name && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-lg border border-primary/20">
                      <GraduationCap className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{user.section.name}</span>
                    </div>
                  )}
                </div>

                {/* Academic Metadata Summary (Small) */}
                {user.registrationNumber && (
                   <div className="mt-2 space-y-1.5 border-t border-border pt-3">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                        <Hash className="w-3 h-3 text-blue-500" /> REG: <span className="text-foreground">{user.registrationNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                        <BookOpen className="w-3 h-3 text-purple-500" /> DEPT: <span className="text-foreground">{user.department}</span>
                      </div>
                   </div>
                )}
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button 
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all text-sm group"
                  onClick={() => { setShowSettings(true); setIsOpen(false); }}
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <User className="w-4 h-4 group-hover:text-primary transition-colors" />
                  </div>
                  Profile Settings
                </button>
              </div>

              {/* Logout Footer */}
              <div className="p-2 bg-red-500/5 border-t border-border">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all text-sm group"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                    <LogOut className="w-4 h-4 group-hover:text-red-500 transition-colors" />
                  </div>
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ProfileSettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  );
};

export default UserProfile;
