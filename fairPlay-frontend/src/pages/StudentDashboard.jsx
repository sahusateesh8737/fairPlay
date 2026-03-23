import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Play, AlertTriangle, CheckCircle, LogOut, Search, ChevronDown, Code2, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import UserProfile from '../components/auth/UserProfile';
import CountdownTimer from '../components/common/CountdownTimer';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [exams, setExams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/assignments');
        setExams(res.data.data);
      } catch (err) {
        console.error("Failed to fetch assignments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleStartExam = (id) => {
    navigate(`/student/exam/${id}`);
  };

  const filteredExams = exams.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'text-green-400 border-green-500/20 bg-green-500/10';
      case 'hard': return 'text-red-400 border-red-500/20 bg-red-500/10';
      default: return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#050507] p-8 md:p-12"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative">
          <div>
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">My Assessments</h1>
            <p className="text-lg text-gray-400 mb-6">View and take your assigned coding exams.</p>
            
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search assessments..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-96 bg-[#111115] border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30 transition-all text-white placeholder:text-gray-600 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>
          
          <UserProfile />
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p>Loading your assessments...</p>
              </div>
            ) : filteredExams.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-800 rounded-3xl bg-[#0a0a0c]/50"
              >
                <AlertTriangle className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg mb-2">No active exams found</p>
                <p className="text-sm">You have no pending assignments matching your search.</p>
              </motion.div>
            ) : (
              filteredExams.map((exam) => (
                <motion.div 
                  key={exam.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0a0a0c] border border-gray-800 rounded-3xl p-6 hover:border-primary/40 transition-all shadow-xl group flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                  
                  {/* Top Badges */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-2">
                       <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider border ${getDifficultyColor(exam.difficulty)}`}>
                        {exam.difficulty || 'Medium'}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider border bg-white/5 text-gray-400 border-white/5 flex items-center gap-1.5">
                        <Code2 className="w-3 h-3 text-blue-400" /> {exam.language || 'React'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">
                      <Award className="w-3 h-3" /> {exam.maxScore || 100} PTS
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4 leading-tight group-hover:text-primary transition-colors">{exam.title}</h3>
                  
                  {/* Countdown / Due Date */}
                  <div className="mb-6">
                    <CountdownTimer dueDate={exam.dueDate} />
                  </div>

                  {/* Expandable Section */}
                  <div className="mb-6">
                    <button 
                      onClick={() => setExpandedId(expandedId === exam.id ? null : exam.id)}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-white transition-colors uppercase tracking-widest mb-2"
                    >
                      Assignment Details
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${expandedId === exam.id ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {expandedId === exam.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-gray-400 leading-relaxed pt-2 line-clamp-4">
                            {exam.description || "No additional instructions provided. Please follow the problem statement in the sandbox environment."}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-auto pt-5 border-t border-white/5 space-y-3">
                    {exam.submissions && exam.submissions.length > 0 ? (
                      <div className="w-full flex justify-center items-center gap-2 py-3 bg-white/5 text-green-400 font-bold rounded-2xl border border-green-500/20 shadow-inner">
                        <CheckCircle className="w-5 h-5" /> Completed
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleStartExam(exam.id)}
                        className="w-full flex justify-center items-center gap-2 py-3.5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white font-bold rounded-2xl transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <Play className="w-5 h-5" /> Start Assessment
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
