import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, CheckCircle2, History, BarChart3, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AssignmentAnalytics from './AssignmentAnalytics';

const AssignmentResults = () => {
  const [assignmentOptions, setAssignmentOptions] = useState([]);
  const [activeAssignment, setActiveAssignment] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'analytics'
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  // 1. Fetch available assignments for the dropdown
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/assignments`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const options = res.data.data;
        setAssignmentOptions(options);
        if (options.length > 0) {
          setActiveAssignment(options[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch assignments", err);
      }
    };
    fetchOptions();
  }, []);

  // 2. Fetch submissions when an assignment is selected
  useEffect(() => {
    if (!activeAssignment) return;
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/submissions/assignment/${activeAssignment}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSubmissions(res.data.data);
        setCurrentPage(1); // Reset to page 1 on new assignment
      } catch (err) {
        console.error("Failed to fetch submissions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [activeAssignment]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter functionality
  const filteredSubmissions = submissions.filter(s => 
    s.student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.student.section?.name && s.student.section.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredSubmissions.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredSubmissions.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            Assignment Results
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Review student marks, sections, and variation performance.</p>
        </div>
        
        {/* View Toggle & Assignment Selector */}
        <div className="flex items-center gap-4">
          <div className="flex bg-muted rounded-lg p-1 border border-border shrink-0">
            <button 
              onClick={() => setView('list')}
              className={`p-2 rounded-md transition-all ${view === 'list' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView('analytics')}
              className={`p-2 rounded-md transition-all ${view === 'analytics' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>

          <div className="relative min-w-[250px]">
            <select 
              className="w-full bg-background border border-border rounded-lg py-2 pl-4 pr-10 text-foreground text-sm focus:outline-none focus:border-green-500/50 appearance-none shadow-sm"
              value={activeAssignment}
              onChange={(e) => setActiveAssignment(e.target.value)}
            >
              {assignmentOptions.map(opt => (
                <option key={opt.id} value={opt.id} className="text-foreground">{opt.title} ({opt.section?.name || '—'})</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'analytics' ? (
          <motion.div 
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AssignmentAnalytics 
              assignmentId={activeAssignment} 
              csvData={submissions.map(s => ({
                Student: s.student.name,
                Email: s.student.email,
                Section: s.student.section?.name || 'N/A',
                Score: s.score || 'Ungraded',
                SubmittedAt: new Date(s.submittedAt).toLocaleString()
              }))}
            />
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-border rounded-xl overflow-hidden shadow-xl"
          >
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
             <span>Total: <strong className="text-foreground">{filteredSubmissions.length}</strong></span>
             <div className="w-px h-4 bg-border hidden sm:block"></div>
             <span>Page: <strong className="text-foreground font-mono">{currentPage} / {totalPages || 1}</strong></span>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
               type="text" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Search results..." 
               className="w-full sm:w-72 bg-background border border-border rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-border transition-all text-foreground placeholder:text-muted-foreground/30 shadow-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black bg-muted/40 border-b border-border">
              <tr>
                <th className="px-6 py-5 font-black">Student</th>
                <th className="px-6 py-5 font-black">Section</th>
                <th className="px-6 py-5 font-black">Variation</th>
                <th className="px-6 py-5 font-black">Score</th>
                <th className="px-6 py-5 font-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr key="loading">
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                        <p className="font-mono text-[10px] uppercase font-black tracking-widest">Loading results...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentRows.length === 0 ? (
                  <tr key="empty">
                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground italic text-sm">
                      No results found matching "{searchTerm}".
                    </td>
                  </tr>
                ) : (
                  currentRows.map((s) => (
                    <motion.tr 
                      key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">{s.student.name}</div>
                        <div className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-tighter">{s.student.email}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-0.5 bg-muted rounded border border-border text-[10px] text-muted-foreground uppercase font-mono font-bold">
                          {s.student.section?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                           <span className="w-fit px-2 py-0.5 rounded text-[10px] uppercase font-black bg-purple-500/10 text-purple-500 border border-purple-500/20 font-mono">
                             Var {s.question?.id || 'N/A'}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {s.score !== null ? (
                          <span className="text-green-600 font-bold text-base">{s.score} <span className="text-muted-foreground text-xs font-normal">/ 100</span></span>
                        ) : (
                          <span className="text-orange-500/70 text-[10px] font-bold uppercase tracking-wider italic">Ungraded</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            to={`/teacher/review/${s.id}`}
                            className="px-4 py-2 hover:bg-green-500/10 hover:text-green-600 border border-transparent hover:border-green-500/20 rounded-xl text-muted-foreground transition-all flex items-center gap-2 group/btn" 
                          >
                            <History className="w-3.5 h-3.5 transition-transform group-hover/btn:-rotate-12" />
                            <span className="text-[10px] font-black uppercase tracking-widest">View</span>
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-background border border-border rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors text-foreground"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-background border border-border rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors text-foreground"
            >
              Next
            </button>
          </div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
</div>
  );
};

export default AssignmentResults;
