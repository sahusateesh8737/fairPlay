import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-4 inset-x-4 md:inset-x-8 rounded-2xl z-50 transition-all duration-300 border border-white/20 bg-background/80 backdrop-blur-md shadow-lg py-4`}
    >
      <div className="container px-6 mx-auto max-w-6xl flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            fP
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">fairPlay</span>
        </Link>

        {/* Theme Toggle & Auth Actions */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-secondary text-foreground border border-border hover:bg-muted transition-colors shadow-sm"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </motion.button>

          {user ? (
            <Link 
              to={`/${user.role}/dashboard`}
              className="text-sm font-medium bg-primary text-white px-5 py-2 rounded-full hover:bg-blue-600 hover:scale-105 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link 
                to="/auth" 
                state={{ defaultMode: 'login' }}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link 
                to="/auth"
                state={{ defaultMode: 'signup' }}
                className="text-sm font-medium bg-white text-black px-5 py-2 rounded-full hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
