import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ShieldAlert, CheckCircle2, AlertTriangle, 
  Clock, Radio, Search, ChevronRight, X, Maximize2,
  Info, BarChart3, Fingerprint
} from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io(`${import.meta.env.VITE_API_BASE_URL}`);

const AssignmentHeatMap = ({ assignmentId, onClose }) => {
  const [assignment, setAssignment] = useState(null);
  const [students, setStudents] = useState([]);
  const [liveStates, setLiveStates] = useState({}); // { studentId: { status, progress, currentQuestion, timestamp } }
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Constants for the 9x8 grid
  const ROWS = 9;
  const COLS = 8;
  const TOTAL_SEATS = ROWS * COLS;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignRes, studentRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/assignments/${assignmentId}`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/students`) // We'll filter this by section in a real app
        ]);

        const activeAssign = assignRes.data.data;
        setAssignment(activeAssign);

        // Filter students belonging to this assignment's section
        const sectionStudents = studentRes.data.data.filter(s => s.sectionId === activeAssign.targetSectionId);
        
        // Sort by Roll Number if available, else name
        const sortedStudents = sectionStudents.sort((a, b) => {
           if (a.rollNumber && b.rollNumber) return a.rollNumber.localeCompare(b.rollNumber);
           return a.name.localeCompare(b.name);
        });

        setStudents(sortedStudents);
        
        // Initialize live states from existing submissions
        const initialStates = {};
        activeAssign.submissions?.forEach(sub => {
          initialStates[sub.studentId] = {
            status: 'SUBMITTED',
            progress: '100%',
            timestamp: new Date(sub.submittedAt).toLocaleTimeString()
          };
        });
        setLiveStates(initialStates);

        // Join Monitoring Room
        socket.emit('teacher_join_monitoring', assignmentId);

      } catch (err) {
        console.error("Failed to load heat map data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Socket Listeners
    socket.on('student_status_update', (data) => {
      setLiveStates(prev => ({
        ...prev,
        [data.studentId]: {
          ...(prev[data.studentId] || {}),
          status: prev[data.studentId]?.status === 'SUBMITTED' ? 'SUBMITTED' : data.status,
          studentName: data.studentName,
          rollNumber: data.rollNumber,
          timestamp: data.timestamp
        }
      }));
    });

    socket.on('receive_progress_update', (data) => {
      setLiveStates(prev => ({
        ...prev,
        [data.studentId]: {
          ...(prev[data.studentId] || {}),
          ...data,
          status: data.tabStatus === 'FLAGGED' ? 'FLAGGED' : (prev[data.studentId]?.status === 'SUBMITTED' ? 'SUBMITTED' : 'ACTIVE')
        }
      }));
    });

    return () => {
      socket.off('student_status_update');
      socket.off('receive_progress_update');
    };
  }, [assignmentId]);

  // Map students to grid positions
  const gridData = useMemo(() => {
    const grid = Array(TOTAL_SEATS).fill(null);
    students.forEach((student, idx) => {
      if (idx < TOTAL_SEATS) {
        grid[idx] = {
          ...student,
          live: liveStates[student.id] || { status: 'IDLE' },
          setLabel: String.fromCharCode(65 + ((student.id + parseInt(assignmentId)) % (assignment?.questions?.length || 2)))
        };
      }
    });
    return grid;
  }, [students, liveStates, assignment]);

  const stats = useMemo(() => {
    const counts = { total: students.length, active: 0, submitted: 0, flagged: 0 };
    Object.values(liveStates).forEach(s => {
      if (s.status === 'ACTIVE') counts.active++;
      if (s.status === 'SUBMITTED') counts.submitted++;
      if (s.status === 'FLAGGED') counts.flagged++;
    });
    return counts;
  }, [liveStates, students]);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-gray-500">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
      <p className="font-mono text-xs uppercase tracking-widest">Constructing Live Matrix...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Overlay */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
               <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              {assignment?.title}
              <span className="text-xs font-mono bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">LIVE FEED</span>
            </h2>
          </div>
          <p className="text-sm text-gray-400 ml-10 italic">Seating Matrix: {ROWS} Rows × {COLS} Columns</p>
        </div>

        <div className="flex items-center gap-4 bg-[#111115] p-2 rounded-2xl border border-gray-800 shadow-2xl">
           <StatItem label="Active" value={stats.active} color="text-blue-400" icon={Radio} pulse />
           <div className="w-px h-8 bg-gray-800" />
           <StatItem label="Submitted" value={stats.submitted} color="text-green-500" icon={CheckCircle2} />
           <div className="w-px h-8 bg-gray-800" />
           <StatItem label="Flagged" value={stats.flagged} color="text-orange-500" icon={ShieldAlert} />
        </div>
      </div>

      {/* The Actual Heat Map Grid */}
      <div className="bg-[#0a0a0c] border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Grid Labeling */}
        <div className="grid grid-cols-8 gap-4 mb-2">
           {Array.from({length: COLS}).map((_, i) => (
             <div key={i} className="text-[10px] text-gray-700 font-bold text-center uppercase tracking-widest">Col {i+1}</div>
           ))}
        </div>

        <div className="grid grid-cols-8 gap-4">
          {gridData.map((seat, idx) => (
            <SeatBox 
              key={idx} 
              seat={seat} 
              onClick={() => seat && setSelectedStudent(seat)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 pt-8 border-t border-gray-800/50 flex flex-wrap gap-8 justify-center">
           <LegendItem color="bg-gray-800" label="Idle / Offline" />
           <LegendItem color="bg-blue-600/40" label="Actively Solving" pulse />
           <LegendItem color="bg-orange-500/40" label="Suspicious (Tab Switch)" />
           <LegendItem color="bg-green-500" label="Verified Submission" />
        </div>
      </div>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="w-full max-w-lg bg-[#0f0f13] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl"
             >
                <div className="p-6 bg-gradient-to-r from-gray-900 to-transparent border-b border-gray-800 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${getStatusBg(selectedStudent.live.status)}`}>
                        {selectedStudent.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white leading-tight">{selectedStudent.name}</h3>
                        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">{selectedStudent.rollNumber || 'No Roll Number'}</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <div className="p-8 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <DetailCard label="Question Set" value={`SET ${selectedStudent.setLabel}`} icon={Fingerprint} />
                      <DetailCard label="Live Status" value={selectedStudent.live.status} icon={Radio} color={getStatusText(selectedStudent.live.status)} />
                      <DetailCard label="Last Pulse" value={selectedStudent.live.timestamp || '—'} icon={Clock} />
                      <DetailCard label="Cur. Question" value={selectedStudent.live.currentQuestion ? `Q#${selectedStudent.live.currentQuestion}` : '—'} icon={BarChart3} />
                   </div>

                   {selectedStudent.live.status === 'FLAGGED' && (
                     <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                           <p className="text-sm font-bold text-orange-400">Suspicious Activity Detected</p>
                           <p className="text-xs text-orange-500/80 leading-relaxed">Student has navigated away from the assessment sandbox or switched tabs. Caution advised.</p>
                        </div>
                     </div>
                   )}

                   <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => setSelectedStudent(null)}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/5"
                      >
                        Dismiss
                      </button>
                      <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)]">
                        Deep Inspect
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SeatBox = ({ seat, onClick }) => {
  if (!seat) return (
    <div className="aspect-square bg-white/[0.01] border border-dashed border-gray-900 rounded-xl" />
  );

  const status = seat.live.status;
  const isFlagged = status === 'FLAGGED';
  const isSubmitted = status === 'SUBMITTED';
  const isActive = status === 'ACTIVE';

  return (
    <motion.button
      whileHover={{ scale: 1.05, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center p-2 relative group overflow-hidden ${
        isSubmitted ? 'bg-green-500 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]' :
        isFlagged ? 'bg-orange-500/20 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]' :
        isActive ? 'bg-blue-600/40 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.2)]' :
        'bg-[#0f0f13] border-gray-800'
      }`}
    >
      {isActive && (
        <div className="absolute top-1 right-1">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
        </div>
      )}

      <span className={`text-[10px] font-bold font-mono tracking-tighter ${isSubmitted ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
        {seat.rollNumber || '—'}
      </span>
      
      <div className={`text-sm font-black mt-1 ${isSubmitted ? 'text-white' : 'text-white/40'}`}>
        {seat.setLabel}
      </div>

      {!isSubmitted && (
         <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <Maximize2 className="w-3 h-3 text-gray-500" />
         </div>
      )}
    </motion.button>
  );
};

const StatItem = ({ label, value, color, icon: Icon, pulse }) => (
  <div className="px-4 flex items-center gap-3">
    <div className={`p-2 rounded-lg bg-gray-900 ${pulse ? 'animate-pulse' : ''}`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <div>
      <div className={`text-xl font-bold text-white font-mono`}>{value}</div>
      <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{label}</div>
    </div>
  </div>
);

const LegendItem = ({ color, label, pulse }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${color} ${pulse ? 'animate-pulse' : ''}`} />
    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{label}</span>
  </div>
);

const DetailCard = ({ label, value, icon: Icon, color = "text-white" }) => (
  <div className="p-4 bg-white/[0.02] border border-gray-800/50 rounded-2xl flex flex-col gap-2">
     <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
        <Icon className="w-3 h-3" /> {label}
     </div>
     <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
  </div>
);

const getStatusBg = (status) => {
  switch (status) {
    case 'SUBMITTED': return 'bg-green-500 text-white';
    case 'FLAGGED': return 'bg-orange-500/20 text-orange-500 border border-orange-500/30';
    case 'ACTIVE': return 'bg-blue-600/20 text-blue-400 border border-blue-500/30';
    default: return 'bg-gray-800 text-gray-500';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'SUBMITTED': return 'text-green-500';
    case 'FLAGGED': return 'text-orange-500';
    case 'ACTIVE': return 'text-blue-400';
    default: return 'text-gray-500';
  }
};

export default AssignmentHeatMap;
