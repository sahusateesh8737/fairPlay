import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, x: "-50%" }}
      animate={{ y: 0, x: "-50%" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 left-1/2 w-[95%] md:w-[90%] max-w-5xl rounded-full z-50 transition-all duration-300 border border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl py-2 md:py-3"
    >
      <div className="flex items-center justify-between w-full px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-primary flex items-center justify-center font-bold text-white group-hover:scale-105 transition-all shadow-lg shadow-primary/20">
            fP
          </div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-foreground">
            fairPlay
          </span>
        </Link>

        {/* Theme Toggle & Auth Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            to="/placement-prep/sql"
            className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Placement Prep
          </Link>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-full bg-secondary/50 text-foreground border border-border/50 hover:bg-secondary transition-colors shadow-sm"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </motion.button>

          {user ? (
            <Link
              to={`/${user.role}/dashboard`}
              className="text-sm font-semibold bg-primary text-white px-5 md:px-6 py-2 rounded-full hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                state={{ defaultMode: "login" }}
                className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                state={{ defaultMode: "signup" }}
                className="text-sm font-semibold bg-foreground text-background px-5 md:px-6 py-2 rounded-full hover:opacity-90 hover:scale-105 transition-all shadow-lg active:scale-95"
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
