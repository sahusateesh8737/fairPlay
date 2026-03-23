import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, KeyRound, UserCog, CornerDownLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminAuth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  const navigate = useNavigate();
  const { user, login, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center font-mono relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBoNDBNNDAgMHY0MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] z-0 pointer-events-none" />
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="w-12 h-12 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
          <p className="text-red-500/50 text-[10px] uppercase tracking-[0.2em]">Verifying System Credentials...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (username && password) {
        const userData = await login(username, password);
        if (userData.role === 'admin') {
          setSuccessData(userData);
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 1500);
        } else {
          setError('Access Denied: Insufficient privileges.');
        }
      }
    } catch (err) {
      const apiErr = err.response?.data?.error;
      setError(apiErr?.message || (typeof apiErr === 'string' ? apiErr : 'Authentication failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center p-6 relative overflow-hidden font-mono">
      {/* Strict Grid Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBoNDBNNDAgMHY0MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] z-0 pointer-events-none" />
      
      {/* Subtle Red Warning Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Return Home (Subcreet) */}
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors z-20 text-sm">
        <CornerDownLeft className="w-4 h-4" />
        Return to Public Portal
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm z-10"
      >
        <div className="bg-[#0a0a0c] border border-red-500/20 rounded-xl p-8 shadow-2xl relative overflow-hidden min-h-[420px] flex flex-col justify-center">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

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
                  className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-2"
                >
                  <CheckCircle2 className="w-10 h-10 text-red-500" />
                </motion.div>
                <h3 className="text-xl font-bold text-white tracking-widest uppercase mt-4">
                  Verification Complete
                </h3>
                <p className="text-red-500/60 text-xs uppercase tracking-widest mt-2">Initializing Secure Session...</p>
                <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mt-6">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
                    className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-red-500" />
                  </div>
                  <h1 className="text-xl font-bold text-white tracking-widest uppercase">System Admin</h1>
                  <p className="text-red-500/60 text-xs mt-2 uppercase tracking-widest">Restricted Area</p>
                </div>

                {error && (
                  <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Identifier</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <UserCog className="w-4 h-4" />
                      </div>
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Admin Email / Username"
                        className="w-full bg-[#111115] border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Master Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full bg-[#111115] border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-2.5 px-4 rounded-lg mt-8 transition-colors text-sm uppercase tracking-widest flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Authenticating...' : 'Authenticate'}
                    {!loading && <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAuth;
