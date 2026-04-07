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
    const [formData, setFormData] = useState({
        name: '', 
        school_id: '', 
        location: '', 
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
                name: '', school_id: '', location: '', about: '', contact_email: '',
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
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 fle items-center justify-center text-2xl flex">🏫</div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Schools</p>
                            <p className="text-3xl font-bold text-slate-900">{stats.total_schools}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 fle items-center justify-center text-2xl flex">📍</div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Territory Location</p>
                            <p className="text-xl font-bold text-slate-900">{user?.dealer_profile?.location || 'Assigned Territory'}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 fle items-center justify-center text-2xl flex">👤</div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dealer Status</p>
                            <p className="text-xl font-bold text-emerald-600">Verified Partner</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* School Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Your Registered Schools</h2>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{schools.length} total</span>
                </div>

                {schools.length === 0 ? (
                    <div className="bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 p-20 text-center">
                        <div className="text-4xl mb-4">🏢</div>
                        <h3 className="text-lg font-bold text-slate-900">No schools registered yet</h3>
                        <p className="text-sm text-slate-500 mt-2">Start by registering your first institution in your territory.</p>
                        <button 
                            onClick={() => setIsFormOpen(true)}
                            className="mt-6 text-indigo-600 font-bold hover:underline"
                        >
                            + Register School
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {schools.map(school => (
                            <div key={school.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-start justify-between mb-6">
                                    {school.logo ? (
                                        <img src={school.logo} alt={school.name} className="w-16 h-16 rounded-2xl shadow-lg" />
                                    ) : (
                                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-2xl font-bold">
                                            {school.name[0]}
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">✏️</button>
                                        <button 
                                            onClick={() => handleDeleteSchool(school.id)}
                                            className="p-2 hover:bg-red-50 rounded-xl text-red-400 transition-colors"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{school.name}</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {school.school_id}</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{school.location}</span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-6 h-8">{school.about || 'No description provided.'}</p>
                                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Created</span>
                                        <span className="text-[11px] font-bold text-slate-700">{new Date(school.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/school/${school.school_id}`)}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                    >
                                        View Portal →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
                                        onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none focus:bg-white focus:border-indigo-500/20 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Location (Must match yours)</label>
                                    <input
                                        type="text"
                                        placeholder={user?.dealer_profile?.location || "Your location"}
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none focus:bg-white focus:border-indigo-500/20 transition-all font-medium"
                                        required
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
        </div>
    );
};

export default DealerDashboard;
