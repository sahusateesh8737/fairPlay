import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, GraduationCap, Eye, EyeOff, Mail, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, register, loading: authLoading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    sectionName: '',
    teacherSecret: ''
  });
  
  const { role } = formData;
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in (prevents back button to login bug)
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'teacher') navigate('/teacher/dashboard', { replace: true });
      else navigate('/student/dashboard', { replace: true });
    }
  }, [user, navigate]);
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const setRole = (newRole) => {
    setFormData({ ...formData, role: newRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let userData;
      if (isLogin) {
        userData = await login(formData.email, formData.password);
      } else {
        userData = await register(formData);
      }

      // Show success animation before redirecting
      setSuccessData(userData);
      
      setTimeout(() => {
        if (userData.role === 'admin') navigate('/admin/dashboard');
        else if (userData.role === 'teacher') navigate('/teacher/dashboard');
        else navigate('/student/dashboard');
      }, 1500);

    } catch (err) {
      const apiErr = err.response?.data?.error;
      setError(apiErr?.message || (typeof apiErr === 'string' ? apiErr : 'Authentication failed'));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] dark:mix-blend-screen mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] dark:mix-blend-screen mix-blend-multiply pointer-events-none" />

      {/* Brand logo to return home */}
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 group z-20">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          fP
        </div>
        <span className="font-bold text-xl tracking-tight text-foreground hidden sm:block">fairPlay</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[450px] flex flex-col justify-center">
          
          <AnimatePresence mode="wait">
            {successData ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center space-y-4 py-8"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                  className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-2"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-foreground tracking-tight">
                  Welcome to fairPlay, {successData.name.split(' ')[0]}!
                </h3>
                <p className="text-muted-foreground text-sm">Preparing your secure workspace...</p>
                <div className="w-48 h-1 bg-muted rounded-full overflow-hidden mt-6">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
                    className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="text-center mb-8 line-clamp-1">
                  <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">
                    {isLogin ? 'Welcome Back' : 'Create an Account'}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {isLogin ? 'Enter your credentials to access your portal' : 'Get started with the ultimate assessment platform'}
                  </p>
                </div>

          {/* Role Toggle for Sign Up */}
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="flex p-1 bg-muted rounded-xl mb-6 relative border border-border"
              >
                <div 
                  className={`absolute inset-y-1 w-[calc(50%-4px)] bg-primary/20 border border-primary/30 rounded-lg transition-transform duration-300 ease-out z-0 ${role === 'teacher' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
                />
                
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium z-10 transition-colors ${role === 'student' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <User className="w-4 h-4" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium z-10 transition-colors ${role === 'teacher' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Teacher
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: [0, -10, 10, -10, 10, 0] }}
              transition={{ x: { duration: 0.4, ease: "easeInOut" }, opacity: { duration: 0.2 } }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 dark:text-red-400 text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Full Name (Sign Up only) */}
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <User className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      name="name"
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                {isLogin ? 'Email Address' : 'College Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@college.edu"
                  className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-12 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Conditionally rendered fields for Sign Up based on Role */}
            <AnimatePresence mode="popLayout">
              {!isLogin && role === 'student' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">My Section</label>
                  <select 
                    name="sectionName"
                    required
                    value={formData.sectionName}
                    onChange={handleInputChange}
                    title="Select your section"
                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all appearance-none [&>option]:text-foreground shadow-sm"
                  >
                    <option value="" disabled>Select an active section...</option>
                    {['k23DJ', 'k23IS', 'k22AL', 'k24ML'].map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </motion.div>
              )}

              {!isLogin && role === 'teacher' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Teacher Access Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <input 
                      type="password" 
                      name="teacherSecret"
                      required
                      value={formData.teacherSecret}
                      onChange={handleInputChange}
                      placeholder="Admin provided secret"
                      className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold py-3 px-4 rounded-xl mt-6 transition-all shadow-[0_4px_14px_0_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.2)] active:scale-[0.98] flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={toggleAuthMode}
                    className="text-primary font-medium hover:text-primary/80 transition-colors"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
