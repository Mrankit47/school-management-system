import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

const Sidebar = () => {
    const location = useLocation();
    const { role, name } = authService.getCurrentUser();

    if (!role) return null;

    const links = {
        student: [
            { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
            { path: '/student/attendance', label: 'Attendance', icon: '📅' },
            { path: '/student/results', label: 'My Results', icon: '📝' },
            { path: '/student/assignments', label: 'Assignments', icon: '📚' },
            { path: '/student/timetable', label: 'Timetable', icon: '⏰' },
            { path: '/student/notifications', label: 'Notifications', icon: '🔔' },
            { path: '/student/fees', label: 'Fees Status', icon: '💰' }
        ],
        teacher: [
            { path: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
            { path: '/teacher/attendance', label: 'Mark Attendance', icon: '✅' },
            { path: '/teacher/upload-result', label: 'Upload Results', icon: '📤' },
            { path: '/teacher/assignment', label: 'Create Assignment', icon: '➕' },
            { path: '/teacher/students', label: 'My Students', icon: '👥' },
            { path: '/teacher/messaging', label: 'Messages', icon: '💬' }
        ],
        admin: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
            { path: '/admin/add-student', label: 'Add Student', icon: '👤' },
            { path: '/admin/add-teacher', label: 'Add Teacher', icon: '👨‍🏫' },
            { path: '/admin/manage-students', label: 'Student List', icon: '👥' },
            { path: '/admin/manage-teachers', label: 'Teacher List', icon: '📋' },
            { path: '/admin/classes', label: 'Classes & Sections', icon: '🏫' },
            { path: '/admin/assign-teacher', label: 'Assign Teacher', icon: '🔗' },
            { path: '/admin/exams', label: 'Exams', icon: '📝' },
            { path: '/admin/fees', label: 'Finance', icon: '💰' },
            { path: '/admin/holidays', label: 'Holidays', icon: '🌴' },
            { path: '/admin/reports', label: 'Reports', icon: '📑' }
        ]
    };

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col transition-all duration-300 z-50">
            {/* Logo Section */}
            <div className="p-6 border-b border-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-school-navy rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-school-navy/20">
                        A
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-school-text tracking-tight uppercase">Atheris Lab</span>
                        <span className="text-[10px] font-bold text-school-blue uppercase tracking-widest">School System</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 mt-2">Main Menu</p>
                {links[role].map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                                isActive 
                                ? 'bg-school-navy text-white shadow-md shadow-school-navy/10' 
                                : 'text-school-body hover:bg-slate-50 hover:text-school-navy'
                            }`}
                        >
                            <span className={`text-lg transition-transform duration-200 group-hover:scale-110 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                                {link.icon}
                            </span>
                            <span>{link.label}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-50"></div>}
                        </Link>
                    );
                })}
            </nav>

            {/* User Footer (Optional but nice) */}
            <div className="p-4 border-t border-slate-50 bg-slate-50/50">
                <div className="flex items-center gap-3 p-2 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-school-blue/10 flex items-center justify-center text-school-blue font-bold text-xs uppercase">
                        {name?.[0] || 'U'}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-school-text truncate">{name || 'User'}</span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">{role}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
