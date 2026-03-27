import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

const Sidebar = () => {
    const location = useLocation();
    const { role, name } = authService.getCurrentUser();
    const [openMenus, setOpenMenus] = useState({});

    if (!role) return null;

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({
            [label]: !prev[label]
        }));
    };

    const studentLinks = [
        { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
        { 
            label: 'Academic', 
            icon: '🎓',
            subLinks: [
                { path: '/student/assignments', label: 'Assignment' },
                { path: '/student/attendance', label: 'Attendance Status' },
                { 
                    label: 'Exam Result',
                    subLinks: [
                        { path: '/student/results/exam', label: 'Main Exam Result' },
                        { path: '/student/results/mst', label: 'MST Result' }
                    ]
                },
                { path: '/student/timetable', label: 'Time Table' }
            ]
        },
        {
            label: 'Account',
            icon: '💰',
            subLinks: [
                { path: '/student/fees', label: 'Fees Receipt' },
                { path: '/student/ledger', label: 'Student Ledgers' }
            ]
        },
        {
            label: 'General Info',
            icon: 'ℹ️',
            subLinks: [
                { path: '/student/contact', label: 'Contact' },
                { path: '/student/notifications', label: 'Notice' },
                { path: '/student/syllabus', label: 'Syllabus' },
                { path: '/student/profile', label: 'Your Profile' }
            ]
        }
    ];

    const teacherLinks = [
        { path: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/teacher/attendance', label: 'Mark Attendance', icon: '✅' },
        { path: '/teacher/upload-result', label: 'Upload Results', icon: '📤' },
        { path: '/teacher/assignment', label: 'Create Assignment', icon: '➕' },
        { path: '/teacher/students', label: 'My Students', icon: '👥' },
    ];

    const adminLinks = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { 
            label: 'User Management', 
            icon: '👥',
            subLinks: [
                { path: '/admin/manage-students', label: 'Student List' },
                { path: '/admin/manage-teachers', label: 'Teacher List' },
                { path: '/admin/add-student', label: 'Add Student' },
                { path: '/admin/add-teacher', label: 'Add Teacher' },
            ]
        },
        {
            label: 'Academic',
            icon: '🎓',
            subLinks: [
                { path: '/admin/classes', label: 'Classes & Sections' },
                { path: '/admin/assign-teacher', label: 'Assign Teacher' },
                { path: '/admin/exams', label: 'Exams' },
                { path: '/admin/holidays', label: 'Holidays' },
            ]
        },
        { path: '/admin/fees', label: 'Finance', icon: '💰' },
    ];

    const links = role === 'student' ? studentLinks : (role === 'teacher' ? teacherLinks : adminLinks);

    const NavItem = ({ item, depth = 0 }) => {
        const hasSubLinks = item.subLinks && item.subLinks.length > 0;
        const isOpen = openMenus[item.label];
        const isActive = location.pathname === item.path;
        
        // Auto-open parent if child is active (simplified for 2 levels)
        const isChildActive = hasSubLinks && item.subLinks.some(sub => 
            sub.path === location.pathname || (sub.subLinks && sub.subLinks.some(ss => ss.path === location.pathname))
        );

        return (
            <div className="flex flex-col">
                {item.path ? (
                    <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                            isActive 
                            ? 'bg-school-navy text-white shadow-md shadow-school-navy/10' 
                            : 'text-school-body hover:bg-slate-50 hover:text-school-navy'
                        }`}
                        style={{ marginLeft: `${depth * 12}px` }}
                    >
                        {item.icon && <span className="text-lg">{item.icon}</span>}
                        <span>{item.label}</span>
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-50"></div>}
                    </Link>
                ) : (
                    <button
                        onClick={() => toggleMenu(item.label)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                            isChildActive ? 'text-school-navy' : 'text-school-body hover:bg-slate-50 hover:text-school-navy'
                        }`}
                        style={{ marginLeft: `${depth * 12}px` }}
                    >
                        {item.icon && <span className="text-lg">{item.icon}</span>}
                        <span>{item.label}</span>
                        <span className={`ml-auto text-[10px] transition-transform duration-200 ${isOpen || isChildActive ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>
                )}

                {(isOpen || isChildActive) && hasSubLinks && (
                    <div className="mt-1 space-y-1">
                        {item.subLinks.map((sub, i) => (
                            <NavItem key={i} item={sub} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col transition-all duration-300 z-50">
            {/* Branding Removed from Sidebar as per request */}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar scrollbar-hide">
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 mt-2">Main Menu</p>
                {links.map((link, i) => (
                    <NavItem key={i} item={link} />
                ))}
            </nav>

            {/* User Footer */}
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
