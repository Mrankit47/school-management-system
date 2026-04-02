import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

/**
 * SuperAdmin Dashboard
 * Allows platform administrators to manage all school tenants.
 */
export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingSchool, setViewingSchool] = useState(null);
  const [viewingAdmins, setViewingAdmins] = useState([]);
  
  // New School Form State
  const [formData, setFormData] = useState({
    name: '',
    school_id: '',
    about: '',
    contact_email: '',
    admin_name: '',
    admin_email: '',
    admin_username: '',
    admin_password: '',
  });

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tenants/admin-schools/');
      setSchools(response.data);
    } catch (err) {
      setError('Failed to fetch platform schools.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tenants/admin-schools/', formData);
      setIsModalOpen(false);
      fetchSchools();
      setFormData({
        name: '',
        school_id: '',
        about: '',
        contact_email: '',
        admin_name: '',
        admin_email: '',
        admin_username: '',
        admin_password: '',
      });
    } catch (err) {
      alert(err.response?.data?.detail || 'Error creating school. Please verify unique fields.');
    }
  };

  const handleViewDetail = async (school) => {
    setViewingSchool(school);
    setIsViewModalOpen(true);
    try {
      const response = await api.get(`/tenants/admin-schools/${school.id}/admins/`);
      setViewingAdmins(response.data);
    } catch (err) {
      console.error('Failed to fetch school admins');
    }
  };

  const toggleSchoolStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/tenants/admin-schools/${id}/`, { is_active: !currentStatus });
      fetchSchools();
    } catch (err) {
      alert('Failed to update school status.');
    }
  };

  const stats = [
    { label: 'Total Institutions', value: schools.length, icon: '🏛️' },
    { label: 'Active Students', value: schools.reduce((acc, s) => acc + (s.student_count || 0), 0), icon: '🎓' },
    { label: 'Active Teachers', value: schools.reduce((acc, s) => acc + (s.teacher_count || 0), 0), icon: '👨‍🏫' },
    { label: 'Global Uptime', value: '99.9%', icon: '⚡' },
  ];

  if (loading && schools.length === 0) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-inter text-slate-500">Initializing Platform...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-inter text-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Overview</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Managing multi-tenant infrastructure for Atheris Lab School</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl text-sm font-bold shadow-2xl shadow-blue-600/20 transition-all active:scale-[0.98]"
            >
              + Create New Institution
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm">
              <div className="text-3xl mb-4">{s.icon}</div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-slate-900 font-outfit leading-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* School Table */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Active Institutions</h2>
            <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-full uppercase tracking-widest">
              Live Filtering Enabled
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-10 py-5">Institution</th>
                  <th className="px-10 py-5">Platform ID</th>
                  <th className="px-10 py-5">Capacity</th>
                  <th className="px-10 py-5">Status</th>
                  <th className="px-10 py-5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold text-lg overflow-hidden border border-slate-200">
                          {school.logo ? <img src={school.logo} alt="" className="w-full h-full object-cover" /> : school.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none">{school.name}</p>
                          <p className="text-xs text-slate-400 mt-1.5">{school.contact_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                        {school.school_id}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-none">{school.student_count || 0}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Students</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-none">{school.teacher_count || 0}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Teachers</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${school.is_active ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${school.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {school.is_active ? 'Online' : 'Suspended'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right space-x-3">
                      <button 
                        onClick={() => handleViewDetail(school)}
                        className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg border border-blue-100 text-blue-600 hover:bg-blue-50 transition-all"
                      >
                        View Detail
                      </button>
                      <button 
                        onClick={() => toggleSchoolStatus(school.id, school.is_active)}
                        className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg border transition-all
                          ${school.is_active 
                            ? 'text-red-500 border-red-100 hover:bg-red-50' 
                            : 'text-green-500 border-green-100 hover:bg-green-50'}`}
                      >
                        {school.is_active ? 'Suspend Gateway' : 'Restore Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create School Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-12 relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 text-2xl transition-colors"
              >✕</button>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Onboard New Institution</h2>
              <p className="text-slate-500 mb-10 text-sm font-medium">This action will initialize a new tenant isolation environment.</p>

              <form onSubmit={handleCreateSchool} className="space-y-10">
                {/* School Details */}
                <div className="space-y-6">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] border-b border-blue-50 pb-2">Institutional Metadata</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Official Name</label>
                       <input 
                         type="text" 
                         required 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                         placeholder="e.g. St. James Academy"
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Universal School ID</label>
                       <input 
                         type="text" 
                         required 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                         placeholder="e.g. stjames-01"
                         value={formData.school_id}
                         onChange={(e) => setFormData({...formData, school_id: e.target.value})}
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                    <input 
                      type="email" 
                      required 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                      placeholder="admin@school.edu"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    />
                  </div>
                </div>

                {/* Initial Admin Details */}
                <div className="space-y-6">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] border-b border-blue-50 pb-2">Administrative Root Account</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Legal Name</label>
                       <input 
                         type="text" 
                         required 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                         placeholder="John Doe"
                         value={formData.admin_name}
                         onChange={(e) => setFormData({...formData, admin_name: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Platform Username</label>
                       <input 
                         type="text" 
                         required 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                         placeholder="admin_stjames"
                         value={formData.admin_username}
                         onChange={(e) => setFormData({...formData, admin_username: e.target.value})}
                       />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Password</label>
                       <input 
                         type="password" 
                         required 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                         placeholder="••••••••••••"
                         value={formData.admin_password}
                         onChange={(e) => setFormData({...formData, admin_password: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Email</label>
                       <input 
                         type="email" 
                         required 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                         placeholder="john.doe@email.com"
                         value={formData.admin_email}
                         onChange={(e) => setFormData({...formData, admin_email: e.target.value})}
                       />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-2xl shadow-blue-600/20 transition-all active:scale-[0.98] text-sm tracking-wide"
                  >
                    Authorize Creation & Initialize Tenant
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View School Detail Modal */}
        {isViewModalOpen && viewingSchool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-12 relative max-h-[90vh] overflow-y-auto font-inter">
              <button 
                onClick={() => { setIsViewModalOpen(false); setViewingAdmins([]); }}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 text-2xl transition-colors"
              >✕</button>
              
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 font-bold text-3xl overflow-hidden border border-slate-200">
                    {viewingSchool.logo ? <img src={viewingSchool.logo} alt="" className="w-full h-full object-cover" /> : viewingSchool.name[0]}
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{viewingSchool.name}</h2>
                    <p className="text-blue-600 font-mono text-sm font-bold mt-1">ID: {viewingSchool.school_id}</p>
                 </div>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50 pb-2">Institutional Profile</p>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Email</p>
                      <p className="text-sm font-semibold text-slate-900">{viewingSchool.contact_email || 'Not Provided'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Status</p>
                      <p className={`text-sm font-bold ${viewingSchool.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {viewingSchool.is_active ? '● Active' : '● Suspended'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">About Institution</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{viewingSchool.about || 'No description provided for this tenant.'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] border-b border-blue-50 pb-2">Administrative Root Access</p>
                   {viewingAdmins.length > 0 ? (
                     <div className="space-y-6">
                        {viewingAdmins.map((admin, idx) => (
                          <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Admin Name</p>
                                <p className="text-sm font-bold text-slate-900">{admin.name}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Username</p>
                                <p className="text-sm font-mono font-bold text-blue-600">{admin.username}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Registered Email</p>
                                <p className="text-sm font-bold text-slate-900">{admin.email}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                     </div>
                   ) : (
                     <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading administrative data...</p>
                     </div>
                   )}
                </div>
              </div>

              <div className="mt-12">
                   <button 
                    onClick={() => { setIsViewModalOpen(false); setViewingAdmins([]); }}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]"
                   >
                    Close Profile
                   </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
