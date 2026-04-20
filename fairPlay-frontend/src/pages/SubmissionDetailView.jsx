import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  ChevronLeft, Award, MessageSquare, Code2, Clock, 
  FileCode, CheckCircle2, AlertCircle 
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SubmissionDetailView = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [submission, setSubmission] = useState(null);
  const [activeFile, setActiveFile] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/submissions/${submissionId}`);
        const data = res.data.data;
        setSubmission(data);
        if (data.files && data.files.length > 0) {
          setActiveFile(data.files[0].fileName);
        }
      } catch (err) {
        console.error("Failed to fetch submission detail", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [submissionId]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-mono uppercase tracking-[0.3em]">
      Reconstructing Session Data...
    </div>
  );

  if (!submission) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-muted-foreground">
      <AlertCircle className="w-12 h-12 opacity-20" />
      <p>Artifact Not Found</p>
      <button onClick={() => navigate(-1)} className="text-primary hover:underline">Go Back</button>
    </div>
  );

  const activeContent = submission.files.find(f => f.fileName === activeFile)?.code || '';

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden text-foreground font-sans">
      {/* Header */}
      <header className="h-20 border-b border-border bg-card flex items-center justify-between px-8 shrink-0 z-40 shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 hover:bg-muted rounded-xl text-muted-foreground transition-colors border border-transparent hover:border-border"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{submission.assignment.title}</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mt-0.5">Assessment Review Mode</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl">
             <Clock className="w-4 h-4 text-primary" />
             <span className="text-xs font-bold text-primary">{new Date(submission.submittedAt).toLocaleDateString()}</span>
          </div>
          <div className="h-8 w-px bg-border mx-2" />
          <div className="flex flex-col items-end">
             <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-foreground">{submission.score || '--'}</span>
                <span className="text-muted-foreground text-xs font-bold">/ 100</span>
             </div>
             <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Final Mark</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Feedback & Prompt */}
        <div className="w-1/3 border-r border-border bg-card/30 flex flex-col overflow-y-auto no-scrollbar">
          <div className="p-8 space-y-10">
            
            {/* Feedback Section */}
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" /> Teacher Feedback
              </h3>
              <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <CheckCircle2 className="w-16 h-16" />
                  </div>
                  <p className="text-sm leading-relaxed text-foreground italic">
                    {submission.teacherFeedback || "No comments provided by instructor yet."}
                  </p>
              </div>
            </section>

            {/* Prompt View */}
            <section className="space-y-4">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-500" /> Instructions Review
              </h3>
              <div className="bg-muted/40 border border-border p-6 rounded-2xl">
                 <p className="text-sm text-foreground/70 leading-relaxed font-serif">
                   {submission.assignment.description || "Refer to the original instructions provided during the session."}
                 </p>
              </div>
            </section>
          </div>
        </div>

        {/* Right Panel: Code Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Editor Header / Files */}
          <div className="h-12 border-b border-border bg-card flex items-center px-4 gap-1 overflow-x-auto no-scrollbar">
             {submission.files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setActiveFile(file.fileName)}
                  className={`h-9 px-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest rounded-t-lg transition-all ${
                    activeFile === file.fileName 
                    ? 'bg-background text-primary border-t-2 border-primary shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  {file.fileName}
                </button>
             ))}
          </div>

          <div className="flex-1 relative">
            <Editor
              height="100%"
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              path={activeFile}
              defaultLanguage="javascript"
              value={activeContent}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                padding: { top: 20 }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetailView;
