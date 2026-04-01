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
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [schedules, setSchedules] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [step, setStep] = useState(1); // 1 create, 2 schedule, 3 publish
    const [selectedExamId, setSelectedExamId] = useState('');
    const [scheduleForm, setScheduleForm] = useState({
        subject: '',
        exam_date: '',
        start_time: '',
        end_time: '',
    });
    const [editingScheduleId, setEditingScheduleId] = useState(null);
    const [editScheduleForm, setEditScheduleForm] = useState({
        subject: '',
        exam_date: '',
        start_time: '',
        end_time: '',
    });

    const [examForm, setExamForm] = useState({
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

    const [publishing, setPublishing] = useState(false);
    const [overviewClassFilter, setOverviewClassFilter] = useState('all');
    const [overviewStatusFilter, setOverviewStatusFilter] = useState('all');

    const selectedExam = useMemo(() => exams.find((e) => String(e.id) === String(selectedExamId)) || null, [exams, selectedExamId]);

    const refreshExams = async () => {
        const res = await api.get('academics/exams/');
        setExams(res.data || []);
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
        <div style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Exam Management</h1>
                    <div style={{ marginTop: '6px', color: '#6b7280', fontWeight: 700, fontSize: '13px' }}>
                        Create exams, add schedule, and publish/unpublish results.
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={stepBadgeStyle(step === 1, done1)}>Step 1: Create Exam</span>
                    <span style={stepBadgeStyle(step === 2, done2)}>Step 2: Add Schedule</span>
                    <span style={stepBadgeStyle(step === 3, done2)}>Step 3: Publish Result</span>
                </div>
            </div>

            {(message || error) && (
                <div
                    style={{
                        marginTop: '12px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: `1px solid ${error ? '#fecaca' : '#bfdbfe'}`,
                        backgroundColor: error ? '#fef2f2' : '#eff6ff',
                        color: error ? '#991b1b' : '#1d4ed8',
                        fontWeight: 800,
                        fontSize: '13px',
                    }}
                >
                    {error || message}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.25fr 0.9fr', gap: '16px', marginTop: '14px' }}>
                {/* Step 1 */}
                <div style={card}>
                    <div style={{ fontWeight: 900, marginBottom: '10px' }}>Step 1: Create Exam</div>
                    <form onSubmit={onCreateExam} style={{ display: 'grid', gap: '10px' }}>
                        <div>
                            <div style={label}>Exam Name</div>
                            <input value={examForm.name} onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} style={input} required />
                        </div>
                        <div>
                            <div style={label}>Class / Section</div>
                            <select value={examForm.class_section} onChange={(e) => setExamForm({ ...examForm, class_section: e.target.value })} style={input} required>
                                <option value="">-- Select --</option>
                                {sections.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.class_name} - {s.section_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div style={label}>Exam Type</div>
                            <select value={examForm.exam_type} onChange={(e) => setExamForm({ ...examForm, exam_type: e.target.value })} style={input}>
                                <option value="Midterm">Midterm</option>
                                <option value="Final">Final</option>
                                <option value="Unit Test">Unit Test</option>
                                <option value="Practical">Practical</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <div style={label}>Start Date</div>
                                <input type="date" value={examForm.start_date} onChange={(e) => setExamForm({ ...examForm, start_date: e.target.value })} style={input} required />
                            </div>
                            <div>
                                <div style={label}>End Date</div>
                                <input type="date" value={examForm.end_date} onChange={(e) => setExamForm({ ...examForm, end_date: e.target.value })} style={input} required />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <div style={label}>Total Marks</div>
                                <input type="number" value={examForm.total_marks} onChange={(e) => setExamForm({ ...examForm, total_marks: e.target.value })} style={input} required />
                            </div>
                            <div>
                                <div style={label}>Passing Marks</div>
                                <input type="number" value={examForm.passing_marks} onChange={(e) => setExamForm({ ...examForm, passing_marks: e.target.value })} style={input} required />
                            </div>
                        </div>
                        <div>
                            <div style={label}>Status</div>
                            <select value={examForm.status} onChange={(e) => setExamForm({ ...examForm, status: e.target.value })} style={input}>
                                <option value="Draft">Draft</option>
                                <option value="Published">Published</option>
                            </select>
                        </div>
                        <div>
                            <div style={label}>Description (optional)</div>
                            <textarea value={examForm.description} onChange={(e) => setExamForm({ ...examForm, description: e.target.value })} style={{ ...input, minHeight: '70px', resize: 'vertical' }} />
                        </div>
                        <button type="submit" style={{ padding: '12px 14px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 900, cursor: 'pointer' }}>
                            Create Exam
                        </button>
                    </form>
                </div>

                {/* Step 2 + 3 */}
                <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px', flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: 900 }}>Step 2: Add Schedule</div>
                            <select value={selectedExamId} onChange={(e) => { setSelectedExamId(e.target.value); setStep(e.target.value ? 2 : 1); }} style={{ ...input, width: '280px' }}>
                                <option value="">-- Select Exam --</option>
                                {exams.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.name} ({e.class_section_display || `${e.class_name}-${e.section_name}`})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {!selectedExamId ? (
                            <div style={{ color: '#6b7280', fontWeight: 800, fontSize: '13px' }}>
                                Create exam first, then select it to add schedule.
                            </div>
                        ) : (
                            <>
                                <form onSubmit={addSchedule} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.9fr 0.9fr auto', gap: '8px', alignItems: 'end', marginBottom: '12px' }}>
                                    <div>
                                        <div style={label}>Subject</div>
                                        <select value={scheduleForm.subject} onChange={(e) => setScheduleForm({ ...scheduleForm, subject: e.target.value })} style={input} required>
                                            <option value="">-- Subject --</option>
                                            {subjects.map((s) => (
                                                <option key={s.id} value={s.name}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <div style={label}>Exam Date</div>
                                        <input type="date" value={scheduleForm.exam_date} onChange={(e) => setScheduleForm({ ...scheduleForm, exam_date: e.target.value })} style={input} required />
                                    </div>
                                    <div>
                                        <div style={label}>Start</div>
                                        <input type="time" value={scheduleForm.start_time} onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })} style={input} required />
                                    </div>
                                    <div>
                                        <div style={label}>End</div>
                                        <input type="time" value={scheduleForm.end_time} onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })} style={input} required />
                                    </div>
                                    <button type="submit" style={{ padding: '10px 14px', borderRadius: '10px', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontWeight: 900, cursor: 'pointer', height: '40px' }}>
                                        Add Schedule
                                    </button>
                                </form>

                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f2f4f7' }}>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>Subject</th>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>Start</th>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>End</th>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {schedules.map((r) => (
                                                <tr key={r.id} style={{ borderTop: '1px solid #eef2f7' }}>
                                                    <td style={{ padding: '10px', fontWeight: 800 }}>
                                                        {editingScheduleId === r.id ? (
                                                            <input
                                                                value={editScheduleForm.subject}
                                                                onChange={(e) => setEditScheduleForm({ ...editScheduleForm, subject: e.target.value })}
                                                                style={input}
                                                            />
                                                        ) : (
                                                            r.subject
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '10px' }}>
                                                        {editingScheduleId === r.id ? (
                                                            <input
                                                                type="date"
                                                                value={editScheduleForm.exam_date}
                                                                onChange={(e) => setEditScheduleForm({ ...editScheduleForm, exam_date: e.target.value })}
                                                                style={input}
                                                            />
                                                        ) : (
                                                            r.exam_date
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '10px' }}>
                                                        {editingScheduleId === r.id ? (
                                                            <input
                                                                type="time"
                                                                value={editScheduleForm.start_time}
                                                                onChange={(e) => setEditScheduleForm({ ...editScheduleForm, start_time: e.target.value })}
                                                                style={input}
                                                            />
                                                        ) : (
                                                            r.start_time
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '10px' }}>
                                                        {editingScheduleId === r.id ? (
                                                            <input
                                                                type="time"
                                                                value={editScheduleForm.end_time}
                                                                onChange={(e) => setEditScheduleForm({ ...editScheduleForm, end_time: e.target.value })}
                                                                style={input}
                                                            />
                                                        ) : (
                                                            r.end_time
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '10px' }}>
                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                            {editingScheduleId === r.id ? (
                                                                <>
                                                                    <button type="button" onClick={saveScheduleEdit} style={{ padding: '7px 10px', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                                                                        Save
                                                                    </button>
                                                                    <button type="button" onClick={cancelEditSchedule} style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#111827', fontWeight: 800, cursor: 'pointer' }}>
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button type="button" onClick={() => startEditSchedule(r)} style={{ padding: '7px 10px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                                                                        Edit
                                                                    </button>
                                                                    <button type="button" onClick={() => deleteSchedule(r.id)} style={{ padding: '7px 10px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                                                                        Delete
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {schedules.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} style={{ padding: '12px', color: '#6b7280', fontWeight: 800 }}>
                                                        No schedule rows yet. Add subjects to continue.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>

                    <div style={card}>
                        <div style={{ fontWeight: 900, marginBottom: '10px' }}>Step 3: Publish Result</div>
                        {!selectedExamId ? (
                            <div style={{ color: '#6b7280', fontWeight: 800 }}>Create/select an exam first.</div>
                        ) : !done2 ? (
                            <div style={{ color: '#6b7280', fontWeight: 800 }}>Add schedule first to enable publishing.</div>
                        ) : (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'end', marginBottom: '10px' }}>
                                    <div>
                                        <div style={label}>Exam + Result Status</div>
                                        <div style={{ ...input, backgroundColor: '#f9fafb', color: '#374151', fontWeight: 700 }}>
                                            {selectedExam?.name} - {selectedExam?.result_published ? 'Published' : 'Unpublished'}
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => togglePublishResults(true)} disabled={publishing || !selectedExamId || !done2} style={{ padding: '10px 14px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 900, cursor: 'pointer' }}>
                                        Publish Result
                                    </button>
                                    <button type="button" onClick={() => togglePublishResults(false)} disabled={publishing || !selectedExamId || !done2} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#111827', fontWeight: 900, cursor: 'pointer' }}>
                                        Unpublish Result
                                    </button>
                                </div>
                                <div style={{ border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '12px', backgroundColor: '#f8fafc' }}>
                                    <div style={{ fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Role-based control</div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                                        Admin can only control result visibility. Marks upload is managed by teachers.
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Overview widget */}
                <div style={card}>
                    <div style={{ fontWeight: 900, marginBottom: '10px' }}>Exam Overview</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '10px' }}>
                        <select value={overviewClassFilter} onChange={(e) => setOverviewClassFilter(e.target.value)} style={input}>
                            <option value="all">All Classes/Sections</option>
                            {sections.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.class_name} - {s.section_name}
                                </option>
                            ))}
                        </select>
                        <select value={overviewStatusFilter} onChange={(e) => setOverviewStatusFilter(e.target.value)} style={input}>
                            <option value="all">All Status</option>
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '10px', fontSize: '12px', fontWeight: 800, color: '#4b5563' }}>
                        Total Exams: {overviewExams.length}
                    </div>
                    {loading ? (
                        <div style={{ color: '#6b7280' }}>Loading...</div>
                    ) : overviewExams.length === 0 ? (
                        <div style={{ color: '#6b7280', fontWeight: 800 }}>
                            No exams found for selected filters.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {overviewExams.slice(0, 8).map((e) => (
                                <div key={e.id} style={{ border: '1px solid #eef2f7', borderRadius: '10px', padding: '10px', backgroundColor: '#fafafa' }}>
                                    <div style={{ fontWeight: 900 }}>{e.name}</div>
                                    <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
                                        {e.class_section_display || `${e.class_name}-${e.section_name}`}
                                    </div>
                                    <div style={{ marginTop: '4px', fontSize: '13px', color: '#374151' }}>
                                        {e.start_date} to {e.end_date}
                                    </div>
                                    <div style={{ marginTop: '4px', fontSize: '12px', fontWeight: 800 }}>
                                        Status: {e.status} • Results: {e.result_published ? 'Published' : 'Unpublished'}
                                    </div>
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