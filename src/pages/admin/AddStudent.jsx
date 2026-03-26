import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AddStudent = () => {
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
    const [loading, setLoading] = useState(false);

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
        fetchClassesAndSections();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData };
            const first = (formData.first_name || '').trim();
            const last = (formData.last_name || '').trim();
            const emailLocal = (formData.email || '').split('@')[0].trim().toLowerCase();
            
            payload.username = emailLocal || 'student';
            payload.name = `${first} ${last}`.trim();

            await api.post('students/admin-create/', payload);
            setMessage('Student created successfully!');
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-school-text">Student Registration</h1>
                    <p className="text-sm text-school-body">Create a new student profile and academic record.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
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
                                type="submit"
                                disabled={loading}
                                className="px-10 py-3 bg-school-navy text-white rounded-xl text-sm font-bold hover:bg-school-blue transition-all shadow-lg shadow-school-navy/20 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Student Account'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStudent;
