import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, CheckCircle2, ChevronDown, MonitorPlay } from 'lucide-react';

const StudentProgress = () => {
  const [activeAssignment, setActiveAssignment] = useState('react-hooks-k23IS');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data representing the Teacher's active assignments
  const assignmentOptions = [
    { id: 'react-hooks-k23IS', title: 'React State Management Hooks', section: 'k23IS' },
    { id: 'nav-bar-k23DJ', title: 'Build a Navigation Bar', section: 'k23DJ' },
  ];

  // Mock data mapping students to their randomly assigned question ID
  const studentData = {
    'react-hooks-k23IS': [
      { id: 1, roll: '121001', name: 'Alice Smith', email: 'alice.s@college.edu', varId: 3, varTitle: 'Implement useReducer', status: 'coding' },
      { id: 2, roll: '121002', name: 'Bob Johnson', email: 'bob.j@college.edu', varId: 1, varTitle: 'Basic useState Counter', status: 'submitted' },
      { id: 3, roll: '121003', name: 'Charlie Davis', email: 'charlie.d@college.edu', varId: 2, varTitle: 'useEffect Data Fetch', status: 'coding' },
      { id: 4, roll: '121004', name: 'Diana Prince', email: 'diana.p@college.edu', varId: 1, varTitle: 'Basic useState Counter', status: 'submitted' },
      { id: 5, roll: '121005', name: 'Evan Wright', email: 'evan.w@college.edu', varId: 4, varTitle: 'Custom Hook creation', status: 'offline' },
    ],
    'nav-bar-k23DJ': [
      { id: 6, roll: '121006', name: 'Fiona Gallagher', email: 'fiona.g@college.edu', varId: 2, varTitle: 'Responsive Hamburger', status: 'submitted' },
      { id: 7, roll: '121007', name: 'George Miller', email: 'george.m@college.edu', varId: 1, varTitle: 'Horizontal Flex Nav', status: 'coding' },
    ]
  };

  const currentStudents = studentData[activeAssignment] || [];
  
  const filteredStudents = currentStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll.includes(searchTerm)
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
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No students found matching "{searchTerm}".
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <motion.tr 
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-800/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{student.name} <span className="text-gray-500 text-xs ml-2 font-mono">{student.roll}</span></div>
                        <div className="text-xs text-gray-500 mt-1">{student.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                             Var {student.varId}
                           </span>
                           <span className="text-gray-300 truncate max-w-[150px]" title={student.varTitle}>{student.varTitle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.status === 'submitted' && (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                          </span>
                        )}
                        {student.status === 'coding' && (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-blue-400">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span> Active
                          </span>
                        )}
                        {student.status === 'offline' && (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                            <span className="w-2 h-2 rounded-full bg-gray-600"></span> Offline
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg text-gray-500 transition-colors" title="View Feed">
                          <MonitorPlay className="w-4 h-4" />
                        </button>
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
