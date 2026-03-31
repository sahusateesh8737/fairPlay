import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, User, Clock, ShieldAlert, X, Radio } from 'lucide-react';
import { useParams } from 'react-router-dom';

const socket = io(`${import.meta.env.VITE_API_BASE_URL}`);

const LiveMonitor = ({ sectionId: propSectionId }) => {
  const { sectionId: paramsSectionId } = useParams();
  const sectionId = propSectionId || paramsSectionId;
  
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  useEffect(() => {
    // 1. Connect and join the section room
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_section_monitor', sectionId);
    });

    // 2. Listen for incoming cheat alerts
    socket.on('receive_cheat_alert', (newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
    });

    // If already connected on mount
    if (socket.connected) {
      setIsConnected(true);
      socket.emit('join_section_monitor', sectionId);
    }

    return () => {
      socket.off('receive_cheat_alert');
      socket.off('connect');
    };
  }, [sectionId]);

  const mainContent = (
    <div className="min-h-screen bg-background p-8 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Live Proctoring</h1>
            </div>
            <p className="text-muted-foreground">Monitoring violations for Section: <span className="text-foreground font-mono font-bold bg-muted px-2 py-0.5 rounded">{sectionId}</span></p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full w-fit shadow-sm">
            <Radio className={`w-4 h-4 ${isConnected ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${isConnected ? 'text-green-500' : 'text-muted-foreground'}`}>
              {isConnected ? 'Live Feed Active' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Alerts Feed */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl min-h-[500px] flex flex-col">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Recent Violations</span>
            <span className="text-xs text-muted-foreground/60">{alerts.length} events logged</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence initial={false}>
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground/30">
                  <AlertTriangle className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-[10px]">Passive monitoring in progress...</p>
                </div>
              ) : (
                alerts.map((alert, index) => (
                  <motion.div
                    key={index + alert.timestamp}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center justify-between group hover:bg-red-500/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-bold">{alert.studentName}</span>
                          <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded uppercase font-black tracking-widest border border-red-500/20">
                            {alert.eventType}
                          </span>
                          {alert.screenshot && (
                            <button 
                              type="button"
                              onClick={() => setSelectedEvidence(alert.screenshot)} 
                              className="text-[10px] text-blue-400 font-mono hover:text-blue-300 w-fit flex items-center gap-1 bg-blue-500/10 px-1.5 py-0.5 rounded transition-colors ml-2"
                            >
                              📸 View Proof
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-tight">Suspected violation detected in exam environment.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground/60 text-[10px] font-mono font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {alert.timestamp}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-blue-500 uppercase tracking-widest font-black mr-2">Proctoring Protocol:</strong> Alerts are delivered in real-time. Each violation is also logged permanently to the student's submission record for post-exam review.
          </p>
        </div>
        </div>

      </div>
  );
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
                <ShieldAlert className="w-5 h-5 text-red-500" /> Live Evidence Capture
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

  return (
    <>
      {mainContent}
      {createPortal(evidenceModal, document.body)}
    </>
  );
};

export default LiveMonitor;
