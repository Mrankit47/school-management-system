import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const palette = {
    pending: '#f59e0b',
    approved: '#16a34a',
    rejected: '#ef4444',
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
    if (s === 'pending') {
        bg = '#fef3c7';
        color = palette.pending;
    } else if (s === 'approved') {
        bg = '#dcfce7';
        color = palette.approved;
    } else if (s === 'rejected') {
        bg = '#fee2e2';
        color = palette.rejected;
    }

    const label = s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Not Marked';
    return (
        <span style={{ display: 'inline-block', padding: '6px 10px', borderRadius: 999, backgroundColor: bg, border: `1px solid ${palette.border}`, color, fontWeight: 1000, fontSize: 12 }}>
            {label}
        </span>
    );
}

const MarkAttendance = () => {
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const [verification, setVerification] = useState(null); // { summary, students: [] }
    const [actionBusy, setActionBusy] = useState({});

    const [notifications, setNotifications] = useState([]);
    const pendingNotifications = useMemo(() => {
        const all = notifications || [];
        return all.filter((n) => (n.title || '').toLowerCase().includes('attendance verification pending') && !n.is_read);
    }, [notifications]);

    const loadTeacherClasses = async () => {
        const [profileRes, classRes] = await Promise.all([api.get('teachers/profile/'), api.get('classes/sections/')]);
        const teacherProfile = profileRes.data || null;
        const allSections = classRes.data || [];
        const mine = allSections.filter((c) => c.class_teacher === teacherProfile?.id);
        setClasses(mine);
        if (mine.length && !selectedClassId) {
            setSelectedClassId(String(mine[0].id));
        }
    };

    const loadVerification = async () => {
        if (!selectedClassId) return;
        setLoading(true);
        try {
            const res = await api.get('attendance/verification/', {
                params: { class_section_id: selectedClassId, date },
            });
            setVerification(res.data || null);
        } catch (e) {
            setVerification(null);
        } finally {
            setLoading(false);
        }
    };

    const loadNotifications = async () => {
        try {
            const res = await api.get('communication/my/');
            setNotifications(res.data || []);
        } catch (e) {
            setNotifications([]);
        }
    };

    useEffect(() => {
        loadTeacherClasses().catch(() => {});
        loadNotifications().catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadVerification().catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClassId, date]);

    const decide = async (attendanceId, decision) => {
        if (!attendanceId) return;
        setActionBusy((prev) => ({ ...prev, [attendanceId]: true }));
        try {
            await api.patch(`attendance/verification/decision/${attendanceId}/`, { decision });
            await loadVerification();
            await loadNotifications();
        } catch (e) {
            alert(e?.response?.data?.error || 'Could not verify attendance.');
        } finally {
            setActionBusy((prev) => ({ ...prev, [attendanceId]: false }));
        }
    };

    return (
        <div style={{ padding: 20, backgroundColor: palette.bg, minHeight: 'calc(100vh - 60px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <div>
                    <h1 style={{ margin: 0, fontWeight: 1000 }}>Attendance Verification System</h1>
                    <div style={{ marginTop: 4, color: palette.muted, fontWeight: 900, fontSize: 13 }}>Students punch attendance (Pending). Teacher verifies (Approve/Reject).</div>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 12, alignItems: 'start' }}>
                <div style={{ backgroundColor: palette.card, border: `1px solid ${palette.border}`, borderRadius: 16, padding: 16, boxShadow: palette.shadow }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontWeight: 1000 }}>Student Attendance Requests</div>
                            <div style={{ marginTop: 3, color: palette.muted, fontWeight: 900, fontSize: 13 }}>
                                {verification?.class_display || 'Select class to view requests'}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <div style={{ color: palette.muted, fontWeight: 900, fontSize: 12 }}>Pending: <span style={{ color: palette.pending, fontWeight: 1000 }}>{verification?.summary?.pending ?? 0}</span></div>
                            <div style={{ color: palette.muted, fontWeight: 900, fontSize: 12 }}>Approved: <span style={{ color: palette.approved, fontWeight: 1000 }}>{verification?.summary?.approved ?? 0}</span></div>
                            <div style={{ color: palette.muted, fontWeight: 900, fontSize: 12 }}>Rejected: <span style={{ color: palette.rejected, fontWeight: 1000 }}>{verification?.summary?.rejected ?? 0}</span></div>
                        </div>
                    </div>

                    <div style={{ marginTop: 12, overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f1f5f9' }}>
                                    <th style={{ padding: 12, textAlign: 'left', color: palette.muted, fontWeight: 1000, fontSize: 12 }}>Name</th>
                                    <th style={{ padding: 12, textAlign: 'left', color: palette.muted, fontWeight: 1000, fontSize: 12 }}>Punch Time</th>
                                    <th style={{ padding: 12, textAlign: 'left', color: palette.muted, fontWeight: 1000, fontSize: 12 }}>Status</th>
                                    <th style={{ padding: 12, textAlign: 'left', color: palette.muted, fontWeight: 1000, fontSize: 12 }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} style={{ padding: 14, color: palette.muted, fontWeight: 900 }}>
                                            Loading...
                                        </td>
                                    </tr>
                                ) : verification?.students?.length ? (
                                    verification.students.map((s) => {
                                        const pending = (s.verification_status || '').toLowerCase() === 'pending';
                                        return (
                                            <tr key={s.student_id} style={{ borderTop: `1px solid ${palette.border}` }}>
                                                <td style={{ padding: 12, fontWeight: 1000 }}>{s.name}</td>
                                                <td style={{ padding: 12, fontWeight: 900, color: palette.muted, fontSize: 13 }}>{formatTime(s.punch_time)}</td>
                                                <td style={{ padding: 12 }}>
                                                    <StatusBadge status={s.verification_status} />
                                                </td>
                                                <td style={{ padding: 12, whiteSpace: 'nowrap' }}>
                                                    {pending ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                disabled={!!actionBusy[s.attendance_id]}
                                                                onClick={() => decide(s.attendance_id, 'approve')}
                                                                style={{ padding: '8px 12px', marginRight: 8, borderRadius: 10, border: 'none', backgroundColor: palette.approved, color: '#fff', fontWeight: 1000, cursor: actionBusy[s.attendance_id] ? 'not-allowed' : 'pointer' }}
                                                            >
                                                                {actionBusy[s.attendance_id] ? 'Approving...' : 'Approve'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={!!actionBusy[s.attendance_id]}
                                                                onClick={() => decide(s.attendance_id, 'reject')}
                                                                style={{ padding: '8px 12px', borderRadius: 10, border: 'none', backgroundColor: palette.rejected, color: '#fff', fontWeight: 1000, cursor: actionBusy[s.attendance_id] ? 'not-allowed' : 'pointer' }}
                                                            >
                                                                {actionBusy[s.attendance_id] ? 'Rejecting...' : 'Reject'}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span style={{ color: palette.muted, fontWeight: 900 }}>—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} style={{ padding: 14, color: palette.muted, fontWeight: 900 }}>
                                            No attendance requests for this class/date.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ backgroundColor: palette.card, border: `1px solid ${palette.border}`, borderRadius: 16, padding: 16, boxShadow: palette.shadow }}>
                    <div style={{ fontWeight: 1000 }}>Notifications</div>
                    <div style={{ marginTop: 4, color: palette.muted, fontWeight: 900, fontSize: 13 }}>Pending attendance verification requests.</div>

                    <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ color: palette.muted, fontWeight: 900, fontSize: 12 }}>Unread Pending:</div>
                        <div style={{ color: palette.pending, fontWeight: 1000 }}>{pendingNotifications.length}</div>
                    </div>

                    <div style={{ marginTop: 12, display: 'grid', gap: 10, maxHeight: 520, overflowY: 'auto' }}>
                        {pendingNotifications.length ? (
                            pendingNotifications.slice(0, 10).map((n) => (
                                <div key={n.id} style={{ border: `1px solid ${palette.border}`, borderRadius: 12, padding: 12, backgroundColor: '#fff7ed' }}>
                                    <div style={{ fontWeight: 1000, fontSize: 13 }}>{n.title}</div>
                                    <div style={{ marginTop: 6, color: palette.muted, fontWeight: 900, fontSize: 12 }}>{n.message}</div>
                                    <div style={{ marginTop: 6, color: palette.muted, fontWeight: 900, fontSize: 11 }}>{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</div>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: palette.muted, fontWeight: 900, fontSize: 13 }}>No pending verification notifications.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarkAttendance;