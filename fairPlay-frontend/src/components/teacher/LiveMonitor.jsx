import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, User, Clock, ShieldAlert, X, Radio } from 'lucide-react';
import { useParams } from 'react-router-dom';

const socket = io('http://localhost:5001');

const LiveMonitor = ({ sectionId: propSectionId }) => {
  const { sectionId: paramsSectionId } = useParams();
  const sectionId = propSectionId || paramsSectionId;
  
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#050507] p-8 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Live Proctoring</h1>
            </div>
            <p className="text-gray-400">Monitoring violations for Section: <span className="text-white font-mono font-bold bg-white/5 px-2 py-0.5 rounded">{sectionId}</span></p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0c] border border-gray-800 rounded-full w-fit">
            <Radio className={`w-4 h-4 ${isConnected ? 'text-green-500 animate-pulse' : 'text-gray-600'}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${isConnected ? 'text-green-500' : 'text-gray-600'}`}>
              {isConnected ? 'Live Feed Active' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Alerts Feed */}
        <div className="bg-[#0a0a0c] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl min-h-[500px] flex flex-col">
          <div className="p-4 border-b border-gray-800 bg-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Violations</span>
            <span className="text-xs text-gray-500">{alerts.length} events logged</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence initial={false}>
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                  <AlertTriangle className="w-12 h-12 mb-4 opacity-20" />
                  <p>Passive monitoring in progress...</p>
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
                          <span className="text-white font-bold">{alert.studentName}</span>
                          <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter border border-red-500/30">
                            {alert.eventType}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Suspected violation detected in exam environment.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-mono">
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
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong className="text-blue-400">Proctoring Protocol:</strong> Alerts are delivered in real-time. Each violation is also logged permanently to the student's submission record for post-exam review.
          </p>
        </div>

      </div>
    </div>
  );
};

export default LiveMonitor;
