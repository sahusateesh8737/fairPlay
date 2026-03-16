import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode, Calendar, Clock, Edit2, Play, Users, Trash2, X, FileTerminal } from 'lucide-react';
import axios from 'axios';

const MyAssignments = ({ setActiveTab }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/assignments');
        setAssignments(res.data.data);
      } catch (err) {
        console.error("Failed to fetch assignments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/assignments/${id}`);
      setAssignments(assignments.filter(a => a.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.patch(`http://localhost:5001/api/assignments/${id}/status`, { status: newStatus });
      setAssignments(assignments.map(a => a.id === id ? { ...a, status: res.data.data.status } : a));
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileCode className="w-6 h-6 text-blue-400" />
            Active Assessments
          </h2>
          <p className="text-sm text-gray-400 mt-1">Manage and monitor your coding assignments across all sections.</p>
        </div>
        <button 
          onClick={() => setActiveTab('create')}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Draft New
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
              <p>Fetching your assessments...</p>
            </div>
          ) : assignments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-800 rounded-3xl bg-[#0a0a0c]/50"
            >
              <FileCode className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg mb-2">No active assignments</p>
              <p className="text-sm">Draft a new coding assessment to get started.</p>
            </motion.div>
          ) : (
            assignments.map((assignment) => (
              <motion.div 
                key={assignment.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0a0a0c] border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors shadow-lg group flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${
                      assignment.status === 'active' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}>
                      {assignment.status}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-mono text-gray-400 bg-[#111115] px-2 py-1 rounded-md border border-gray-800">
                      <Users className="w-3 h-3" /> {assignment.section?.name || assignment.targetSection || '—'}
                    </span>
                  </div>
                  
                  <h3 className="text-white font-semibold text-lg mb-2 leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                    {assignment.title}
                  </h3>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Due: {new Date(assignment.dueDate).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {assignment.questions && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <FileCode className="w-4 h-4 text-gray-500" />
                        <span>{assignment.questions.length} variations active</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{assignment.submissions === 0 ? 'No' : assignment.submissions} submissions</span>
                    </div>
                  </div>
                </div>

              <div className="p-4 bg-[#111115] border-t border-gray-800 flex justify-between items-center gap-2">
                  {assignment.status === 'draft' ? (
                    <button
                      onClick={() => handleStatusChange(assignment.id, 'active')}
                      className="flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium text-green-400 hover:text-white hover:bg-green-600/20 rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" /> Publish
                    </button>
                  ) : assignment.status === 'active' ? (
                    <button
                      onClick={() => handleStatusChange(assignment.id, 'closed')}
                      className="flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium text-orange-400 hover:text-white hover:bg-orange-600/20 rounded-lg transition-colors"
                    >
                      <Clock className="w-4 h-4" /> Close
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(assignment.id, 'active')}
                      className="flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium text-blue-400 hover:text-white hover:bg-blue-600/20 rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" /> Reopen
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedReview(assignment)}
                    className="flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium text-blue-400 hover:text-white hover:bg-blue-600/20 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" /> Review
                  </button>
                  <button 
                    onClick={() => handleDelete(assignment.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedReview(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-[#0a0a0c] border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/40">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedReview.title}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {selectedReview.section?.name || selectedReview.targetSection || '—'}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(selectedReview.dueDate).toLocaleString()}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedReview(null)}
                  className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#0a0a0c]">
                <div>
                   <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                     <FileTerminal className="w-5 h-5 text-blue-400" />
                     Question Variations ({selectedReview.questions?.length})
                   </h4>
                   <div className="space-y-6">
                     {selectedReview.questions?.map((q, idx) => (
                       <div key={idx} className="bg-[#111115] border border-gray-800 rounded-xl overflow-hidden">
                         <div className="bg-gray-800/30 px-4 py-2 border-b border-gray-800">
                           <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">Variation {idx + 1}</span>
                         </div>
                         <div className="p-5 space-y-4">
                           <div>
                             <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Prompt / Instructions</p>
                             <div className="text-gray-300 text-sm whitespace-pre-wrap bg-[#0a0a0c] p-4 rounded-lg border border-gray-800/50">
                               {q.prompt}
                             </div>
                           </div>
                           {q.boilerplate && (
                             <div>
                               <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Provided Boilerplate (JSX)</p>
                               <div className="text-blue-300 text-sm font-mono whitespace-pre-wrap bg-[#050507] p-4 rounded-lg border border-gray-800/50 overflow-x-auto">
                                 {q.boilerplate}
                               </div>
                             </div>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-800 bg-[#111115] flex justify-end">
                <button 
                  onClick={() => setSelectedReview(null)}
                  className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Simple inline PlusCircle icon
const PlusCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 8v8"></path>
    <path d="M8 12h8"></path>
  </svg>
);

export default MyAssignments;
