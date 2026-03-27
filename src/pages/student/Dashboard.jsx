import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const StudentDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [timetable, setTimetable] = useState([]);
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, timetableRes, noticeRes] = await Promise.all([
                    api.get('students/profile/'),
                    api.get('timetable/'),
                    api.get('communication/my/')
                ]);
                setProfile(profileRes.data);
                
                // Filter timetable for today
                const todaySlots = timetableRes.data.filter(slot => slot.day === today);
                setTimetable(todaySlots);
                
                setNotices(noticeRes.data);
            } catch (err) {
                console.error("Error fetching dashboard data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [today]);

    // Placeholder data for LMS (as requested by user for missing backend)
    const lmsSubjects = [
        { code: 'CS101', name: 'Intro to Computer Science', instructor: 'Dr. Smith', progress: '65%' },
        { code: 'MATH202', name: 'Advanced Calculus', instructor: 'Prof. Johnson', progress: '40%' },
        { code: 'PHY105', name: 'Physics I (Mechanics)', instructor: 'Dr. Brown', progress: '80%' },
        { code: 'ENG101', name: 'Communication Skills', instructor: 'Mrs. Davis', progress: '95%' }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-school-navy/20 border-t-school-navy rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Dashboard</h1>
                    <p className="text-slate-500 font-medium mt-1">Welcome back, <span className="text-school-navy font-bold">{profile?.name || 'Student'}</span>! Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <span className="text-lg">🗓️</span>
                    <span className="text-sm font-bold text-slate-600">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Content Area (2 Columns) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Today's Time Table */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-school-navy/10 flex items-center justify-center text-xl text-school-navy">⏰</span>
                                <h2 className="text-xl font-black text-slate-800">Today's Time Table</h2>
                            </div>
                            <span className="px-3 py-1 bg-school-navy text-white text-[10px] font-black uppercase tracking-widest rounded-full">{today}</span>
                        </div>
                        <div className="p-6">
                            {timetable.length > 0 ? (
                                <div className="space-y-4">
                                    {timetable.map((slot, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 hover:border-school-navy/10 hover:bg-slate-50 transition-all group">
                                            <div className="w-20 text-center font-bold text-slate-400 text-xs uppercase">
                                                {slot.start_time.slice(0, 5)}
                                            </div>
                                            <div className="w-1 h-10 bg-school-blue/20 rounded-full group-hover:bg-school-navy transition-colors"></div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800 text-sm">{slot.subject || 'Subject'}</h4>
                                                <p className="text-[11px] text-slate-400 font-medium">Room: {slot.room_info || '101'} • {slot.teacher_name || 'Instructor'}</p>
                                            </div>
                                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg border border-emerald-100">ONGOING</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-slate-400 font-bold italic">No classes scheduled for today.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Academic LMS (Subject List) */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
                            <span className="w-10 h-10 rounded-xl bg-school-blue/10 flex items-center justify-center text-xl text-school-blue">📚</span>
                            <h2 className="text-xl font-black text-slate-800">Academic LMS</h2>
                        </div>
                        <div className="p-6 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                        <th className="pb-4 px-2">#</th>
                                        <th className="pb-4">Subject</th>
                                        <th className="pb-4">Instructor</th>
                                        <th className="pb-4">Progress</th>
                                        <th className="pb-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {lmsSubjects.map((sub, i) => (
                                        <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                            <td className="py-5 px-2 text-sm font-bold text-slate-400">{i + 1}</td>
                                            <td className="py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-800 leading-tight group-hover:text-school-navy transition-colors">{sub.name}</span>
                                                    <span className="text-[11px] text-slate-400 font-bold mt-1 opacity-70 group-hover:opacity-100">{sub.code}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 text-sm font-bold text-slate-600 italic">{sub.instructor}</td>
                                            <td className="py-5">
                                                <div className="w-32 flex flex-col gap-1.5">
                                                    <div className="flex justify-between text-[10px] font-black italic">
                                                        <span className="text-slate-400">{sub.progress}</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden shadow-inner">
                                                        <div className="bg-school-blue h-full rounded-full shadow-sm" style={{ width: sub.progress }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 text-right">
                                                <button className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[11px] font-black group-hover:bg-school-navy group-hover:text-white transition-all shadow-sm">View LMS &gt;&gt;</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Area (1 Column) */}
                <div className="space-y-8">
                    
                    {/* News & Notices */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl text-orange-500">📢</span>
                                <h2 className="text-xl font-black text-slate-800">News & Notice</h2>
                            </div>
                            <button className="text-[10px] font-bold text-school-blue hover:underline uppercase tracking-widest italic">View All</button>
                        </div>
                        <div className="p-6 space-y-6">
                            {notices.length > 0 ? (
                                notices.slice(0, 3).map((notice, i) => (
                                    <div key={i} className="flex flex-col gap-2 p-1 relative">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[9px] font-black text-school-navy bg-school-navy/5 px-2 py-0.5 rounded-md uppercase">NOTICE</span>
                                            <span className="text-[9px] font-bold text-slate-400 italic">2h ago</span>
                                        </div>
                                        <h4 className="font-bold text-sm text-slate-800 leading-snug">{notice.title}</h4>
                                        <p className="text-[11px] text-slate-400 font-medium line-clamp-2">{notice.message}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2 p-1 border-b border-slate-50 pb-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[9px] font-black text-school-navy bg-school-navy/5 px-2 py-0.5 rounded-md uppercase">EVENT</span>
                                            <span className="text-[9px] font-bold text-slate-400 italic">Mar 28, 2026</span>
                                        </div>
                                        <h4 className="font-bold text-sm text-slate-800 leading-snug">Annual Science Fair 2026</h4>
                                        <p className="text-[11px] text-slate-400 font-medium">Please submit your project titles by end of this week to your respective faculty mentors.</p>
                                    </div>
                                    <div className="flex flex-col gap-2 p-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[9px] font-black text-school-blue bg-school-blue/5 px-2 py-0.5 rounded-md uppercase">HOLIDAY</span>
                                            <span className="text-[9px] font-bold text-slate-400 italic">Mar 30, 2026</span>
                                        </div>
                                        <h4 className="font-bold text-sm text-slate-800 leading-snug">Holiday Announcement</h4>
                                        <p className="text-[11px] text-slate-400 font-medium">School will remain closed on March 30th due to local festival. Classes will resume normally on the 31st.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Simple Calendar Placeholder */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
                            <span className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl text-emerald-500">📅</span>
                            <h2 className="text-xl font-black text-slate-800">Academic Calendar</h2>
                        </div>
                        <div className="p-6">
                            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest italic">March 2026</h3>
                                    <div className="flex gap-2">
                                        <button className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px]">◀</button>
                                        <button className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px]">▶</button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                    {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="text-[9px] font-black text-slate-400">{d}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: 31 }).map((_, i) => (
                                        <div key={i} className={`h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all
                                            ${i + 1 === 26 ? 'bg-school-navy text-white shadow-lg shadow-school-navy/20' : 'hover:bg-white hover:shadow-sm text-slate-600 cursor-pointer'}
                                            ${(i + 1) % 7 === 0 || (i + 1) % 7 === 1 ? 'text-red-400' : ''}`}>
                                            {i + 1}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-3 p-2 border-l-2 border-school-navy bg-slate-50/50 rounded-r-lg">
                                    <span className="text-[9px] font-black text-slate-400 italic">MAR 28</span>
                                    <span className="text-[10px] font-bold text-slate-700">Science Fair</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 border-l-2 border-orange-400 bg-slate-50/50 rounded-r-lg">
                                    <span className="text-[9px] font-black text-slate-400 italic">APR 05</span>
                                    <span className="text-[10px] font-bold text-slate-700">MST Exam Starts</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
