import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../context/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as Babel from '@babel/standalone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, AlertOctagon, Clock, User, FileCode, Play, 
  Send, ChevronLeft, ShieldAlert, MonitorPlay, Code2, Terminal
} from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api`;

const SubmissionReviewer = () => {
  const { theme } = useTheme();
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState('');
  const [compileError, setCompileError] = useState('');
  const [grade, setGrade] = useState({ score: '', feedback: '' });
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // --- EVIDENCE VIEWER STATE ---
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  const iframeRef = useRef(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await axios.get(`${API_BASE}/submissions/${submissionId}`);
        
        const data = res.data.data;
        setSubmission(data);
        
        // Convert submission files array to our internal files object
        const fileObj = {};
        data.files.forEach(f => {
          fileObj[f.fileName] = f.code;
        });
        
        setFiles(fileObj);
        setActiveFile(data.files[0]?.fileName || 'index.jsx');
        setGrade({ score: data.score || '', feedback: '' });
        
      } catch (error) {
        console.error("Failed to load submission", error);
      }
    };
    fetchSubmission();
  }, [submissionId]);

  // --- MULTI-FILE REACT BUNDLER (Shared Logic) ---
  const runCode = () => {
    if (Object.keys(files).length === 0) return;
    setCompileError('');
    
    try {
      const transpiledModules = {};
      
      Object.keys(files).forEach((filename) => {
        const fileContent = files[filename];
        const transpiled = Babel.transform(fileContent, { 
          presets: ['react', 'env'] 
        }).code;
        
        const moduleName = filename.replace(/\.(jsx?)$/, '');
        transpiledModules[moduleName] = transpiled;
      });

      const modulesInjection = JSON.stringify(transpiledModules);

      const iframeContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { margin: 0; background-color: ${theme === 'dark' ? '#0a0a0c' : '#ffffff'}; color: ${theme === 'dark' ? 'white' : 'black'}; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; }
              #root { width: 100%; max-width: 800px; padding: 20px; box-sizing: border-box; }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script>
              const modulesMap = ${modulesInjection};
              const moduleCache = {};

              function require(modulePath) {
                if (modulePath === 'react') return window.React;
                if (modulePath === 'react-dom/client' || modulePath === 'react-dom') return window.ReactDOM;
                let cleanPath = modulePath.replace(/^\\.\\//, '').replace(/\\.(jsx?)$/, '');
                if (moduleCache[cleanPath]) return moduleCache[cleanPath].exports;
                if (!modulesMap[cleanPath]) throw new Error("Cannot find module '" + modulePath + "'");
                
                const module = { exports: {} };
                moduleCache[cleanPath] = module;
                try {
                  const wrapper = new Function('exports', 'require', 'module', modulesMap[cleanPath]);
                  wrapper(module.exports, require, module);
                  return module.exports;
                } catch (e) {
                  throw new Error("Error executing module " + cleanPath + ": " + e.message);
                }
              }

              window.onload = () => {
                try {
                  require('index');
                } catch (err) {
                  document.body.innerHTML = '<div style="color: #ef4444; padding: 20px; font-family: monospace; background: ' + (theme === 'dark' ? '#220000' : '#fee2e2') + '; border-radius: 8px;"><h3>Runtime Error</h3>' + err.toString() + '</div>';
                }
              };
            </script>
          </body>
        </html>
      `;

      if (iframeRef.current) {
        iframeRef.current.srcdoc = iframeContent;
      }
    } catch (err) {
      setCompileError(err.toString());
    }
  };

  useEffect(() => {
    if (Object.keys(files).length > 0) {
      const timer = setTimeout(() => runCode(), 500);
      return () => clearTimeout(timer);
    }
  }, [files]);

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingGrade(true);
    try {
      await axios.put(`${API_BASE}/submissions/${submissionId}/grade`, grade);
      alert('Assessment graded successfully!');
    } catch (error) {
      console.error("Failed to save grade", error);
      alert('Failed to save grade. Please check the console.');
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  const evidenceModal = (
    <AnimatePresence>
      {selectedEvidence && (
        <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={() => setSelectedEvidence(null)}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="relative max-w-5xl w-full bg-card border border-border rounded-2xl overflow-hidden shadow-2xl z-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card">
              <h3 className="text-foreground font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" /> Evidence Capture
              </h3>
              <button onClick={() => setSelectedEvidence(null)} className="text-muted-foreground hover:text-foreground transition-colors text-sm px-3 py-1 bg-muted rounded-md shadow-sm font-bold uppercase tracking-widest text-[10px]">Close</button>
            </div>
            <div className="p-4 bg-background flex justify-center items-center">
              <img src={selectedEvidence} alt="Cheat Evidence" className="max-w-full max-h-[70vh] rounded-lg border border-border shadow-2xl" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!submission) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-mono">RETRIEVING ARTIFACTS...</div>;

  return (
    <>
      <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
        
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-foreground font-bold leading-tight">Review: {submission.student.name}</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{submission.assignment.title}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 border border-border rounded-lg">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-mono">
                {new Date(submission.submittedAt).toLocaleString()}
              </span>
            </div>
            <button 
              onClick={runCode}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-6 rounded-lg transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Re-Run Build
            </button>
          </div>
        </header>

        {/* Main Container */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Side: Intel & Code (50%) */}
          <div className="w-1/2 border-r border-border flex flex-col bg-background overflow-hidden text-foreground">
            
            {/* Integrity Report (Top) */}
            <div className="p-6 border-b border-border shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Integrity Report</h2>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${submission.cheatLogs.length === 0 ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {submission.cheatLogs.length === 0 ? <CheckCircle className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                    {submission.cheatLogs.length} Violations
                  </div>
              </div>
              
              <div className="max-h-32 overflow-y-auto space-y-2 pr-2 no-scrollbar">
                  {submission.cheatLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border italic">
                      The student maintained full focus within the sandbox throughout the session.
                    </p>
                  ) : (
                    submission.cheatLogs.map((log, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-red-500/5 border border-red-500/10 rounded-lg text-xs group">
                        <div className="flex flex-col gap-1">
                          <span className="text-red-400 font-medium">{log.eventType}</span>
                          {log.screenshot && (
                            <button 
                              type="button"
                              onClick={() => setSelectedEvidence(log.screenshot)} 
                              className="text-[10px] text-blue-400 font-mono hover:text-blue-300 w-fit flex items-center gap-1 bg-blue-500/10 px-1.5 py-0.5 rounded transition-colors"
                            >
                              📸 View Proof
                            </button>
                          )}
                        </div>
                        <span className="text-muted-foreground/60 font-mono">{new Date(log.eventTimestamp || log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
              </div>
            </div>

            {/* Code Viewer (Middle) */}
            <div className="flex-1 flex flex-col overflow-hidden bg-card">
              {/* Simple Tab Bar */}
              <div className="h-10 bg-background border-b border-border flex items-center overflow-x-auto no-scrollbar">
                  {Object.keys(files).map(filename => (
                    <button
                      key={filename}
                      onClick={() => setActiveFile(filename)}
                      className={`h-full px-4 flex items-center gap-2 text-xs font-mono border-r border-border transition-colors shrink-0 ${
                        activeFile === filename ? 'bg-card text-foreground border-t-2 border-t-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      {filename}
                    </button>
                  ))}
              </div>
              <pre className="flex-1 p-6 overflow-auto font-mono text-sm text-foreground/70 leading-relaxed bg-card no-scrollbar">
                <code>{files[activeFile]}</code>
              </pre>
            </div>

            {/* Evaluation Form (Bottom) */}
            <div className="p-6 bg-card border-t border-border shrink-0 shadow-2xl">
              <form onSubmit={handleGradeSubmit} className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Final Score (0-100)</label>
                        <input 
                          type="number"
                          max="100" min="0"
                          required
                          value={grade.score}
                          onChange={(e) => setGrade({...grade, score: e.target.value})}
                          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground font-bold focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30 shadow-sm"
                          placeholder="--"
                        />
                    </div>
                    <div className="flex-[2]">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Comments / Feedback</label>
                        <input 
                          type="text"
                          value={grade.feedback}
                          onChange={(e) => setGrade({...grade, feedback: e.target.value})}
                          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30 shadow-sm"
                          placeholder="Structure is clean. Good use of props."
                        />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmittingGrade}
                    className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    <Send className="w-4 h-4" /> 
                    {isSubmittingGrade ? 'UPLOADING...' : 'SUBMIT EVALUATION'}
                  </button>
              </form>
            </div>

          </div>

          {/* Right Side: Live Renders (50%) */}
          <div className="w-1/2 bg-background flex flex-col overflow-hidden relative">
            <div className="h-10 bg-card border-b border-border flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <MonitorPlay className="w-4 h-4 text-green-500" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Artifact Render</span>
                </div>
                {compileError && (
                  <span className="text-[10px] font-mono text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 animate-pulse">
                    BUILD_ERROR
                  </span>
                )}
            </div>

            <div className="flex-1 relative bg-background">
                {compileError ? (
                  <div className="absolute inset-0 p-8 flex items-center justify-center">
                    <div className="w-full max-w-lg bg-red-500/5 border border-red-500/20 rounded-2xl p-6 font-mono">
                        <div className="flex items-center gap-2 text-red-600 font-bold mb-4 border-b border-red-500/20 pb-3">
                          <Terminal className="w-4 h-4" /> BUNDLE_FAILURE_LOG
                        </div>
                        <p className="text-red-500 text-sm leading-relaxed">{compileError}</p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    ref={iframeRef}
                    title="submission-preview"
                    sandbox="allow-scripts"
                    className="w-full h-full border-none bg-transparent"
                  />
                )}
            </div>
          </div>

        </div>

      </div>
      {createPortal(evidenceModal, document.body)}
    </>
  );
};

export default SubmissionReviewer;
