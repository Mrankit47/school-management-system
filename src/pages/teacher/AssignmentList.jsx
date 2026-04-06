import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const pageSize = 8;

function parseDateOnly(v) {
    if (!v) return null;
    const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function getStatus(a) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = parseDateOnly(a?.due_date);
    if (!due) return 'Closed';
    return due.getTime() >= today.getTime() ? 'Active' : 'Closed';
}

const badgeStyle = (status) => ({
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 1000,
    border: status === 'Active' ? '1px solid #16a34a' : '1px solid #ef4444',
    backgroundColor: status === 'Active' ? '#ecfdf5' : '#fef2f2',
    color: status === 'Active' ? '#16a34a' : '#ef4444',
});

export default function TeacherAssignmentList() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [q, setQ] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [page, setPage] = useState(1);
    const [viewRow, setViewRow] = useState(null);
    const [editRow, setEditRow] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('assignments/');
            setRows((res.data || []).map((a) => ({ ...a, computed_status: getStatus(a) })));
        } catch (e) {
            setError(e?.response?.data?.error || 'Could not load assignments.');
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const summary = useMemo(() => {
        const total = rows.length;
        const active = rows.filter((r) => r.computed_status === 'Active').length;
        const closed = total - active;
        return { total, active, closed };
    }, [rows]);

    const classOptions = useMemo(
        () => Array.from(new Set(rows.map((r) => `${r.class_name || ''}-${r.section_name || ''}`))).filter(Boolean),
        [rows]
    );
    const subjectOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.subject || ''))).filter(Boolean), [rows]);

    const filtered = useMemo(() => {
        const f = rows.filter((r) => {
            const title = String(r.title || '').toLowerCase();
            if (q && !title.includes(q.toLowerCase())) return false;

            const cls = `${r.class_name || ''}-${r.section_name || ''}`;
            if (classFilter && cls !== classFilter) return false;
            if (subjectFilter && r.subject !== subjectFilter) return false;
            if (statusFilter && r.computed_status !== statusFilter) return false;

            const due = parseDateOnly(r.due_date);
            if (fromDate && due && due < parseDateOnly(fromDate)) return false;
            if (toDate && due && due > parseDateOnly(toDate)) return false;
            return true;
        });
        return f.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
    }, [rows, q, classFilter, subjectFilter, statusFilter, fromDate, toDate]);

    useEffect(() => {
        setPage(1);
    }, [q, classFilter, subjectFilter, statusFilter, fromDate, toDate]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    const onDelete = async (id) => {
        if (!window.confirm('Delete this assignment?')) return;
        try {
            await api.delete(`assignments/${id}/`);
            await load();
        } catch (e) {
            alert(e?.response?.data?.error || 'Delete failed');
        }
    };

    const onSaveEdit = async () => {
        if (!editRow) return;
        setSaving(true);
        try {
            await api.patch(`assignments/${editRow.id}/`, {
                title: editRow.title,
                subject: editRow.subject,
                start_date: editRow.start_date || null,
                due_date: editRow.due_date,
                total_marks: editRow.total_marks,
                submission_type: editRow.submission_type,
                description: editRow.description || '',
                instructions: editRow.instructions || '',
            });
            setEditRow(null);
            await load();
        } catch (e) {
            alert(e?.response?.data?.error || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: 0 }}>My Assignments</h1>
                    <div style={{ marginTop: 4, color: '#6b7280', fontSize: 13, fontWeight: 900 }}>Assignments created by you only.</div>
                </div>
                <button onClick={() => navigate('/teacher/assignment')} style={{ border: 'none', background: '#2563eb', color: '#fff', borderRadius: 10, padding: '10px 14px', fontWeight: 900, cursor: 'pointer' }}>
                    + Create Assignment
                </button>
            </div>

            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: 14, background: '#fff' }}><div style={{ fontSize: 12, color: '#6b7280', fontWeight: 900 }}>Total Assignments</div><div style={{ marginTop: 6, fontSize: 26, fontWeight: 1000 }}>{summary.total}</div></div>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: 14, background: '#fff' }}><div style={{ fontSize: 12, color: '#6b7280', fontWeight: 900 }}>Active Assignments</div><div style={{ marginTop: 6, fontSize: 26, fontWeight: 1000, color: '#16a34a' }}>{summary.active}</div></div>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: 14, background: '#fff' }}><div style={{ fontSize: 12, color: '#6b7280', fontWeight: 900 }}>Completed Assignments</div><div style={{ marginTop: 6, fontSize: 26, fontWeight: 1000, color: '#ef4444' }}>{summary.closed}</div></div>
            </div>

            <div style={{ marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 14, background: '#fff', padding: 12, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: 10 }}>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title" style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10 }} />
                <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10 }}><option value="">All Classes</option>{classOptions.map((c) => <option key={c} value={c}>{c}</option>)}</select>
                <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10 }}><option value="">All Subjects</option>{subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}</select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10 }}><option value="">All Status</option><option value="Active">Active</option><option value="Closed">Closed</option></select>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10 }} />
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10 }} />
            </div>

            <div style={{ marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 14, background: '#fff', overflowX: 'auto' }}>
                {error ? <div style={{ padding: 12, color: '#b91c1c', fontWeight: 900 }}>{error}</div> : null}
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1200 }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            {['Title', 'Subject', 'Class', 'Section', 'Start Date', 'Due Date', 'Total Marks', 'Submission Type', 'Status', 'Actions'].map((h) => (
                                <th key={h} style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#6b7280' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={10} style={{ padding: 12 }}>Loading...</td></tr>
                        ) : paged.length ? (
                            paged.map((r) => (
                                <tr key={r.id} style={{ borderTop: '1px solid #eef2f7' }}>
                                    <td style={{ padding: 10, fontWeight: 900 }}>{r.title}</td>
                                    <td style={{ padding: 10 }}>{r.subject}</td>
                                    <td style={{ padding: 10 }}>{r.class_name || '-'}</td>
                                    <td style={{ padding: 10 }}>{r.section_name || '-'}</td>
                                    <td style={{ padding: 10 }}>{r.start_date || '-'}</td>
                                    <td style={{ padding: 10 }}>{r.due_date || '-'}</td>
                                    <td style={{ padding: 10 }}>{r.total_marks}</td>
                                    <td style={{ padding: 10, textTransform: 'capitalize' }}>{r.submission_type}</td>
                                    <td style={{ padding: 10 }}><span style={badgeStyle(r.computed_status)}>{r.computed_status}</span></td>
                                    <td style={{ padding: 10 }}>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            <button onClick={() => setViewRow(r)} style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontWeight: 900 }}>View</button>
                                            <button onClick={() => setEditRow({ ...r })} style={{ border: 'none', background: '#16a34a', color: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontWeight: 900 }}>Edit</button>
                                            <button onClick={() => onDelete(r.id)} style={{ border: 'none', background: '#ef4444', color: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontWeight: 900 }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={10} style={{ padding: 12, color: '#6b7280' }}>No assignments found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#6b7280', fontWeight: 900, fontSize: 13 }}>Showing {paged.length} of {filtered.length}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                    <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Prev</button>
                    <div style={{ padding: '8px 10px', fontWeight: 900 }}>{page} / {totalPages}</div>
                    <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Next</button>
                </div>
            </div>

            {viewRow ? (
                <div onClick={() => setViewRow(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(700px,100%)', background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 16 }}>
                        <h3 style={{ marginTop: 0 }}>Assignment Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div><strong>Title:</strong> {viewRow.title}</div><div><strong>Subject:</strong> {viewRow.subject}</div>
                            <div><strong>Class:</strong> {viewRow.class_name || '-'}</div><div><strong>Section:</strong> {viewRow.section_name || '-'}</div>
                            <div><strong>Start:</strong> {viewRow.start_date || '-'}</div><div><strong>Due:</strong> {viewRow.due_date || '-'}</div>
                            <div><strong>Total Marks:</strong> {viewRow.total_marks}</div><div><strong>Submission:</strong> {viewRow.submission_type}</div>
                            <div><strong>Status:</strong> {viewRow.computed_status}</div>
                        </div>
                        <div style={{ marginTop: 10 }}><strong>Description:</strong><div style={{ marginTop: 4, color: '#4b5563' }}>{viewRow.description || '-'}</div></div>
                        <div style={{ marginTop: 12, textAlign: 'right' }}><button onClick={() => setViewRow(null)} style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', fontWeight: 900 }}>Close</button></div>
                    </div>
                </div>
            ) : null}

            {editRow ? (
                <div onClick={() => setEditRow(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(760px,100%)', background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 16 }}>
                        <h3 style={{ marginTop: 0 }}>Edit Assignment</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <input value={editRow.title || ''} onChange={(e) => setEditRow((p) => ({ ...p, title: e.target.value }))} placeholder="Title" style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10 }} />
                            <input value={editRow.subject || ''} onChange={(e) => setEditRow((p) => ({ ...p, subject: e.target.value }))} placeholder="Subject" style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10 }} />
                            <input type="date" value={editRow.start_date || ''} onChange={(e) => setEditRow((p) => ({ ...p, start_date: e.target.value }))} style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10 }} />
                            <input type="date" value={editRow.due_date || ''} onChange={(e) => setEditRow((p) => ({ ...p, due_date: e.target.value }))} style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10 }} />
                            <input type="number" value={editRow.total_marks || ''} onChange={(e) => setEditRow((p) => ({ ...p, total_marks: e.target.value }))} placeholder="Total marks" style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10 }} />
                            <select value={editRow.submission_type || 'online'} onChange={(e) => setEditRow((p) => ({ ...p, submission_type: e.target.value }))} style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10 }}>
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                            </select>
                        </div>
                        <textarea value={editRow.description || ''} onChange={(e) => setEditRow((p) => ({ ...p, description: e.target.value }))} placeholder="Description" style={{ marginTop: 10, width: '100%', minHeight: 80, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10 }} />
                        <textarea value={editRow.instructions || ''} onChange={(e) => setEditRow((p) => ({ ...p, instructions: e.target.value }))} placeholder="Instructions" style={{ marginTop: 10, width: '100%', minHeight: 70, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10 }} />
                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button onClick={() => setEditRow(null)} style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', fontWeight: 900 }}>Cancel</button>
                            <button onClick={onSaveEdit} disabled={saving} style={{ border: 'none', background: '#2563eb', color: '#fff', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', fontWeight: 900 }}>{saving ? 'Saving...' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

