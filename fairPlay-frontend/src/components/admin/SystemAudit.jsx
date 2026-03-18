import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Users, FileCode, AlertTriangle, Clock, Filter } from 'lucide-react';
import axios from 'axios';

const SystemAudit = () => {
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [sections, setSections] = useState([]);
  const [sectionFilter, setSectionFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuditData = async () => {
    try {
      setIsLoading(true);
      const [metricsRes, logsRes, sectionsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/analytics/metrics', { withCredentials: true }),
        axios.get('http://localhost:5001/api/admin/analytics/logs', { withCredentials: true }),
        axios.get('http://localhost:5001/api/sections', { withCredentials: true })
      ]);
      setMetrics(metricsRes.data.data);
      setLogs(logsRes.data.data);
      setSections(sectionsRes.data.data);
    } catch (err) {
      console.error("Failed to fetch audit data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
    const interval = setInterval(fetchAuditData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !metrics) {
    return <div className="text-gray-500 animate-pulse">Gathering platform intelligence...</div>;
  }

  const filteredLogs = sectionFilter === 'all'
    ? logs
    : logs.filter(log => log.submission?.student?.section?.name === sectionFilter);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
          <Activity className="w-6 h-6 text-green-400" />
          System Audit &amp; Global Analytics
        </h2>
        <p className="text-gray-400 text-sm">Monitor platform health and track real-time integrity alerts campus-wide.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0a0a0c] border border-gray-800 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Users className="w-5 h-5 text-blue-400" /></div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{metrics?.studentCount || 0}</h3>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Registered Students</p>
        </div>
        
        <div className="bg-[#0a0a0c] border border-gray-800 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg"><ShieldCheck className="w-5 h-5 text-purple-400" /></div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{metrics?.teacherCount || 0}</h3>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active Instructors</p>
        </div>

        <div className="bg-[#0a0a0c] border border-gray-800 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg"><FileCode className="w-5 h-5 text-green-400" /></div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{metrics?.assignmentCount || 0}</h3>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Assessments</p>
        </div>

        <div className="bg-[#0a0a0c] border border-gray-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-2 bg-red-500/10 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1 relative z-10">{metrics?.activeCheatLogs || 0}</h3>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold relative z-10">Total Intrusions Logged</p>
        </div>
      </div>

      {/* Global Cheat Logs Master Feed */}
      <div className="bg-[#0a0a0c] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-5 border-b border-gray-800 bg-gray-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-white font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" /> Global Integrity Audit Trail
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="bg-[#111115] border border-gray-800 rounded-lg py-1.5 px-3 text-xs text-gray-300 focus:outline-none focus:border-blue-500/50 appearance-none"
                title="Filter logs by section"
              >
                <option value="all">All Sections</option>
                {sections.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live
            </span>
          </div>
        </div>
        
        <div className="p-0 overflow-y-auto max-h-[500px]">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>
                {sectionFilter === 'all'
                  ? 'No cheating incidents have been recorded across the platform yet.'
                  : `No integrity violations found for section "${sectionFilter}".`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-800/20 transition-colors flex items-start gap-4">
                  <div className="p-2 bg-red-500/10 rounded text-red-400 mt-1 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-white font-medium truncate">{log.eventType}</p>
                      <span className="text-xs text-gray-500 whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(log.eventTimestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded bg-gray-800 text-gray-300">
                        <span className="text-gray-500 mr-1">Student:</span> {log.submission?.student?.name || 'Unknown'}
                      </span>
                      <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {log.submission?.student?.section?.name || 'No Section'}
                      </span>
                      <span className="px-2 py-1 rounded bg-gray-800 text-gray-400 border border-gray-700 truncate max-w-[200px]">
                        Exam: {log.submission?.assignment?.title || 'Unknown Exam'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemAudit;
