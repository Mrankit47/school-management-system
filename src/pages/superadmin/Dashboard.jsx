import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function SuperAdminDashboard() {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Create School State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newSchool, setNewSchool] = useState({ 
        name: '', school_id: '',
        admin_name: '', admin_username: '', admin_email: '', admin_password: '', admin_phone: ''
    });
    const [createError, setCreateError] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // View Admin State
    const [viewAdminSchool, setViewAdminSchool] = useState(null);
    const [schoolAdmins, setSchoolAdmins] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);

    const fetchSchools = async () => {
        try {
            const res = await api.get('tenants/admin-schools/');
            setSchools(res.data);
        } catch (error) {
            console.error("Failed to fetch schools", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    const handleCreateSchool = async (e) => {
        e.preventDefault();
        setCreateError('');
        setIsCreating(true);
        try {
            await api.post('tenants/admin-schools/', newSchool);
            setIsCreateModalOpen(false);
            setNewSchool({ 
                name: '', school_id: '',
                admin_name: '', admin_username: '', admin_email: '', admin_password: '', admin_phone: ''
            });
            fetchSchools();
        } catch (error) {
            if (error.response?.data?.school_id) {
                setCreateError("A school with this ID already exists.");
            } else {
                setCreateError(error.response?.data?.detail || "Failed to create school.");
            }
        } finally {
            setIsCreating(false);
        }
    };

    const toggleStatus = async (school) => {
        try {
            await api.patch(`tenants/admin-schools/${school.id}/`, { is_active: !school.is_active });
            fetchSchools();
        } catch (err) {
            console.error("Failed to update status");
            alert("Error updating school status.");
        }
    };

    const handleViewAdmins = async (school) => {
        setViewAdminSchool(school);
        setLoadingAdmins(true);
        try {
            const res = await api.get(`tenants/admin-schools/${school.id}/admins/`);
            setSchoolAdmins(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAdmins(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Registered Schools</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage global platforms and tenant accounts.</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                    <span>+</span> Add New School
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500 font-medium">Loading platform data...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                                <th className="px-6 py-4">School Profile</th>
                                <th className="px-6 py-4">Tenant ID</th>
                                <th className="px-6 py-4 text-center">Students</th>
                                <th className="px-6 py-4 text-center">Teachers</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {schools.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {s.logo ? (
                                                <img src={s.logo} alt="" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200 shadow-sm">{s.name[0]}</div>
                                            )}
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm leading-tight">{s.name}</p>
                                                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{s.contact_email || 'No email provided'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-[11px] text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/50 uppercase">{s.school_id}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-bold text-slate-600">{s.student_count || 0}</td>
                                    <td className="px-6 py-4 text-center text-sm font-bold text-slate-600">{s.teacher_count || 0}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => toggleStatus(s)}
                                            className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all hover:opacity-80
                                            ${s.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                            title="Click to toggle status"
                                        >
                                            {s.is_active ? 'Active' : 'Suspended'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleViewAdmins(s)}
                                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            View Admins
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {schools.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">No schools registered yet. Click "Add New School" to start.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create School Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Register New School</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-xl transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        {createError && (
                            <div className="mb-5 p-3.5 bg-red-50 text-red-600 text-[13px] font-bold rounded-xl border border-red-100 flex items-start gap-2">
                                <span className="text-lg">⚠️</span> {createError}
                            </div>
                        )}
                        <form onSubmit={handleCreateSchool} className="flex flex-col max-h-[70vh]">
                            <div className="overflow-y-auto custom-scrollbar p-1 pr-3 space-y-6">
                                {/* School Info Section */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">School Details</h4>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">School Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Atheris Lab School" 
                                            value={newSchool.name}
                                            onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-semibold text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Unique Tenant ID</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. ATHERIS" 
                                            value={newSchool.school_id}
                                            onChange={(e) => setNewSchool({...newSchool, school_id: e.target.value.toUpperCase()})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-mono text-sm font-bold text-blue-600 uppercase"
                                            required
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1.5 font-semibold leading-tight">Alphanumeric string without spaces. Used in the URL to identify this school.</p>
                                    </div>
                                </div>

                                {/* Admin Info Section */}
                                <div className="space-y-4 pt-2">
                                    <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">Primary Admin Account</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Admin Name</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. John Doe" 
                                                value={newSchool.admin_name}
                                                onChange={(e) => setNewSchool({...newSchool, admin_name: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-semibold text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Admin Phone</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. +1 555 0100" 
                                                value={newSchool.admin_phone}
                                                onChange={(e) => setNewSchool({...newSchool, admin_phone: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-semibold text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Admin Username</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. jdoe_admin" 
                                            value={newSchool.admin_username}
                                            onChange={(e) => setNewSchool({...newSchool, admin_username: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-semibold text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Admin Email</label>
                                        <input 
                                            type="email" 
                                            placeholder="e.g. admin@school.com" 
                                            value={newSchool.admin_email}
                                            onChange={(e) => setNewSchool({...newSchool, admin_email: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-semibold text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Initial Password</label>
                                        <input 
                                            type="password" 
                                            placeholder="••••••••" 
                                            value={newSchool.admin_password}
                                            onChange={(e) => setNewSchool({...newSchool, admin_password: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-semibold text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Sticky Footer */}
                            <div className="pt-5 mt-2 border-t border-slate-100 flex gap-3 bg-white shrink-0">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isCreating} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 text-sm">
                                    {isCreating ? 'Creating...' : 'Register School & Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Admin Modal */}
            {viewAdminSchool && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[85vh]">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">School Admins</h3>
                                <p className="text-xs font-semibold text-slate-500 mt-0.5">{viewAdminSchool.name}</p>
                            </div>
                            <button onClick={() => setViewAdminSchool(null)} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-1.5 rounded-xl shadow-sm border border-slate-200 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            {loadingAdmins ? (
                                <div className="text-center py-8 text-slate-500 font-medium">Fetching admins...</div>
                            ) : schoolAdmins.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-3 opacity-50">👤</div>
                                    <p className="text-slate-600 font-semibold text-sm">No administrators found.</p>
                                    <p className="text-slate-400 text-xs mt-1">This school currently does not have any assigned admin users.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {schoolAdmins.map((adm, idx) => (
                                        <div key={idx} className="bg-white border text-sm border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md hover:border-blue-100 transition-all">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100 shrink-0">
                                                {adm.name ? adm.name[0].toUpperCase() : 'A'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 truncate">{adm.name}</p>
                                                <p className="text-[12px] text-slate-500 font-medium truncate mt-0.5">{adm.email || adm.username}</p>
                                            </div>
                                            <div>
                                                <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${adm.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                    {adm.is_active ? 'Active' : 'Locked'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                            <button onClick={() => setViewAdminSchool(null)} className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider">Close Window</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
