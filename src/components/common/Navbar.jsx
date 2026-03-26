import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';

const Navbar = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const { logout } = useAuthStore();

    const handleLogout = () => {
        // Keep Zustand auth state and localStorage in sync.
        logout();
        navigate('/');
    };

    const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between px-8 transition-all duration-300">
            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-school-navy transition-colors">
                    🔍
                </span>
                <input 
                    type="text" 
                    placeholder="Search students, classes, or staff..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-school-navy/10 focus:bg-white focus:border-school-navy/20 transition-all font-medium placeholder-slate-400"
                />
            </div>

            {/* Right Section: User Profile & Actions */}
            <div className="flex items-center gap-6">
                <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-school-navy transition-all">
                    <span>🔔</span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-px bg-slate-100 mx-1"></div>

                <div className="flex items-center gap-4 group cursor-default">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-school-text group-hover:text-school-navy transition-colors">{user.name || 'System User'}</span>
                        <span className="text-[10px] font-bold text-school-blue uppercase tracking-widest">{user.role}</span>
                    </div>
                    
                    <div className="relative">
                        <div className="w-11 h-11 rounded-xl bg-school-navy flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-school-navy/20 active:scale-95 transition-transform overflow-hidden group-hover:ring-2 group-hover:ring-school-navy/10">
                            {initials}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-lg border-[3px] border-white shadow-sm"></div>
                    </div>
                </div>

                <div className="h-8 w-px bg-slate-100 mx-1"></div>

                <button 
                    onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all shadow-sm"
                    title="Logout"
                >
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
