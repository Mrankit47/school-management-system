import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

const Sidebar = () => {
    const { role } = authService.getCurrentUser();
    const location = useLocation();

    if (!role) return null;

    const links = {
        student: [
            { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
            { path: '/student/attendance', label: 'Attendance', icon: '📅' },
            { path: '/student/results', label: 'My Results', icon: '🏆' },
            { path: '/student/assignments', label: 'Assignments', icon: '📝' },
            { path: '/student/timetable', label: 'Timetable', icon: '⏰' },
            { path: '/student/notifications', label: 'Notifications', icon: '🔔' },
            { path: '/student/fees', label: 'Fees Status', icon: '💳' },
            { path: '/student/profile', label: 'Profile', icon: '👤' }
        ],
        teacher: [
            { path: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
            { path: '/teacher/attendance', label: 'Mark Attendance', icon: '✅' },
            { path: '/teacher/upload-result', label: 'Upload Results', icon: '📤' },
            { path: '/teacher/assignment', label: 'Create Assignment', icon: '➕' },
            { path: '/teacher/students', label: 'My Students', icon: '👥' },
            { path: '/teacher/messaging', label: 'Messages', icon: '💬' },
            { path: '/teacher/profile', label: 'Profile', icon: '👤' }
        ],
        admin: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
            { path: '/admin/manage-students', label: 'Students', icon: '👥' },
            { path: '/admin/manage-teachers', label: 'Teachers', icon: '👨‍🏫' },
            { path: '/admin/classes', label: 'Classes', icon: '🏫' },
            { path: '/admin/assign-teacher', label: 'Assignments', icon: '🔗' },
            { path: '/admin/exams', label: 'Exams', icon: '📝' },
            { path: '/admin/fees', label: 'Finance', icon: '💰' },
            { path: '/admin/holidays', label: 'Holidays', icon: '🌴' },
            { path: '/admin/reports', label: 'Reports', icon: '📈' },
            { path: '/admin/profile', label: 'Profile', icon: '👤' }
        ]
    };

    const activeLinks = links[role] || [];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col sticky top-0 overflow-y-auto">
            {/* Logo Section */}
            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-school-navy flex items-center justify-center text-white font-bold text-lg">A</div>
                <div>
                    <h1 className="text-sm font-bold text-school-text leading-none">Atheris Lab</h1>
                    <p className="text-[10px] text-school-body mt-0.5 uppercase tracking-wider font-semibold">Intelligence System</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Main Menu</p>
                <ul className="space-y-1">
                    {activeLinks.map(link => {
                        const isActive = location.pathname === link.path;
                        return (
                            <li key={link.path}>
                                <Link 
                                    to={link.path} 
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                                        isActive 
                                        ? 'bg-school-navy text-white shadow-md shadow-school-navy/20' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-school-navy'
                                    }`}
                                >
                                    <span className={`text-lg transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                        {link.icon}
                                    </span>
                                    <span className="text-sm font-medium">{link.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom Section */}
            <div className="p-4 mt-auto">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-xs font-bold text-school-text mb-1">Need help?</p>
                    <p className="text-[10px] text-school-body leading-relaxed mb-3">Check our documentation or contact support.</p>
                    <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-school-navy hover:bg-slate-50 transition-colors">
                        Documentation
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
