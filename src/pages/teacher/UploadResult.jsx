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
    const [students, setStudents] = useState([]);
    /** ClassSection rows where this teacher is class_teacher (from classes/sections/) */
    const [mySections, setMySections] = useState([]);

    const [allSubjects, setAllSubjects] = useState([]);

    const [examId, setExamId] = useState('');
    /** MainClass name for subject filter (e.g. "10", "3") */
    const [className, setClassName] = useState('');
    /** Selected ClassSection id for student list */
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [studentId, setStudentId] = useState('');

    const [rowMaxMarks, setRowMaxMarks] = useState({});
    const [rowMarks, setRowMarks] = useState({});

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [topError, setTopError] = useState('');
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    const filteredSubjects = useMemo(() => {
        if (!className) return [];
        return (allSubjects || []).filter((s) => s.class_name === className);
    }, [allSubjects, className]);

    const parseNumber = (v) => {
        if (v === '' || v === null || v === undefined) return null;
        const num = Number(v);
        return Number.isFinite(num) ? num : null;
    };

    const marksErrors = useMemo(() => {
        const errors = {};
        (filteredSubjects || []).forEach((s) => {
            const maxMarksRaw = rowMaxMarks[s.id];
            const marksRaw = rowMarks[s.id];

            const maxMarks = parseNumber(maxMarksRaw);
            const marks = parseNumber(marksRaw);

            if (maxMarks === null) {
                errors[s.id] = { ...(errors[s.id] || {}), maxMarks: 'Max marks required' };
                return;
            }
            if (marks === null) {
                errors[s.id] = { ...(errors[s.id] || {}), marks: 'Marks obtained required' };
                return;
            }

            if (maxMarks < 0) {
                errors[s.id] = { ...(errors[s.id] || {}), maxMarks: 'Max marks cannot be negative' };
                return;
            }
            if (marks < 0) {
                errors[s.id] = { ...(errors[s.id] || {}), marks: 'Marks cannot be negative' };
                return;
            }
            if (marks > maxMarks) {
                errors[s.id] = { ...(errors[s.id] || {}), marks: 'Marks cannot be greater than max marks' };
            }
        });
        return errors;
    }, [filteredSubjects, rowMaxMarks, rowMarks]);

    const totals = useMemo(() => {
        let totalObtained = 0;
        let totalMax = 0;
        let validRows = 0;
        let invalidRows = 0;

        (filteredSubjects || []).forEach((s) => {
            const maxMarks = parseNumber(rowMaxMarks[s.id]);
            const marks = parseNumber(rowMarks[s.id]);

            if (maxMarks === null || marks === null) return;
            validRows += 1;
            totalObtained += marks;
            totalMax += maxMarks;
            if (marks > maxMarks) invalidRows += 1;
        });

        const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
        return { totalObtained, totalMax, percentage, validRows, invalidRows };
    }, [filteredSubjects, rowMaxMarks, rowMarks]);

    const gradeInfo = useMemo(() => {
        const pct = totals.percentage || 0;
        const pass = pct >= 33;
        let grade = 'F';
        if (pct >= 90) grade = 'A';
        else if (pct >= 75) grade = 'B';
        else if (pct >= 60) grade = 'C';
        else if (pct >= 33) grade = 'D';

        return { pass, grade, pct };
    }, [totals.percentage]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setTopError('');
            try {
                const [secRes, examsRes, subRes] = await Promise.all([
                    api.get('classes/teaching-sections/'),
                    api.get('academics/exams/'),
                    api.get('subjects/', { params: { status: 'Active' } }),
                ]);
                if (cancelled) return;

                setAllSubjects(asList(subRes.data));

                const teachingSections = asList(secRes.data);
                const allExams = asList(examsRes.data);

                const mine = teachingSections.map((c) => ({
                    id: c.id,
                    class_name: c.class_name,
                    section_name: c.section_name,
                }));
                setMySections(mine);

                // Exams: show full list again (like before). Filtering to "only my class" hid every exam when class_teacher id did not match strictly.
                setExams(allExams);
            } catch {
                if (!cancelled) setTopError('Failed to load meta data');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // When exam is selected: sync class section + marks rows (do not clear section when no exam — teacher may pick class first).
    useEffect(() => {
        if (!examId) {
            return;
        }
        const ex = exams.find((e) => e.id === parseInt(examId, 10));
        if (!ex) return;

        setAttemptedSubmit(false);
        setStudentId('');
        setRowMaxMarks({});
        setRowMarks({});

        const sid = ex.class_section;
        setSelectedSectionId(sid != null ? String(sid) : '');
        const sec = mySections.find((s) => Number(s.id) === Number(sid));
        setClassName(sec?.class_name || ex.class_name || '');
    }, [examId, exams, mySections]);

    // Load students for selected class section (backend allows only class teacher for this class).
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
        // Initialize rows when filtered subjects change
        if (!filteredSubjects.length) {
            setRowMaxMarks({});
            setRowMarks({});
            return;
        }

        const nextMax = { ...rowMaxMarks };
        const nextMarks = { ...rowMarks };
        filteredSubjects.forEach((s) => {
            if (nextMax[s.id] === undefined) nextMax[s.id] = '';
            if (nextMarks[s.id] === undefined) nextMarks[s.id] = '';
        });

        setRowMaxMarks(nextMax);
        setRowMarks(nextMarks);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredSubjects]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAttemptedSubmit(true);
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
        if (!className) {
            setTopError('Select Class');
            return;
        }
        if (!studentId) {
            setTopError('Select Student');
            return;
        }
        if (!filteredSubjects.length) {
            setTopError('No active subjects found for this class');
            return;
        }

        const errorsExist = Object.keys(marksErrors || {}).length > 0;
        if (errorsExist) {
            setTopError('Please fix marks entry errors');
            return;
        }

        const resultsPayload = filteredSubjects.map((s) => {
            const maxMarks = rowMaxMarks[s.id];
            const marks = rowMarks[s.id];
            return {
                subject: s.name,
                marks,
                max_marks: maxMarks,
            };
        });

        const payload = {
            exam: examId,
            student: studentId,
            results: resultsPayload,
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
                            Exam -&gt; Class -&gt; Student, then enter marks for all subjects.
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
                                value={examId}
                                onChange={(e) => {
                                    setExamId(e.target.value);
                                    setTopError('');
                                }}
                                required
                                style={{ ...{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    fontSize: '13px',
                                    outline: 'none',
                                    backgroundColor: '#fff',
                                } }}
                                disabled={loading || submitting}
                            >
                                <option value="">-- Select Exam --</option>
                                {exams.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.name} ({e.class_section_display || `${e.class_name}${e.section_name ? ` - ${e.section_name}` : ''}`})
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
                                    setStudentId('');
                                    setTopError('');
                                    const sec = mySections.find((s) => String(s.id) === sid);
                                    setClassName(sec?.class_name || '');
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
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
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

                    <div style={{ borderTop: '1px solid #eef2f7', paddingTop: '16px' }}>
                        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 900, textTransform: 'uppercase', marginBottom: '10px' }}>
                            Marks Entry
                        </div>

                        <div style={{ overflowX: 'auto', border: '1px solid #eef2f7', borderRadius: '14px', backgroundColor: '#fff' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f2f4f7' }}>
                                        <th style={{ padding: '12px 10px', textAlign: 'left' }}>Subject</th>
                                        <th style={{ padding: '12px 10px', textAlign: 'left' }}>Max Marks</th>
                                        <th style={{ padding: '12px 10px', textAlign: 'left' }}>Marks Obtained</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubjects.map((s) => {
                                        const maxErr = attemptedSubmit ? marksErrors?.[s.id]?.maxMarks : undefined;
                                        const marksErr = attemptedSubmit ? marksErrors?.[s.id]?.marks : undefined;

                                        return (
                                            <tr key={s.id} style={{ borderTop: '1px solid #eef2f7' }}>
                                                <td style={{ padding: '12px 10px', fontWeight: 900 }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <div>{s.name}</div>
                                                        {s.teachers?.length ? (
                                                            <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 800 }}>
                                                                {s.teachers.map((t) => t.name).filter(Boolean).join(', ')}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 10px', width: '170px' }}>
                                                    <input
                                                        type="number"
                                                        value={rowMaxMarks[s.id] ?? ''}
                                                        min="0"
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setRowMaxMarks((prev) => ({ ...prev, [s.id]: v }));
                                                        }}
                                                        style={{ width: '100%', padding: '10px 12px', border: `1px solid ${maxErr ? '#fca5a5' : '#e5e7eb'}`, borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}
                                                    />
                                                    {maxErr ? (
                                                        <div style={{ marginTop: '6px', color: '#b91c1c', fontSize: '12px', fontWeight: 900 }}>
                                                            {maxErr}
                                                        </div>
                                                    ) : null}
                                                </td>
                                                <td style={{ padding: '12px 10px', width: '190px' }}>
                                                    <input
                                                        type="number"
                                                        value={rowMarks[s.id] ?? ''}
                                                        min="0"
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setRowMarks((prev) => ({ ...prev, [s.id]: v }));
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
                                    {filteredSubjects.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} style={{ padding: '16px 10px', color: '#6b7280', fontWeight: 900 }}>
                                                No subjects available for this class.
                                            </td>
                                        </tr>
                                    ) : null}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '14px' }}>
                            <div style={{ border: '1px solid #eef2f7', borderRadius: '14px', padding: '12px', backgroundColor: '#fff' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 900, textTransform: 'uppercase' }}>Total Obtained</div>
                                <div style={{ marginTop: '6px', fontSize: '18px', fontWeight: 1000, color: '#111827' }}>{totals.totalObtained || 0}</div>
                            </div>
                            <div style={{ border: '1px solid #eef2f7', borderRadius: '14px', padding: '12px', backgroundColor: '#fff' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 900, textTransform: 'uppercase' }}>Total Max</div>
                                <div style={{ marginTop: '6px', fontSize: '18px', fontWeight: 1000, color: '#111827' }}>{totals.totalMax || 0}</div>
                            </div>
                            <div style={{ border: '1px solid #eef2f7', borderRadius: '14px', padding: '12px', backgroundColor: '#fff' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 900, textTransform: 'uppercase' }}>Percentage</div>
                                <div style={{ marginTop: '6px', fontSize: '18px', fontWeight: 1000, color: '#111827' }}>
                                    {totals.totalMax > 0 ? `${totals.percentage.toFixed(2)}%` : '0%'}
                                </div>
                                <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: 900, color: gradeInfo.pass ? '#166534' : '#991b1b' }}>
                                    {gradeInfo.pass ? `Pass • Grade ${gradeInfo.grade}` : `Fail • Grade ${gradeInfo.grade}`}
                                </div>
                            </div>
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
