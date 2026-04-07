import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const DealerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total_schools: 0 });
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // View Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewingSchool, setViewingSchool] = useState(null);
    const [schoolAdmins, setSchoolAdmins] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);

    const [formData, setFormData] = useState({
        name: '', 
        school_id: '', 
        location: user?.dealer_profile?.location || '', 
        about: '', 
        contact_email: '',
        admin_name: '',
        admin_username: '',
        admin_email: '',
        admin_password: ''
    });
    const [message, setMessage] = useState('');

    const fetchSchools = async () => {
        try {
            const res = await api.get('dealers/schools/');
            setSchools(res.data);
            setStats({ total_schools: res.data.length });
        } catch (e) {
            console.error("Error fetching schools:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    const handleCreateSchool = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await api.post('dealers/schools/', formData);
            setMessage('School created successfully!');
            setIsFormOpen(false);
            setFormData({ 
                name: '', school_id: '', location: user?.dealer_profile?.location || '', about: '', contact_email: '',
                admin_name: '', admin_username: '', admin_email: '', admin_password: ''
            });
            fetchSchools();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.location?.[0] || err.response?.data?.detail || 'Error creating school.';
            setMessage(`Error: ${errorMsg}`);
        }
    };

    const handleDeleteSchool = async (id) => {
        if (!window.confirm("Are you sure you want to delete this school? This action cannot be undone.")) return;
        try {
            await api.delete(`dealers/schools/${id}/`);
            fetchSchools();
        } catch (err) {
            alert("Error deleting school.");
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.post(`dealers/schools/${id}/toggle_active/`);
            fetchSchools();
        } catch (err) {
            alert("Failed to update school status.");
        }
    };

    const handleViewDetail = async (school) => {
        setViewingSchool(school);
        setViewModalOpen(true);
        setLoadingAdmins(true);
        try {
            const res = await api.get(`dealers/schools/${school.id}/admins/`);
            setSchoolAdmins(res.data);
        } catch (err) {
            console.error("Error fetching school admins:", err);
        } finally {
            setLoadingAdmins(false);
        }
    };

    if (loading) return <div className="p-10 text-slate-500 font-inter">Loading Dashboard...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-inter p-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                        Dealer <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-school-blue">Dashboard</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage your delegated institutions and territory</p>
                </div>
                <button 
                    onClick={() => setIsFormOpen(true)}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2"
                >
                    <span className="text-lg">+</span> Register New School
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl">🏫</div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Schools</p>
                            <p className="text-3xl font-bold text-slate-900">{stats.total_schools}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">📍</div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Territory Location</p>
                            <p className="text-xl font-bold text-slate-900">{user?.dealer_profile?.location || 'Assigned Territory'}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">👤</div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dealer Status</p>
                            <p className="text-xl font-bold text-emerald-600">Verified Partner</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area (Table Layout) */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Your Registered Schools</h2>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-full uppercase tracking-widest">
                        {schools.length} total units
                    </span>
                </div>

                <div className="overflow-x-auto">
                    {schools.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="text-4xl mb-4">🏢</div>
                            <h3 className="text-lg font-bold text-slate-900">No schools registered yet</h3>
                            <p className="text-sm text-slate-500 mt-2">Start by registering your first institution in your territory.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    <th className="px-10 py-5">Institution</th>
                                    <th className="px-10 py-5">Platform ID</th>
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
                                                className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg border border-indigo-100 text-indigo-600 hover:bg-indigo-50 transition-all font-inter"
                                            >
                                                View Detail
                                            </button>
                                            <button 
                                                onClick={() => handleToggleStatus(school.id)}
                                                className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg border transition-all font-inter
                                                    ${school.is_active 
                                                        ? 'text-red-500 border-red-100 hover:bg-red-50' 
                                                        : 'text-green-500 border-green-100 hover:bg-green-50'}`}
                                            >
                                                {school.is_active ? 'Suspend Access' : 'Restore Access'}
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteSchool(school.id)}
                                                className="text-slate-300 hover:text-red-400 transition-colors"
                                            >
                                                🗑️
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
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 bg-slate-900 text-white flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-bold">New Institution Registration</h3>
                                <p className="text-slate-400 text-xs mt-1">Register a school within your assigned territory.</p>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="text-white/50 hover:text-white text-2xl">×</button>
                        </div>

                        <form onSubmit={handleCreateSchool} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">School Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter full school name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none focus:bg-white focus:border-indigo-500/20 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Unique School ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. DPS_WEST"
                                        value={formData.school_id}
                                        onChange={(e) => setFormData({ ...formData, school_id: e.target.value.toUpperCase() })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none focus:bg-white focus:border-indigo-500/20 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Location (Must match yours)</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.location}
                                        className="w-full bg-slate-100 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm outline-none font-bold text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Contact Email</label>
                                    <input
                                        type="email"
                                        placeholder="admin@school.com"
                                        value={formData.contact_email}
                                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none focus:bg-white focus:border-indigo-500/20 transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">About Institution</label>
                                <textarea
                                    placeholder="Brief description of the school..."
                                    value={formData.about}
                                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none focus:bg-white focus:border-indigo-500/20 transition-all font-medium min-h-[80px]"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100 mt-6">
                                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-6">Administrative Root Account</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Legal Name</label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.admin_name}
                                            onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none focus:bg-white focus:border-indigo-500/20 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Platform Username</label>
                                        <input
                                            type="text"
                                            placeholder="admin_username"
                                            value={formData.admin_username}
                                            onChange={(e) => setFormData({ ...formData, admin_username: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none focus:bg-white focus:border-indigo-500/20 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Admin Email</label>
                                        <input
                                            type="email"
                                            placeholder="john.doe@email.com"
                                            value={formData.admin_email}
                                            onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none focus:bg-white focus:border-indigo-500/20 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Admin Password</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.admin_password}
                                            onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none focus:bg-white focus:border-indigo-500/20 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                {message && (
                                    <span className={`text-xs font-bold ${message.includes('Error') ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {message}
                                    </span>
                                )}
                                <div className="flex gap-4 ml-auto">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="px-8 py-3.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                                    >
                                        Register School
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Detail Modal */}
            {viewModalOpen && viewingSchool && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-12 relative max-h-[90vh] overflow-y-auto font-inter">
                        <button 
                            onClick={() => { setViewModalOpen(false); setViewingSchool(null); setSchoolAdmins([]); }}
                            className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 text-2xl transition-colors"
                        >✕</button>
                        
                        <div className="flex items-center gap-6 mb-10">
                            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 font-bold text-3xl overflow-hidden border border-slate-200">
                                {viewingSchool.logo ? <img src={viewingSchool.logo} alt="" className="w-full h-full object-cover" /> : viewingSchool.name[0]}
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{viewingSchool.name}</h2>
                                <p className="text-indigo-600 font-mono text-sm font-bold mt-1">ID: {viewingSchool.school_id}</p>
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
                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em] border-b border-indigo-50 pb-2">Administrative Root Access</p>
                                {loadingAdmins ? (
                                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading administrative data...</p>
                                    </div>
                                ) : schoolAdmins.length > 0 ? (
                                    <div className="space-y-6">
                                        {schoolAdmins.map((admin, idx) => (
                                            <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Admin Name</p>
                                                        <p className="text-sm font-bold text-slate-900">{admin.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Username</p>
                                                        <p className="text-sm font-mono font-bold text-indigo-600">{admin.username}</p>
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
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No admins found.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-12">
                            <button 
                                onClick={() => { setViewModalOpen(false); setViewingSchool(null); setSchoolAdmins([]); }}
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealerDashboard;
