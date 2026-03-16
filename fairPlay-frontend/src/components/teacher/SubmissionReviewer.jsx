import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as Babel from '@babel/standalone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, AlertOctagon, Clock, User, FileCode, Play, 
  Send, ChevronLeft, ShieldAlert, MonitorPlay, Code2, Terminal
} from 'lucide-react';

const API_BASE = 'http://localhost:5001/api';

const SubmissionReviewer = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState('');
  const [compileError, setCompileError] = useState('');
  const [grade, setGrade] = useState({ score: '', feedback: '' });
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  const [loading, setLoading] = useState(true);
  
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
              body { margin: 0; background-color: #0a0a0c; color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; }
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
                  document.body.innerHTML = '<div style="color: #ef4444; padding: 20px; font-family: monospace; background: #220000; border-radius: 8px;"><h3>Runtime Error</h3>' + err.toString() + '</div>';
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

  if (!submission) return <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white font-mono">RETRIEVING ARTIFACTS...</div>;

  return (
    <div className="flex flex-col h-screen bg-[#050507] overflow-hidden font-sans">
      
      {/* Header */}
      <header className="h-16 border-b border-gray-800 bg-[#0a0a0c] flex items-center justify-between px-6 shrink-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-white font-bold leading-tight">Review: {submission.student.name}</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{submission.assignment.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111115] border border-gray-800 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-400 font-mono">
              {new Date(submission.submittedAt).toLocaleString()}
            </span>
          </div>
          <button 
            onClick={runCode}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4" /> Re-Run Build
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Intel & Code (50%) */}
        <div className="w-1/2 border-r border-gray-800 flex flex-col bg-[#050507] overflow-hidden">
          
          {/* Integrity Report (Top) */}
          <div className="p-6 border-b border-gray-800 shrink-0">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Integrity Report</h2>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${submission.cheatLogs.length === 0 ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                   {submission.cheatLogs.length === 0 ? <CheckCircle className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                   {submission.cheatLogs.length} Violations
                </div>
             </div>
             
             <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {submission.cheatLogs.length === 0 ? (
                  <p className="text-sm text-gray-400 bg-gray-900/50 p-3 rounded-lg border border-gray-800/50 italic">
                    The student maintained full focus within the sandbox throughout the session.
                  </p>
                ) : (
                  submission.cheatLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-red-500/5 border border-red-500/10 rounded-lg text-xs">
                      <span className="text-red-400 font-medium">{log.eventType}</span>
                      <span className="text-gray-600 font-mono">{new Date(log.eventTimestamp || log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))
                )}
             </div>
          </div>

          {/* Code Viewer (Middle) */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0c]">
             {/* Simple Tab Bar */}
             <div className="h-10 bg-[#050507] border-b border-gray-800 flex items-center overflow-x-auto no-scrollbar">
                {Object.keys(files).map(filename => (
                  <button
                    key={filename}
                    onClick={() => setActiveFile(filename)}
                    className={`h-full px-4 flex items-center gap-2 text-xs font-mono border-r border-gray-800 transition-colors shrink-0 ${
                      activeFile === filename ? 'bg-[#0a0a0c] text-white border-t-2 border-t-blue-500' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    {filename}
                  </button>
                ))}
             </div>
             <pre className="flex-1 p-6 overflow-auto font-mono text-sm text-gray-400 leading-relaxed bg-[#0a0a0c] custom-scrollbar">
               <code>{files[activeFile]}</code>
             </pre>
          </div>

          {/* Evaluation Form (Bottom) */}
          <div className="p-6 bg-[#0a0a0c] border-t border-gray-800 shrink-0 shadow-2xl">
             <form onSubmit={handleGradeSubmit} className="space-y-4">
                <div className="flex gap-4">
                   <div className="flex-1">
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 ml-1">Final Score (0-100)</label>
                      <input 
                         type="number"
                         max="100" min="0"
                         required
                         value={grade.score}
                         onChange={(e) => setGrade({...grade, score: e.target.value})}
                         className="w-full bg-[#111115] border border-gray-800 rounded-xl px-4 py-2.5 text-white font-bold focus:border-blue-500 outline-none transition-all placeholder:text-gray-700"
                         placeholder="--"
                      />
                   </div>
                   <div className="flex-[2]">
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 ml-1">Comments / Feedback</label>
                      <input 
                         type="text"
                         value={grade.feedback}
                         onChange={(e) => setGrade({...grade, feedback: e.target.value})}
                         className="w-full bg-[#111115] border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all placeholder:text-gray-700"
                         placeholder="Structure is clean. Good use of props."
                      />
                   </div>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmittingGrade}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                >
                  <Send className="w-4 h-4" /> 
                  {isSubmittingGrade ? 'UPLOADING...' : 'SUBMIT EVALUATION'}
                </button>
             </form>
          </div>

        </div>

        {/* Right Side: Live Renders (50%) */}
        <div className="w-1/2 bg-black flex flex-col overflow-hidden relative">
           <div className="h-10 bg-[#0a0a0c] border-b border-gray-800 flex items-center px-4 justify-between shrink-0">
               <div className="flex items-center gap-2">
                 <MonitorPlay className="w-4 h-4 text-green-400" />
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Artifact Render</span>
               </div>
               {compileError && (
                 <span className="text-[10px] font-mono text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-500/20 animate-pulse">
                   BUILD_ERROR
                 </span>
               )}
           </div>

           <div className="flex-1 relative bg-[#050507]">
              {compileError ? (
                <div className="absolute inset-0 p-8 flex items-center justify-center">
                   <div className="w-full max-w-lg bg-[#220000] border border-red-500/30 rounded-2xl p-6 font-mono">
                      <div className="flex items-center gap-2 text-red-500 font-bold mb-4 border-b border-red-500/20 pb-3">
                        <Terminal className="w-4 h-4" /> BUNDLE_FAILURE_LOG
                      </div>
                      <p className="text-red-400 text-sm leading-relaxed">{compileError}</p>
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
  );
};

export default SubmissionReviewer;
