import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Users, Network, Key, LayoutGrid, LogOut, 
  Settings, ServerCrash, ShieldCheck, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import IPManager from '../components/admin/IPManager';
import SectionManager from '../components/admin/SectionManager';

// Extracted Overview Component (what was originally on the dashboard)
const Overview = () => (
  <>
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[
        { label: 'Active Sessions', value: '142', icon: <Users className="w-5 h-5 text-blue-400" /> },
        { label: 'Whitelisted IPs', value: '28', icon: <Network className="w-5 h-5 text-green-400" /> },
        { label: 'Active Sections', value: '12', icon: <ServerCrash className="w-5 h-5 text-purple-400" /> },
        { label: 'Security Alerts', value: '0', icon: <ShieldCheck className="w-5 h-5 text-gray-400" /> },
      ].map((stat, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-[#0a0a0c] border border-gray-800 rounded-lg p-5"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-gray-800/50 rounded-md">
              {stat.icon}
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Quick Actions / Recent Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-[#0a0a0c] border border-gray-800 rounded-lg p-6">
        <h3 className="text-white font-medium mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-gray-400" /> Recent Security Events
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-800/50">
            <div>
              <p className="text-white text-sm">Exam start registered: Section k23DJ</p>
              <p className="text-xs text-gray-500 mt-1">IP: 192.168.1.144</p>
            </div>
            <span className="text-xs text-green-500">2 mins ago</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-800/50">
            <div>
              <p className="text-white text-sm">Failed login attempt (Teacher)</p>
              <p className="text-xs text-gray-500 mt-1">Invalid access code submitted</p>
            </div>
            <span className="text-xs text-yellow-500">14 mins ago</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-800/50">
            <div>
              <p className="text-white text-sm">IP Whitelist Updated</p>
              <p className="text-xs text-gray-500 mt-1">Added range: 10.0.x.x by Admin</p>
            </div>
            <span className="text-xs text-gray-500">1 hr ago</span>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0c] border border-gray-800 rounded-lg p-6">
        <h3 className="text-white font-medium mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-400" /> Quick Actions
        </h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-800 rounded text-sm transition-colors text-left text-gray-300">
            Generate Teacher Code
            <Key className="w-4 h-4 text-gray-500" />
          </button>
          <button className="w-full flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-800 rounded text-sm transition-colors text-left text-gray-300">
            Add Whitelist IP
            <Network className="w-4 h-4 text-gray-500" />
          </button>
          <button className="w-full flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-800 rounded text-sm transition-colors text-left text-gray-300">
            Create Section
            <LayoutGrid className="w-4 h-4 text-gray-500" />
          </button>
          <button className="w-full flex items-center justify-between p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-sm transition-colors text-left text-red-400 mt-4">
            Trigger System Lockdown
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'network', label: 'IP Whitelist', icon: Network },
    { id: 'sections', label: 'Manage Sections', icon: ServerCrash },
    { id: 'codes', label: 'Teacher Codes', icon: Key },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-gray-300 font-mono flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-[#0a0a0c] flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 rounded flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h1 className="text-white font-bold tracking-wider text-sm">fP_ADMIN</h1>
              <p className="text-[10px] text-green-500 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                  isActive 
                    ? 'bg-gray-800/50 text-white border border-gray-700/50' 
                    : 'hover:bg-gray-800/30 text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : ''}`} /> {item.label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen">
        {/* Top Header */}
        <header className="h-20 shrink-0 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0a0a0c]/50">
          <h2 className="text-xl text-white font-medium capitalize">
            {activeTab === 'overview' ? 'System Overview' : navItems.find(t => t.id === activeTab)?.label}
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-[#111115] border border-gray-800 rounded-md py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-gray-600 transition-colors w-64 text-white"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content routing based on activeTab */}
        <div className="p-8 flex-1 overflow-y-auto">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'network' && <IPManager />}
          {activeTab === 'sections' && <SectionManager />}
          {['codes', 'users', 'settings'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Settings className="w-12 h-12 mb-4 opacity-20" />
              <p>Module under construction during Phase 3</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
