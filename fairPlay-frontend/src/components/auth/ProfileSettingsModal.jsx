import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, BookOpen, Hash, Layers, Calendar, Save, Loader2, CheckCircle2 } from 'lucide-react';
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="relative w-full max-w-lg bg-[#0a0a0c] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-500/5 to-purple-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Academic Profile</h2>
                  <p className="text-xs text-gray-400">Complete your student details</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                  <X className="w-4 h-4" /> {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
                </div>
              )}

              <div className="space-y-4">
                {/* Registration Number */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Hash className="w-3 h-3" /> Registration Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2021BCS001"
                    className="w-full bg-[#111115] border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <BookOpen className="w-3 h-3" /> Department
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science"
                    className="w-full bg-[#111115] border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Semester */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Layers className="w-3 h-3" /> Semester
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="12"
                      placeholder="e.g. 6"
                      className="w-full bg-[#111115] border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                      value={formData.semester}
                      onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Academic Year
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 3"
                      className="w-full bg-[#111115] border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                    />
                  </div>
                </div>

                {/* Roll Number */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Hash className="w-3 h-3" /> Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 45"
                    className="w-full bg-[#111115] border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-800 text-gray-400 font-bold hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-3 py-3 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 min-w-[140px]"
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
};

export default ProfileSettingsModal;
