import React from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';

const Sidebar = () => {
    const { role } = authService.getCurrentUser();

    if (!role) return null;

    const links = {
        student: [
            { path: '/student/dashboard', label: 'Dashboard' },
            { path: '/student/attendance', label: 'Attendance' },
            { path: '/student/results', label: 'My Results' },
            { path: '/student/assignments', label: 'Assignments' },
            { path: '/student/timetable', label: 'Timetable' },
            { path: '/student/notifications', label: 'Notifications' },
            { path: '/student/holidays', label: 'Holidays' },
            { path: '/student/fees', label: 'Fees Status' },
            { path: '/student/profile', label: 'Profile' }
        ],
        teacher: [
            { path: '/teacher/dashboard', label: 'Dashboard' },
            { path: '/teacher/attendance', label: 'Mark Attendance' },
            { path: '/teacher/upload-result', label: 'Upload Results' },
            { path: '/teacher/assignment', label: 'Create Assignment' },
            { path: '/teacher/students', label: 'My Students' },
            { path: '/teacher/messaging', label: 'Messages' },
            { path: '/teacher/holidays', label: 'Holidays' },
            { path: '/teacher/profile', label: 'Profile' }
        ],
        admin: [
            { path: '/admin/dashboard', label: 'Add Student' },
            { path: '/admin/add-teacher', label: 'Add Teacher' },
            { path: '/admin/manage-students', label: 'Student List' },
            { path: '/admin/manage-teachers', label: 'Teacher List' },
            { path: '/admin/classes', label: 'Classes & Sections' },
            { path: '/admin/assign-teacher', label: 'Assign Teacher' },
            { path: '/admin/subjects', label: 'Subjects' },
            { path: '/admin/exams', label: 'Exams' },
            { path: '/admin/fees', label: 'Finance' },
            { path: '/admin/holidays', label: 'Holidays' },
            { path: '/admin/reports', label: 'Reports' },
            { path: '/admin/profile', label: 'Profile' }
        ]
    };

    return (
        <div style={{ width: '220px', backgroundColor: '#343a40', color: '#fff', height: '100vh', padding: '20px', position: 'sticky', top: '50px' }}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {links[role].map(link => (
                    <li key={link.path} style={{ marginBottom: '12px' }}>
                        <Link to={link.path} style={{ textDecoration: 'none', color: '#adb5bd', fontSize: '14px' }}>{link.label}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
