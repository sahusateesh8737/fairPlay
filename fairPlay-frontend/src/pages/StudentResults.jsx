import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, History, Award, BookOpen, Clock, ChevronRight, Code2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import UserProfile from '../components/auth/UserProfile';

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/submissions/student/my-results`);
        setResults(res.data.data);
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background p-8 md:p-12 relative"
    >
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex justify-between items-end mb-12">
          <div>
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 border border-green-500/20">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Academic History</h1>
            <p className="text-lg text-muted-foreground">Review your past submissions and teacher feedback.</p>
          </div>
          <UserProfile />
        </header>

        <div className="space-y-4">
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="font-mono text-[10px] uppercase tracking-widest font-black">Decrypting Gradebook...</p>
             </div>
          ) : results.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-muted/20">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">You haven't completed any assessments yet.</p>
            </div>
          ) : (
            results.map((res) => (
              <motion.div 
                key={res.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => navigate(`/student/results/${res.id}`)}
                className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-primary/40 transition-all shadow-xl shadow-black/5"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{res.assignment.title}</h3>
                    <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                       <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(res.submittedAt).toLocaleDateString()}</span>
                       <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {res.assignment.maxScore} Max Pts</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    {res.score !== null ? (
                      <div>
                        <span className="text-2xl font-black text-primary">{res.score}</span>
                        <span className="text-muted-foreground text-xs ml-1">/{res.assignment.maxScore}</span>
                        <div className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">Graded</div>
                      </div>
                    ) : (
                      <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest italic bg-orange-400/10 px-3 py-1 rounded-full border border-orange-400/20">
                        Pending Grade
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </motion.div>
            ))
          )}
        </div>
        
        <div className="mt-8">
          <button 
            onClick={() => navigate('/student/dashboard')}
            className="text-muted-foreground hover:text-foreground text-sm font-bold flex items-center gap-2 transition-colors"
          >
            ← Back to Active Exams
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentResults;
