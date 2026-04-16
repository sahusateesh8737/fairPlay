import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, BookOpen, Hash, Layers, Calendar, Save, Loader2, CheckCircle2, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProfileSettingsModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    registrationNumber: user?.registrationNumber || '',
    department: user?.department || '',
    semester: user?.semester || '',
    year: user?.year || '',
    rollNumber: user?.rollNumber || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await updateProfile(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-[999] flex items-center justify-center p-4 ${window.location.pathname.includes('/admin') ? 'dark text-foreground' : ''}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-gradient-to-r from-primary/5 to-purple-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">Academic Profile</h2>
                  <p className="text-xs text-muted-foreground">Complete your student details</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-xs font-medium">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-lg text-xs font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Profile updated successfully!
                </div>
              )}

              <div className="space-y-4">
                {/* Registration Number */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Hash className="w-3 h-3" /> Registration Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2021BCS001"
                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30 shadow-inner"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                    <GraduationCap className="w-3 h-3" /> Department
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science"
                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30 shadow-inner"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Semester */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Layers className="w-3 h-3" /> Semester
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="12"
                      placeholder="e.g. 6"
                      className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30 shadow-inner"
                      value={formData.semester}
                      onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Academic Year
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 3"
                      className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30 shadow-inner"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                    />
                  </div>
                </div>

                {/* Roll Number */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Hash className="w-3 h-3" /> Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 45"
                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30 shadow-inner"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-border text-muted-foreground font-black uppercase tracking-widest text-[10px] hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-3 py-3 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 min-w-[140px]"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Details
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default ProfileSettingsModal;
