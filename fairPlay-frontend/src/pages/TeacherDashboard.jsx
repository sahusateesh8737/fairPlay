import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileCode, Users, LogOut, Settings, LayoutDashboard, Search, GraduationCap, Radio, BarChart2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import MyAssignments from '../components/teacher/MyAssignments';
import CreateAssignment from '../components/teacher/CreateAssignment';
import StudentProgress from '../components/teacher/StudentProgress';
import AssignmentResults from '../components/teacher/AssignmentResults';
import LiveMonitor from '../components/teacher/LiveMonitor';
import UserProfile from '../components/auth/UserProfile';

import { useAuth } from '../context/AuthContext';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('assignments');
  const [searchQuery, setSearchQuery] = useState('');

  // Resolve sections from user profile
  const teacherProfile = {
    name: user?.name || 'Instructor',
    email: user?.email || '',
    sections: user?.section?.name ? [user.section.name] : ['General']
  };

  const navItems = [
    { id: 'assignments', label: 'My Assignments', icon: LayoutDashboard },
    { id: 'create', label: 'Draft New', icon: FileCode },
    { id: 'students', label: 'Student Progress', icon: Users },
    { id: 'results', label: 'Results', icon: BarChart2 },
    { id: 'monitor', label: 'Live Proctor', icon: Radio },
    { id: 'settings', label: 'Course Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex isolate relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 mix-blend-overlay pointer-events-none"></div>
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/80 backdrop-blur-xl flex flex-col z-10 shrink-0 relative">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shadow-inner">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-foreground font-bold tracking-tight text-sm">fairPlay_EDU</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                Instructor Portal
              </p>
            </div>
          </div>
        </div>

        {/* Teacher Profile Snippet */}
        <div className="px-6 py-4 border-b border-border/50">
          <p className="text-foreground text-sm font-medium">{teacherProfile.name}</p>
          <div className="flex gap-1 mt-2">
            {teacherProfile.sections.map(sec => (
              <span key={sec} className="px-1.5 py-0.5 bg-muted rounded border border-border text-[9px] text-muted-foreground uppercase font-mono">
                {sec}
              </span>
            ))}
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} /> {item.label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <motion.main 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header */}
        <header className="h-20 shrink-0 border-b border-border flex items-center justify-between px-8 bg-card/50 backdrop-blur-md relative z-[60]">
          <h2 className="text-xl text-foreground font-medium capitalize flex items-center gap-3">
             {navItems.find(t => t.id === activeTab)?.label}
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assessments..." 
                className="bg-muted border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/30 transition-all w-64 text-foreground placeholder:text-muted-foreground/50 shadow-sm"
              />
            </div>
            <UserProfile />
          </div>
        </header>

        {/* Dashboard Content routing based on activeTab */}
        <div className="p-8 md:p-12 flex-1 overflow-y-auto relative z-10">
          {activeTab === 'assignments' && <MyAssignments setActiveTab={setActiveTab} searchQuery={searchQuery} />}
          {activeTab === 'create' && <CreateAssignment teacherSections={teacherProfile.sections} setActiveTab={setActiveTab} />}
          {activeTab === 'students' && <StudentProgress />}
          {activeTab === 'results' && <AssignmentResults />}
          {activeTab === 'monitor' && <LiveMonitor sectionId={user?.section?.name || 'General'} />}
          
          {['settings'].includes(activeTab) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground border border-dashed border-border rounded-3xl bg-muted/30"
            >
              <Settings className="w-16 h-16 mb-6 opacity-20 animate-spin-slow" />
              <h3 className="text-xl text-foreground font-medium mb-2">Module Offline</h3>
              <p className="max-w-md text-center">Course settings are slated for next quarter's feature rollout.</p>
            </motion.div>
          )}
        </div>
      </motion.main>
    </div>
  );
};

export default TeacherDashboard;
