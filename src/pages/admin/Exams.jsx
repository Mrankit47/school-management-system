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
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [resultDashboard, setResultDashboard] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [step, setStep] = useState(1); // 1 create, 2 schedule, 3 marks
    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
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

    const [marksRows, setMarksRows] = useState([]); // [{subject,max_marks,marks,absent}]
    const [publishing, setPublishing] = useState(false);

    const selectedExam = useMemo(() => exams.find((e) => String(e.id) === String(selectedExamId)) || null, [exams, selectedExamId]);

    const refreshExams = async () => {
        const res = await api.get('academics/exams/');
        setExams(res.data || []);
    };

    const loadMeta = async () => {
        const [sRes, stRes] = await Promise.all([api.get('classes/sections/'), api.get('students/')]);
        setSections(sRes.data || []);
        setStudents(stRes.data || []);
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
            setMarksRows([]);
            setResultDashboard([]);
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
                setMarksRows(
                    (subRes.data || []).map((s) => ({
                        subject: s.name,
                        max_marks: '',
                        marks: '',
                        absent: false,
                    }))
                );
            })
            .catch(() => {});
    }, [selectedExamId, sections, selectedExam]);

    useEffect(() => {
        if (!selectedExamId || !selectedStudentId) {
            setResultDashboard([]);
            return;
        }
        api.get(`academics/exams/${selectedExamId}/result-dashboard/`, { params: { student_id: selectedStudentId } })
            .then((res) => setResultDashboard(res.data || []))
            .catch(() => setResultDashboard([]));
    }, [selectedExamId, selectedStudentId]);

    const onCreateExam = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
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
        setError('');
        try {
            await api.post(`academics/exams/${selectedExamId}/schedule/`, scheduleForm);
            const res = await api.get(`academics/exams/${selectedExamId}/schedule/`);
            setSchedules(res.data || []);
            setScheduleForm({ subject: '', exam_date: '', start_time: '', end_time: '' });
            setMessage('Subject schedule added');
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

    const updateMarkRow = (subject, patch) => {
        setMarksRows((prev) => prev.map((r) => (r.subject === subject ? { ...r, ...patch } : r)));
    };

    const downloadMarksCsvTemplate = () => {
        const header = 'subject,max_marks,marks,absent';
        const sampleRows = marksRows.length
            ? marksRows.map((r) => `${r.subject},100,0,false`)
            : ['Maths,100,0,false', 'Science,100,0,false', 'English,100,,true'];
        const csvText = [header, ...sampleRows].join('\n');

        const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'marks_upload_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleMarksCsvUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const lines = text.split(/\r?\n/).filter((ln) => ln.trim());
            if (lines.length < 2) {
                setError('CSV is empty');
                return;
            }
            const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
            const idxSubject = header.indexOf('subject');
            const idxMax = header.indexOf('max_marks');
            const idxMarks = header.indexOf('marks');
            const idxAbsent = header.indexOf('absent');
            if (idxSubject < 0 || idxMax < 0 || idxMarks < 0) {
                setError('CSV headers required: subject,max_marks,marks,absent(optional)');
                return;
            }

            const parsedRows = lines.slice(1).map((line) => {
                const cols = line.split(',').map((c) => c.trim());
                return {
                    subject: cols[idxSubject] || '',
                    max_marks: cols[idxMax] || '',
                    marks: cols[idxMarks] || '',
                    absent: idxAbsent >= 0 ? ['1', 'true', 'yes', 'abs', 'absent'].includes((cols[idxAbsent] || '').toLowerCase()) : false,
                };
            }).filter((r) => r.subject);

            if (!parsedRows.length) {
                setError('No valid rows found in CSV');
                return;
            }

            setMarksRows((prev) => {
                const next = [...prev];
                parsedRows.forEach((csvRow) => {
                    const i = next.findIndex((r) => r.subject.toLowerCase() === csvRow.subject.toLowerCase());
                    if (i >= 0) {
                        next[i] = { ...next[i], ...csvRow };
                    } else {
                        next.push(csvRow);
                    }
                });
                return next;
            });
            setMessage('CSV imported. Please review before upload.');
        } catch (err) {
            setError('Failed to parse CSV');
        } finally {
            e.target.value = '';
        }
    };

    const totals = useMemo(() => {
        let obtained = 0;
        let max = 0;
        marksRows.forEach((r) => {
            const m = Number(r.marks || 0);
            const mm = Number(r.max_marks || 0);
            if (!r.absent) obtained += m;
            max += mm;
        });
        const percentage = max > 0 ? (obtained / max) * 100 : 0;
        let grade = 'F';
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';
        else if (percentage >= 50) grade = 'D';
        return { obtained, max, percentage, grade };
    }, [marksRows]);

    const uploadMarks = async () => {
        if (!selectedExamId || !selectedStudentId) return;
        setError('');
        try {
            const invalid = marksRows.find((r) => !r.absent && Number(r.marks) > Number(r.max_marks));
            if (invalid) {
                setError(`Invalid marks for ${invalid.subject}`);
                return;
            }
            await api.post('academics/results/upload/', {
                exam: selectedExamId,
                student: selectedStudentId,
                results: marksRows.map((r) => ({
                    subject: r.subject,
                    marks: r.absent ? null : (r.marks === '' ? 0 : r.marks),
                    max_marks: r.max_marks === '' ? 0 : r.max_marks,
                    absent: r.absent,
                })),
            });
            setMessage('Marks uploaded successfully');
            const dashRes = await api.get(`academics/exams/${selectedExamId}/result-dashboard/`, { params: { student_id: selectedStudentId } });
            setResultDashboard(dashRes.data || []);
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to upload marks');
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

    const upcomingExams = useMemo(() => {
        const today = new Date();
        return (exams || []).filter((e) => {
            const d = new Date(e.start_date || e.date);
            return d >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
        });
    }, [exams]);

    const done1 = !!selectedExamId;
    const done2 = done1 && schedules.length > 0;

    return (
        <div style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Exam Management</h1>
                    <div style={{ marginTop: '6px', color: '#6b7280', fontWeight: 700, fontSize: '13px' }}>
                        Create exams, schedule subjects, upload marks, and publish results.
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={stepBadgeStyle(step === 1, done1)}>Step 1: Create Exam</span>
                    <span style={stepBadgeStyle(step === 2, done2)}>Step 2: Add Schedule</span>
                    <span style={stepBadgeStyle(step === 3, done2 && !!selectedStudentId)}>Step 3: Upload Marks</span>
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
                                Create/select an exam first to add schedule.
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
                                        Add
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
                        <div style={{ fontWeight: 900, marginBottom: '10px' }}>Step 3: Upload Marks</div>
                        {!selectedExamId ? (
                            <div style={{ color: '#6b7280', fontWeight: 800 }}>Select an exam first.</div>
                        ) : (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'end', marginBottom: '10px' }}>
                                    <div>
                                        <div style={label}>Student</div>
                                        <select value={selectedStudentId} onChange={(e) => { setSelectedStudentId(e.target.value); setStep(e.target.value ? 3 : 2); }} style={input}>
                                            <option value="">-- Select Student --</option>
                                            {students
                                                .filter((s) => s.class_name === `${selectedExam?.class_name} - ${selectedExam?.section_name}`)
                                                .map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <button type="button" onClick={() => togglePublishResults(true)} disabled={publishing || !selectedExamId} style={{ padding: '10px 14px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 900, cursor: 'pointer' }}>
                                        Publish
                                    </button>
                                    <button type="button" onClick={() => togglePublishResults(false)} disabled={publishing || !selectedExamId} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#111827', fontWeight: 900, cursor: 'pointer' }}>
                                        Unpublish
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#4b5563' }}>
                                        Bulk CSV Upload
                                    </label>
                                    <button
                                        type="button"
                                        onClick={downloadMarksCsvTemplate}
                                        style={{
                                            padding: '7px 10px',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                            backgroundColor: '#fff',
                                            color: '#111827',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                        }}
                                    >
                                        Download CSV Template
                                    </button>
                                    <input
                                        type="file"
                                        accept=".csv,text/csv"
                                        onChange={handleMarksCsvUpload}
                                        style={{ fontSize: '12px' }}
                                    />
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                        Header: <code>subject,max_marks,marks,absent</code>
                                    </span>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f2f4f7' }}>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>Subject</th>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>Max Marks</th>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>Obtained</th>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>Absent</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {marksRows.map((r) => (
                                                <tr key={r.subject} style={{ borderTop: '1px solid #eef2f7' }}>
                                                    <td style={{ padding: '10px', fontWeight: 800 }}>{r.subject}</td>
                                                    <td style={{ padding: '10px', width: '160px' }}>
                                                        <input type="number" value={r.max_marks} onChange={(e) => updateMarkRow(r.subject, { max_marks: e.target.value })} style={input} />
                                                    </td>
                                                    <td style={{ padding: '10px', width: '160px' }}>
                                                        <input type="number" value={r.marks} onChange={(e) => updateMarkRow(r.subject, { marks: e.target.value })} style={{ ...input, opacity: r.absent ? 0.6 : 1 }} disabled={r.absent} />
                                                    </td>
                                                    <td style={{ padding: '10px', width: '90px' }}>
                                                        <input type="checkbox" checked={r.absent} onChange={(e) => updateMarkRow(r.subject, { absent: e.target.checked })} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginTop: '10px' }}>
                                    <div style={{ ...card, padding: '10px' }}>
                                        <div style={label}>Total Marks</div>
                                        <div style={{ fontWeight: 900 }}>{totals.max}</div>
                                    </div>
                                    <div style={{ ...card, padding: '10px' }}>
                                        <div style={label}>Obtained</div>
                                        <div style={{ fontWeight: 900 }}>{totals.obtained}</div>
                                    </div>
                                    <div style={{ ...card, padding: '10px' }}>
                                        <div style={label}>Percentage</div>
                                        <div style={{ fontWeight: 900 }}>{totals.percentage.toFixed(2)}%</div>
                                    </div>
                                    <div style={{ ...card, padding: '10px' }}>
                                        <div style={label}>Grade</div>
                                        <div style={{ fontWeight: 900 }}>{totals.grade}</div>
                                    </div>
                                </div>
                                <button type="button" onClick={uploadMarks} disabled={!selectedStudentId} style={{ marginTop: '10px', padding: '12px 14px', borderRadius: '12px', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontWeight: 900, cursor: 'pointer', width: '100%' }}>
                                    Upload Marks
                                </button>

                                {resultDashboard.length > 0 && (
                                    <div style={{ marginTop: '12px', borderTop: '1px solid #eef2f7', paddingTop: '10px' }}>
                                        <div style={{ fontWeight: 900, marginBottom: '8px' }}>Result Dashboard</div>
                                        {resultDashboard.map((d) => (
                                            <div key={d.student_id} style={{ border: '1px solid #eef2f7', borderRadius: '10px', padding: '10px', marginBottom: '8px' }}>
                                                <div style={{ fontWeight: 900 }}>{d.student_name}</div>
                                                <div style={{ fontSize: '13px', color: '#374151' }}>
                                                    Total: {d.obtained_marks}/{d.total_marks} • Percentage: {d.percentage}% • Grade: {d.grade} • {d.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Upcoming widget */}
                <div style={card}>
                    <div style={{ fontWeight: 900, marginBottom: '10px' }}>Upcoming Exams</div>
                    {loading ? (
                        <div style={{ color: '#6b7280' }}>Loading...</div>
                    ) : upcomingExams.length === 0 ? (
                        <div style={{ color: '#6b7280', fontWeight: 800 }}>
                            No upcoming exams yet. Create one in Step 1.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {upcomingExams.slice(0, 8).map((e) => (
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
