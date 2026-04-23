import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const palette = {
    present: '#16a34a',
    absent: '#ef4444',
    muted: '#6b7280',
    border: '#e5e7eb',
    primary: '#2563eb',
    card: '#ffffff',
    bg: '#f9fafb',
    shadow: '0 1px 6px rgba(16,24,40,0.06)',
};

function formatTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString();
}

function StatusBadge({ status }) {
    const s = (status || '').toLowerCase();
    let bg = '#f3f4f6';
    let color = '#111827';
    if (s === 'present') {
        bg = '#dcfce7';
        color = palette.present;
    } else if (s === 'absent') {
        bg = '#fee2e2';
        color = palette.absent;
    }

    const label = s === 'present' ? 'Present' : s === 'absent' ? 'Absent' : 'Unmarked';
    return (
        <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 999, backgroundColor: bg, border: `1px solid ${palette.border}`, color, fontWeight: 900, fontSize: 12 }}>
            {label}
        </span>
    );
}

const MarkAttendance = () => {
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [sheet, setSheet] = useState(null); // { summary, students: [] }
    const [rows, setRows] = useState([]); // local editable rows
    const [saving, setSaving] = useState(false);

    const isEditable = !!sheet?.is_editable && !!sheet?.can_mark;
    const isSubjectTeacher = !!sheet?.is_editable && sheet?.can_mark === false;

    const loadTeacherClasses = async () => {
        const res = await api.get('classes/teaching-sections/');
        const mine = res.data || [];
        setClasses(mine);
        if (mine.length && !selectedClassId) {
            setSelectedClassId(String(mine[0].id));
        }
    };

    const loadSheet = async () => {
        if (!selectedClassId) return;
        setLoading(true);
        try {
            const res = await api.get('attendance/teacher/sheet/', {
                params: { class_section_id: selectedClassId, date },
            });
            setSheet(res.data || null);
            setRows((res.data?.students || []).map((s) => ({ ...s, status: s.status || '' })));
        } catch (e) {
            setSheet(null);
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTeacherClasses().catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadSheet().catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClassId, date]);

    const setStudentStatus = (studentId, status) => {
        if (!isEditable) return;
        setRows((prev) => prev.map((r) => (r.student_id === studentId ? { ...r, status } : r)));
    };

    const markAllPresent = () => {
        if (!isEditable) return;
        setRows((prev) => prev.map((r) => ({ ...r, status: 'present' })));
    };

    const saveAttendance = async () => {
        if (!isEditable) {
            const reason = isSubjectTeacher ? 'Only Class Teachers can mark attendance.' : 'Past attendance records are view-only.';
            alert(`Selected sheet is view-only. ${reason}`);
            return;
        }
        if (!selectedClassId) return;
        setSaving(true);
        try {
            const res = await api.post('attendance/teacher/save/', {
                class_section_id: selectedClassId,
                date,
                rows: rows.map((r) => ({
                    student_id: r.student_id,
                    status: r.status,
                })),
            });
            await loadSheet();
            const savedCount = Number(res?.data?.saved || 0);
            alert(`Attendance saved successfully. ${savedCount} student(s) updated.`);
        } catch (e) {
            alert(e?.response?.data?.error || 'Could not save attendance.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ padding: 20, backgroundColor: palette.bg, minHeight: 'calc(100vh - 60px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <div>
                    <h1 style={{ margin: 0, fontWeight: 1000 }}>Attendance Management</h1>
                    <div style={{ marginTop: 4, color: palette.muted, fontWeight: 900, fontSize: 13 }}>Select class/section and date. Past date records are view-only, today can be edited.</div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 1000, color: palette.muted, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Select Date</div>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${palette.border}`, backgroundColor: '#fff', fontWeight: 900 }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 1000, color: palette.muted, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Select Class</div>
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${palette.border}`, backgroundColor: '#fff', fontWeight: 900, minWidth: 240 }}
                        >
                            {classes.length ? null : <option value="">No assigned classes</option>}
                            {classes.map((c) => (
                                <option key={c.id} value={String(c.id)}>
                                    {c.class_name} - {c.section_name}
                                </option>
                            ))}
                </select>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, alignItems: 'start' }}>
                <div style={{ backgroundColor: palette.card, border: `1px solid ${palette.border}`, borderRadius: 16, padding: 16, boxShadow: palette.shadow }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontWeight: 1000 }}>Student Attendance Sheet</div>
                            <div style={{ marginTop: 3, color: palette.muted, fontWeight: 900, fontSize: 13 }}>
                                {sheet?.class_display || 'Select class to view sheet'}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <div style={{ color: palette.muted, fontWeight: 900, fontSize: 12 }}>Present: <span style={{ color: palette.present, fontWeight: 1000 }}>{sheet?.summary?.present ?? 0}</span></div>
                            <div style={{ color: palette.muted, fontWeight: 900, fontSize: 12 }}>Absent: <span style={{ color: palette.absent, fontWeight: 1000 }}>{sheet?.summary?.absent ?? 0}</span></div>
                            <div style={{ color: palette.muted, fontWeight: 900, fontSize: 12 }}>Marked: <span style={{ color: '#111827', fontWeight: 1000 }}>{sheet?.summary?.marked ?? 0}</span></div>
                        {sheet?.can_mark && (
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={markAllPresent}
                                    disabled={!isEditable}
                                    style={{ padding: '8px 12px', borderRadius: 10, border: `1px solid ${palette.border}`, backgroundColor: '#fff', fontWeight: 1000, cursor: 'pointer' }}
                                >
                                    Mark All Present
                                </button>
                                <button
                                    type="button"
                                    onClick={saveAttendance}
                                    disabled={saving || !isEditable}
                                    style={{ padding: '8px 12px', borderRadius: 10, border: 'none', backgroundColor: palette.primary, color: '#fff', fontWeight: 1000, cursor: saving || !isEditable ? 'not-allowed' : 'pointer', opacity: saving || !isEditable ? 0.6 : 1 }}
                                >
                                    {saving ? 'Saving...' : 'Save Attendance'}
                                </button>
                            </div>
                        )}
                        </div>
                    </div>
                    {!isEditable ? (
                        <div style={{ marginTop: 10, border: `1px solid ${isSubjectTeacher ? '#93c5fd' : '#fde68a'}`, background: isSubjectTeacher ? '#eff6ff' : '#fffbeb', color: isSubjectTeacher ? '#1e40af' : '#a16207', borderRadius: 10, padding: '8px 10px', fontWeight: 900, fontSize: 12 }}>
                            {isSubjectTeacher 
                                ? "You are assigned as a Subject Teacher for this class. Only the Class Teacher can mark or edit attendance."
                                : "This is a previous date record. You can view attendance but cannot edit or change it."
                            }
                        </div>
                    ) : null}

                    <div style={{ marginTop: 12, overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                                <tr style={{ backgroundColor: '#f1f5f9' }}>
                                    <th style={{ padding: 12, textAlign: 'left', color: palette.muted, fontWeight: 1000, fontSize: 12 }}>Student Name</th>
                                    <th style={{ padding: 12, textAlign: 'left', color: palette.muted, fontWeight: 1000, fontSize: 12 }}>Roll No</th>
                                    <th style={{ padding: 12, textAlign: 'left', color: palette.muted, fontWeight: 1000, fontSize: 12 }}>Status</th>
                                    {sheet?.can_mark && <th style={{ padding: 12, textAlign: 'left', color: palette.muted, fontWeight: 1000, fontSize: 12 }}>Action</th>}
                                </tr>
                </thead>
                <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} style={{ padding: 14, color: palette.muted, fontWeight: 900 }}>
                                            Loading...
                                        </td>
                                    </tr>
                                ) : rows?.length ? (
                                    rows.map((s) => {
                                        return (
                                            <tr key={s.student_id} style={{ borderTop: `1px solid ${palette.border}` }}>
                                                <td style={{ padding: 12, fontWeight: 1000 }}>{s.name}</td>
                                                <td style={{ padding: 12, fontWeight: 900, color: palette.muted, fontSize: 13 }}>{s.roll_no || '—'}</td>
                                                <td style={{ padding: 12 }}>
                                                    <StatusBadge status={s.status} />
                                                </td>
                                                {sheet?.can_mark && (
                                                    <td style={{ padding: 12, whiteSpace: 'nowrap' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setStudentStatus(s.student_id, 'present')}
                                                            disabled={!isEditable}
                                                            style={{ padding: '8px 12px', marginRight: 8, borderRadius: 10, border: 'none', backgroundColor: '#16a34a', color: '#fff', fontWeight: 1000, cursor: !isEditable ? 'not-allowed' : 'pointer', opacity: !isEditable ? 0.6 : 1 }}
                                                        >
                                                            P
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setStudentStatus(s.student_id, 'absent')}
                                                            disabled={!isEditable}
                                                            style={{ padding: '8px 12px', borderRadius: 10, border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: 1000, cursor: !isEditable ? 'not-allowed' : 'pointer', opacity: !isEditable ? 0.6 : 1 }}
                                                        >
                                                            A
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} style={{ padding: 14, color: palette.muted, fontWeight: 900 }}>
                                            No students found for selected class/date.
                            </td>
                        </tr>
                                )}
                </tbody>
            </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarkAttendance;