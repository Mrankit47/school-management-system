import React from 'react';
import authService from '../../services/authService';

const SuperAdminProfile = () => {
    const user = authService.getCurrentUser();
    
    const getInitials = (name) => {
        return (name || 'S').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-700 font-inter">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Platform Administrator</h1>
                <p className="text-slate-500 mt-2 text-lg font-medium">Manage your global SaaS infrastructure settings.</p>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/60 p-12 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/5 rounded-full -ml-36 -mb-36 blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-12">
                    <div className="flex-shrink-0">
                        <div className="w-40 h-40 rounded-[2.5rem] bg-slate-900 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-slate-900/20 transform hover:scale-105 transition-transform duration-500">
                            {getInitials(user?.name || user?.username)}
                        </div>
                        <div className="mt-6 flex justify-center">
                            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-100">
                                ● Online
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-10 w-full text-center md:text-left">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 mb-2 capitalize">{user?.name || user?.username || 'Administrator'}</h2>
                            <p className="text-blue-600 font-bold text-sm tracking-widest uppercase">System Superuser</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                            <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-300">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 leading-none">Authentication ID</p>
                                <p className="font-bold text-slate-900 font-mono">{user?.id || 'GLOBAL_ROOT'}</p>
                            </div>
                            <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-300">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 leading-none">Username</p>
                                <p className="font-bold text-slate-900 font-mono">@{user?.username || 'admin'}</p>
                            </div>
                            <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-300 sm:col-span-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 leading-none">Access Permissions</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {['Full System Access', 'Tenant Management', 'Security Protocols', 'Global Analytics'].map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button className="flex-1 px-8 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">
                                Manage Root Settings
                            </button>
                            <button className="flex-1 px-8 py-4 bg-white border-2 border-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:border-slate-200 hover:bg-slate-50 transition-all">
                                Platform Configuration
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                Secure Platform Management Environment
            </div>
        </div>
    );
};

export default SuperAdminProfile;
