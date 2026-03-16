import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Play, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-[#050507] p-8 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="mb-12">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
            <BookOpen className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">My Assessments</h1>
          <p className="text-lg text-gray-400">View and take your assigned coding exams.</p>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p>Loading your assessments...</p>
              </div>
            ) : exams.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-800 rounded-3xl bg-[#0a0a0c]/50"
              >
                <AlertTriangle className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg mb-2">No active exams found</p>
                <p className="text-sm">You have no pending assignments right now.</p>
              </motion.div>
            ) : (
              exams.map((exam) => (
                <motion.div 
                  key={exam.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0a0a0c] border border-gray-800 rounded-2xl p-6 hover:border-blue-500/50 transition-colors shadow-lg group flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-blue-500/20 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border bg-red-500/10 text-red-400 border-red-500/20 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Strict Proctoring
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight min-h-[56px]">{exam.title}</h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 bg-[#111115] w-fit px-3 py-1.5 rounded-lg border border-gray-800/50">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span>Due: <strong className="text-white">{new Date(exam.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</strong></span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-800/50">
                    <button 
                      onClick={() => handleStartExam(exam.id)}
                      className="w-full flex justify-center items-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                    >
                      <Play className="w-5 h-5" /> Start Assessment
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
