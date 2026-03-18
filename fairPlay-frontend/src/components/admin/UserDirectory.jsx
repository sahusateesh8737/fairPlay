import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Search, ShieldCheck, Mail, ShieldAlert } from 'lucide-react';
import axios from 'axios';

const UserDirectory = () => {
  const [users, setUsers] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  
  // Create Teacher Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: '', sectionId: '' });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const fetchUsersAndSections = async () => {
    try {
      setIsLoading(true);
      const [usersRes, sectionsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/users', { withCredentials: true }),
        axios.get('http://localhost:5001/api/sections', { withCredentials: true }) // Using public/teacher route for list
      ]);
      setUsers(usersRes.data.data);
      setSections(sectionsRes.data.data);
    } catch (err) {
      console.error("Failed to fetch directory data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndSections();
  }, []);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    
    try {
      await axios.post('http://localhost:5001/api/admin/users/teacher', newTeacher, { withCredentials: true });
      setCreateSuccess('Teacher account provisioned successfully!');
      setNewTeacher({ name: '', email: '', password: '', sectionId: '' });
      fetchUsersAndSections(); // Refresh list
      setTimeout(() => setShowCreateModal(false), 2000);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create teacher account');
    }
  };

  const handleDeleteUser = async (id, role, name) => {
    if (!window.confirm(`Are you sure you want to completely remove ${role.toUpperCase()} ${name}? This action cannot be undone and will delete all their submissions/assignments.`)) return;
    
    try {
      await axios.delete(`http://localhost:5001/api/admin/users/${id}`, { withCredentials: true });
      fetchUsersAndSections();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = 
      sectionFilter === 'all' ? true :
      sectionFilter === 'none' ? !u.section :
      u.section?.name === sectionFilter;
    return matchesSearch && matchesSection;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <Users className="w-6 h-6 text-blue-400" />
            User Access Control
          </h2>
          <p className="text-gray-400 text-sm">Provision authority accounts and manage the student body.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
        >
          <UserPlus className="w-4 h-4" /> Provision Teacher
        </button>
      </div>

      <div className="bg-[#0a0a0c] border border-gray-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-900/30">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search by name, email, or role..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111115] border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 text-white"
              />
            </div>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="bg-[#111115] border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 appearance-none"
              title="Filter by section"
            >
              <option value="all">All Sections</option>
              <option value="none">⊘ Unassigned</option>
              {sections.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 font-medium">
              Teachers: {users.filter(u => u.role === 'teacher').length}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 font-medium">
              Students: {users.filter(u => u.role === 'student').length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#111115] text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">User Profile</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Assigned Section</th>
                <th className="px-6 py-4 font-medium">Registered</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {isLoading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 animate-pulse">Loading directory...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No users found matching your search.</td></tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          u.role === 'admin' ? 'bg-red-500/20 text-red-500' :
                          u.role === 'teacher' ? 'bg-blue-500/20 text-blue-400' : 
                          'bg-gray-800 text-gray-300'
                        }`}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        u.role === 'teacher' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                        'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {u.section ? u.section.name : <span className="text-gray-600">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <button 
                          onClick={() => handleDeleteUser(u.id, u.role, u.name)}
                          className="text-gray-500 hover:text-red-400 p-2 rounded-md hover:bg-red-500/10 transition-colors group"
                          title="Delete / Ban User"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Teacher Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-[#0a0a0c] border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" /> Provision Instructor
            </h3>
            <p className="text-sm text-gray-400 mb-6">Create a high-privilege teacher account. They will use this email and password to access the instructor portal.</p>
            
            {createError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> {createError}</div>}
            {createSuccess && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">{createSuccess}</div>}

            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                <input required type="text" value={newTeacher.name} onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})} className="w-full bg-[#111115] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Official Email</label>
                <input required type="email" value={newTeacher.email} onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})} className="w-full bg-[#111115] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Temporary Password</label>
                <input required type="text" minLength={6} value={newTeacher.password} onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})} className="w-full bg-[#111115] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500/50 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Assign to Section (Optional)</label>
                <select value={newTeacher.sectionId} onChange={(e) => setNewTeacher({...newTeacher, sectionId: e.target.value})} className="w-full bg-[#111115] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500/50">
                  <option value="">-- No primary section --</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors text-sm shadow-lg">Provision Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDirectory;
