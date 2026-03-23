import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, CheckCircle2, ChevronDown, MonitorPlay, History, Loader2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StudentProgress = () => {
  const [viewMode, setViewMode] = useState('assignment'); // 'assignment' or 'section'
  const [assignmentOptions, setAssignmentOptions] = useState([]);
  const [activeAssignment, setActiveAssignment] = useState('');
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState('');
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [assignRes, sectionRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/assignments`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sections`)
        ]);
        
        const assignmentsData = assignRes.data.data;
        setAssignmentOptions(assignmentsData);
        if (assignmentsData.length > 0) setActiveAssignment(assignmentsData[0].id);

        // Filter sections that have assignments
        const activeSectionNames = [...new Set(assignmentsData.map(a => a.section?.name))].filter(Boolean);
        setSections(activeSectionNames);
        if (activeSectionNames.length > 0) setActiveSection(activeSectionNames[0]);

      } catch (err) {
        console.error("Failed to fetch initial data", {
          url: err.config?.url,
          status: err.response?.status,
          message: err.response?.data?.error?.message || err.message
        });
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let res;
        if (viewMode === 'assignment') {
          if (!activeAssignment) return;
          res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/submissions/assignment/${activeAssignment}`);
          setStudents(res.data.data);
        } else {
          if (!activeSection) return;
          const url = activeSection === 'all' 
            ? `${import.meta.env.VITE_API_BASE_URL}/api/auth/students` 
            : `${import.meta.env.VITE_API_BASE_URL}/api/auth/students?sectionName=${activeSection}`;
          res = await axios.get(url);
          setStudents(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch data", {
          url: err.config?.url,
          status: err.response?.status,
          message: err.response?.data?.error?.message || err.message
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [viewMode, activeAssignment, activeSection]);

  const filteredStudents = students.filter(s => {
    const student = viewMode === 'assignment' ? s?.student : s;
    if (!student) return false;
    
    return (
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            Student Management
          </h2>
          <p className="text-sm text-gray-400 mt-2 italic">Filter by assignment results or view full section rosters.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-[#111115] p-1 rounded-xl border border-gray-800">
           <button 
            onClick={() => setViewMode('assignment')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'assignment' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-gray-500 hover:text-gray-300'}`}
           >
             By Assignment
           </button>
           <button 
            onClick={() => setViewMode('section')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'section' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:text-gray-300'}`}
           >
             By Section
           </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        {viewMode === 'assignment' ? (
          <div className="relative flex-1 md:max-w-md">
            <select 
              className="w-full bg-[#0a0a0c] border border-gray-800 rounded-xl py-3 pl-4 pr-10 text-white text-sm focus:outline-none focus:border-purple-500/50 appearance-none [&>option]:text-black"
              value={activeAssignment}
              onChange={(e) => setActiveAssignment(e.target.value)}
            >
              {assignmentOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.title} ({opt.section?.name || '—'})</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        ) : (
          <div className="relative flex-1 md:max-w-md">
            <select 
              className="w-full bg-[#0a0a0c] border border-gray-800 rounded-xl py-3 pl-4 pr-10 text-white text-sm focus:outline-none focus:border-blue-500/50 appearance-none [&>option]:text-black"
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
            >
              <option value="all">Global (All Students)</option>
              {sections.map(sec => (
                <option key={sec} value={sec}>{sec} Section</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        )}

        <div className="relative flex-1 md:max-w-sm">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, roll, or reg..." 
            className="w-full bg-[#0a0a0c] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-gray-600 transition-colors text-white placeholder:text-gray-600 shadow-inner"
          />
        </div>
      </div>

      <div className="bg-[#0a0a0c] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-900/40 to-transparent">
           <div className="flex items-center gap-4 text-xs font-bold tracking-widest text-gray-500 uppercase">
             {viewMode === 'assignment' ? 'Submission Progress' : 'Student Roster'}
             <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-2" />
           </div>
           <div className="text-xs text-gray-400">
             Showing <span className="text-white font-mono">{filteredStudents.length}</span> results
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-separate border-spacing-0">
            <thead className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black bg-[#070709]">
              <tr>
                <th className="px-6 py-5 border-b border-gray-800">Student Identity</th>
                <th className="px-6 py-5 border-b border-gray-800">Academic Records</th>
                {viewMode === 'assignment' && <th className="px-6 py-5 border-b border-gray-800">Status & Variation</th>}
                <th className="px-6 py-5 border-b border-gray-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                        <p className="font-medium tracking-wide">Syncing Student Data...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-24 text-center text-gray-500 italic">
                      No records found matching your selection.
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredStudents.map((item, idx) => {
                      const student = viewMode === 'assignment' ? item.student : item;
                      if (!student) return null;

                      return (
                        <motion.tr 
                          key={`${viewMode}-${student.id}-${idx}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: idx * 0.03 }}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                {student.name?.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white group-hover:text-primary transition-colors">{student.name}</div>
                                <div className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase tracking-tighter">{student.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-1.5">
                              {student.registrationNumber ? (
                                <>
                                  <div className="flex items-center gap-2 text-[10px]">
                                     <span className="text-gray-500 w-8">REG:</span>
                                     <span className="text-gray-300 font-mono">{student.registrationNumber}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px]">
                                     <span className="text-gray-500 w-8">ROLL:</span>
                                     <span className="text-blue-400 font-bold font-mono">{student.rollNumber || '—'}</span>
                                  </div>
                                </>
                              ) : (
                                <span className="text-[10px] text-gray-600 italic">Profile Incomplete</span>
                              )}
                            </div>
                          </td>
                          {viewMode === 'assignment' && (
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-2">
                                 <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-black bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                                      Var {item.questionId || 'N/A'}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-400">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                                    </span>
                                 </div>
                                 <p className="text-[10px] text-gray-500 truncate max-w-[150px] italic">
                                   "{item.question?.prompt?.substring(0, 40)}..."
                                 </p>
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-3">
                              {viewMode === 'assignment' ? (
                                <Link 
                                  to={`/teacher/review/${item.id}`}
                                  className="px-4 py-2 bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/10 rounded-xl text-gray-400 hover:text-primary transition-all flex items-center gap-2 group/btn" 
                                >
                                  <History className="w-3.5 h-3.5 transition-transform group-hover/btn:-rotate-12" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Review</span>
                                </Link>
                              ) : (
                                <button 
                                  className="px-4 py-2 bg-white/5 border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/10 rounded-xl text-gray-400 hover:text-blue-400 transition-all flex items-center gap-2" 
                                >
                                  <MonitorPlay className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Activity</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;

