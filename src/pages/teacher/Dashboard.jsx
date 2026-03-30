import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import authService from '../../services/authService';

const TeacherDashboard = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [students, setStudents] = useState([]);
    const [attendanceDict, setAttendanceDict] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const { name } = authService.getCurrentUser() || { name: 'Teacher' };
    const [dashboardData, setDashboardData] = useState({
        classes_today: [],
        attendance_pending: 0,
        assignments_pending: 0,
        results_pending: 0,
        notifications: [],
        recent_activity: []
    });

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            api.get('classes/sections/').catch(() => ({ data: [] })),
            api.get('teacher/dashboard').catch(() => ({ data: { data: {} } }))
        ]).then(([classesRes, dashRes]) => {
            if (classesRes.data) setClasses(classesRes.data);
            if (dashRes.data && dashRes.data.data) {
                setDashboardData({
                    classes_today: dashRes.data.data.classes_today || [],
                    attendance_pending: dashRes.data.data.attendance_pending || 0,
                    assignments_pending: dashRes.data.data.assignments_pending || 0,
                    results_pending: dashRes.data.data.results_pending || 0,
                    notifications: dashRes.data.data.notifications || [],
                    recent_activity: dashRes.data.data.recent_activity || []
                });
            }
        }).finally(() => setIsLoading(false));
    }, []);

    const stats = [
        { label: 'Classes Today', value: dashboardData.classes_today.length || '0', icon: '🏫', color: 'bg-school-light text-school-navy', border: 'border-school-navy' },
        { label: 'Attendance Pending', value: dashboardData.attendance_pending, icon: '📋', color: 'bg-school-light text-school-navy', border: 'border-school-blue' },
        { label: 'Pending Review', value: dashboardData.assignments_pending, icon: '📝', color: 'bg-school-light text-school-navy', border: 'border-slate-400' },
        { label: 'Results Pending', value: dashboardData.results_pending, icon: '🎓', color: 'bg-school-light text-school-navy', border: 'border-school-sky' },
        { label: 'Notifications', value: dashboardData.notifications.length || '0', icon: '🔔', color: 'bg-school-light text-school-navy', border: 'border-slate-300' },
    ];

    const fetchStudents = async (id) => {
        setSelectedClassId(id);
        if (id) {
            try {
                const res = await api.get(`students/by-class/${id}/`);
                setStudents(res.data);
                
                const today = new Date().toISOString().split('T')[0];
                const attRes = await api.get(`attendance/class/${id}/date/${today}`);
                const dict = {};
                if (attRes.data && attRes.data.data) {
                    attRes.data.data.forEach(r => dict[r.student_id] = r.status);
                }
                setAttendanceDict(dict);
            } catch (err) {
                console.error(err);
            }
        } else {
            setStudents([]);
            setAttendanceDict({});
        }
    };

    const markPresent = async (studentId) => {
        const today = new Date().toISOString().split('T')[0];
        try {
            await api.post('attendance/mark/', {
                class_id: selectedClassId,
                date: today,
                records: [{ student_id: studentId, status: 'present' }]
            });
            setAttendanceDict(prev => ({...prev, [studentId]: 'present'}));
            // Refresh dashboard stats to update pending attendance
            api.get('teacher/dashboard').then(res => {
                if(res.data && res.data.data) {
                   setDashboardData(prev => ({...prev, attendance_pending: res.data.data.attendance_pending}));
                }
            });
        } catch (err) {
            alert(err.response?.data?.message || "Error marking attendance");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-school-navy rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-700 bg-gray-50 min-h-screen text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Teacher Dashboard</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Welcome back, <span className="text-school-navy font-bold">{name}</span>! Here's your overview for today.
                    </p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <span className="text-lg">🗓️</span>
                    <span className="text-sm font-bold text-slate-600">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* =========================================
                LAYER 1: TOP SUMMARY (STATS CARDS)
                ========================================= */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${stat.border} border-t border-r border-b border-slate-100 hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
                                <h3 className="text-2xl font-black text-slate-800 mt-2">{stat.value}</h3>
                            </div>
                            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-xl`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* =========================================
                LAYER 2: CORE WORK MODULES
                ========================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- LEFT SIDE (Main Work Area) --- */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* 1. Today's Schedule */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50 text-slate-800">
                            <span className="w-10 h-10 rounded-xl bg-school-light border border-slate-200 flex items-center justify-center text-xl">⏰</span>
                            <h2 className="text-xl font-black">Today's Schedule</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid gap-4">
                                {dashboardData.classes_today.map((cls, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 text-center font-bold text-slate-400 text-xs uppercase bg-white border border-slate-100 shadow-sm py-1.5 rounded-lg">
                                                {cls.time}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{cls.name}</h4>
                                                <p className="text-[11px] font-semibold text-slate-400">{cls.subject}</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-school-light border border-slate-200 text-school-navy rounded-xl text-xs font-bold hover:bg-school-navy hover:text-white transition-all shadow-sm">
                                            Take Attendance
                                        </button>
                                    </div>
                                ))}
                                {dashboardData.classes_today.length === 0 && (
                                    <div className="p-8 text-center text-slate-400 font-bold italic border border-dashed border-slate-200 rounded-2xl">
                                        No classes assigned for today.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Class Selector & Student List (Legacy API Integration) */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-school-light border border-slate-200 flex items-center justify-center text-xl">👥</span>
                                <h2 className="text-xl font-black text-slate-800">Quick Attendance Maker</h2>
                            </div>
                            <select 
                                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-school-navy outline-none bg-white"
                                onChange={(e) => fetchStudents(e.target.value)} 
                                value={selectedClassId}
                            >
                                <option value="">-- Choose a Class --</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.class_name} - {c.section_name}</option>
                                ))}
                            </select>
                        </div>
                        {selectedClassId ? (
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-white">
                                            <th className="p-4">Adm No</th>
                                            <th className="p-4">Student Name</th>
                                            <th className="p-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {students.length > 0 ? students.map(s => (
                                            <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4 text-sm font-bold text-slate-500">{s.admission_number}</td>
                                                <td className="p-4 text-sm font-black text-slate-800">{s.user.username}</td>
                                                <td className="p-4 text-right">
                                                    {attendanceDict[s.id] === 'present' ? (
                                                        <span className="text-school-navy font-bold text-xs uppercase bg-school-light border border-slate-200 px-3 py-1.5 rounded-lg">Present ✅</span>
                                                    ) : (
                                                    <button onClick={() => markPresent(s.id)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-school-navy hover:text-white transition-colors shadow-sm">
                                                        Mark Present
                                                    </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" className="p-8 text-center text-slate-400 font-bold italic">No students found in this class.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-10 text-center">
                                <div className="text-4xl mb-3">👆</div>
                                <p className="text-slate-400 font-bold text-sm">Select a class from the dropdown above to manage students.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- RIGHT SIDE (Support Panels) --- */}
                <div className="space-y-8">
                    
                    {/* 3. Quick Actions */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6">
                        <h2 className="text-lg font-black text-slate-800 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white text-school-navy hover:bg-school-navy hover:text-white transition-all group border border-slate-200 shadow-sm">
                                <span className="text-2xl group-hover:scale-110 transition-transform">📋</span>
                                <span className="text-[10px] font-bold uppercase tracking-wide">Attendance</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white text-school-navy hover:bg-school-navy hover:text-white transition-all group border border-slate-200 shadow-sm">
                                <span className="text-2xl group-hover:scale-110 transition-transform">➕</span>
                                <span className="text-[10px] font-bold uppercase tracking-wide">Assignment</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white text-school-navy hover:bg-school-navy hover:text-white transition-all group border border-slate-200 shadow-sm">
                                <span className="text-2xl group-hover:scale-110 transition-transform">📝</span>
                                <span className="text-[10px] font-bold uppercase tracking-wide">Enter Marks</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white text-school-navy hover:bg-school-navy hover:text-white transition-all group border border-slate-200 shadow-sm">
                                <span className="text-2xl group-hover:scale-110 transition-transform">✉️</span>
                                <span className="text-[10px] font-bold uppercase tracking-wide">Message</span>
                            </button>
                        </div>
                    </div>

                    {/* 4. Announcements */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-lg font-black text-slate-800">Announcements</h2>
                            <button className="text-[10px] font-bold text-school-navy uppercase tracking-widest hover:underline">View All</button>
                        </div>
                        <div className="p-5 space-y-4">
                            {dashboardData.notifications.map((ann, i) => (
                                <div key={i} className="flex flex-col gap-1 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-school-navy bg-school-light border border-slate-200 px-2 py-0.5 rounded uppercase">{ann.type}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{ann.time}</span>
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-800 mt-1">{ann.title}</h4>
                                </div>
                            ))}
                            {dashboardData.notifications.length === 0 && (
                                <p className="text-sm font-semibold text-slate-400 italic text-center py-4">No new announcements</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================================
                LAYER 3: ACTIVITY & INSIGHTS
                ========================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 5. Recent Activities */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">Recent Activities</h2>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.1rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        {dashboardData.recent_activity.map((act, i) => (
                            <div key={i} className="relative flex items-center gap-4">
                                <div className="w-9 h-9 rounded-full bg-white border-4 border-slate-50 shadow-sm flex items-center justify-center text-sm z-10">
                                    {act.icon || '✅'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">{act.text}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{act.time}</p>
                                </div>
                            </div>
                        ))}
                        {dashboardData.recent_activity.length === 0 && (
                            <p className="text-sm font-semibold text-slate-400 italic">No recent activities on record.</p>
                        )}
                    </div>
                </div>

                {/* 6. Performance Snapshot */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6">
                    <h2 className="text-lg font-black text-slate-800 mb-6">Performance Snapshot</h2>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-slate-700">Syllabus Completion (Class 10-A)</span>
                                <span className="text-xs font-black text-school-navy">75%</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-school-navy rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-slate-700">Average Attendance</span>
                                <span className="text-xs font-black text-school-blue">92%</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-school-blue rounded-full" style={{ width: '92%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-slate-700">Assignments Graded</span>
                                <span className="text-xs font-black text-school-sky">45/60</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-school-sky rounded-full" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TeacherDashboard;
