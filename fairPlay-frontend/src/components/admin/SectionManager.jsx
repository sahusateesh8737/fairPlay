import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Trash2, Users, Search } from 'lucide-react';
import axios from 'axios';

const SectionManager = () => {
  const [sections, setSections] = useState([]);
  const [newSectionCode, setNewSectionCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchSections = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/sections`, { withCredentials: true });
      setSections(res.data.data);
    } catch (err) {
      console.error("Failed to fetch sections", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionCode.trim()) return;
    
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/sections`, {
        name: newSectionCode.toUpperCase()
      }, { withCredentials: true });
      
      setNewSectionCode('');
      fetchSections();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create section');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this section? This might impact linked teachers/students.")) return;
    // Note: The backend currently lacks a DELETE /sections endpoint.
    // If you need actual deletion, you must add it to the backend `adminController.js` first.
    // For now, alerting user.
    alert("Delete section functionality requires a database cascade update. Not implemented yet.");
  };

  const filteredSections = sections.filter(sec => 
    sec.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-400" />
            Manage Sections
          </h2>
          <p className="text-sm text-gray-400 mt-1">Create and monitor student cohorts for examination routing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Add New Section Form */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#0a0a0c] border border-gray-800 rounded-xl p-6 sticky top-6"
          >
            <h3 className="text-white font-medium mb-4 uppercase tracking-wider text-sm">Create Cohort</h3>
            <form onSubmit={handleAddSection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Section Code</label>
                <input 
                  type="text" 
                  value={newSectionCode}
                  onChange={(e) => setNewSectionCode(e.target.value)}
                  placeholder="e.g., k24ML"
                  className="w-full bg-[#111115] border border-gray-800 rounded-lg py-2.5 px-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors uppercase"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 font-bold py-2.5 px-4 rounded-lg mt-2 transition-colors text-sm uppercase tracking-widest flex items-center justify-center gap-2 group"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                Add Section
              </button>
            </form>
          </motion.div>
        </div>

        {/* Section Grid/List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search section codes..." 
                className="w-full bg-[#111115] border border-gray-800 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-gray-600 transition-colors text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {isLoading ? (
                <div className="col-span-full py-12 text-center text-gray-500 animate-pulse">Loading sections...</div>
              ) : filteredSections.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-gray-800 rounded-xl">
                  No sections found matching "{searchTerm}".
                </div>
              ) : (
                filteredSections.map((sec) => (
                  <motion.div 
                    key={sec.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className="bg-[#0a0a0c] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group relative overflow-hidden"
                  >
                    {/* Status accent line */}
                    <div className={`absolute top-0 inset-x-0 h-1 ${sec.status === 'active' ? 'bg-purple-500/50' : 'bg-gray-700'}`} />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight uppercase">{sec.name}</h3>
                        <span className="inline-block px-1.5 py-0.5 rounded mt-1 text-[9px] uppercase tracking-widest font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Active
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDelete(sec.id)}
                        className="text-gray-600 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-800/50">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">{sec._count?.users || 0} Enrolled</span>
                      </div>
                      <div className="text-[10px] text-gray-600 uppercase tracking-wider">
                        Est. {new Date(sec.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionManager;
