import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { AlertOctagon, Send, Clock, ShieldAlert, Code2, Play, Terminal, MonitorPlay, FilePlus, X } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5001');

const StudentExamSandbox = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [question, setQuestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // --- MULTI-FILE STATE ---
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState('index.jsx');
  
  const defaultFiles = {
    'index.jsx': `import React from 'react';\nimport ReactDOM from 'react-dom/client';\n\nfunction App() {\n  return <h1>Hello World</h1>;\n}\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(<App />);`
  };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/assignments/${assignmentId}`);
        const activeExam = res.data.data;
        setExam(activeExam);
        
        if (activeExam.questions && activeExam.questions.length > 0) {
          const randomIndex = Math.floor(Math.random() * activeExam.questions.length);
          const selectedVariation = activeExam.questions[randomIndex];
          setQuestion(selectedVariation);
          
          if (selectedVariation.boilerplate) {
            setFiles({ 'index.jsx': selectedVariation.boilerplate });
          } else {
            setFiles(defaultFiles);
          }
        }
      } catch (err) {
        console.error("Failed to fetch assignment", err);
        navigate('/student/dashboard');
      }
    };
    fetchExam();
  }, [assignmentId, navigate]);

  // --- ANTI-CHEAT ENGINE ---
  useEffect(() => {
    if (!exam) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const alertData = {
          studentName: "Student_" + socket.id?.substring(0, 4), // Generic name for testing
          sectionId: exam.targetSection || "General",
          eventType: 'Tab Switched',
          timestamp: new Date().toLocaleTimeString(),
        };
        
        socket.emit('student_cheat_alert', alertData);
        setCheatLogs(prev => [...prev, alertData]);
        showWarning("WARNING: You left the exam tab. This action has been logged and sent to your teacher.");
      }
    };

    const preventDefaultAction = (e) => {
      e.preventDefault();
      let actionType = '';
      if (e.type === 'contextmenu') actionType = 'Right Click';
      if (e.type === 'paste') actionType = 'Paste';
      if (e.type === 'copy') actionType = 'Copy';
      if (e.type === 'cut') actionType = 'Cut';
      if (e.type === 'drop') actionType = 'Drag and Drop';

      if (actionType) {
        const alertData = {
          studentName: "Student_" + socket.id?.substring(0, 4),
          sectionId: exam.targetSection || "General",
          eventType: actionType,
          timestamp: new Date().toLocaleTimeString(),
        };

        socket.emit('student_cheat_alert', alertData);
        setCheatLogs(prev => [...prev, alertData]);
        showWarning(`WARNING: ${actionType} actions are completely disabled and reported.`);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Use capture phase (true) to intercept these BEFORE they reach Monaco Editor
    document.addEventListener("contextmenu", preventDefaultAction, true);
    document.addEventListener("copy", preventDefaultAction, true);
    document.addEventListener("paste", preventDefaultAction, true);
    document.addEventListener("cut", preventDefaultAction, true);
    document.addEventListener("drop", preventDefaultAction, true);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", preventDefaultAction, true);
      document.removeEventListener("copy", preventDefaultAction, true);
      document.removeEventListener("paste", preventDefaultAction, true);
      document.removeEventListener("cut", preventDefaultAction, true);
      document.removeEventListener("drop", preventDefaultAction, true);
    };
  }, [exam]);

  const showWarning = (msg) => {
    setWarningMessage(msg);
    setTimeout(() => setWarningMessage(null), 4000);
  };

  const handleEditorChange = (value) => {
    setFiles(prev => ({ ...prev, [activeFile]: value }));
  };

  const createNewFile = (e) => {
    e.preventDefault();
    if (!newFileName) return;
    
    // Ensure .jsx extension for simplicity
    let finalName = newFileName;
    if (!finalName.endsWith('.jsx') && !finalName.endsWith('.js')) {
      finalName += '.jsx';
    }

    if (files[finalName]) {
      alert("A file with this name already exists.");
      return;
    }

    setFiles(prev => ({ ...prev, [finalName]: '// Write your code here...' }));
    setActiveFile(finalName);
    setNewFileName('');
    setIsCreatingFile(false);
  };

  // --- MULTI-FILE REACT BUNDLER ---
  const runCode = () => {
    setCompileError('');
    try {
      const transpiledModules = {};
      
      // 1. Transpile every file in the 'files' state
      Object.keys(files).forEach((filename) => {
        const fileContent = files[filename];
        
        // We use Babel with CommonJS module transform so `import` becomes `require()`
        // This allows us to intercept requirements manually in the iframe.
        const transpiled = Babel.transform(fileContent, { 
          presets: ['react', 'env'] // 'env' handles ES6 module -> CommonJS transpilation
        }).code;
        
        // Strip the ./ from module paths for easier lookup 
        const moduleName = filename.replace(/\.(jsx?)$/, ''); // App.jsx -> App
        transpiledModules[moduleName] = transpiled;
      });

      // 2. Build the Fake CommonJS Environment for the iFrame
      // We stringify the transpiled modules map and inject a custom require() function
      const modulesInjection = JSON.stringify(transpiledModules);

      const iframeContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
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

              // Fake CommonJS Require Implementation
              function require(modulePath) {
                // Handle React core imports natively
                if (modulePath === 'react') return window.React;
                if (modulePath === 'react-dom/client' || modulePath === 'react-dom') return window.ReactDOM;
                
                // Clean the path (e.g., './Button.jsx' -> 'Button')
                let cleanPath = modulePath.replace(/^\\.\\//, '').replace(/\\.(jsx?)$/, '');
                
                // Return cached version if already executed
                if (moduleCache[cleanPath]) {
                  return moduleCache[cleanPath].exports;
                }

                // If module doesn't exist, throw error
                if (!modulesMap[cleanPath]) {
                  throw new Error("Cannot find module '" + modulePath + "'");
                }

                // Execute the module code
                const module = { exports: {} };
                moduleCache[cleanPath] = module;
                
                try {
                  // Wrap the transpiled code in a function to provide exports and require variables
                  const wrapper = new Function('exports', 'require', 'module', modulesMap[cleanPath]);
                  wrapper(module.exports, require, module);
                  return module.exports;
                } catch (e) {
                  throw new Error("Error executing module " + cleanPath + ": " + e.message);
                }
              }

              // Boot the application starting from index
              window.onload = () => {
                try {
                  require('index'); // Entry point must always be index.jsx
                } catch (err) {
                  document.body.innerHTML = '<div style="color: #ef4444; padding: 20px; font-family: monospace; background: #220000; border-radius: 8px;"><h3>Runtime Error</h3>' + err.toString() + '</div>';
                  console.error(err);
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
    // Prevent auto-running immediately on exact first mount with string literal default
    if (Object.keys(files).length > 0 && files['index.jsx'] && files['index.jsx'] !== '// Loading...') {
      const timer = setTimeout(() => runCode(), 500);
      return () => clearTimeout(timer);
    }
  }, [files]); // Re-run when files change. In a real app, you might only run on explicit "Run" button click to save CPU.

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const finalSubmission = {
        assignmentId: exam.id,
        questionId: question.id,
        files: files,
        cheatLogs: cheatLogs 
      };
      await axios.post('http://localhost:5001/api/submissions', finalSubmission);
      alert(`Successfully Submitted!\n\nViolations Logged: ${cheatLogs.length}`);
      navigate('/student/dashboard');
    } catch (err) {
      console.error("Submission failed", err);
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!exam || !question) {
    return <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white">Loading Security Environment...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#050507] overflow-hidden font-sans">
      
      {/* Warning Overlay */}
      <AnimatePresence>
        {warningMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600/90 text-white px-6 py-3 rounded-xl border border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center gap-3 font-semibold"
          >
            <AlertOctagon className="w-5 h-5 flex-shrink-0" />
            {warningMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <header className="h-16 border-b border-gray-800 bg-[#0a0a0c] flex items-center justify-between px-6 shrink-0 z-40">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wider rounded-md flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Proctored Session
          </div>
          <h1 className="text-white font-bold">{exam.title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={runCode}
            className="bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-5 rounded-lg transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4" /> Compile & Run
          </button>
          <div className="w-px h-8 bg-gray-800 mx-2" />
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </div>
      </header>

      {/* 3-Pane Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Pane 1: Instructions (25% width) */}
        <div className="w-1/4 min-w-[300px] border-r border-gray-800 bg-[#0a0a0c] overflow-y-auto flex flex-col relative z-20">
          <div className="p-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Instructions</h2>
            <div className="prose prose-invert prose-blue max-w-none text-gray-300">
              <p className="whitespace-pre-wrap leading-relaxed">{question.prompt}</p>
            </div>
          </div>
          
          <div className="mt-auto p-6">
            <div className="bg-[#111115] border border-gray-800 rounded-xl p-4">
               <h3 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                 <ShieldAlert className="w-4 h-4 text-orange-400" /> Exam Rules
               </h3>
               <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-4">
                 <li>Right-clicking is disabled.</li>
                 <li>Copying and pasting inside the editor is blocked.</li>
                 <li>Navigating away or switching tabs will be logged.</li>
               </ul>
               <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center">
                 <span className="text-xs text-gray-600 font-mono tracking-widest uppercase">Violations Logs</span>
                 <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${cheatLogs.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/10 text-green-500'}`}>
                   {cheatLogs.length}
                 </span>
               </div>
            </div>
          </div>
        </div>

        {/* Pane 2 & 3 Container */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Pane 2: Monaco Editor (60% height) */}
          <div className="h-[60%] border-b border-gray-800 relative group flex flex-col bg-[#050507]">
            {/* File Explorer Tab Bar */}
            <div className="h-10 bg-[#0a0a0c] border-b border-gray-800 flex items-center overflow-x-auto shrink-0">
               {Object.keys(files).map((filename) => (
                 <button
                   key={filename}
                   onClick={() => setActiveFile(filename)}
                   className={`h-full px-4 flex items-center gap-2 text-xs font-mono border-r border-gray-800 transition-colors shrink-0 ${
                     activeFile === filename ? 'bg-[#111115] text-white border-t-2 border-t-blue-500' : 'text-gray-500 hover:text-gray-300 hover:bg-[#111115]/50 border-t-2 border-t-transparent'
                   }`}
                 >
                   <Code2 className={`w-3.5 h-3.5 ${activeFile === filename ? 'text-blue-400' : 'text-gray-600'}`} />
                   {filename}
                 </button>
               ))}
               
               {isCreatingFile ? (
                 <form onSubmit={createNewFile} className="flex items-center px-2 h-full border-r border-gray-800">
                    <input 
                      autoFocus
                      type="text" 
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      onBlur={() => { if(!newFileName) setIsCreatingFile(false) }}
                      placeholder="Component.jsx"
                      className="bg-[#111115] border border-gray-800 rounded text-xs px-2 py-1 text-white font-mono w-32 focus:outline-none focus:border-blue-500"
                    />
                 </form>
               ) : (
                 <button 
                  onClick={() => setIsCreatingFile(true)}
                  className="h-full px-3 flex items-center text-gray-500 hover:text-white transition-colors border-r border-gray-800 shrink-0"
                 >
                   <FilePlus className="w-4 h-4" />
                 </button>
               )}
            </div>

            <div className="flex-1 relative">
              <div className="absolute inset-0 pointer-events-none border-[2px] border-transparent group-focus-within:border-blue-500/20 transition-colors z-10" />
              <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={files[activeFile]} // Bind to active file
                onChange={handleEditorChange} // Update active file in dict
                onMount={(editor) => editorRef.current = editor}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  wordWrap: 'on',
                  padding: { top: 16, bottom: 16 },
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                  contextmenu: false,
                  scrollbar: { verticalScrollbarSize: 8 }
                }}
                className="z-0"
              />
            </div>
          </div>

          {/* Pane 3: Code Output & Console (40% height) */}
          <div className="h-[40%] bg-[#0a0a0c] flex flex-col relative shrink-0">
            <div className="h-10 bg-[#111115] border-b border-gray-800 flex items-center px-4 justify-between shrink-0">
               <div className="flex items-center">
                 <MonitorPlay className="w-4 h-4 text-green-400 mr-2" />
                 <span className="text-xs font-mono text-gray-300">Live Preview Output</span>
               </div>
               {compileError && (
                 <span className="text-xs font-mono text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 truncate max-w-md">
                   Compilation Error
                 </span>
               )}
            </div>
            
            <div className="flex-1 relative bg-[#050507]">
              {compileError ? (
                // Display Babel Syntax Errors
                <div className="absolute inset-0 p-4 overflow-auto">
                  <div className="bg-[#220000] border border-red-500/30 rounded-lg p-4 font-mono text-red-400 text-sm whitespace-pre-wrap">
                    <div className="flex items-center gap-2 mb-2 text-red-500 font-bold border-b border-red-500/30 pb-2">
                      <Terminal className="w-4 h-4" /> Build Failed during Babel Transpilation
                    </div>
                    {compileError}
                  </div>
                </div>
              ) : (
                // Display React Output
                <iframe
                  ref={iframeRef}
                  title="component-preview"
                  sandbox="allow-scripts" 
                  className="w-full h-full border-none bg-transparent"
                />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentExamSandbox;
