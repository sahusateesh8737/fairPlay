import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, ChevronLeft, ShieldCheck, 
  Code2, Eye, Layers, MonitorPlay, CheckCircle2, User, Lock, AlertOctagon
} from 'lucide-react';

const FlowAnimation = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative max-w-6xl w-full h-full max-h-[85vh] bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
      >
        {/* Left Side: Instructions & Steps */}
        <div className="w-full md:w-80 bg-muted/30 border-b md:border-b-0 md:border-r border-border p-8 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold mb-6">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm tracking-widest uppercase">FairPlay Flow</span>
            </div>
            
            <div className="space-y-6">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`flex gap-4 transition-all ${step === s ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step === s ? 'bg-primary border-primary text-white' : 'border-muted-foreground text-muted-foreground'}`}>
                    {s}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      {s === 1 ? 'Creation' : s === 2 ? 'Sandbox' : s === 3 ? 'Proctoring' : 'Review'}
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                      {s === 1 ? 'Teacher Setup' : s === 2 ? 'Student Environment' : s === 3 ? 'Live Monitoring' : 'Forensic Analysis'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/50">
             <button 
               onClick={onClose}
               className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-red-500 transition-colors"
             >
               <X className="w-4 h-4" /> Close Walkthrough
             </button>
          </div>
        </div>

        {/* Right Side: Animated Mockups */}
        <div className="flex-1 relative bg-background p-6 md:p-12 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col"
            >
              {step === 1 && <TeacherStage />}
              {step === 2 && <StudentStage />}
              {step === 3 && <ProctorStage />}
              {step === 4 && <ReviewStage />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
            <button 
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold disabled:opacity-20 hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1 rounded-full transition-all ${step === i ? 'w-8 bg-primary' : 'w-2 bg-muted'}`} />
              ))}
            </div>
            {step < 4 ? (
              <button 
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-green-500/20"
              >
                Finish <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- STAGE 1: TEACHER DASHBOARD ---
const TeacherStage = () => (
  <div className="flex flex-col h-full">
    <div className="mb-6">
      <h2 className="text-2xl font-black text-foreground mb-2 italic uppercase">1. The Blueprint</h2>
      <p className="text-muted-foreground text-sm">Teachers define the React assessment, set randomized variations, and upload a <span className="text-primary font-bold">Reference Design</span> for pixel-perfect grading.</p>
    </div>
    <div className="flex-1 bg-card rounded-2xl border border-border p-5 shadow-inner relative overflow-hidden flex flex-col gap-5">
       <div className="w-full h-8 bg-muted/50 rounded-lg flex items-center px-3 gap-2 border border-border/50">
          <div className="w-2 h-2 rounded-full bg-red-500/50" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
          <div className="flex-1 h-2 bg-muted rounded-full max-w-[100px] ml-4" />
       </div>
       
       <div className="space-y-4">
          <div className="space-y-2">
             <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Assessment Title</div>
             <motion.div initial={{ width: 0 }} animate={{ width: '90%' }} transition={{ duration: 1 }} className="h-10 bg-background rounded-xl border border-primary/20 flex items-center px-4">
                <span className="text-[10px] font-bold text-primary">React: Build a Navigation Bar</span>
             </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Target Section</div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="h-10 bg-background rounded-xl border border-border flex items-center px-4 text-[10px] font-bold text-foreground">SECTION_B</motion.div>
             </div>
             <div className="space-y-2">
                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Time Limit</div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="h-10 bg-background rounded-xl border border-border flex items-center px-4 text-[10px] font-bold text-foreground">60 Minutes</motion.div>
             </div>
          </div>

          <div className="space-y-2">
             <div className="flex justify-between items-center">
                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Randomized Variations</div>
                <div className="text-[8px] font-black text-primary uppercase tracking-widest">3 / 5 Created</div>
             </div>
             <div className="flex gap-2">
                <div className="h-6 w-16 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-[8px] font-bold text-primary">SET A</div>
                <div className="h-6 w-16 rounded bg-muted border border-border flex items-center justify-center text-[8px] font-bold text-muted-foreground">SET B</div>
                <div className="h-6 w-16 rounded bg-muted border border-border flex items-center justify-center text-[8px] font-bold text-muted-foreground">SET C</div>
             </div>
          </div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ delay: 1.2 }}
            className="p-5 border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5 flex flex-col items-center gap-2 relative group"
          >
            <div className="absolute top-2 right-2 flex gap-1">
               <div className="w-1 h-1 rounded-full bg-primary" />
               <div className="w-1 h-1 rounded-full bg-primary" />
            </div>
            <Layers className="w-6 h-6 text-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase text-primary tracking-widest text-center">Reference Design Attached<br/><span className="text-[7px] text-muted-foreground opacity-60 italic font-medium">mockup_v1.png</span></span>
          </motion.div>
       </div>

       <motion.div 
         animate={{ 
           scale: [1, 1.02, 1],
           boxShadow: ["0px 0px 0px rgba(59,130,246,0)", "0px 0px 20px rgba(59,130,246,0.3)", "0px 0px 0px rgba(59,130,246,0)"]
         }} 
         transition={{ repeat: Infinity, duration: 2 }}
         className="mt-auto h-12 bg-primary rounded-xl flex items-center justify-center font-bold text-white shadow-lg text-xs uppercase tracking-widest"
       >
         Publish Secure Assessment
       </motion.div>
    </div>
  </div>
);

// --- STAGE 2: STUDENT SANDBOX ---
const StudentStage = () => (
  <div className="flex flex-col h-full">
    <div className="mb-6">
      <h2 className="text-2xl font-black text-foreground mb-2 italic uppercase">2. The Sandbox</h2>
      <p className="text-muted-foreground text-sm">Students code in a locked-down environment. <span className="text-red-500 font-bold">Anti-cheat</span> detects tab switching and disables copy-paste while rrweb records every keystroke.</p>
    </div>
    <div className="flex-1 bg-neutral-900 rounded-2xl border border-white/10 p-4 shadow-inner relative overflow-hidden flex gap-3">
       <div className="absolute top-2 right-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-red-500 font-black">RECORDING SESSION</span>
       </div>
       <div className="w-1/2 border-r border-white/10 pr-3 flex flex-col gap-2">
          <div className="flex items-center gap-1 mb-2">
             <Code2 className="w-3 h-3 text-blue-400" />
             <span className="text-[9px] text-white/40 font-mono">index.jsx</span>
          </div>
          <div className="space-y-2 font-mono text-[10px]">
             <TypewriterText text="function App() {" delay={0} />
             <TypewriterText text="  return (" delay={0.5} />
             <TypewriterText text='    <div className="nav"> ' delay={1} />
             <TypewriterText text="      <h1>Hello World</h1>" delay={1.5} />
             <TypewriterText text="    </div>" delay={2} />
             <TypewriterText text="  );" delay={2.5} />
             <TypewriterText text="}" delay={3} />
          </div>
       </div>
       <div className="w-1/2 bg-white rounded-xl flex items-center justify-center text-black p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.5 }}
            className="w-full h-8 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] font-bold"
          >
            Hello World
          </motion.div>
       </div>
       {/* Security Warning Popups */}
       <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: [0, 1, 1, 0] }}
         transition={{ times: [0, 0.1, 0.9, 1], duration: 2, delay: 1.5 }}
         className="absolute bottom-10 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-2 shadow-2xl z-20"
       >
         <Lock className="w-3 h-3" /> TAB SWITCH DETECTED!
       </motion.div>
    </div>
  </div>
);

// --- STAGE 3: LIVE PROCTORING ---
const ProctorStage = () => (
  <div className="flex flex-col h-full">
    <div className="mb-6">
      <h2 className="text-2xl font-black text-foreground mb-2 italic uppercase">3. The Watchtower</h2>
      <p className="text-muted-foreground text-sm">Teachers monitor the live session. A <span className="text-red-500 font-bold">Real-Time Grid</span> shows student status, and instant notifications trigger when a violation occurs.</p>
    </div>
    <div className="flex-1 bg-card rounded-2xl border border-border p-6 shadow-inner relative overflow-hidden flex flex-col gap-6">
       <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Student A', status: 'ACTIVE', color: 'bg-green-500' },
            { name: 'Student B', status: 'FLAGGED', color: 'bg-red-500', pulse: true },
            { name: 'Student C', status: 'IDLE', color: 'bg-yellow-500' },
            { name: 'Student D', status: 'ACTIVE', color: 'bg-green-500' },
            { name: 'Student E', status: 'ACTIVE', color: 'bg-green-500' },
            { name: 'Student F', status: 'FLAGGED', color: 'bg-red-500', pulse: true },
          ].map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`p-3 rounded-xl border border-border bg-background flex flex-col gap-2 relative overflow-hidden ${s.pulse ? 'ring-2 ring-red-500/50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                   <User className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className={`w-2 h-2 rounded-full ${s.color} ${s.pulse ? 'animate-ping' : ''}`} />
              </div>
              <span className="text-[10px] font-bold text-foreground">{s.name}</span>
              <span className={`text-[8px] font-black tracking-widest ${s.status === 'FLAGGED' ? 'text-red-500' : 'text-muted-foreground'}`}>{s.status}</span>
            </motion.div>
          ))}
       </div>
       
       <div className="mt-auto bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
             <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <div className="flex-1">
             <div className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Alert</div>
             <div className="text-xs font-bold text-foreground">Student B: Unexpected Tab Switching Detected</div>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground">14:22:05</div>
       </div>
    </div>
  </div>
);

