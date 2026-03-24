import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { AlertOctagon, Send, Clock, ShieldAlert, Code2, Play, Terminal, MonitorPlay, FilePlus, X } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

import { useAuth } from '../context/AuthContext';

const socket = io(`${import.meta.env.VITE_API_BASE_URL}`);

const StudentExamSandbox = () => {
  const { user } = useAuth();
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const editorRef = useRef(null);
  
  const [exam, setExam] = useState(null);
  const [question, setQuestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [warningMessage, setWarningMessage] = useState(null);
  const [cheatLogs, setCheatLogs] = useState([]);
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [compileError, setCompileError] = useState('');
  
  // --- MULTI-FILE STATE ---
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState('index.jsx');
  const [savedStatus, setSavedStatus] = useState(''); // '', 'saving', 'saved'

  const defaultFiles = {
    'index.jsx': `import React from 'react';\nimport ReactDOM from 'react-dom/client';\n\nfunction App() {\n  return <h1>Hello World</h1>;\n}\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(<App />);`
  };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/assignments/${assignmentId}`);
        const activeExam = res.data.data;
        setExam(activeExam);
        
        if (activeExam.questions && activeExam.questions.length > 0) {
          // DISTRIBUTION LOGIC: Deterministic Set Assignment
          // Uses student Roll Number to strictly alternate variations for adjacent seating.
          let hash = user.id;
          if (user.rollNumber) {
            const digits = String(user.rollNumber).match(/\\d+/g);
            if (digits) hash = parseInt(digits.join(''), 10);
            else hash = String(user.rollNumber).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          }
          const setIndex = (hash + activeExam.id) % activeExam.questions.length;
          const selectedVariation = activeExam.questions[setIndex];
          setQuestion(selectedVariation);

          // We also store a 'Label' for the Heat Map (e.g. SET A, SET B)
          activeExam.assignedSetLabel = String.fromCharCode(65 + setIndex); // 0->A, 1->B...

          // --- RESTORE from localStorage if available ---
          const storageKey = `fairplay_exam_${assignmentId}`;
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed.files && Object.keys(parsed.files).length > 0) {
                setFiles(parsed.files);
                setActiveFile(parsed.activeFile || 'index.jsx');
                setSavedStatus('saved');
                return; // Skip boilerplate — restore from save
              }
            } catch (_) { /* corrupt data, fall through */ }
          }

          // No saved state — use boilerplate or default
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
    if (exam && user) {
      // Notify monitor room that student is in the exam
      socket.emit('join_exam', {
        assignmentId: exam.id,
        studentId: user.id,
        studentName: user.name,
        rollNumber: user.rollNumber || 'N/A'
      });
    }

    const handleVisibilityChange = () => {
      const isHidden = document.hidden;
      const status = isHidden ? 'FLAGGED' : 'ACTIVE';
      
      if (isHidden) {
        const alertData = {
          studentId: user?.id,
          studentName: user?.name || "Unknown Student",
          sectionId: exam.section?.name || "General",
          assignmentId: exam.id,
          eventType: 'Tab Switched',
          timestamp: new Date().toLocaleTimeString(),
        };
        
        socket.emit('student_cheat_alert', alertData);
        setCheatLogs(prev => [...prev, alertData]);
        showWarning("WARNING: You left the exam tab. This action has been logged.");
      }

      // Update live status on heat map
      socket.emit('student_progress_update', {
        assignmentId: exam.id,
        studentId: user?.id,
        tabStatus: status,
        currentQuestion: question?.id
      });
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
          studentId: user?.id,
          studentName: user?.name || "Unknown Student",
          sectionId: exam.section?.name || "General",
          assignmentId: exam.id,
          eventType: actionType,
          timestamp: new Date().toLocaleTimeString(),
        };

        socket.emit('student_cheat_alert', alertData);
        setCheatLogs(prev => [...prev, alertData]);
        showWarning(`WARNING: ${actionType} reported.`);
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
      if (exam && user) {
        socket.emit('student_status_update', {
          assignmentId: exam.id,
          studentId: user.id,
          studentName: user.name,
          rollNumber: user.rollNumber || 'N/A',
          status: 'IDLE',
          timestamp: new Date().toLocaleTimeString()
        });
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", preventDefaultAction, true);
      document.removeEventListener("copy", preventDefaultAction, true);
      document.removeEventListener("paste", preventDefaultAction, true);
      document.removeEventListener("cut", preventDefaultAction, true);
      document.removeEventListener("drop", preventDefaultAction, true);
    };
  }, [exam, user]);

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
      // Safely encode file contents to avoid </script> injection issues
      const filesJson = JSON.stringify(files)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e');

      const iframeContent = `<!DOCTYPE html>
<html>
<head>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  <style>
    body { margin:0; background:#0a0a0c; color:white; font-family:sans-serif; padding:20px; box-sizing:border-box; }
    #root { max-width:800px; margin:0 auto; }
    .err { color:#ef4444; font-family:monospace; background:#220000; padding:20px; border-radius:8px; white-space:pre-wrap; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    var filesMap = ${filesJson};
    var moduleCache = {};

    function requireModule(modulePath) {
      if (modulePath === 'react') return window.React;
      if (modulePath === 'react-dom/client' || modulePath === 'react-dom') return window.ReactDOM;

      // Strip leading ./ and extension to get clean key
      var cleanPath = modulePath.replace(/^\\.\\//, '').replace(/\\.(jsx?)$/, '');

      if (moduleCache[cleanPath]) return moduleCache[cleanPath].exports;

      var source = filesMap[cleanPath + '.jsx'] || filesMap[cleanPath + '.js'] || filesMap[cleanPath];
      if (!source) throw new Error("Cannot find module '" + modulePath + "'");

      var transpiled;
      try {
        transpiled = Babel.transform(source, {
          filename: cleanPath + '.jsx',
          presets: [
            ['react'],
            ['env', { modules: 'commonjs', targets: { browsers: ['last 1 Chrome version'] } }]
          ]
        }).code;
      } catch(e) {
        throw new Error("Babel error in " + cleanPath + ": " + e.message);
      }

      var mod = { exports: {} };
      moduleCache[cleanPath] = mod;
      (new Function('exports', 'require', 'module', transpiled))(mod.exports, requireModule, mod);
      return mod.exports;
    }

    window.addEventListener('load', function() {
      try {
        requireModule('index');
      } catch(err) {
        document.getElementById('root').innerHTML =
          '<div class="err"><strong>⚠ Error</strong>\\n' + err.message + '</div>';
      }
    });
  <\/script>
</body>
</html>`;

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
  }, [files]);

  // --- AUTO-SAVE to localStorage (debounced 1s) ---
  useEffect(() => {
    if (Object.keys(files).length === 0) return;
    setSavedStatus('saving');
    const timer = setTimeout(() => {
      try {
        const storageKey = `fairplay_exam_${assignmentId}`;
        localStorage.setItem(storageKey, JSON.stringify({ files, activeFile }));
        setSavedStatus('saved');
      } catch (_) { setSavedStatus(''); }
    }, 1000);
    return () => clearTimeout(timer);
  }, [files, activeFile, assignmentId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const finalSubmission = {
        assignmentId: exam.id,
        questionId: question.id,
        files: files,
        cheatLogs: cheatLogs 
      };
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/submissions`, finalSubmission);
      
      // Notify teacher immediately that student has submitted
      socket.emit('student_status_update', {
        assignmentId: exam.id,
        studentId: user.id,
        studentName: user.name,
        rollNumber: user.rollNumber || 'N/A',
        status: 'SUBMITTED',
        timestamp: new Date().toLocaleTimeString()
      });

      // Clear the autosave for this exam on successful submit
      localStorage.removeItem(`fairplay_exam_${assignmentId}`);
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

        {/* Autosave indicator */}
        <div className="flex items-center gap-2 text-xs font-medium">
          {savedStatus === 'saving' && (
            <span className="text-gray-400 flex items-center gap-1.5">
              <div className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin" />
              Saving…
            </span>
          )}
          {savedStatus === 'saved' && (
            <span className="text-green-500 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Draft saved locally
            </span>
          )}
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
                onMount={(editor, monaco) => {
                  editorRef.current = editor;

                  // --- REACT SNIPPETS (VS Code-style) ---
                  const snippets = [
                    {
                      label: 'rafce',
                      detail: 'React Arrow Function Component Export',
                      insertText: [
                        "import React from 'react';",
                        '',
                        'const ${1:${TM_FILENAME_BASE}} = () => {',
                        '  return (',
                        '    <div>',
                        '      ${2:}',
                        '    </div>',
                        '  );',
                        '};',
                        '',
                        'export default ${1:${TM_FILENAME_BASE}};',
                      ].join('\n'),
                    },
                    {
                      label: 'rafc',
                      detail: 'React Arrow Function Component',
                      insertText: [
                        "import React from 'react';",
                        '',
                        'const ${1:${TM_FILENAME_BASE}} = () => {',
                        '  return (',
                        '    <div>',
                        '      ${2:}',
                        '    </div>',
                        '  );',
                        '};',
                      ].join('\n'),
                    },
                    {
                      label: 'rfc',
                      detail: 'React Functional Component',
                      insertText: [
                        "import React from 'react';",
                        '',
                        'function ${1:${TM_FILENAME_BASE}}() {',
                        '  return (',
                        '    <div>',
                        '      ${2:}',
                        '    </div>',
                        '  );',
                        '}',
                        '',
                        'export default ${1:${TM_FILENAME_BASE}};',
                      ].join('\n'),
                    },
                    {
                      label: 'useState',
                      detail: 'React useState hook',
                      insertText: "const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:initialValue});",
                    },
                    {
                      label: 'useEffect',
                      detail: 'React useEffect hook',
                      insertText: [
                        'useEffect(() => {',
                        '  ${1:}',
                        '}, [${2:}]);',
                      ].join('\n'),
                    },
                    {
                      label: 'useRef',
                      detail: 'React useRef hook',
                      insertText: 'const ${1:ref} = useRef(${2:null});',
                    },
                    {
                      label: 'imr',
                      detail: "import React from 'react'",
                      insertText: "import React from 'react';",
                    },
                    {
                      label: 'imrd',
                      detail: "import ReactDOM from 'react-dom/client'",
                      insertText: "import ReactDOM from 'react-dom/client';",
                    },
                  ];

                  monaco.languages.registerCompletionItemProvider('javascript', {
                    provideCompletionItems: (model, position) => {
                      const word = model.getWordUntilPosition(position);
                      const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn,
                      };
                      return {
                        suggestions: snippets.map(s => ({
                          label: s.label,
                          kind: monaco.languages.CompletionItemKind.Snippet,
                          detail: s.detail,
                          insertText: s.insertText,
                          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                          range,
                          sortText: '0' + s.label, // float snippets to top
                        })),
                      };
                    },
                  });

                  // --- HTML / JSX TAG SNIPPETS ---
                  const htmlTags = [
                    ['div', 'div', '<div className="${1:}">\n  ${2:}\n</div>'],
                    ['span', 'span', '<span className="${1:}">${2:}</span>'],
                    ['p', 'p', '<p className="${1:}">${2:}</p>'],
                    ['h1', 'h1', '<h1 className="${1:}">${2:}</h1>'],
                    ['h2', 'h2', '<h2 className="${1:}">${2:}</h2>'],
                    ['h3', 'h3', '<h3 className="${1:}">${2:}</h3>'],
                    ['button', 'button', '<button className="${1:}" onClick={${2:() => {}}}>\n  ${3:Click me}\n</button>'],
                    ['input', 'input', '<input type="${1:text}" className="${2:}" placeholder="${3:}" value={${4:}} onChange={${5:(e) => {}}} />'],
                    ['img', 'img', '<img src="${1:}" alt="${2:}" className="${3:}" />'],
                    ['a', 'a (anchor)', '<a href="${1:#}" className="${2:}">${3:Link}</a>'],
                    ['ul', 'ul', '<ul className="${1:}">\n  <li>${2:}</li>\n</ul>'],
                    ['li', 'li', '<li className="${1:}">${2:}</li>'],
                    ['form', 'form', '<form className="${1:}" onSubmit={${2:(e) => { e.preventDefault(); }}}>\n  ${3:}\n</form>'],
                    ['label', 'label', '<label htmlFor="${1:}" className="${2:}">${3:}</label>'],
                    ['nav', 'nav', '<nav className="${1:}">\n  ${2:}\n</nav>'],
                    ['section', 'section', '<section className="${1:}">\n  ${2:}\n</section>'],
                    ['header', 'header', '<header className="${1:}">\n  ${2:}\n</header>'],
                    ['footer', 'footer', '<footer className="${1:}">\n  ${2:}\n</footer>'],
                    ['main', 'main', '<main className="${1:}">\n  ${2:}\n</main>'],
                    ['table', 'table', '<table className="${1:}">\n  <thead><tr><th>${2:Header}</th></tr></thead>\n  <tbody><tr><td>${3:Cell}</td></tr></tbody>\n</table>'],
                    ['select', 'select', '<select className="${1:}" value={${2:}} onChange={${3:(e) => {}}}>\n  <option value="${4:}">${5:Option}</option>\n</select>'],
                    ['textarea', 'textarea', '<textarea className="${1:}" value={${2:}} onChange={${3:(e) => {}}} rows={${4:4}} />'],
                  ];

                  monaco.languages.registerCompletionItemProvider('javascript', {
                    triggerCharacters: ['<'],
                    provideCompletionItems: (model, position) => {
                      const lineContent = model.getLineContent(position.lineNumber);
                      const prefix = lineContent.substring(0, position.column - 1);
                      const tagMatch = prefix.match(/<([a-z]*)$/);
                      if (!tagMatch) return { suggestions: [] };
                      const typedTag = tagMatch[1];
                      const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: position.column - typedTag.length,
                        endColumn: position.column,
                      };
                      return {
                        suggestions: htmlTags
                          .filter(([tag]) => tag.startsWith(typedTag))
                          .map(([tag, detail, insertText]) => ({
                            label: tag,
                            kind: monaco.languages.CompletionItemKind.Property,
                            detail: `<${detail}>`,
                            insertText,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            range,
                          })),
                      };
                    },
                  });

                  // --- TAILWIND CSS CLASS SUGGESTIONS ---
                  const twClasses = [
                    // Layout
                    'flex','inline-flex','grid','block','inline-block','hidden',
                    'flex-row','flex-col','flex-wrap','flex-nowrap',
                    'items-start','items-center','items-end','items-stretch',
                    'justify-start','justify-center','justify-end','justify-between','justify-around','justify-evenly',
                    'gap-1','gap-2','gap-3','gap-4','gap-6','gap-8',
                    'grid-cols-1','grid-cols-2','grid-cols-3','grid-cols-4','grid-cols-6','grid-cols-12',
                    // Spacing
                    'p-1','p-2','p-3','p-4','p-5','p-6','p-8','p-10','p-12',
                    'px-2','px-4','px-6','px-8','py-1','py-2','py-3','py-4','py-6','py-8',
                    'm-1','m-2','m-4','m-auto','mx-auto','mx-4','my-4','mt-2','mt-4','mt-8','mb-2','mb-4','mb-8',
                    // Sizing
                    'w-full','w-screen','w-1/2','w-1/3','w-1/4','w-2/3','w-3/4',
                    'w-4','w-6','w-8','w-10','w-12','w-16','w-20','w-24','w-32','w-48','w-64',
                    'h-full','h-screen','h-auto','h-4','h-6','h-8','h-10','h-12','h-16','h-20','h-24','h-32','h-48','h-64',
                    'max-w-xs','max-w-sm','max-w-md','max-w-lg','max-w-xl','max-w-2xl','max-w-full',
                    'min-h-screen','min-h-full',
                    // Typography
                    'text-xs','text-sm','text-base','text-lg','text-xl','text-2xl','text-3xl','text-4xl','text-5xl',
                    'font-thin','font-light','font-normal','font-medium','font-semibold','font-bold','font-extrabold',
                    'text-left','text-center','text-right','text-justify',
                    'leading-tight','leading-snug','leading-normal','leading-relaxed','leading-loose',
                    'tracking-tight','tracking-normal','tracking-wide','tracking-wider','tracking-widest',
                    'uppercase','lowercase','capitalize','normal-case',
                    'truncate','line-clamp-2','line-clamp-3',
                    // Colors (text)
                    'text-white','text-black','text-gray-100','text-gray-200','text-gray-300','text-gray-400','text-gray-500','text-gray-600','text-gray-700','text-gray-900',
                    'text-red-400','text-red-500','text-red-600',
                    'text-blue-400','text-blue-500','text-blue-600',
                    'text-green-400','text-green-500','text-green-600',
                    'text-yellow-400','text-yellow-500',
                    'text-purple-400','text-purple-500',
                    'text-orange-400','text-orange-500',
                    'text-indigo-400','text-indigo-500',
                    // Colors (bg)
                    'bg-white','bg-black','bg-transparent',
                    'bg-gray-50','bg-gray-100','bg-gray-200','bg-gray-700','bg-gray-800','bg-gray-900',
                    'bg-blue-500','bg-blue-600','bg-blue-700',
                    'bg-green-500','bg-green-600',
                    'bg-red-500','bg-red-600',
                    'bg-purple-500','bg-purple-600',
                    'bg-indigo-500','bg-indigo-600',
                    'bg-yellow-400','bg-yellow-500',
                    'bg-orange-500',
                    // Borders
                    'border','border-0','border-2','border-4',
                    'border-gray-200','border-gray-300','border-gray-700','border-gray-800',
                    'border-blue-500','border-red-500','border-green-500',
                    'rounded','rounded-sm','rounded-md','rounded-lg','rounded-xl','rounded-2xl','rounded-3xl','rounded-full',
                    // Shadows
                    'shadow-sm','shadow','shadow-md','shadow-lg','shadow-xl','shadow-2xl','shadow-none',
                    // Transitions / Animation
                    'transition','transition-all','transition-colors','transition-opacity','transition-transform',
                    'duration-150','duration-200','duration-300','duration-500',
                    'ease-in','ease-out','ease-in-out',
                    'animate-spin','animate-pulse','animate-bounce',
                    'hover:opacity-80','hover:scale-105','hover:bg-blue-600','hover:text-white',
                    // Positioning
                    'relative','absolute','fixed','sticky',
                    'top-0','bottom-0','left-0','right-0','inset-0',
                    'z-10','z-20','z-50','z-auto',
                    'overflow-hidden','overflow-auto','overflow-scroll','overflow-x-auto',
                    // Opacity / Display
                    'opacity-0','opacity-50','opacity-75','opacity-100',
                    'cursor-pointer','cursor-not-allowed','cursor-default',
                    'pointer-events-none','select-none',
                    'space-y-1','space-y-2','space-y-4','space-y-6','space-x-2','space-x-4',
                  ];

                  monaco.languages.registerCompletionItemProvider('javascript', {
                    triggerCharacters: ['"', "'", ' '],
                    provideCompletionItems: (model, position) => {
                      const lineContent = model.getLineContent(position.lineNumber);
                      const prefix = lineContent.substring(0, position.column - 1);

                      // Only trigger inside className="..." or className='...'
                      const classNameMatch = prefix.match(/className=["']([^"']*)$/);
                      if (!classNameMatch) return { suggestions: [] };

                      const typedClasses = classNameMatch[1];
                      const lastClass = typedClasses.split(' ').pop();

                      const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: position.column - lastClass.length,
                        endColumn: position.column,
                      };

                      return {
                        suggestions: twClasses
                          .filter(cls => cls.startsWith(lastClass))
                          .map(cls => ({
                            label: cls,
                            kind: monaco.languages.CompletionItemKind.Value,
                            detail: 'Tailwind CSS',
                            insertText: cls,
                            range,
                          })),
                      };
                    },
                  });
                }}
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
