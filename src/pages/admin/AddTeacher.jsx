import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import TeacherCards from './TeacherCards';

const AddTeacher = () => {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        gender: '',
        dob: '',
        employee_id: '',
        subject_specialization: '',
        qualification: '',
        experience_years: '',
        joining_date: '',
        password: '',
        confirm_password: '',
        status: 'Active',
        profile_image: null,
        profile_image_base64: '',
    });

    const [previewUrl, setPreviewUrl] = useState('');
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [teachersLoading, setTeachersLoading] = useState(false);

    const fetchTeachers = async () => {
        setTeachersLoading(true);
        try {
            const res = await api.get('teachers/');
            setTeachers(res.data);
        } catch (e) {
            setTeachers([]);
        } finally {
            setTeachersLoading(false);
        }
    };

    const specializationOptions = useMemo(
        () => [
            'Mathematics', 'Science', 'English', 'Computer Science',
            'Social Studies', 'Physics', 'Chemistry', 'Biology', 'Physical Education',
        ],
        []
    );

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validate = () => {
        const nextErrors = {};
        if (!form.first_name.trim()) nextErrors.first_name = 'First name is required';
        if (!form.last_name.trim()) nextErrors.last_name = 'Last name is required';
        if (!form.email.trim()) nextErrors.email = 'Email is required';
        else if (!emailRegex.test(form.email.trim())) nextErrors.email = 'Enter a valid email';
        if (!form.phone_number.trim()) nextErrors.phone_number = 'Phone required';
        if (!form.gender) nextErrors.gender = 'Gender required';
        if (!form.employee_id.trim()) nextErrors.employee_id = 'ID required';
        if (!form.subject_specialization) nextErrors.subject_specialization = 'Specialization required';
        if (!form.password) nextErrors.password = 'Password required';
        else if (form.password.length < 6) nextErrors.password = 'Min 6 chars';
        if (form.confirm_password !== form.password) nextErrors.confirm_password = 'No match';
        return nextErrors;
    };

    const handleImageChange = async (file) => {
        if (!file) {
            setForm(p => ({ ...p, profile_image: null, profile_image_base64: '' }));
            setPreviewUrl('');
            return;
        }
        setPreviewUrl(URL.createObjectURL(file));
        const base64 = await new Promise((res) => {
            const r = new FileReader();
            r.onload = () => res(r.result);
            r.readAsDataURL(file);
        });
        setForm(p => ({ ...p, profile_image: file, profile_image_base64: base64 }));
    };

    useEffect(() => {
        fetchTeachers();
        // fetchTeachers already sets loading states
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setBusy(true);
        try {
            const payload = {
                ...form,
                username: form.email.split('@')[0].toLowerCase() + "_" + form.employee_id,
                name: `${form.first_name} ${form.last_name}`.trim(),
            };
            await api.post('teachers/admin/create-teacher/', payload);
            setMessage('Teacher created successfully!');
            await fetchTeachers();
            setIsFormOpen(false);
            setForm({
                first_name: '', last_name: '', email: '', phone_number: '', gender: '',
                dob: '', employee_id: '', subject_specialization: '', qualification: '',
                experience_years: '', joining_date: '', password: '', confirm_password: '',
                status: 'Active', profile_image: null, profile_image_base64: '',
            });
            setPreviewUrl('');
            setErrors({});
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Error creating teacher.';
            setMessage(errorMsg);
            setTimeout(() => setMessage(''), 5000);
        } finally {
            setBusy(false);
        }
    };

    const inputClasses = "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium";
    const labelClasses = "text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block";
    const errorClasses = "text-[10px] text-red-500 font-bold mt-1";

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-school-text">Teacher Registration</h1>
                    <p className="text-sm text-school-body">Create a new professional profile for school faculty.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left & Middle Columns: Form Sections */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Section 1: Personal */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
                                <span className="text-xl">👤</span>
                                <h3 className="font-bold text-school-text uppercase tracking-wider text-sm">Personal Information</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>First Name</label>
                                    <input type="text" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className={inputClasses} placeholder="John" required />
                                    {errors.first_name && <p className={errorClasses}>{errors.first_name}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Last Name</label>
                                    <input type="text" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className={inputClasses} placeholder="Doe" required />
                                    {errors.last_name && <p className={errorClasses}>{errors.last_name}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Email</label>
                                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputClasses} placeholder="teacher@school.com" required />
                                    {errors.email && <p className={errorClasses}>{errors.email}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Phone Number</label>
                                    <input type="tel" value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} className={inputClasses} placeholder="+1 234 567 890" required />
                                    {errors.phone_number && <p className={errorClasses}>{errors.phone_number}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Gender</label>
                                    <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className={inputClasses} required>
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.gender && <p className={errorClasses}>{errors.gender}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Date of Birth</label>
                                    <input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} className={inputClasses} required />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Professional */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
                                <span className="text-xl">💼</span>
                                <h3 className="font-bold text-school-text uppercase tracking-wider text-sm">Professional Details</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>Employee ID</label>
                                    <input type="text" value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})} className={inputClasses} placeholder="TCH-2026-001" required />
                                    {errors.employee_id && <p className={errorClasses}>{errors.employee_id}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Subject Specialization</label>
                                    <select value={form.subject_specialization} onChange={e => setForm({...form, subject_specialization: e.target.value})} className={inputClasses} required>
                                        <option value="">Select Subject</option>
                                        {specializationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                    {errors.subject_specialization && <p className={errorClasses}>{errors.subject_specialization}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Qualification</label>
                                    <input type="text" value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} className={inputClasses} placeholder="e.g. B.Ed, M.Sc" />
                                </div>
                                <div>
                                    <label className={labelClasses}>Experience</label>
                                    <input type="number" value={form.experience_years} onChange={e => setForm({...form, experience_years: e.target.value})} className={inputClasses} placeholder="Years of experience" />
                                </div>
                                <div>
                                    <label className={labelClasses}>Joining Date</label>
                                    <input type="date" value={form.joining_date} onChange={e => setForm({...form, joining_date: e.target.value})} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Status</label>
                                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={inputClasses}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Account & Profile */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Profile Image */}
                        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-slate-900/20 space-y-6">
                            <h3 className="font-bold uppercase tracking-wider text-xs text-slate-400">Profile Image</h3>
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-full aspect-square max-w-[160px] rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden relative group">
                                    {previewUrl ? (
                                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <span className="text-4xl opacity-20">📸</span>
                                    )}
                                    <input type="file" accept="image/*" onChange={e => handleImageChange(e.target.files?.[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                                <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-widest">Click to upload photo</p>
                            </div>
                        </div>

                        {/* Account Setup */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-school-text uppercase tracking-wider text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-school-blue"></span>
                                Account
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClasses}>Password</label>
                                    <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={inputClasses} placeholder="••••••••" required />
                                    {errors.password && <p className={errorClasses}>{errors.password}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Confirm Password</label>
                                    <input type="password" value={form.confirm_password} onChange={e => setForm({...form, confirm_password: e.target.value})} className={inputClasses} placeholder="••••••••" required />
                                    {errors.confirm_password && <p className={errorClasses}>{errors.confirm_password}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={busy}
                                className="w-full py-4 bg-school-navy text-white rounded-2xl font-bold text-sm hover:bg-school-blue transition-all shadow-lg shadow-school-navy/20 active:scale-95 disabled:opacity-50"
                            >
                                {busy ? 'Processing...' : 'Complete Registration'}
                            </button>
                            {message && <p className={`text-center mt-4 text-xs font-bold ${message.includes('Error') ? 'text-red-500' : 'text-emerald-500'}`}>{message}</p>}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddTeacher;
