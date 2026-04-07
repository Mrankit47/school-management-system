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
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('institutions'); // 'institutions' | 'dealers'
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDealerModalOpen, setIsDealerModalOpen] = useState(false);
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

  // New Dealer Form State
  const [dealerFormData, setDealerFormData] = useState({
    name: '',
    contact: '',
    location: '',
    admin_username: '',
    admin_email: '',
    admin_password: '',
  });

  const fetchSchools = async () => {
    try {
      const response = await api.get('/tenants/admin-schools/');
      setSchools(response.data);
    } catch (err) {
      setError('Failed to fetch platform schools.');
    }
  };

  const fetchDealers = async () => {
    try {
      const response = await api.get('/dealers/management/');
      setDealers(response.data);
    } catch (err) {
      console.error('Failed to fetch dealers');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchSchools(), fetchDealers()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
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

  const handleCreateDealer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/dealers/management/', dealerFormData);
      setIsDealerModalOpen(false);
      fetchDealers();
      setDealerFormData({
        name: '',
        contact: '',
        location: '',
        admin_username: '',
        admin_email: '',
        admin_password: '',
      });
    } catch (err) {
      alert(err.response?.data?.detail || 'Error creating dealer. Please verify unique fields.');
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

  const toggleDealerStatus = async (id) => {
    try {
      await api.post(`/dealers/management/${id}/toggle_active/`);
      fetchDealers();
    } catch (err) {
      alert('Failed to update dealer status.');
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
          
          <div className="flex items-center gap-6">
            {/* Toggle Switch */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center shadow-inner border border-slate-200">
              <button 
                onClick={() => setViewMode('institutions')}
                className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'institutions' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Institutions
              </button>
              <button 
                onClick={() => setViewMode('dealers')}
                className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'dealers' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Dealers
              </button>
            </div>

            {viewMode === 'institutions' ? (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl text-sm font-bold shadow-2xl shadow-blue-600/20 transition-all active:scale-[0.98]"
              >
                + Create Institution
              </button>
            ) : (
              <button 
                onClick={() => setIsDealerModalOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl text-sm font-bold shadow-2xl shadow-slate-900/20 transition-all active:scale-[0.98]"
              >
                + Create New Dealer
              </button>
            )}
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

        {/* Main Content Area */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {viewMode === 'institutions' ? 'Direct Institutions' : 'Authorized Dealers'}
            </h2>
            <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-full uppercase tracking-widest">
              {viewMode === 'institutions' ? 'Superadmin Managed' : 'Network Partners'}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {viewMode === 'institutions' ? (
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
                  {schools.filter(s => s.dealer === null).map((school) => (
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
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-10 py-5">Dealer Profile</th>
                    <th className="px-10 py-5">Location</th>
                    <th className="px-10 py-5">Managed Schools</th>
                    <th className="px-10 py-5">Login Access</th>
                    <th className="px-10 py-5 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dealers.map((dealer) => (
                    <tr key={dealer.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-lg border border-slate-800">
                            {dealer.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-none">{dealer.name}</p>
                            <p className="text-xs text-slate-400 mt-1.5">{dealer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-xs font-bold text-slate-600">
                          {dealer.location}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{dealer.school_count}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Units</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${dealer.is_active ? 'bg-indigo-500' : 'bg-red-500'} animate-pulse`}></span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${dealer.is_active ? 'text-indigo-600' : 'text-red-600'}`}>
                            {dealer.is_active ? 'Authorized' : 'Suspended'}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right space-x-3">
                        <button 
                          onClick={() => {
                            setViewingSchool({ 
                              name: dealer.name, 
                              schools: dealer.schools,
                              isDealer: true,
                              email: dealer.email,
                              location: dealer.location,
                              is_active: dealer.is_active
                            });
                            setIsViewModalOpen(true);
                          }}
                          className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                        >
                          View Detail
                        </button>
                        <button 
                          onClick={() => toggleDealerStatus(dealer.id)}
                          className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg border transition-all
                            ${dealer.is_active 
                              ? 'text-red-500 border-red-100 hover:bg-red-50' 
                              : 'text-indigo-500 border-indigo-100 hover:bg-indigo-50'}`}
                        >
                          {dealer.is_active ? 'Suspend Dealer' : 'Re-Authorize'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
              
              <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Register New School</h2>
              <p className="text-slate-500 mb-10 text-sm font-medium">Create a new isolated tenant environment.</p>

              <form onSubmit={handleCreateSchool} className="space-y-10">
                <div className="space-y-6">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] border-b border-blue-50 pb-2">Institutional Profile</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">School Name</label>
                       <input 
                         type="text" 
                         required 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                         placeholder="e.g. Atheris Lab School"
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tenant ID</label>
                       <input 
                         type="text" 
                         required 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium font-mono text-blue-600"
                         placeholder="e.g. ATHERIS"
                         value={formData.school_id}
                         onChange={(e) => setFormData({...formData, school_id: e.target.value.toUpperCase()})}
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                    <input 
                      type="email" 
                      required 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                      placeholder="admin@school.com"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">About School</label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium h-24 resize-none"
                      placeholder="Brief description of the institution..."
                      value={formData.about}
                      onChange={(e) => setFormData({...formData, about: e.target.value})}
                    ></textarea>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] border-b border-blue-50 pb-2">Root Admin Account</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Full Name</label>
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
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Email</label>
                       <input 
                         type="email" 
                         required 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                         placeholder="john@example.com"
                         value={formData.admin_email}
                         onChange={(e) => setFormData({...formData, admin_email: e.target.value})}
                       />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                       <input 
                         type="text" 
                         required 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                         placeholder="admin_root"
                         value={formData.admin_username}
                         onChange={(e) => setFormData({...formData, admin_username: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Initial Password</label>
                       <input 
                         type="password" 
                         required 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                         placeholder="••••••••••••"
                         value={formData.admin_password}
                         onChange={(e) => setFormData({...formData, admin_password: e.target.value})}
                       />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-2xl shadow-blue-600/20 transition-all active:scale-[0.98] text-sm tracking-wide"
                  >
                    Initialize Tenant Infrastructure
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Dealer Modal */}
        {isDealerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-12 relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setIsDealerModalOpen(false)}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 text-2xl transition-colors"
              >✕</button>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Onboard New Dealer</h2>
              <p className="text-slate-500 mb-10 text-sm font-medium">Create an independent dealer account for platform expansion.</p>

              <form onSubmit={handleCreateDealer} className="space-y-10">
                <div className="space-y-6">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] border-b border-blue-50 pb-2">Dealer Profile</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dealer Name</label>
                       <input 
                         type="text" 
                         required 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                         placeholder="e.g. North Zone Distributions"
                         value={dealerFormData.name}
                         onChange={(e) => setDealerFormData({...dealerFormData, name: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                       <input 
                         type="text" 
                         required 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                         placeholder="+91 00000 00000"
                         value={dealerFormData.contact}
                         onChange={(e) => setDealerFormData({...dealerFormData, contact: e.target.value})}
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location / Territory</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                      placeholder="e.g. Jaipur, Rajasthan"
                      value={dealerFormData.location}
                      onChange={(e) => setDealerFormData({...dealerFormData, location: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] border-b border-blue-50 pb-2">Dealer Login Account</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                       <input 
                         type="text" 
                         required 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                         placeholder="dealer_north"
                         value={dealerFormData.admin_username}
                         onChange={(e) => setDealerFormData({...dealerFormData, admin_username: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                       <input 
                         type="email" 
                         required 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                         placeholder="dealer@example.com"
                         value={dealerFormData.admin_email}
                         onChange={(e) => setDealerFormData({...dealerFormData, admin_email: e.target.value})}
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                    <input 
                      type="password" 
                      required 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-medium"
                      placeholder="••••••••••••"
                      value={dealerFormData.admin_password}
                      onChange={(e) => setDealerFormData({...dealerFormData, admin_password: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl shadow-2xl shadow-slate-900/20 transition-all active:scale-[0.98] text-sm tracking-wide"
                  >
                    Confirm Registration
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Detail Modal (Unified for Institutions and Dealer Managed Schools) */}
        {isViewModalOpen && viewingSchool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-12 relative max-h-[90vh] overflow-y-auto font-inter">
              <button 
                onClick={() => { setIsViewModalOpen(false); setViewingAdmins([]); setViewingSchool(null); }}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 text-2xl transition-colors"
              >✕</button>
              
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 font-bold text-3xl overflow-hidden border border-slate-200">
                    {viewingSchool.logo ? <img src={viewingSchool.logo} alt="" className="w-full h-full object-cover" /> : (viewingSchool.name?.[0] || 'D')}
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{viewingSchool.name}</h2>
                    {viewingSchool.school_id && <p className="text-blue-600 font-mono text-sm font-bold mt-1">ID: {viewingSchool.school_id}</p>}
                 </div>
              </div>

              {viewingSchool.schools ? (
                /* Dealer Schools List View */
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8 mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dealer Email</p>
                      <p className="text-sm font-semibold text-slate-900">{viewingSchool.email || 'Not Provided'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dealer Location</p>
                      <p className="text-sm font-semibold text-slate-900">{viewingSchool.location || 'Not Provided'}</p>
                    </div>
                  </div>

                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50 pb-2">Managed Institutions</p>
                  <div className="grid grid-cols-1 gap-4">
                    {viewingSchool.schools && viewingSchool.schools.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{s.name}</p>
                          <p className="text-xs font-mono text-slate-400 mt-1">{s.school_id}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${s.is_active ? 'text-green-600' : 'text-red-600'}`}>
                            {s.is_active ? 'Online' : 'Suspended'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {(!viewingSchool.schools || viewingSchool.schools.length === 0) && (
                      <p className="text-center py-10 text-slate-400 text-sm italic">No institutions registered under this dealer yet.</p>
                    )}
                  </div>
                </div>
              ) : (
                /* Single School Detail View */
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
              )}

              <div className="mt-12">
                   <button 
                    onClick={() => { setIsViewModalOpen(false); setViewingAdmins([]); setViewingSchool(null); }}
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
