import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCode, Calendar, Clock, Edit2, Play, Users, Trash2, X, FileTerminal, Radio, PlusCircle 
} from 'lucide-react';
import axios from 'axios';
import AssignmentHeatMap from './AssignmentHeatMap';

const MyAssignments = ({ setActiveTab, searchQuery = '' }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [activeHeatMap, setActiveHeatMap] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/assignments`);
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
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/assignments/${id}`);
      setAssignments(assignments.filter(a => a.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/assignments/${id}/status`, { status: newStatus });
      setAssignments(assignments.map(a => a.id === id ? { ...a, status: res.data.data.status } : a));
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <AnimatePresence>
        {activeHeatMap && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background overflow-y-auto p-8"
          >
            <AssignmentHeatMap 
              assignmentId={activeHeatMap.id} 
              onClose={() => setActiveHeatMap(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <FileCode className="w-6 h-6 text-primary" />
            Active Assessments
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage and monitor your coding assignments across all sections.</p>
        </div>
        <button 
          onClick={() => setActiveTab('create')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Draft New
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
              <p>Fetching your assessments...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-3xl bg-muted/30"
            >
              <FileCode className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg mb-2">No assignments found</p>
              <p className="text-sm">Try adjusting your search query or draft a new assessment.</p>
            </motion.div>
          ) : (
            filteredAssignments.map((assignment) => (
              <motion.div 
                key={assignment.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all shadow-lg group flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-widest border transition-colors ${
                      assignment.status === 'active' 
                        ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                        : 'bg-muted text-muted-foreground border-border'
                    }`}>
                      {assignment.status}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border">
                      <Users className="w-3 h-3" /> {assignment.section?.name || assignment.targetSection || '—'}
                    </span>
                  </div>
                  
                  <h3 className="text-foreground font-semibold text-lg mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {assignment.title}
                  </h3>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary/60" />
                      <span>Due: {new Date(assignment.dueDate).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {assignment.questions && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileCode className="w-4 h-4 text-primary/60" />
                        <span>{assignment.questions.length} variations active</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary/60" />
                      <span>{assignment.submissions === 0 ? 'No' : assignment.submissions} submissions</span>
                    </div>
                  </div>
                </div>

              <div className="p-4 bg-muted/30 border-t border-border flex justify-between items-center gap-2">
                  {assignment.status === 'draft' ? (
                    <button
                      onClick={() => handleStatusChange(assignment.id, 'active')}
                      className="flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium text-green-400 hover:text-white hover:bg-green-600/20 rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" /> Publish
                    </button>
                  ) : assignment.status === 'active' ? (
                    <div className="flex flex-col flex-1 gap-2">
                      <button
                        onClick={() => setActiveHeatMap(assignment)}
                        className="w-full flex justify-center items-center gap-2 py-3 text-sm font-black text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-lg shadow-primary/20 group/btn"
                      >
                        <Radio className="w-4 h-4 group-hover/btn:animate-pulse" /> Live Matrix Monitoring
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(assignment.id, 'closed')}
                          className="flex-1 flex justify-center items-center gap-2 py-2 text-xs font-medium text-orange-400 hover:text-white hover:bg-orange-600/20 rounded-lg transition-colors border border-orange-500/10"
                        >
                          <Clock className="w-3.5 h-3.5" /> Close
                        </button>
                        <button 
                          onClick={() => setSelectedReview(assignment)}
                          className="flex-1 flex justify-center items-center gap-2 py-2 text-xs font-medium text-primary hover:text-primary-foreground hover:bg-primary rounded-lg transition-all border border-primary/20"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Review
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(assignment.id, 'active')}
                      className="flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium text-blue-400 hover:text-white hover:bg-blue-600/20 rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" /> Reopen
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(assignment.id)}
                    className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
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
              className="relative bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedReview.title}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-mono"><Users className="w-3.5 h-3.5 text-primary" /> {selectedReview.section?.name || selectedReview.targetSection || '—'}</span>
                    <span className="flex items-center gap-1.5 font-mono"><Calendar className="w-4 h-4 text-primary" /> {new Date(selectedReview.dueDate).toLocaleString()}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedReview(null)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-background no-scrollbar">
                <div>
                   <h4 className="text-foreground font-medium mb-4 flex items-center gap-2">
                     <FileTerminal className="w-5 h-5 text-primary" />
                     Question Variations ({selectedReview.questions?.length})
                   </h4>
                   <div className="space-y-6">
                     {selectedReview.questions?.map((q, idx) => (
                       <div key={idx} className="bg-card border border-border rounded-xl overflow-hidden">
                         <div className="bg-muted px-4 py-2 border-b border-border">
                           <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Variation {idx + 1}</span>
                         </div>
                         <div className="p-5 space-y-4">
                           <div>
                             <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Prompt / Instructions</p>
                             <div className="text-foreground/80 text-sm whitespace-pre-wrap bg-background p-4 rounded-lg border border-border">
                               {q.prompt}
                             </div>
                           </div>
                           {q.boilerplate && (
                             <div>
                               <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Provided Boilerplate (JSX)</p>
                               <div className="text-primary text-sm font-mono whitespace-pre-wrap bg-muted p-4 rounded-lg border border-border overflow-x-auto">
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

              <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
                <button 
                  onClick={() => setSelectedReview(null)}
                  className="px-6 py-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-lg transition-colors font-medium text-sm"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

export default MyAssignments;
