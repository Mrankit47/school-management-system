import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import SiblingSwitcher from '../student/SiblingSwitcher';
import { useStudent } from '../../context/StudentContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const user = authService.getCurrentUser();
    const [studentProfile, setStudentProfile] = useState(null);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { selectedStudentId, setSelectedStudentId } = useStudent();
    const [siblings, setSiblings] = useState([]);

    useEffect(() => {
        if (user.role === 'student') {
            api.get('students/profile/').then(res => setStudentProfile(res.data)).catch(() => { });
            api.get('students/siblings/').then(res => setSiblings(res.data)).catch(() => { });
        }
        if (user.role === 'teacher') {
            api.get('teachers/profile/').then(res => setTeacherProfile(res.data)).catch(() => { });
        }
    }, [user.role, selectedStudentId]);

    const handleLogout = () => {
        const sid = user.school_id;
        logout();
        if (sid && user.role !== 'superadmin') {
            navigate(`/school/${sid}`);
        } else {
            navigate('/');
        }
    };

    const displayName = user.role === 'student' ? (studentProfile?.name || user.name) : user.name;
    const initials = (displayName || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const profileId = user.role === 'student'
        ? studentProfile?.admission_number
        : user.role === 'teacher'
            ? teacherProfile?.employee_id
            : user?.id;

    // Unified Navbar for all roles
    return (
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between px-8">
            {/* Left Section: Branding */}
            <div className="flex items-center gap-4 min-w-[200px]">
                <div className="w-11 h-11 bg-school-navy rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-school-navy/20 animate-in fade-in zoom-in duration-700 overflow-hidden">
                    {user.role === 'superadmin' ? 'S' : user.role === 'dealer' ? 'D' : (
                        user.school_logo ? (
                            <img
                                src={user.school_logo}
                                alt="Logo"
                                className="w-full h-full object-contain bg-white rounded-xl border border-slate-100 shadow-sm transition-opacity duration-500"
                                onLoad={(e) => {
                                    e.target.style.opacity = '1';
                                }}
                                onError={(e) => {
                                    if (!e.target.dataset.triedFallback) {
                                        e.target.dataset.triedFallback = 'true';
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerText = user.school_name ? user.school_name[0].toUpperCase() : 'S';
                                    }
                                }}
                            />
                        ) : (
                            user.school_name ? user.school_name[0].toUpperCase() : 'S'
                        ))}
                </div>
                <div className="flex flex-col">
                    <h1 className="text-[13px] sm:text-base font-black text-slate-900 leading-tight tracking-tight uppercase truncate max-w-[150px] sm:max-w-xs">
                        {user.role === 'superadmin' ? 'Root User' : user.role === 'dealer' ? 'Dealer Portal' : (user.school_name || 'School Portal')}
                    </h1>
                    <p className="text-[9px] font-bold text-school-blue uppercase tracking-[0.2em] opacity-80">
                        {user.role === 'superadmin' ? 'Global Control' : user.role === 'dealer' ? 'Partner Access' : (user.school_id || 'System')}
                    </p>
                </div>
            </div>

            {/* Right: Notifications & Profile Dropdown */}
            <div className="flex items-center gap-5">
                {/* Repositioned Class Info */}
                {user.role === 'student' && (
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl items-center gap-2.5 shadow-sm hover:shadow-md transition-all group cursor-default">
                            <span className="text-lg group-hover:scale-110 transition-transform">🏫</span>
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Class</span>
                                <span className="text-[12px] font-black text-school-navy leading-tight">{studentProfile?.class_section_display || '...'}</span>
                            </div>
                        </div>
                        <SiblingSwitcher
                            siblings={siblings}
                            selectedStudentId={selectedStudentId}
                            onSwitch={setSelectedStudentId}
                        />
                    </div>
                )}

                {/* Notifications - Hidden for Superadmin and School Admin */}
                {user.role !== 'superadmin' && user.role !== 'admin' && (
                    <>
                        {user.role === 'student' || user.role === 'teacher' ? (
                            <Link
                                to={user.role === 'student' ? '/student/notifications' : '/teacher/notifications'}
                                className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all group"
                                aria-label="Notifications"
                            >
                                <span className="text-xl group-hover:scale-110 transition-transform">🔔</span>
                            </Link>
                        ) : (
                            <button type="button" className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all group">
                                <span className="text-xl group-hover:scale-110 transition-transform">🔔</span>
                            </button>
                        )}
                        <div className="h-8 w-px bg-slate-100 mx-1"></div>
                    </>
                )}

                {/* Profile Toggle */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 group bg-slate-50 hover:bg-slate-100 p-1.5 pr-4 rounded-2xl transition-all border border-transparent hover:border-slate-200"
                    >
                        <div className="relative">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-school-navy to-school-blue flex items-center justify-center text-white font-black text-sm shadow-lg shadow-school-navy/20 group-hover:scale-105 transition-transform overflow-hidden">
                                {initials}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-lg border-[3px] border-white shadow-sm"></div>
                        </div>
                        <div className="flex flex-col items-start min-w-[80px]">
                            <span className="text-[13px] font-black text-slate-800 leading-tight group-hover:text-school-navy transition-colors">
                                {user.role === 'student' ? (studentProfile?.name || user.name) : user.name}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{user.role}</span>
                        </div>
                        <span className={`text-[10px] text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                            <div className="absolute right-0 mt-4 w-72 bg-white rounded-3xl shadow-2xl shadow-slate-200/80 border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 transform origin-top-right">
                                <div className="p-6 bg-slate-50 border-b border-slate-100">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-school-navy text-xl font-black">
                                            {initials}
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="font-black text-slate-900 leading-tight">
                                                {user.role === 'student' ? (studentProfile?.name || user.name) : user.name}
                                            </h3>
                                            <p className="text-[11px] font-bold text-school-blue mt-0.5">ID: {profileId || '---'}</p>
                                        </div>
                                    </div>
                                    {user.role === 'student' && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-white p-2 rounded-xl border border-slate-100">
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter italic">Class</p>
                                                <p className="text-[10px] font-black text-slate-800">{studentProfile?.class_section_display || 'N/A'}</p>
                                            </div>
                                            <div className="bg-white p-2 rounded-xl border border-slate-100">
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter italic">Semester</p>
                                                <p className="text-[10px] font-black text-slate-800">1st (Current)</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-2">
                                    <Link
                                        to={`/${user.role}/profile`}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-school-navy rounded-2xl transition-all group"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">👤</span>
                                        View Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all group"
                                    >
                                        <span className="w-8 h-8 rounded-lg bg-red-100/50 flex items-center justify-center group-hover:scale-110 transition-transform">🚪</span>
                                        Sign Out
                                    </button>
                                </div>
                                <div className="p-4 bg-slate-50/50 text-center">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Atheris Secure Login</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
