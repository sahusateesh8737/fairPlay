import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, CheckCircle2, ChevronDown, MonitorPlay, History } from 'lucide-react';
import { Link } from 'react-router-dom';

import axios from 'axios';

const StudentProgress = () => {
  const [assignmentOptions, setAssignmentOptions] = useState([]);
  const [activeAssignment, setActiveAssignment] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/assignments');
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

  useEffect(() => {
    if (!activeAssignment) return;
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5001/api/submissions/assignment/${activeAssignment}`);
        setStudents(res.data.data);
      } catch (err) {
        console.error("Failed to fetch submissions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [activeAssignment]);

  const filteredStudents = students.filter(s => 
    s.student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Student Progress Tracking
          </h2>
          <p className="text-sm text-gray-400 mt-1">Monitor real-time exam status and verify randomized question distribution.</p>
        </div>
        
        {/* Assignment Selector */}
        <div className="relative min-w-[250px]">
          <select 
            className="w-full bg-[#111115] border border-gray-800 rounded-lg py-2 pl-4 pr-10 text-white text-sm focus:outline-none focus:border-purple-500/50 appearance-none [&>option]:text-black"
            value={activeAssignment}
            onChange={(e) => setActiveAssignment(e.target.value)}
          >
            {assignmentOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.title} ({opt.section})</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div className="bg-[#0a0a0c] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900/20">
          <div className="flex items-center gap-4 text-sm">
             <span className="text-gray-400">Total Enrolled: <strong className="text-white">{currentStudents.length}</strong></span>
             <div className="w-px h-4 bg-gray-700"></div>
             <span className="text-gray-400">Variations Active: <strong className="text-white">{new Set(currentStudents.map(s => s.varId)).size}</strong></span>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or roll..." 
              className="w-full sm:w-64 bg-[#111115] border border-gray-800 rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-gray-600 transition-colors text-white"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-gray-500 uppercase bg-[#070709] border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 font-medium">Student Details</th>
                <th className="px-6 py-4 font-medium">Assigned Variation</th>
                <th className="px-6 py-4 font-medium">Live Status</th>
                <th className="px-6 py-4 font-medium text-right">Monitoring</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                        <p>Loading submission data...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No students found matching "{searchTerm}".
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <motion.tr 
                      key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-800/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{s.student.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{s.student.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                             Var {s.questionId || 'N/A'}
                           </span>
                           <span className="text-gray-300 truncate max-w-[150px]" title={s.question?.prompt}>
                             {s.question?.prompt?.substring(0, 30) || 'General Assessment'}...
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            to={`/teacher/review/${s.id}`}
                            className="p-2 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg text-gray-500 transition-colors flex items-center gap-2" 
                            title="Review & Grade"
                          >
                            <History className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase">Review</span>
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
      </div>
    </div>
  );
};

export default StudentProgress;
