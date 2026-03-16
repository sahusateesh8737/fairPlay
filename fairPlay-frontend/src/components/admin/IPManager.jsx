import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Plus, Trash2, Search, Edit2 } from 'lucide-react';
import { getIps, saveIps } from '../../utils/storage';

const IPManager = () => {
  const [ips, setIps] = useState([]);
  
  useEffect(() => {
    // Load from local storage on mount
    setIps(getIps());
  }, []);

  const [newIp, setNewIp] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddIP = (e) => {
    e.preventDefault();
    if (!newIp) return;
    
    const newEntry = {
      id: Date.now(),
      address: newIp,
      desc: newDesc || 'No description',
      status: 'active',
      addedAt: new Date().toISOString().split('T')[0]
    };
    
    const updatedIps = [newEntry, ...ips];
    setIps(updatedIps);
    saveIps(updatedIps); // Save to local storage

    setNewIp('');
    setNewDesc('');
  };

  const handleDelete = (id) => {
    const updatedIps = ips.filter(ip => ip.id !== id);
    setIps(updatedIps);
    saveIps(updatedIps); // Save to local storage
  };

  const filteredIps = ips.filter(ip => 
    ip.address.includes(searchTerm) || ip.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Network className="w-6 h-6 text-green-400" />
            Network Security
          </h2>
          <p className="text-sm text-gray-400 mt-1">Manage global IP whitelists for secure exam access.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Add New IP Form */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#0a0a0c] border border-gray-800 rounded-xl p-6 sticky top-6"
          >
            <h3 className="text-white font-medium mb-4 uppercase tracking-wider text-sm">Add Whitelist Entry</h3>
            <form onSubmit={handleAddIP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">IP Address / CIDR</label>
                <input 
                  type="text" 
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="e.g., 192.168.1.100"
                  className="w-full bg-[#111115] border border-gray-800 rounded-lg py-2.5 px-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Description</label>
                <input 
                  type="text" 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g., Block A Computer Lab"
                  className="w-full bg-[#111115] border border-gray-800 rounded-lg py-2.5 px-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 font-bold py-2.5 px-4 rounded-lg mt-2 transition-colors text-sm uppercase tracking-widest flex items-center justify-center gap-2 group"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                Add Network
              </button>
            </form>
          </motion.div>
        </div>

        {/* IP List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0a0a0c] border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/20">
              <h3 className="text-white font-medium uppercase tracking-wider text-sm">Active Rules</h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter IPs..." 
                  className="bg-[#111115] border border-gray-800 rounded-md py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-gray-600 transition-colors w-48 sm:w-64"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-gray-500 uppercase bg-gray-900/50 border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-3 font-medium">Network Address</th>
                    <th className="px-6 py-3 font-medium">Description</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <AnimatePresence>
                    {filteredIps.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                          No networks found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredIps.map((ip) => (
                        <motion.tr 
                          key={ip.id}
                          initial={{ opacity: 0, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                          animate={{ opacity: 1, backgroundColor: 'transparent' }}
                          exit={{ opacity: 0, x: -20 }}
                          className="hover:bg-gray-800/30 transition-colors group"
                        >
                          <td className="px-6 py-4 font-mono text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            {ip.address}
                          </td>
                          <td className="px-6 py-4 text-gray-400">{ip.desc}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold ${
                              ip.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}>
                              {ip.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(ip.id)}
                                className="p-1.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPManager;
