import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AssignTeacher = () => {
    const [hierarchy, setHierarchy] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formClass, setFormClass] = useState('');
    const [formSubject, setFormSubject] = useState('');
    const [formTeacherId, setFormTeacherId] = useState('');
    const [busy, setBusy] = useState(false);
    
    const [filterClass, setFilterClass] = useState('All Classes');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [hierRes, subjRes, assignRes] = await Promise.all([
                api.get('admin/classes-hierarchy'),
                api.get('admin/subjects'),
                api.get('admin/subject-teachers')
            ]);
            setHierarchy(hierRes.data.data);
            setSubjects(subjRes.data.data);
            setAssignments(assignRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            await api.post('admin/subject-teachers/assign', {
                class_section_id: parseInt(formClass),
                subject_id: parseInt(formSubject),
                teacher_employee_id: formTeacherId
            });
            alert('Teacher assignment updated successfully!');
            fetchData();
            setFormClass('');
            setFormSubject('');
            setFormTeacherId('');
        } catch (err) {
            alert('Failed to assign teacher. Ensure Employee ID is correct.');
        } finally {
            setBusy(false);
        }
    };

    const inputClasses = "w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-white text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none";
    const labelClasses = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

    // Flatten sections for dropdown
    const allSections = [];
    hierarchy.forEach(c => c.sections.forEach(s => allSections.push({ ...s, class_name: c.name })));

    // Filter available subjects based on selected class (Wait, we can't easily extract MainClass ID from ClassSection ID without looking up, but we can filter logic)
    // We simplify: show all active subjects or common subjects
    // The filter logic for Subjects says `class_ref` is optional (Common).

    // Filter assignments table
    const displayAssignments = assignments.filter(a => {
        if (filterClass !== 'All Classes' && !a.class_name.startsWith(filterClass)) return false;
        return true;
    });

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-[1.35rem] font-semibold text-slate-800">Assign Teacher to Class</h1>
                <p className="text-[13px] text-slate-500 mt-1">Link teacher with class and subject in one place.</p>
            </div>

            <div className="bg-slate-50/50 rounded-2xl border border-slate-200 shadow-sm p-8">
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                    <div>
                        <label className={labelClasses}>CLASS</label>
                        <select 
                            value={formClass}
                            onChange={e => setFormClass(e.target.value)} 
                            required 
                            className={inputClasses}
                        >
                            <option value="">-- Select Class --</option>
                            {allSections.map(s => (
                                <option key={s.id} value={s.id}>{s.class_name} - {s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClasses}>SUBJECT</label>
                        <select 
                            value={formSubject}
                            onChange={e => setFormSubject(e.target.value)} 
                            required 
                            className={inputClasses}
                            disabled={!formClass}
                        >
                            <option value="">{formClass ? "-- Select Subject --" : "Select class first"}</option>
                            {subjects.filter(s => s.status === 'Active').map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.class_name})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClasses}>TEACHER (SEARCH BY NAME OR EMPLOYEE ID)</label>
                        <input 
                            type="text" 
                            placeholder="Search teacher employee ID (e.g., T-100)..." 
                            value={formTeacherId}
                            onChange={e => setFormTeacherId(e.target.value)} 
                            className={inputClasses}
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={busy}
                            className="px-6 py-2.5 bg-[#4B70F5] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                            {busy ? "Assigning..." : "Assign"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Assignments Table section */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <label className={labelClasses}>FILTER BY CLASS</label>
                    <select 
                        value={filterClass}
                        onChange={e => setFilterClass(e.target.value)}
                        className="w-48 text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none"
                    >
                        <option>All Classes</option>
                        {hierarchy.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                    {loading ? (
                        <div className="p-6 text-center text-xs text-slate-500">Loading assignments...</div>
                    ) : displayAssignments.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">No assignments found.</div>
                    ) : (
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Class</th>
                                    <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Subject</th>
                                    <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Teacher</th>
                                    <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Employee ID</th>
                                    <th className="py-2.5 px-4 text-right font-semibold uppercase tracking-wider text-[10px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {displayAssignments.map(a => (
                                    <tr key={a.id} className="hover:bg-slate-50/50">
                                        <td className="py-3 px-4 font-medium text-slate-700">{a.class_name}</td>
                                        <td className="py-3 px-4">{a.subject_name}</td>
                                        <td className="py-3 px-4">{a.teacher_name}</td>
                                        <td className="py-3 px-4">{a.employee_id}</td>
                                        <td className="py-3 px-4 text-right">
                                            <button className="text-red-500 hover:text-red-600">Unassign</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignTeacher;
