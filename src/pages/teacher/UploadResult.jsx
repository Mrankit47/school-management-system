import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

/** Backend may return a bare array or a wrapper like `{ data: [...] }`. */
function asList(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    if (payload && Array.isArray(payload.results)) return payload.results;
    return [];
}

const UploadResult = () => {
    const [exams, setExams] = useState([]);
    const [mySections, setMySections] = useState([]);
    const [students, setStudents] = useState([]);
    const [teacherSubjects, setTeacherSubjects] = useState([]);
    const [examId, setExamId] = useState('');
    const [examTypeFilter, setExamTypeFilter] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [studentMarks, setStudentMarks] = useState({});

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [topError, setTopError] = useState('');

    const examOptions = useMemo(() => {
        const allowed = ['Midterm', 'Final', 'Unit Test'];
        return (exams || []).filter((e) => allowed.includes(e.exam_type) && (!examTypeFilter || e.exam_type === examTypeFilter));
    }, [exams, examTypeFilter]);
    const selectedExam = useMemo(
        () => (exams || []).find((e) => String(e.id) === String(examId)) || null,
        [exams, examId]
    );

    useEffect(() => {
        if (!examOptions.length) {
            setExamId('');
            return;
        }
        if (!examId || !examOptions.some((e) => String(e.id) === String(examId))) {
            setExamId(String(examOptions[0].id));
        }
    }, [examOptions, examId]);

    const parseNumber = (v) => {
        if (v === '' || v === null || v === undefined) return null;
        const num = Number(v);
        return Number.isFinite(num) ? num : null;
    };

    const marksErrors = useMemo(() => {
        const errors = {};
        students.filter((s) => String(s.id) === String(selectedStudentId)).forEach((s) => {
            const marks = parseNumber(studentMarks[s.id]);
            if (marks === null) {
                errors[s.id] = 'Marks are required';
                return;
            }
            if (marks < 0) {
                errors[s.id] = 'Marks cannot be negative';
                return;
            }
            const examMax = parseNumber(selectedExam?.total_marks);
            if (examMax !== null && marks > examMax) {
                errors[s.id] = `Marks cannot exceed exam total (${examMax})`;
            }
        });
        return errors;
    }, [students, studentMarks, selectedStudentId, selectedExam]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setTopError('');
            try {
                const secRes = await api.get('classes/teaching-sections/');
                if (cancelled) return;
                const teachingSections = asList(secRes.data);
                const mine = teachingSections.map((c) => ({
                    id: c.id,
                    class_name: c.class_name,
                    section_name: c.section_name,
                }));
                setMySections(mine);
            } catch {
                // Fallback: at least allow section list from generic endpoint.
                try {
                    const altSec = await api.get('classes/sections/');
                    if (!cancelled) {
                        const rows = asList(altSec.data).map((c) => ({
                            id: c.id,
                            class_name: c.class_name,
                            section_name: c.section_name,
                        }));
                        setMySections(rows);
                    }
                } catch {
                    if (!cancelled) setTopError('Failed to load class data');
                }
            }

            try {
                const examsRes = await api.get('academics/exams/');
                if (!cancelled) setExams(asList(examsRes.data));
            } catch {
                if (!cancelled) setTopError((prev) => prev || 'Failed to load exam data');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!examId) {
            return;
        }
        const ex = exams.find((e) => e.id === parseInt(examId, 10));
        if (!ex) return;

        setStudentMarks({});
        setSelectedStudentId('');

        const sid = ex.class_section;
        setSelectedSectionId(sid != null ? String(sid) : '');
    }, [examId, exams, mySections]);

    useEffect(() => {
        if (!selectedSectionId) {
            setStudents([]);
            return;
        }
        const id = parseInt(selectedSectionId, 10);
        if (!Number.isFinite(id)) {
            setStudents([]);
            return;
        }
        let cancelled = false;
        setTopError('');
        api.get(`students/by-class/${id}/`)
            .then((res) => {
                if (!cancelled) setStudents(res.data || []);
            })
            .catch((err) => {
                if (!cancelled) {
                    setStudents([]);
                    setTopError(
                        err?.response?.data?.error
                        || err?.response?.data?.detail
                        || 'Failed to load students for selected class'
                    );
                }
            });
        return () => {
            cancelled = true;
        };
    }, [selectedSectionId]);

    useEffect(() => {
        if (!selectedSectionId) {
            setTeacherSubjects([]);
            setSelectedSubject('');
            return;
        }
        api.get(`academics/class-sections/${selectedSectionId}/teacher-subjects/`)
            .then((res) => {
                const rows = asList(res.data);
                const uniqueByName = Array.from(
                    new Map(rows.map((r) => [String(r.name || '').toLowerCase(), r])).values()
                );
                setTeacherSubjects(uniqueByName);
                if (uniqueByName.length > 0 && !uniqueByName.some((r) => r.name === selectedSubject)) {
                    // Auto pick first assigned subject so table row always shows a subject.
                    setSelectedSubject(uniqueByName[0].name);
                } else if (uniqueByName.length === 0) {
                    setSelectedSubject('');
                }
            })
            .catch(() => {
                setTeacherSubjects([]);
                setSelectedSubject('');
            });
    }, [selectedSectionId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTopError('');

        if (!examId) {
            setTopError('Select Exam');
            return;
        }
        if (!selectedSectionId) {
            setTopError('Select Class');
            return;
        }
        const examRow = exams.find((x) => x.id === parseInt(examId, 10));
        if (examRow && String(examRow.class_section) !== String(selectedSectionId)) {
            setTopError('Selected class must match the exam’s class.');
            return;
        }
        if (!selectedSubject) {
            setTopError('Select Subject');
            return;
        }
        if (!selectedStudentId) {
            setTopError('Select Student');
            return;
        }
        if (!students.length) {
            setTopError('No students found for selected class');
            return;
        }

        const errorsExist = Object.keys(marksErrors || {}).length > 0;
        if (errorsExist) {
            setTopError('');
            return;
        }

        const payload = {
            exam: examId,
            class_section: selectedSectionId,
            subject: selectedSubject,
            max_marks: parseNumber(selectedExam?.total_marks) || 0,
            entries: [
                {
                    student: selectedStudentId,
                    marks: parseNumber(studentMarks[selectedStudentId]) || 0,
                },
            ],
        };

        setSubmitting(true);
        try {
            await api.post('academics/results/upload/', payload);
            alert('Results uploaded!');
        } catch (err) {
            const serverErrors = err?.response?.data?.errors;
            if (serverErrors) {
                setTopError('Server validation failed. Please review marks.');
                // We don't have subject row indexes mapping from backend errors, so keep top message.
            } else {
                setTopError(err?.response?.data?.error || 'Error uploading result.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div
                style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '18px',
                    boxShadow: '0 1px 6px rgba(16,24,40,0.06)',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '22px' }}>Upload Student Results</h1>
                        <div style={{ marginTop: '6px', color: '#6b7280', fontSize: '13px', fontWeight: 700 }}>
                            Select exam type, class, and assigned subject, then enter raw subject marks student-wise.
                        </div>
                    </div>
                    {topError && (
                        <div style={{ color: '#b91c1c', fontWeight: 900, fontSize: '13px' }}>
                            {topError}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} style={{ marginTop: '16px', display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div>
                            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase' }}>
                                Exam Details
                            </div>
                            <select
                                value={examTypeFilter}
                                onChange={(e) => {
                                    setExamTypeFilter(e.target.value);
                                    setExamId('');
                                }}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', outline: 'none', backgroundColor: '#fff', marginBottom: '8px' }}
                            >
                                <option value="">-- Select Exam Type --</option>
                                <option value="Midterm">Midterm</option>
                                <option value="Final">Final</option>
                                <option value="Unit Test">Unit Test</option>
                            </select>
                            <select
                                value={examId}
                                onChange={(e) => setExamId(e.target.value)}
                                required
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}
                                disabled={loading || submitting || examOptions.length === 0}
                            >
                                <option value="">-- Select Exam --</option>
                                {examOptions.map((e) => (
                                    <option key={e.id} value={String(e.id)}>
                                        {e.name} ({e.class_section_display || `${e.class_name}-${e.section_name}`})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase' }}>
                                Select Class
                            </div>
                            <select
                                value={selectedSectionId}
                                onChange={(e) => {
                                    const sid = e.target.value;
                                    setSelectedSectionId(sid);
                                    setSelectedStudentId('');
                                    setTopError('');
                                    if (examId) {
                                        const ex = exams.find((x) => x.id === parseInt(examId, 10));
                                        if (ex && String(ex.class_section) !== sid) {
                                            setExamId('');
                                        }
                                    }
                                }}
                                required
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}
                                disabled={loading || submitting || !mySections.length}
                            >
                                <option value="">-- Select Class --</option>
                                {mySections.map((s) => (
                                    <option key={s.id} value={String(s.id)}>
                                        {s.class_name} - {s.section_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase' }}>
                                Select Student
                            </div>
                            <select
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                required
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}
                                disabled={!selectedSectionId || loading || submitting || students.length === 0}
                            >
                                <option value="">-- Select Student --</option>
                                {students.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase' }}>
                            Select Subject
                        </div>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            required
                            style={{ width: '320px', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}
                            disabled={!selectedSectionId || loading || submitting || teacherSubjects.length === 0}
                        >
                            <option value="">-- Select Subject --</option>
                            {teacherSubjects.map((s) => (
                                <option key={s.id} value={s.name}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ borderTop: '1px solid #eef2f7', paddingTop: '16px' }}>
                        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 900, textTransform: 'uppercase', marginBottom: '10px' }}>
                            Marks Entry
                        </div>

                        <div style={{ overflowX: 'auto', border: '1px solid #eef2f7', borderRadius: '14px', backgroundColor: '#fff' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f2f4f7' }}>
                                        <th style={{ padding: '12px 10px', textAlign: 'left' }}>Student</th>
                                        <th style={{ padding: '12px 10px', textAlign: 'left' }}>Subject</th>
                                        <th style={{ padding: '12px 10px', textAlign: 'left' }}>Marks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.filter((s) => String(s.id) === String(selectedStudentId)).map((s) => {
                                        const marksErr = marksErrors?.[s.id];
                                        return (
                                            <tr key={s.id} style={{ borderTop: '1px solid #eef2f7' }}>
                                                <td style={{ padding: '12px 10px', fontWeight: 900 }}>{s.name}</td>
                                                <td style={{ padding: '12px 10px', fontWeight: 800 }}>
                                                    {selectedSubject || '—'}
                                                </td>
                                            <td style={{ padding: '12px 10px', width: '220px' }}>
                                                <input
                                                    type="number"
                                                    value={studentMarks[s.id] ?? ''}
                                                    min="0"
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        setStudentMarks((prev) => ({ ...prev, [s.id]: v }));
                                                    }}
                                                    style={{ width: '100%', padding: '10px 12px', border: `1px solid ${marksErr ? '#fca5a5' : '#e5e7eb'}`, borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}
                                                />
                                                {marksErr ? (
                                                    <div style={{ marginTop: '6px', color: '#b91c1c', fontSize: '12px', fontWeight: 900 }}>
                                                        {marksErr}
                                                    </div>
                                                ) : null}
                                            </td>
                                            </tr>
                                        );
                                    })}
                                    {students.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} style={{ padding: '16px 10px', color: '#6b7280', fontWeight: 900 }}>
                                                No students available for this class.
                                            </td>
                                        </tr>
                                    ) : null}
                                    {!selectedStudentId ? (
                                        <tr>
                                            <td colSpan={3} style={{ padding: '16px 10px', color: '#6b7280', fontWeight: 900 }}>
                                                Select student from dropdown to enter marks.
                                            </td>
                                        </tr>
                                    ) : null}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button
                            type="submit"
                            disabled={submitting || loading}
                            style={{
                                padding: '14px 20px',
                                borderRadius: '14px',
                                border: 'none',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                backgroundColor: '#2563eb',
                                color: '#fff',
                                fontWeight: 1000,
                                fontSize: '14px',
                                minWidth: '180px',
                                opacity: submitting || loading ? 0.7 : 1,
                            }}
                        >
                            {submitting ? 'Uploading...' : 'Upload Results'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadResult;
