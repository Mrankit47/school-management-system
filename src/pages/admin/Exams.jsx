import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const card = {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 1px 6px rgba(16,24,40,0.06)',
};

const input = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
};

const label = {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 800,
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
};

const stepBadgeStyle = (active, done) => ({
    padding: '8px 12px',
    borderRadius: '999px',
    border: '1px solid #e5e7eb',
    fontWeight: 900,
    fontSize: '12px',
    backgroundColor: done ? '#dcfce7' : active ? '#dbeafe' : '#fff',
    color: done ? '#166534' : active ? '#1d4ed8' : '#4b5563',
});

const Exams = () => {
    const [exams, setExams] = useState([]);
    const [hierarchy, setHierarchy] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        class_section_id: '',
        exam_type: 'Midterm',
        start_date: '',
        end_date: '',
        total_marks: 100,
        passing_marks: 33,
        status: 'Draft',
        description: ''
    });

    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [hierRes, examRes] = await Promise.all([
                api.get('admin/classes-hierarchy'),
                api.get('admin/exams')
            ]);
            setHierarchy(hierRes.data.data);
            setExams(examRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        alert('Exam scheduled successfully!');
    };

    const loadMeta = async () => {
        const [sRes] = await Promise.all([api.get('classes/sections/')]);
        setSections(sRes.data || []);
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([refreshExams(), loadMeta()])
            .catch(() => setError('Failed to load exam data'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedExam) {
            setSchedules([]);
            setSubjects([]);
            return;
        }
        const sec = sections.find((s) => String(s.id) === String(selectedExam.class_section));
        if (!sec) return;

        Promise.all([
            api.get(`academics/exams/${selectedExam.id}/schedule/`),
            api.get('subjects/', { params: { class_id: sec.class_id, status: 'Active' } }),
        ])
            .then(([schRes, subRes]) => {
                setSchedules(schRes.data || []);
                setSubjects(subRes.data || []);
            })
            .catch(() => {});
    }, [selectedExamId, sections, selectedExam]);

    const onCreateExam = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (!examForm.name || !examForm.class_section || !examForm.start_date || !examForm.end_date || !examForm.total_marks || !examForm.passing_marks) {
            setError('Please fill all required fields.');
            return;
        }
        if (examForm.start_date > examForm.end_date) {
            setError('Start date must be before end date.');
            return;
        }
        try {
            const payload = {
                ...examForm,
                total_marks: examForm.total_marks || 0,
                passing_marks: examForm.passing_marks || 0,
                date: examForm.start_date || undefined,
            };
            const res = await api.post('academics/exams/', payload);
            setMessage('Exam created successfully');
            await refreshExams();
            setSelectedExamId(String(res.data.id));
            setStep(2);
            setExamForm({
                name: '',
                class_section: '',
                exam_type: 'Midterm',
                start_date: '',
                end_date: '',
                total_marks: '',
                passing_marks: '',
                status: 'Draft',
                description: '',
            });
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to create exam');
        }
    };

    const addSchedule = async (e) => {
        e.preventDefault();
        if (!selectedExamId) return;
        if (!scheduleForm.subject || !scheduleForm.exam_date || !scheduleForm.start_time || !scheduleForm.end_time) {
            setError('Please fill all schedule fields.');
            return;
        }
        if (scheduleForm.start_time >= scheduleForm.end_time) {
            setError('Start time must be before end time.');
            return;
        }
        setError('');
        try {
            await api.post(`academics/exams/${selectedExamId}/schedule/`, scheduleForm);
            const res = await api.get(`academics/exams/${selectedExamId}/schedule/`);
            setSchedules(res.data || []);
            setScheduleForm({ subject: '', exam_date: '', start_time: '', end_time: '' });
            setMessage('Subject schedule added');
            setStep(3);
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to add schedule');
        }
    };

    const deleteSchedule = async (id) => {
        try {
            await api.delete(`academics/schedule/${id}/`);
            const res = await api.get(`academics/exams/${selectedExamId}/schedule/`);
            setSchedules(res.data || []);
        } catch (e) {
            setError('Failed to delete schedule row');
        }
    };

    const startEditSchedule = (row) => {
        setEditingScheduleId(row.id);
        setEditScheduleForm({
            subject: row.subject || '',
            exam_date: row.exam_date || '',
            start_time: row.start_time || '',
            end_time: row.end_time || '',
        });
    };

    const cancelEditSchedule = () => {
        setEditingScheduleId(null);
        setEditScheduleForm({
            subject: '',
            exam_date: '',
            start_time: '',
            end_time: '',
        });
    };

    const saveScheduleEdit = async () => {
        if (!editingScheduleId) return;
        setError('');
        if (editScheduleForm.start_time >= editScheduleForm.end_time) {
            setError('Start time must be before end time.');
            return;
        }
        try {
            await api.patch(`academics/schedule/${editingScheduleId}/`, editScheduleForm);
            const res = await api.get(`academics/exams/${selectedExamId}/schedule/`);
            setSchedules(res.data || []);
            setMessage('Schedule updated');
            cancelEditSchedule();
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to update schedule');
        }
    };

    const togglePublishResults = async (publish) => {
        if (!selectedExamId) return;
        setPublishing(true);
        setError('');
        try {
            await api.post(`academics/exams/${selectedExamId}/publish-results/`, { publish });
            await refreshExams();
            setMessage(publish ? 'Results published' : 'Results unpublished');
        } catch (err) {
            setError('Failed to update publish status');
        } finally {
            setPublishing(false);
        }
    };

    const overviewExams = useMemo(() => {
        return (exams || []).filter((e) => {
            if (overviewClassFilter !== 'all' && String(e.class_section) !== String(overviewClassFilter)) return false;
            if (overviewStatusFilter !== 'all' && String(e.status) !== String(overviewStatusFilter)) return false;
            return true;
        });
    }, [exams, overviewClassFilter, overviewStatusFilter]);

    const done1 = !!selectedExamId;
    const done2 = done1 && schedules.length > 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl">
            <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-[1.35rem] font-semibold text-slate-800">Exam Management</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Create exams, add schedule, and publish/unpublish results.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button className="px-4 py-1.5 bg-white shadow-sm text-school-navy text-xs font-semibold rounded-lg">Step 1: Create Exam</button>
                    <button className="px-4 py-1.5 text-slate-500 text-xs font-medium hover:text-slate-700">Step 2: Add Schedule</button>
                    <button className="px-4 py-1.5 text-slate-500 text-xs font-medium hover:text-slate-700">Step 3: Publish Result</button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Step 1 & 2 Combined Left Side */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Step 1 */}
                        <div className="bg-slate-50/50 rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-3 mb-5">Step 1: Create Exam</h3>
                            <form onSubmit={handleCreateExam} className="space-y-4">
                                <div>
                                    <label className={labelClasses}>EXAM NAME</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClasses} required />
                                </div>
                                
                                <div>
                                    <label className={labelClasses}>CLASS / SECTION</label>
                                    <select value={formData.class_section_id} onChange={e => setFormData({...formData, class_section_id: e.target.value})} className={inputClasses} required>
                                        <option value="">-- Select --</option>
                                        {allSections.map(s => <option key={s.id} value={s.id}>{s.class_name} - {s.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClasses}>EXAM TYPE</label>
                                    <select value={formData.exam_type} onChange={e => setFormData({...formData, exam_type: e.target.value})} className={inputClasses}>
                                        <option>Midterm</option>
                                        <option>Final</option>
                                        <option>Quiz</option>
                                        <option>Assignment</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>START DATE</label>
                                        <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className={inputClasses} required />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>END DATE</label>
                                        <input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className={inputClasses} required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>TOTAL MARKS</label>
                                        <input type="number" value={formData.total_marks} onChange={e => setFormData({...formData, total_marks: e.target.value})} className={inputClasses} required />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>PASSING MARKS</label>
                                        <input type="number" value={formData.passing_marks} onChange={e => setFormData({...formData, passing_marks: e.target.value})} className={inputClasses} required />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClasses}>STATUS</label>
                                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className={inputClasses}>
                                        <option>Draft</option>
                                        <option>Published</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className={labelClasses}>DESCRIPTION (OPTIONAL)</label>
                                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={`${inputClasses} h-20 resize-none`}></textarea>
                                </div>

                                <button type="submit" className="w-full py-2.5 bg-[#4B70F5] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors">
                                    Create Exam
                                </button>
                            </form>
                        </div>

                        {/* Step 2 & 3 Placeholder */}
                        <div className="space-y-6">
                            <div className="bg-slate-50/50 rounded-2xl border border-slate-200 p-6 shadow-sm h-[200px]">
                                <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-3 mb-5">Step 2: Add Schedule</h3>
                                <div className="space-y-4">
                                    <select className={inputClasses}>
                                        <option>-- Select Exam --</option>
                                        {exams.map(e => <option key={e.id}>{e.name} ({e.class_name})</option>)}
                                    </select>
                                    <p className="text-xs text-slate-500 font-medium">Create exam first, then select it to add schedule.</p>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 rounded-2xl border border-slate-200 p-6 shadow-sm flex-1/2">
                                <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-3 mb-5">Step 3: Publish Result</h3>
                                <p className="text-xs text-slate-500 font-medium">Create/select an exam first.</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Exam Overview Sidebar */}
                <div className="bg-slate-50/50 rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-3 mb-5">Exam Overview</h3>
                    <div className="space-y-3 mb-6">
                        <select className={inputClasses}><option>All Classes/Sections</option></select>
                        <select className={inputClasses}><option>All Status</option></select>
                    </div>
                    
                    <div className="text-xs font-bold text-slate-600 mb-4">Total Exams: {exams.length}</div>
                    
                    {loading ? (
                        <div className="text-center text-xs text-slate-500">Loading...</div>
                    ) : exams.length === 0 ? (
                        <div className="text-sm font-semibold text-slate-500">No exams found for selected filters.</div>
                    ) : (
                        <div className="space-y-3">
                            {exams.map(e => (
                                <div key={e.id} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <div className="font-semibold text-sm text-slate-800">{e.name}</div>
                                    <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                                        <span>{e.class_name}</span>
                                        <span className={e.status === 'Published' ? 'text-emerald-500 font-bold' : 'text-orange-500 font-bold'}>{e.status}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-2">{e.start_date} to {e.end_date}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Exams;
