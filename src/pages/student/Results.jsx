import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const colors = {
    border: '#e5e7eb',
    muted: '#6b7280',
    text: '#111827',
    primary: '#2563eb',
    present: '#16a34a',
    absent: '#ef4444',
    yellow: '#f59e0b',
    card: '#ffffff',
    bg: '#f9fafb',
};

function parseDateOnly(value) {
    if (!value) return null;
    const s = String(value);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const d = parseInt(m[3], 10);
    return new Date(y, mo - 1, d);
}

function formatMoneyMaybe(v) {
    const n = Number(v);
    if (Number.isNaN(n)) return '0';
    return `${n}`;
}

function pctToOverallGrade(pct) {
    const p = Number(pct) || 0;
    if (p >= 90) return 'A+';
    if (p >= 80) return 'A';
    if (p >= 70) return 'B';
    if (p >= 60) return 'C';
    if (p >= 50) return 'D';
    return 'F';
}

function overallResultText(totalObtained, passingMarks) {
    const obt = Number(totalObtained) || 0;
    const pass = Number(passingMarks) || 0;
    return obt >= pass ? 'Pass' : 'Fail';
}

function subjectResultText(r) {
    const rs = (r.result_status || '').toString();
    if (rs.toLowerCase() === 'pass') return 'Pass';
    if (rs.toLowerCase() === 'absent') return 'Fail';
    return 'Fail';
}

