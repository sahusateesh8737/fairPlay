import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { Code2, Play, Terminal, MonitorPlay, ChevronLeft, Lightbulb, AlertCircle } from 'lucide-react';
import * as Babel from '@babel/standalone';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const StudentPracticeSandbox = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const iframeRef = useRef(null);
  
  const [activeProblem, setActiveProblem] = useState(null);
  const [code, setCode] = useState('');
  const [compileError, setCompileError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/practice/${id}`);
        if (response.data.success) {
          const problem = response.data.data;
          setActiveProblem(problem);
          setCode(problem.boilerplate || '');
        } else {
          setError('Problem not found');
        }
      } catch (err) {
        setError('Failed to load the practice problem');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProblem();
  }, [id]);

  const handleEditorDidMount = (editor, monaco) => {
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: "React",
      allowJs: true
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
  };

  const runCode = () => {
    setCompileError('');
    
    try {
      const transpiled = Babel.transform(code, { 
        presets: ['react', 'env'] 
      }).code;
      
      const modulesInjection = JSON.stringify({ 'index.jsx': transpiled });

      const iframeContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { margin: 0; background-color: ${theme === 'dark' ? '#0a0a0c' : '#ffffff'}; color: ${theme === 'dark' ? 'white' : 'black'}; display: flex; align-items: flex-start; justify-content: center; min-height: 100vh; font-family: sans-serif; padding: 20px; }
              #root { width: 100%; max-width: 800px; padding: 20px; box-sizing: border-box; background: ${theme === 'dark' ? '#1a1a1a' : '#f9f9f9'}; border-radius: 12px; }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script>
              const modulesMap = ${modulesInjection};
              const moduleCache = {};

              function myRequire(moduleName) {
                if (moduleName === 'react') return window.React;
                if (moduleName === 'react-dom/client') return window.ReactDOM;
                
                let normalizedName = moduleName.startsWith('./') ? moduleName.slice(2) : moduleName;
                if (!normalizedName.endsWith('.jsx') && !normalizedName.endsWith('.js')) {
                  normalizedName += '.jsx';
                }

                if (moduleCache[normalizedName]) return moduleCache[normalizedName].exports;

                const moduleSource = modulesMap[normalizedName];
                if (!moduleSource) throw new Error("Cannot find module '" + moduleName + "'");

                const module = { exports: {} };
                moduleCache[normalizedName] = module;

                const wrapper = new Function('require', 'module', 'exports', moduleSource);
                wrapper(myRequire, module, module.exports);

                return module.exports;
              }

              try {
                window.addEventListener('error', (e) => {
                  window.parent.postMessage({ type: 'error', message: e.message }, '*');
                });
                myRequire('index.jsx');
              } catch (e) {
                window.parent.postMessage({ type: 'error', message: e.toString() }, '*');
              }
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
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'error') {
        setCompileError(event.data.message);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center font-sans">
         <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !activeProblem) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center font-sans p-6">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-start gap-4 max-w-lg text-center flex-col items-center">
          <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
          <h3 className="font-bold text-red-500 text-xl">{error || 'Problem Not Found'}</h3>
          <button onClick={() => navigate('/practice')} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg font-bold">Return to Practice Hub</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      
      {/* Header Bar */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/practice')} className="p-2 hover:bg-muted rounded-full transition-colors group">
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          </button>
          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-widest rounded-md flex items-center gap-2">
            <Code2 className="w-4 h-4" /> Sandbox
          </div>
          <h1 className="text-foreground font-bold hidden md:block">{activeProblem.title}</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={runCode}
            className="bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-5 rounded-lg transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4" /> Compile & Run
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Left Side: Problems & Editor (50%) */}
        <div className="w-1/2 flex flex-col border-r border-border bg-card overflow-hidden">
          
          <div className="p-5 border-b border-border bg-muted/10 shrink-0 flex flex-col gap-3">
             <div className="flex justify-between items-center mb-2">
               <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                 <Lightbulb className="w-4 h-4 text-yellow-500" /> Challenge Details
               </h3>
               <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${
                  activeProblem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                  activeProblem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                  'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {activeProblem.difficulty}
               </span>
             </div>
             <div>
               <h2 className="text-xl font-bold text-foreground">{activeProblem.title}</h2>
               <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{activeProblem.description}</p>
             </div>
          </div>

          <div className="h-10 bg-muted/30 border-b border-border flex items-center px-4 shrink-0">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono font-medium text-foreground">index.jsx</span>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language="javascript"
              theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              options={{
                suggestOnTriggerCharacters: true,
                quickSuggestions: { other: true, comments: true, strings: true },
                snippetSuggestions: "inline",
                wordBasedSuggestions: true,
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineHeight: 24,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                formatOnPaste: true,
              }}
            />
          </div>
        </div>

        {/* Right Side: Live Render (50%) */}
        <div className="w-1/2 bg-background flex flex-col overflow-hidden relative">
          <div className="h-10 bg-card border-b border-border flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-primary/10 text-primary">
              <MonitorPlay className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Live Preview</span>
            </div>
            {compileError && (
              <span className="text-[10px] font-mono text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 animate-pulse">
                BUILD_ERROR
              </span>
            )}
          </div>

          <div className="flex-1 relative bg-background overflow-hidden">
            {compileError ? (
              <div className="absolute inset-0 p-8 flex items-center justify-center bg-red-500/5">
                <div className="w-full max-w-lg bg-card border border-red-500/20 rounded-2xl p-6 font-mono shadow-xl">
                  <div className="flex items-center gap-2 text-red-500 font-bold mb-4 border-b border-red-500/20 pb-3 text-sm">
                    <Terminal className="w-4 h-4" /> COMPILATION_FAILED
                  </div>
                  <div className="text-red-400 text-xs leading-relaxed whitespace-pre-wrap overflow-auto max-h-[300px]">
                    {compileError}
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                title="practice-preview"
                sandbox="allow-scripts allow-same-origin"
                className="w-full h-full border-none bg-transparent"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPracticeSandbox;
