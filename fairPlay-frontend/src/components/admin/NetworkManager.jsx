import React, { useState, useEffect } from 'react';
import { Network, Plus, Trash2, ShieldAlert, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const NetworkManager = () => {
  const [ips, setIps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newIp, setNewIp] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isOverrideActive, setIsOverrideActive] = useState(false);
  const [error, setError] = useState('');

  const fetchNetworkData = async () => {
    try {
      setIsLoading(true);
      const [ipRes, configRes] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/ips', { withCredentials: true }),
        axios.get('http://localhost:5001/api/admin/config/override', { withCredentials: true })
      ]);
      setIps(ipRes.data.data);
      setIsOverrideActive(configRes.data.data.emergencyOverride);
    } catch (err) {
      console.error("Failed to fetch network data", err);
      setError(err.response?.data?.message || 'Failed to load network configuration');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const handleAddIp = async (e) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    try {
      setError('');
      await axios.post('http://localhost:5001/api/admin/ips', {
        ipAddress: newIp,
        description: newDesc
      }, { withCredentials: true });
      
      setNewIp('');
      setNewDesc('');
      fetchNetworkData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add IP');
    }
  };

  const handleRemoveIp = async (id) => {
    if (!window.confirm("Are you sure you want to remove this IP from the whitelist?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/admin/ips/${id}`, { withCredentials: true });
      fetchNetworkData();
    } catch (err) {
      setError('Failed to remove IP');
    }
  };

  const toggleOverride = async () => {
    const action = isOverrideActive ? 'DISABLE' : 'ENABLE';
    if (!window.confirm(`Are you absolutely sure you want to ${action} the Emergency Override? ${!isOverrideActive ? 'This will allow ANY location to access exams.' : ''}`)) return;
    
    try {
      const res = await axios.post('http://localhost:5001/api/admin/config/override', {
        emergencyOverride: !isOverrideActive
      }, { withCredentials: true });
      setIsOverrideActive(res.data.data.emergencyOverride);
    } catch (err) {
      setError('Failed to toggle emergency override');
    }
  };

  if (isLoading) {
    return <div className="text-gray-500 animate-pulse">Loading network configuration...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
          <Network className="w-6 h-6 text-blue-400" />
          Network & Security Management
        </h2>
        <p className="text-gray-400 text-sm">Configure the physical boundaries of the testing platform.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Emergency Override Card */}
      <div className={`p-6 rounded-xl border transition-colors flex items-center justify-between ${isOverrideActive ? 'bg-red-900/20 border-red-500/50' : 'bg-[#0a0a0c] border-gray-800'}`}>
        <div>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${isOverrideActive ? 'text-red-400' : 'text-white'}`}>
            <ShieldAlert className="w-5 h-5" /> Emergency IP Override
          </h3>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            When enabled, the strict IP whitelist is ignored globally. Use this ONLY during severe campus network outages if students must use mobile hotspots to complete active exams.
          </p>
        </div>
        <button
          onClick={toggleOverride}
          className={`px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg ${
            isOverrideActive 
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          }`}
        >
          {isOverrideActive ? 'DISABLE OVERRIDE' : 'Enable Override'}
        </button>
      </div>

      {/* IP Whitelist Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* List Pane */}
        <div className="lg:col-span-2 bg-[#0a0a0c] border border-gray-800 rounded-xl overflow-hidden flex flex-col">
          <div className="bg-gray-800/30 p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-white font-medium">Whitelisted Campus IPs</h3>
            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{ips.length} allowed IPs</span>
          </div>
          
          <div className="p-0 overflow-y-auto max-h-[400px]">
             {ips.length === 0 ? (
               <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                 <Network className="w-10 h-10 opacity-20 mb-3" />
                 <p>No IP addresses configured.</p>
                 <p className="text-sm">Exams cannot be started without an Emergency Override.</p>
               </div>
             ) : (
               <table className="w-full text-left text-sm text-gray-400">
                 <thead className="bg-gray-900/50 text-xs uppercase text-gray-500 sticky top-0">
                   <tr>
                     <th className="px-6 py-3 font-medium">IP Address / Range</th>
                     <th className="px-6 py-3 font-medium">Description</th>
                     <th className="px-6 py-3 font-medium text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800/50">
                   {ips.map((ip) => (
                     <tr key={ip.id} className="hover:bg-gray-800/20 transition-colors">
                       <td className="px-6 py-4 font-mono text-white">{ip.ipAddress}</td>
                       <td className="px-6 py-4">{ip.description || '—'}</td>
                       <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => handleRemoveIp(ip.id)}
                           className="text-gray-500 hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition-colors"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
          </div>
        </div>

        {/* Add Pane */}
        <div className="bg-[#0a0a0c] border border-gray-800 rounded-xl p-6 h-fit">
          <h3 className="text-white font-medium mb-4">Add Network Rule</h3>
          <form onSubmit={handleAddIp} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">IP Address (IPv4)</label>
              <input
                type="text"
                placeholder="e.g. 192.168.1.100"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="w-full bg-[#111115] border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Label (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Main Library Wi-Fi"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-[#111115] border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!newIp.trim()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> Whitelist IP
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default NetworkManager;