// --- STAGE 4: FORENSIC REVIEW ---
const ReviewStage = () => (
  <div className="flex flex-col h-full">
    <div className="mb-6">
      <h2 className="text-2xl font-black text-foreground mb-2 italic uppercase">3. The Verdict</h2>
      <p className="text-muted-foreground text-sm">Review with <span className="text-orange-500 font-bold">Time-Lapse Replay</span> to watch the coding process. Use the <span className="text-primary font-bold">Transparency Slider</span> to compare work against the reference.</p>
    </div>
    <div className="flex-1 bg-card rounded-2xl border border-border p-4 shadow-inner relative overflow-hidden flex flex-col">
       <div className="flex items-center justify-between mb-4 bg-muted/30 p-2 rounded-lg">
          <div className="flex gap-2">
             <div className="px-3 py-1 bg-primary/20 text-primary rounded-md text-[8px] font-bold">RENDER</div>
             <div className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-md text-[8px] font-bold flex items-center gap-1">
                <MonitorPlay className="w-3 h-3" /> REPLAY
             </div>
          </div>
          <div className="flex items-center gap-2 bg-background p-1 rounded-full border border-border">
             <Layers className="w-3 h-3 text-primary" />
             <div className="w-16 h-1 bg-primary/30 rounded-full overflow-hidden relative">
                <motion.div 
                  animate={{ x: [-64, 0, -64] }} 
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute inset-0 bg-primary w-full"
                />
             </div>
          </div>
       </div>
       <div className="flex-1 relative rounded-xl overflow-hidden bg-background border border-border">
          {/* Mock Rendering with overlay animation */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-40 h-10 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] font-bold">Student Work</div>
          </div>
          <motion.div 
            animate={{ opacity: [0, 0.6, 0] }} 
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute inset-0 bg-red-500/20 border-4 border-red-500/40 flex items-center justify-center"
          >
             <span className="text-[10px] font-black text-red-600">REFERENCE DESIGN OVERLAY</span>
          </motion.div>
       </div>
       <div className="mt-4 flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-orange-500" />
          <div className="flex-1 h-1 bg-muted rounded-full relative">
             <motion.div 
               animate={{ width: ['0%', '100%'] }} 
               transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
               className="absolute inset-y-0 left-0 bg-orange-500 rounded-full"
             />
          </div>
       </div>
    </div>
  </div>
);

const TypewriterText = ({ text, delay }) => (
  <motion.div
    initial={{ width: 0, opacity: 0 }}
    animate={{ width: '100%', opacity: 1 }}
    transition={{ delay, duration: 1 }}
    className="whitespace-nowrap overflow-hidden text-blue-300"
  >
    {text}
  </motion.div>
);

const PlayCircle = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
);

export default FlowAnimation;
