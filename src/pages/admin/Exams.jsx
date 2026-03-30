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
    const [formData, setFormData] = useState({ name: '', class_section: '', date: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('academics/exams/').then(res => {
            setExams(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleCreate = async (e) => {
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-school-text">Exam Management</h1>
                <p className="text-sm text-school-body">Schedule and monitor academic assessments.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Schedule Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sticky top-24">
                        <h3 className="text-lg font-bold text-school-text mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-school-navy/5 flex items-center justify-center text-school-navy text-sm">📅</span>
                            Schedule Exam
                        </h3>
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Exam Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., Mid-Term Assessment" 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium"
                                    required 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Class Section ID</label>
                                <input 
                                    type="number" 
                                    placeholder="e.g., 4" 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium"
                                    required 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Date</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium"
                                    required 
                                />
                            </div>
                            <button type="submit" className="w-full py-3.5 bg-school-navy text-white text-xs font-bold rounded-xl shadow-lg shadow-school-navy/10 hover:bg-school-blue transition-all mt-4">
                                Schedule Exam
                            </button>
                        </form>
                    </div>
                </div>

                {/* Upcoming Exams List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <h3 className="font-bold text-school-text">Upcoming Exams</h3>
                            <span className="px-3 py-1 bg-white border border-slate-100 text-[10px] font-bold text-slate-500 rounded-lg uppercase tracking-wider shadow-sm">
                                {exams.length} Scheduled
                            </span>
                        </div>
                        
                        <div className="divide-y divide-slate-50">
                            {loading ? (
                                <div className="p-12 text-center">
                                    <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-school-navy rounded-full"></div>
                                </div>
                            ) : exams.length > 0 ? (
                                exams.map(e => (
                                    <div key={e.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold text-xs shadow-sm">
                                                {new Date(e.date).getDate()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-school-text group-hover:text-school-navy transition-colors">{e.name}</h4>
                                                <p className="text-xs text-school-body font-medium flex items-center gap-2 mt-0.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    {e.class_name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Date</p>
                                            <p className="text-xs font-bold text-school-text">{new Date(e.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📭</div>
                                    <p className="text-slate-400 font-medium italic">No exams scheduled yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Exams;
