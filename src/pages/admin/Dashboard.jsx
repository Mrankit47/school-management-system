import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StudentCards from './StudentCards';
import TeacherCards from './TeacherCards';

const AdminDashboard = () => {
    const [formData, setFormData] = useState({
        email: '', password: '',
        first_name: '', last_name: '', name: '',
        admission_number: '',
        class_id: '', section_id: '',
        dob: '',
        gender: '',
        blood_group: '',
        parent_guardian_name: '',
        parent_contact_number: '',
        address: '',
        date_of_admission: '',
        category: '',
    });
    const [mainClasses, setMainClasses] = useState([]);
    const [mainSections, setMainSections] = useState([]);
    const [message, setMessage] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [teachersCount, setTeachersCount] = useState(0);
    const [studentsLoading, setStudentsLoading] = useState(false);

    const fetchCounts = async () => {
        try {
            const res = await api.get('admin/dashboard/stats');
            const data = res.data.data;
            setStudents({ length: data.total_students });
            setTeachersCount(data.total_teachers);
        } catch (e) {
            console.error("Error fetching stats:", e);
        }
    };

    const fetchClassesAndSections = async () => {
        try {
            const [cRes, sRes] = await Promise.all([
                api.get('classes/main-classes/'),
                api.get('classes/main-sections/')
            ]);
            setMainClasses(cRes.data);
            setMainSections(sRes.data);
        } catch (e) {
            console.error("Error fetching class/sections:", e);
        }
    };

    useEffect(() => {
        setStudentsLoading(true);
        Promise.all([fetchCounts(), fetchClassesAndSections()])
            .finally(() => setStudentsLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            const first = (formData.first_name || '').trim();
            const last = (formData.last_name || '').trim();
            const emailLocal = (formData.email || '').split('@')[0].trim().toLowerCase();
            
            payload.username = emailLocal || 'student';
            payload.name = `${first} ${last}`.trim();

            await api.post('students/admin-create/', payload);
            setMessage('Student created successfully!');
            await fetchCounts();
            setIsFormOpen(false);
            setFormData({
                email: '', password: '', first_name: '', last_name: '', name: '',
                admission_number: '', class_id: '', section_id: '', dob: '',
                gender: '', blood_group: '', parent_guardian_name: '',
                parent_contact_number: '', address: '', date_of_admission: '', category: '',
            });
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error creating student.');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
                <div>
                    <h1 className="text-4xl font-poppins font-black text-school-text tracking-tight">
                        Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-school-navy to-school-blue">Dashboard</span>
                    </h1>
                    <p className="text-sm text-school-body font-medium mt-1">Management Overview & Academic Control Center</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 shadow-xl flex items-center gap-2 ${
                            isFormOpen 
                            ? 'bg-white border border-slate-200 text-school-body hover:bg-slate-50 shadow-slate-200/50' 
                            : 'bg-gradient-to-r from-school-navy to-school-blue text-white hover:shadow-school-blue/20 hover:-translate-y-0.5 active:scale-95'
                        }`}
                    >
                        {isFormOpen ? '✕ Close Registration' : '＋ Register New Student'}
                    </button>
                </div>
            </div>

            {/* Dashboard Stats & Overview */}
            {!isFormOpen && (
                <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-700">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Total Students', value: students.length, icon: '🎓', color: 'from-blue-500 to-school-blue', shadow: 'shadow-blue-500/20' },
                            { label: 'Total Teachers', value: teachersCount, icon: '👨‍🏫', color: 'from-indigo-600 to-violet-500', shadow: 'shadow-indigo-500/20' },
                            { label: 'Active Classes', value: mainClasses.length, icon: '🏫', color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/20' },
                            { label: 'Total Sections', value: mainSections.length, icon: '🏢', color: 'from-amber-500 to-orange-400', shadow: 'shadow-amber-500/20' },
                        ].map((stat, i) => (
                            <div key={i} className="group relative bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-school-blue/10 transition-all duration-500 cursor-default hover:-translate-y-2 overflow-hidden">
                                <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-lg ${stat.shadow} group-hover:rotate-6 transition-transform duration-500`}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                        <p className="text-3xl font-poppins font-black text-school-text">{studentsLoading ? '...' : stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart & Activity Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Attendance Chart Mockup */}
                        <div className="lg:col-span-8 bg-white/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="font-poppins font-bold text-school-text text-lg">Attendance Overview</h3>
                                    <p className="text-xs text-slate-400">Weekly student presence analytics</p>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="w-2.5 h-2.5 rounded-full bg-school-navy animate-pulse"></span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Updates</span>
                                </div>
                            </div>
                            <div className="h-64 flex items-end justify-between gap-4 px-2">
                                {[85, 92, 78, 95, 88, 70, 92].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                        <div className="w-full bg-slate-50 rounded-2xl relative h-full overflow-hidden border border-slate-100/50">
                                            <div 
                                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-school-navy to-school-blue rounded-2xl transition-all duration-1000 ease-out shadow-lg shadow-school-blue/20"
                                                style={{ height: `${h}%` }}
                                            >
                                                <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[9px] font-black text-white">{h}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 group-hover:text-school-navy transition-colors">Day {i+1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity / Calendar Placeholder (Light Theme) */}
                        <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:shadow-2xl hover:shadow-school-blue/10 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-school-blue/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-school-blue/10 transition-colors"></div>
                            <h3 className="font-poppins font-bold text-school-text text-lg mb-8 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-school-blue animate-pulse"></span>
                                Academic Calendar
                            </h3>
                            <div className="grid grid-cols-7 gap-2 text-center mb-6">
                                {['S','M','T','W','T','F','S'].map(d => (
                                    <span key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</span>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({length: 31}, (_, i) => (
                                    <div 
                                        key={i} 
                                        className={`aspect-square flex items-center justify-center text-[11px] rounded-xl transition-all cursor-pointer border
                                            ${i+1 === new Date().getDate() 
                                                ? 'bg-gradient-to-br from-school-navy to-school-blue text-white font-black border-transparent shadow-lg shadow-school-blue/30 scale-110 z-10' 
                                                : 'hover:bg-slate-50 text-slate-600 font-bold border-slate-50 hover:border-slate-100 hover:text-school-navy'}`}
                                    >
                                        {i+1}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-10 space-y-5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1">Upcoming Events</p>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group/event cursor-pointer">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-500 font-black text-xs ring-4 ring-red-50 group-hover/event:scale-110 transition-transform">
                                            28
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-800 group-hover/event:text-school-navy transition-colors">Exam Prep Week</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Starts in 2 days</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* Registration Form UI */}
            {isFormOpen && (
                <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    <div className="p-8 bg-slate-900 text-white relative">
                        <h3 className="text-2xl font-bold">New Student Registration</h3>
                        <p className="text-slate-400 text-sm mt-1">Fill in the details to create a new student account.</p>
                        <div className="absolute right-8 top-8 opacity-20 text-6xl">🎓</div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Section: Personal Info */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-lg bg-school-blue/10 flex items-center justify-center text-school-blue font-bold">01</span>
                                <h4 className="font-bold text-school-text uppercase tracking-wider text-sm">Personal Information</h4>
                                <div className="flex-1 h-px bg-slate-100"></div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">First Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter first name"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Last Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter last name"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="student@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Login Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Blood Group</label>
                                    <select
                                        value={formData.blood_group}
                                        onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all"
                                        required
                                    >
                                        <option value="">Select Group</option>
                                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section: Academic Info */}
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">02</span>
                                <h4 className="font-bold text-school-text uppercase tracking-wider text-sm">Academic Details</h4>
                                <div className="flex-1 h-px bg-slate-100"></div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Admission No</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ADM2026"
                                        value={formData.admission_number}
                                        onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Category</label>
                                    <input
                                        type="text"
                                        placeholder="General / OBC / SC"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Class</label>
                                    <select
                                        value={formData.class_id}
                                        onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all"
                                        required
                                    >
                                        <option value="">Select Class</option>
                                        {mainClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Section</label>
                                    <select
                                        value={formData.section_id}
                                        onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all"
                                        required
                                    >
                                        <option value="">Select Section</option>
                                        {mainSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Admission Date</label>
                                <input
                                    type="date"
                                    value={formData.date_of_admission}
                                    onChange={(e) => setFormData({ ...formData, date_of_admission: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all max-w-xs"
                                    required
                                />
                            </div>
                        </div>

                        {/* Section: Guardian Info */}
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold">03</span>
                                <h4 className="font-bold text-school-text uppercase tracking-wider text-sm">Guardian & Address</h4>
                                <div className="flex-1 h-px bg-slate-100"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Guardian Name</label>
                                    <input
                                        type="text"
                                        placeholder="Full name of parent/guardian"
                                        value={formData.parent_guardian_name}
                                        onChange={(e) => setFormData({ ...formData, parent_guardian_name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Contact Number</label>
                                    <input
                                        type="tel"
                                        placeholder="Contact phone number"
                                        value={formData.parent_contact_number}
                                        onChange={(e) => setFormData({ ...formData, parent_contact_number: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Residential Address</label>
                                <textarea
                                    placeholder="Enter full permanent address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all min-h-[100px]"
                                    required
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                            <span className={`text-sm font-bold ${message.includes('Error') ? 'text-red-500' : 'text-emerald-500'}`}>
                                {message}
                            </span>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-8 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-10 py-3 bg-school-navy text-white rounded-xl text-sm font-bold hover:bg-school-blue transition-all shadow-lg shadow-school-navy/20 active:scale-95"
                                >
                                    Create Student Account
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
