import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Navbar = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 w-full h-16 flex items-center px-6">
            <div className="flex-1 flex items-center gap-4">
                {/* Search Bar UI */}
                <div className="relative max-w-md w-full hidden md:block">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search students, teachers, or reports..." 
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-school-navy/10 focus:border-school-navy transition-all duration-200"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications Icon (UI Only) */}
                <button className="p-2 text-slate-500 hover:bg-slate-50 hover:text-school-navy rounded-xl transition-colors relative">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Profile Section */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-school-text leading-none">{user.name}</p>
                        <p className="text-[10px] text-school-body uppercase tracking-wider font-semibold mt-1">{user.role}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-school-navy/10 flex items-center justify-center text-school-navy font-bold shadow-inner">
                        {user.name ? user.name.charAt(0) : 'U'}
                    </div>
                </div>

                {/* Logout Button */}
                <button 
                    onClick={handleLogout}
                    className="ml-2 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Navbar;
