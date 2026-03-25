import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
    const [counts, setCounts] = useState({ students: 0, teachers: 0, staff: 0 });
    const [recentStudents, setRecentStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', 
        name: '', admission_number: '', class_section: ''
    });
    const [teacherFormData, setTeacherFormData] = useState({
        username: '', email: '', password: '', 
        name: '', employee_id: '', subject_specialization: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsRes, teachersRes] = await Promise.all([
                    api.get('students/'),
                    api.get('teachers/')
                ]);
                setCounts({
                    students: studentsRes.data.length,
                    teachers: teachersRes.data.length,
                    staff: 12 // Placeholder for staff logic if not separate
                });
                setRecentStudents(studentsRes.data.slice(0, 5));
                setLoading(false);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e, type) => {
        e.preventDefault();
        const endpoint = type === 'student' ? 'students/admin/create-student/' : 'teachers/admin/create-teacher/';
        const data = type === 'student' ? formData : teacherFormData;
        
        try {
            await api.post(endpoint, data);
            setMessage({ text: `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`, type: 'success' });
            if (type === 'student') {
                setFormData({ username: '', email: '', password: '', name: '', admission_number: '', class_section: '' });
                // Re-fetch counts
                const res = await api.get('students/');
                setCounts(prev => ({ ...prev, students: res.data.length }));
                setRecentStudents(res.data.slice(0, 5));
            } else {
                setTeacherFormData({ username: '', email: '', password: '', name: '', employee_id: '', subject_specialization: '' });
                const res = await api.get('teachers/');
                setCounts(prev => ({ ...prev, teachers: res.data.length }));
            }
        } catch (err) {
            setMessage({ text: `Error creating ${type}.`, type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-school-text">Admin Dashboard</h1>
                    <p className="text-sm text-school-body">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-school-body hover:bg-slate-50 transition-colors shadow-sm">
                        Export Report
                    </button>
                    <button className="px-4 py-2 bg-school-navy text-white rounded-xl text-sm font-semibold hover:bg-school-blue transition-colors shadow-md shadow-school-navy/20">
                        + New Registration
                    </button>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Main Content (L-C) */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Stats Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            { label: 'Total Students', count: counts.students, color: 'bg-blue-500', icon: '🎓' },
                            { label: 'Total Teachers', count: counts.teachers, color: 'bg-indigo-500', icon: '👨‍🏫' },
                            { label: 'Total Staff', count: counts.staff, color: 'bg-emerald-500', icon: '👔' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center text-xl`}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-school-body uppercase tracking-wider">{stat.label}</p>
                                        <p className="text-2xl font-bold text-school-text mt-0.5">{loading ? '...' : stat.count}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart & Tables Container */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="font-bold text-school-text">Attendance Overview</h3>
                            <select className="text-xs border-none bg-slate-50 rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer text-school-body font-semibold">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>
                        <div className="p-6">
                            {/* Custom SVG Chart Placeholder */}
                            <div className="h-64 w-full flex items-end justify-between gap-2">
                                {[65, 80, 45, 90, 70, 85, 95].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div 
                                            className="w-full bg-slate-100 rounded-t-lg relative overflow-hidden transition-all duration-500 group-hover:bg-school-navy/10"
                                            style={{ height: '100%' }}
                                        >
                                            <div 
                                                className="absolute bottom-0 left-0 right-0 bg-school-navy rounded-t-lg transition-all duration-1000 ease-out"
                                                style={{ height: loading ? '0%' : `${h}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Day {i+1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Registrations Table */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50">
                            <h3 className="font-bold text-school-text">Recent Student Registrations</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Class</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-school-body">Loading data...</td></tr>
                                    ) : recentStudents.map((s) => (
                                        <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 text-xs font-medium text-school-body">{s.admission_number}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-school-navy uppercase">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-semibold text-school-text">{s.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-school-body">{s.class_name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-school-body">{s.email}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold">Active</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-slate-50 text-center">
                            <button className="text-xs font-bold text-school-navy hover:underline">View All Students</button>
                        </div>
                    </div>
                </div>

                {/* Right Panel (Sidebar Content) */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* Calendar Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-school-text">Calendar</h3>
                            <button className="text-xs text-school-navy font-bold">March 2026</button>
                        </div>
                        <div className="grid grid-cols-7 gap-2 mb-2">
                            {['S','M','T','W','T','F','S'].map(d => (
                                <div key={d} className="text-[10px] font-bold text-slate-400 text-center">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                                <div 
                                    key={day} 
                                    className={`aspect-square flex items-center justify-center text-xs rounded-lg cursor-pointer transition-all
                                        ${day === 25 ? 'bg-school-navy text-white font-bold shadow-md' : 'text-school-text hover:bg-slate-50'}
                                        ${[5, 12, 19, 26].includes(day) ? 'text-red-400' : ''}
                                    `}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Schedule / Events */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-school-text mb-6">Upcoming Events</h3>
                        <div className="space-y-6">
                            {[
                                { title: 'Staff Meeting', time: '09:00 AM', type: 'Work', color: 'bg-blue-500' },
                                { title: 'Parent-Teacher Meet', time: '11:30 AM', type: 'Event', color: 'bg-emerald-500' },
                                { title: 'Annual Sports Day', time: '02:00 PM', type: 'Priority', color: 'bg-red-500' },
                            ].map((event, i) => (
                                <div key={i} className="flex gap-4 group cursor-pointer">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full ${event.color} ring-4 ring-white shadow-sm ring-opacity-20`}></div>
                                        <div className="flex-1 w-px bg-slate-100 mt-2"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-school-text group-hover:text-school-navy transition-colors">{event.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-school-body font-medium">{event.time}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{event.type}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-2.5 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-400 hover:border-school-navy hover:text-school-navy transition-all">
                            + Add New Event
                        </button>
                    </div>

                    {/* Mini Forms Container (Refined existing logic) */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/20">
                        <h3 className="font-bold text-lg mb-4">Quick Registration</h3>
                        <div className="space-y-4">
                            <form onSubmit={(e) => handleSubmit(e, 'student')} className="space-y-3">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Student Profile</p>
                                <input 
                                    type="text" 
                                    placeholder="Name" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    className="w-full bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-school-blue outline-none placeholder-slate-500"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Adm No" 
                                        value={formData.admission_number} 
                                        onChange={e => setFormData({...formData, admission_number: e.target.value})} 
                                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-school-blue outline-none placeholder-slate-500"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Class-Sec" 
                                        value={formData.class_section} 
                                        onChange={e => setFormData({...formData, class_section: e.target.value})} 
                                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-school-blue outline-none placeholder-slate-500"
                                    />
                                </div>
                                <button type="submit" className="w-full py-2 bg-school-blue hover:bg-blue-400 transition-colors rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20">
                                    Create Student
                                </button>
                            </form>

                            {message.text && (
                                <p className={`text-[10px] text-center font-bold ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {message.text}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