export default function Results() {
    const [profile, setProfile] = useState(null);
    const [results, setResults] = useState([]);
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([api.get('students/profile/'), api.get('academics/results/my/'), api.get('academics/exams/')])
            .then(([pRes, rRes, eRes]) => {
                setProfile(pRes.data || null);
                setResults(rRes.data || []);
                setExams(eRes.data || []);
            })
            .finally(() => setLoading(false));
    }, []);

    const resultsByExam = useMemo(() => {
        const map = new Map(); // examId -> { exam_name, rows }
        (results || []).forEach((r) => {
            if (!map.has(r.exam)) map.set(r.exam, { exam_name: r.exam_name, rows: [] });
            map.get(r.exam).rows.push(r);
        });
        return map;
    }, [results]);

    const examMetaMap = useMemo(() => {
        const map = new Map();
        (exams || []).forEach((e) => map.set(Number(e.id), e));
        return map;
    }, [exams]);

    const examOptions = useMemo(() => {
        const options = [];
        for (const [examId, data] of resultsByExam.entries()) {
            const meta = examMetaMap.get(Number(examId));
            options.push({
                id: Number(examId),
                label: meta ? `${meta.name} (${meta.exam_type || 'Exam'})` : data.exam_name,
                startDate: meta?.start_date || meta?.date || null,
                exam_type: meta?.exam_type || null,
                passing_marks: meta?.passing_marks || 0,
            });
        }
        options.sort((a, b) => String(b.startDate || '').localeCompare(String(a.startDate || '')));
        return options;
    }, [resultsByExam, examMetaMap]);

    useEffect(() => {
        if (examOptions.length === 0) {
            setSelectedExamId(null);
            return;
        }
        if (selectedExamId && examOptions.some((o) => o.id === selectedExamId)) return;
        setSelectedExamId(examOptions[0].id);
    }, [examOptions, selectedExamId]);

    const selectedExam = useMemo(() => examOptions.find((o) => o.id === selectedExamId) || null, [examOptions, selectedExamId]);

    const selectedRows = useMemo(() => {
        if (!selectedExamId) return [];
        const data = resultsByExam.get(selectedExamId);
        return data?.rows || [];
    }, [resultsByExam, selectedExamId]);

    const computed = useMemo(() => {
        const meta = examMetaMap.get(Number(selectedExamId)) || null;
        const passingMarks = meta?.passing_marks || 0;
        const totalMax = selectedRows.reduce((s, r) => s + Number(r.max_marks || 0), 0);
        const totalObt = selectedRows.reduce((s, r) => s + Number(r.absent ? 0 : r.marks || 0), 0);
        const percentage = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;
        const overallGrade = pctToOverallGrade(percentage);
        const finalResult = overallResultText(totalObt, passingMarks);

        const academicYear = (() => {
            const start = meta?.start_date ? parseDateOnly(meta.start_date) : null;
            const end = meta?.end_date ? parseDateOnly(meta.end_date) : null;
            if (!start || !end) return '—';
            return `${start.getFullYear()}-${String(end.getFullYear()).slice(-2)}`;
        })();

        return {
            passingMarks,
            totalMax,
            totalObt,
            percentage,
            overallGrade,
            finalResult,
            academicYear,
            declarationDate: meta?.start_date || meta?.date || '—',
            examType: meta?.exam_type || '—',
        };
    }, [selectedExamId, selectedRows, examMetaMap]);

    const downloadPdf = async () => {
        try {
            if (!selectedExamId) return;
            const res = await api.get(`academics/results/my/${selectedExamId}/pdf/`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `marksheet_exam_${selectedExamId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            // eslint-disable-next-line no-alert
            alert('Could not download marksheet PDF.');
        }
    };

    if (loading) return <div style={{ padding: 20, color: colors.muted, fontWeight: 900 }}>Loading results…</div>;

    if (!selectedExamId || selectedRows.length === 0) {
        return (
            <div style={{ padding: 20, backgroundColor: colors.bg, minHeight: 'calc(100vh - 60px)' }}>
                <div style={{ fontWeight: 1000, fontSize: 18 }}>My Exam Results</div>
                <div style={{ marginTop: 10, color: colors.muted, fontWeight: 900 }}>No published results yet.</div>
            </div>
        );
    }

    const studentName = profile?.user?.name || profile?.user?.username || 'Student';
    const rollNumber = profile?.admission_number || '—';
    const classLabel = profile ? `${profile.class_name || ''}${profile.section_name ? ` - ${profile.section_name}` : ''}`.trim() : '—';

    return (
        <div style={{ padding: 20, backgroundColor: colors.bg, minHeight: 'calc(100vh - 60px)' }}>
            <div style={{ maxWidth: 1120, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 1000, color: colors.primary }}>
                                MIS
                            </div>
                            <div>
                                <div style={{ fontWeight: 1000, fontSize: 20, color: colors.text }}>Student Marksheet</div>
                                <div style={{ color: colors.muted, fontWeight: 900, fontSize: 12, marginTop: 2 }}>
                                    Official view of your final results
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontSize: 12, color: colors.muted, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 6 }}>
                                Exam
                            </div>
                            <select
                                value={selectedExamId}
                                onChange={(e) => setSelectedExamId(parseInt(e.target.value, 10))}
                                style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${colors.border}`, backgroundColor: '#fff', fontWeight: 900 }}
                            >
                                {examOptions.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={downloadPdf}
                            style={{
                                padding: '12px 14px',
                                borderRadius: 12,
                                border: 'none',
                                backgroundColor: colors.primary,
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: 1000,
                                height: 44,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Download PDF
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: 14, border: `1px solid ${colors.border}`, borderRadius: 16, backgroundColor: '#fff', padding: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0,1fr))', gap: 12 }}>
                        <div style={{ gridColumn: 'span 7' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontSize: 12, color: colors.muted, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Student Information</div>
                                    <div style={{ marginTop: 8, fontWeight: 1000, fontSize: 18 }}>{studentName}</div>
                                    <div style={{ marginTop: 6, color: colors.muted, fontWeight: 900 }}>Roll Number: {rollNumber}</div>
                                    <div style={{ marginTop: 4, color: colors.muted, fontWeight: 900 }}>Class & Section: {classLabel}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 12, color: colors.muted, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Academic Year</div>
                                    <div style={{ marginTop: 8, fontWeight: 1000, fontSize: 18 }}>{computed.academicYear}</div>
                                    <div style={{ marginTop: 6, color: colors.muted, fontWeight: 900 }}>School Name: School Management System</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ gridColumn: 'span 5', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 12, backgroundColor: '#fff' }}>
                            <div style={{ fontSize: 12, color: colors.muted, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Exam Details</div>
                            <div style={{ marginTop: 10, fontWeight: 1000, color: colors.text }}>
                                {computed.examType}
                            </div>
                            <div style={{ marginTop: 6, color: colors.muted, fontWeight: 900 }}>
                                Result Declaration Date: {computed.declarationDate}
                            </div>
                            <div style={{ marginTop: 10, color: colors.muted, fontWeight: 900 }}>
                                Total Subjects: {selectedRows.length}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 14, borderTop: `1px solid ${colors.border}`, paddingTop: 14 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0,1fr))', gap: 12 }}>
                            <div style={{ gridColumn: 'span 12' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 1000, fontSize: 16 }}>Subject-wise Marks</div>
                                    <div style={{ color: colors.muted, fontWeight: 900, fontSize: 12 }}>
                                        Computed automatically from teacher-entered marks
                                    </div>
                                </div>

                                <div style={{ marginTop: 12, overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f2f4f7' }}>
                                                <th style={{ padding: '12px 10px', textAlign: 'left', color: colors.muted, fontWeight: 1000 }}>Subject Name</th>
                                                <th style={{ padding: '12px 10px', textAlign: 'right', color: colors.muted, fontWeight: 1000 }}>Maximum Marks</th>
                                                <th style={{ padding: '12px 10px', textAlign: 'right', color: colors.muted, fontWeight: 1000 }}>Obtained Marks</th>
                                                <th style={{ padding: '12px 10px', textAlign: 'left', color: colors.muted, fontWeight: 1000 }}>Grade</th>
                                                <th style={{ padding: '12px 10px', textAlign: 'left', color: colors.muted, fontWeight: 1000 }}>Result</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedRows.map((r) => (
                                                <tr key={r.id} style={{ borderTop: `1px solid ${colors.border}` }}>
                                                    <td style={{ padding: '12px 10px', fontWeight: 900 }}>{r.subject}</td>
                                                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>{formatMoneyMaybe(r.max_marks)}</td>
                                                    <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 1000, color: r.absent ? colors.absent : colors.text }}>
                                                        {r.absent ? 'ABS' : formatMoneyMaybe(r.marks)}
                                                    </td>
                                                    <td style={{ padding: '12px 10px', fontWeight: 1000 }}>{r.grade || '—'}</td>
                                                    <td style={{ padding: '12px 10px', fontWeight: 1000, color: r.absent ? colors.absent : (r.result_status || '').toLowerCase() === 'pass' ? colors.present : colors.absent }}>
                                                        {subjectResultText(r)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 18 }}>
                            <div style={{ fontWeight: 1000, fontSize: 16 }}>Result Summary</div>
                            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0,1fr))', gap: 12 }}>
                                <div style={{ gridColumn: 'span 4', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 12, backgroundColor: '#fff' }}>
                                    <div style={{ color: colors.muted, fontWeight: 900, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Total Marks</div>
                                    <div style={{ marginTop: 6, fontWeight: 1000, fontSize: 18 }}>{computed.totalObt}/{computed.totalMax}</div>
                                </div>
                                <div style={{ gridColumn: 'span 4', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 12, backgroundColor: '#fff' }}>
                                    <div style={{ color: colors.muted, fontWeight: 900, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Percentage</div>
                                    <div style={{ marginTop: 6, fontWeight: 1000, fontSize: 18 }}>{computed.percentage.toFixed(2)}%</div>
                                </div>
                                <div style={{ gridColumn: 'span 4', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 12, backgroundColor: '#fff' }}>
                                    <div style={{ color: colors.muted, fontWeight: 900, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Overall</div>
                                    <div style={{ marginTop: 6, fontWeight: 1000, fontSize: 18 }}>{computed.overallGrade}</div>
                                    <div style={{ marginTop: 6, color: computed.finalResult === 'Pass' ? colors.present : colors.absent, fontWeight: 1000 }}>
                                        {computed.finalResult}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0,1fr))', gap: 12 }}>
                            <div style={{ gridColumn: 'span 7', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 12, backgroundColor: '#fff' }}>
                                <div style={{ fontWeight: 1000, fontSize: 16 }}>Teacher Remarks</div>
                                <div style={{ marginTop: 8, color: colors.muted, fontWeight: 900 }}>Class Teacher Name: —</div>
                                <div style={{ marginTop: 4, color: colors.muted, fontWeight: 900 }}>Remarks: —</div>
                            </div>
                            <div style={{ gridColumn: 'span 5', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 12, backgroundColor: '#fff' }}>
                                <div style={{ fontWeight: 1000, fontSize: 16 }}>Digital Signature</div>
                                <div style={{ marginTop: 10, color: colors.muted, fontWeight: 900 }}>Class Teacher: __________________</div>
                                <div style={{ marginTop: 10, color: colors.muted, fontWeight: 900 }}>Authorized Sign: __________________</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}