import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Code2, ChevronRight, ChevronLeft, Clock, Star, Activity, AlertCircle } from 'lucide-react';

const PracticeHub = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/practice`);
        if (response.data.success) {
          setProblems(response.data.data);
        } else {
          setError('Failed to fetch practice problems');
        }
      } catch (err) {
        setError('Unable to connect to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6">
      <div className="max-w-5xl mx-auto relative">
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-0 left-0 p-2 hover:bg-muted rounded-full transition-colors group flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-sm"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Home
        </button>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 font-bold uppercase tracking-widest text-xs">
            <Code2 className="w-4 h-4" /> Practice Hub
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Sharpen Your <span className="text-primary">React Skills</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No login required. Choose a problem below to open the interactive sandbox and start coding instantly. Perfect for interview prep or sharpening your frontend skills.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-start gap-4 max-w-2xl mx-auto">
             <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
             <div>
                <h3 className="font-bold text-red-500 mb-1">Error Loading Practice Questions</h3>
                <p className="text-sm text-red-400">{error}</p>
             </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {problems.map((problem, index) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/practice/${problem.id}`)}
                className="group bg-card border border-border hover:border-primary/50 p-6 md:p-8 rounded-3xl cursor-pointer transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {problem.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> ~15 Mins</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{problem.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{problem.description}</p>
                </div>
                <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeHub;
