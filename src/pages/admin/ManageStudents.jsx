import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const PAGE_SIZE = 8;

const parseClassSection = (className) => {
    if (!className || className === 'N/A') return { classLabel: 'N/A', sectionLabel: 'N/A' };
    const [classLabel, sectionLabel] = String(className).split('-').map((p) => p?.trim());
    return {
        classLabel: classLabel || 'N/A',
        sectionLabel: sectionLabel || 'N/A',
    };
};

const ageFromDob = (dob) => {
    if (!dob) return null;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
    return age >= 0 ? age : null;
};

const ageBucket = (age) => {
    if (age == null) return 'Unknown';
    if (age <= 10) return '0-10';
    if (age <= 15) return '11-15';
    if (age <= 18) return '16-18';
    return '18+';
};

const sessionFromAdmissionDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return 'N/A';
    const y = d.getFullYear();
    const n = y + 1;
    return `${y}-${String(n).slice(-2)}`;
};

const regionFromAddress = (address) => {
    if (!address) return 'Unknown';
    const parts = String(address).split(',').map((p) => p.trim()).filter(Boolean);
    return parts[parts.length - 1] || 'Unknown';
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString();
};

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyDeleteId, setBusyDeleteId] = useState(null);
    const [page, setPage] = useState(1);
    const [viewRow, setViewRow] = useState(null);
    const [editRow, setEditRow] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);

    const defaultFilters = {
        activity: '',
        gender: '',
        age: '',
        region: '',
        session: '',
        category: '',
        className: '',
        sectionName: '',
        search: '',
    };
    const [draftFilters, setDraftFilters] = useState(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

    const loadData = async () => {
        setLoading(true);
        try {
            const [sRes, cRes, secRes] = await Promise.allSettled([
                api.get('students/'),
                api.get('classes/main-classes/'),
                api.get('classes/main-sections/'),
            ]);

            setStudents(sRes.status === 'fulfilled' ? (sRes.value?.data || []) : []);
            setClasses(cRes.status === 'fulfilled' ? (cRes.value?.data || []) : []);
            setSections(secRes.status === 'fulfilled' ? (secRes.value?.data || []) : []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const studentsWithMeta = useMemo(() => (
        (students || []).map((s) => {
            const { classLabel, sectionLabel } = parseClassSection(s.class_name);
            const age = ageFromDob(s.dob);
            const activity = classLabel === 'N/A' ? 'Inactive' : 'Active';
            return {
                ...s,
                classLabel,
                sectionLabel,
                age,
                ageLabel: ageBucket(age),
                activity,
                sessionName: sessionFromAdmissionDate(s.date_of_admission),
                region: regionFromAddress(s.address),
            };
        })
    ), [students]);

    const options = useMemo(() => {
        const uniq = (arr) => [...new Set(arr.filter(Boolean))];
        return {
            activity: ['Active', 'Inactive'],
            gender: uniq(studentsWithMeta.map((s) => s.gender || 'Unknown')),
            age: ['0-10', '11-15', '16-18', '18+', 'Unknown'],
            region: uniq(studentsWithMeta.map((s) => s.region)),
            session: uniq(studentsWithMeta.map((s) => s.sessionName)),
            category: uniq(studentsWithMeta.map((s) => s.category || 'N/A')),
            className: uniq([...(classes || []).map((c) => c.name), ...studentsWithMeta.map((s) => s.classLabel)]),
            sectionName: uniq([...(sections || []).map((s) => s.name), ...studentsWithMeta.map((s) => s.sectionLabel)]),
        };
    }, [studentsWithMeta, classes, sections]);

    const filtered = useMemo(() => {
        const q = (appliedFilters.search || '').trim().toLowerCase();
        return studentsWithMeta.filter((s) => {
            if (appliedFilters.activity && s.activity !== appliedFilters.activity) return false;
            if (appliedFilters.gender && (s.gender || 'Unknown') !== appliedFilters.gender) return false;
            if (appliedFilters.age && s.ageLabel !== appliedFilters.age) return false;
            if (appliedFilters.region && s.region !== appliedFilters.region) return false;
            if (appliedFilters.session && s.sessionName !== appliedFilters.session) return false;
            if (appliedFilters.category && (s.category || 'N/A') !== appliedFilters.category) return false;
            if (appliedFilters.className && s.classLabel !== appliedFilters.className) return false;
            if (appliedFilters.sectionName && s.sectionLabel !== appliedFilters.sectionName) return false;

            if (q) {
                const haystack = [
                    s.name, s.username, s.email, s.admission_number, s.parent_guardian_name, s.parent_contact_number,
                ].join(' ').toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            return true;
        });
    }, [studentsWithMeta, appliedFilters]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pagedRows = filtered.slice(start, start + PAGE_SIZE);

    const pageNumbers = useMemo(() => {
        const nums = [];
        for (let i = 1; i <= totalPages; i += 1) nums.push(i);
        return nums;
    }, [totalPages]);

    const applySearch = () => {
        setAppliedFilters(draftFilters);
        setPage(1);
    };

    const clearAll = () => {
        setDraftFilters(defaultFilters);
        setAppliedFilters(defaultFilters);
        setPage(1);
    };

    const handleDelete = async (row) => {
        const ok = window.confirm(`Delete student "${row?.name}"?`);
        if (!ok) return;
        setBusyDeleteId(row.id);
        try {
            await api.delete(`students/delete/${row.id}/`);
            await loadData();
        } catch (e) {
            window.alert(e?.response?.data?.error || 'Failed to delete student.');
        } finally {
            setBusyDeleteId(null);
        }
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        if (!editRow) return;
        setSavingEdit(true);
        try {
            await api.patch(`students/update/${editRow.id}/`, {
                first_name: editRow.first_name || '',
                last_name: editRow.last_name || '',
                name: `${editRow.first_name || ''} ${editRow.last_name || ''}`.trim() || editRow.name,
                email: editRow.email || '',
                admission_number: editRow.admission_number || '',
                dob: editRow.dob || null,
                gender: editRow.gender || '',
                parent_guardian_name: editRow.parent_guardian_name || '',
                parent_contact_number: editRow.parent_contact_number || '',
                category: editRow.category || '',
            });
            setEditRow(null);
            await loadData();
        } catch (e2) {
            window.alert(e2?.response?.data?.error || 'Failed to update student.');
        } finally {
            setSavingEdit(false);
        }
    };

    const shellCard = {
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 18,
        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)',
        padding: 18,
    };

    const th = {
        textAlign: 'left',
        fontSize: 12,
        fontWeight: 800,
        color: '#475569',
        padding: '12px 10px',
        whiteSpace: 'nowrap',
        background: '#f1f5f9',
    };

    const td = {
        fontSize: 13,
        color: '#0f172a',
        padding: '12px 10px',
        borderTop: '1px solid #e2e8f0',
        whiteSpace: 'nowrap',
    };

    const selectStyle = {
        minWidth: 120,
        padding: '10px 12px',
        border: '1px solid #d1d5db',
        borderRadius: 10,
        fontSize: 13,
        backgroundColor: '#fff',
    };

    return (
        <div style={{ padding: 20, background: '#f1f5f9', minHeight: '100%' }}>
            <div style={shellCard}>
                <h1 style={{ margin: 0, fontSize: 30, color: '#0f172a' }}>Student Management</h1>

                <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {[
                        ['activity', 'Activity', options.activity],
                        ['gender', 'Gender', options.gender],
                        ['age', 'Age', options.age],
                        ['region', 'Region', options.region],
                        ['session', 'Session', options.session],
                        ['category', 'Category', options.category],
                        ['className', 'Class', options.className],
                        ['sectionName', 'Section', options.sectionName],
                    ].map(([key, label, opts]) => (
                        <select
                            key={key}
                            value={draftFilters[key]}
                            onChange={(e) => setDraftFilters((p) => ({ ...p, [key]: e.target.value }))}
                            style={selectStyle}
                        >
                            <option value="">{label}</option>
                            {(opts || []).map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                    ))}

                    <button
                        type="button"
                        onClick={applySearch}
                        style={{ ...selectStyle, minWidth: 100, background: '#1d4ed8', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
                    >
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={clearAll}
                        style={{ ...selectStyle, minWidth: 100, background: '#fff', color: '#475569', cursor: 'pointer', fontWeight: 700 }}
                    >
                        Clear All
                    </button>
                </div>

                <div style={{ marginTop: 14, position: 'relative', maxWidth: 420 }}>
                    <span style={{ position: 'absolute', left: 12, top: 10, color: '#94a3b8' }}>🔍</span>
                    <input
                        value={draftFilters.search}
                        onChange={(e) => setDraftFilters((p) => ({ ...p, search: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') applySearch(); }}
                        placeholder="Search student..."
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 34px',
                            border: '1px solid #d1d5db',
                            borderRadius: 10,
                            background: '#fff',
                            fontSize: 14,
                        }}
                    />
                </div>
            </div>

            <div style={{ ...shellCard, marginTop: 14, padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 18, color: '#64748b' }}>Loading students...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 1300 }}>
                        <thead>
                                <tr>
                                    <th style={th}>S.No</th>
                                    <th style={th}>Student Name</th>
                                    <th style={th}>Session Name</th>
                                    <th style={th}>Gender</th>
                                    <th style={th}>DOB</th>
                                    <th style={th}>Class</th>
                                    <th style={th}>Section</th>
                                    <th style={th}>Guardian Name</th>
                                    <th style={th}>Guardian Email</th>
                                    <th style={th}>Guardian Mobile</th>
                                    <th style={th}>Status</th>
                                    <th style={th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                                {pagedRows.length === 0 ? (
                                    <tr><td colSpan={12} style={{ ...td, textAlign: 'center', padding: 20 }}>No students found.</td></tr>
                                ) : pagedRows.map((s, idx) => (
                                    <tr key={s.id} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                        <td style={td}>{start + idx + 1}</td>
                                        <td style={{ ...td, fontWeight: 700 }}>{s.name || '—'}</td>
                                        <td style={td}>{s.sessionName}</td>
                                        <td style={td}>{s.gender || 'Unknown'}</td>
                                        <td style={td}>{formatDate(s.dob)}</td>
                                        <td style={td}>{s.classLabel}</td>
                                        <td style={td}>{s.sectionLabel}</td>
                                        <td style={td}>{s.parent_guardian_name || '—'}</td>
                                        <td style={td}>{s.email || '—'}</td>
                                        <td style={td}>{s.parent_contact_number || '—'}</td>
                                        <td style={td}>
                                            <span
                                                style={{
                                                    padding: '4px 10px',
                                                    borderRadius: 999,
                                                    fontWeight: 700,
                                                    fontSize: 11,
                                                    color: s.activity === 'Active' ? '#166534' : '#991b1b',
                                                    backgroundColor: s.activity === 'Active' ? '#dcfce7' : '#fee2e2',
                                                    border: `1px solid ${s.activity === 'Active' ? '#86efac' : '#fecaca'}`,
                                                }}
                                            >
                                                {s.activity}
                                            </span>
                                        </td>
                                        <td style={td}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button type="button" title="View" onClick={() => setViewRow(s)} style={{ border: '1px solid #dbeafe', background: '#eff6ff', borderRadius: 8, cursor: 'pointer', padding: '6px 9px' }}>👁️</button>
                                                <button type="button" title="Edit" onClick={() => setEditRow({ ...s })} style={{ border: '1px solid #d1fae5', background: '#ecfdf5', borderRadius: 8, cursor: 'pointer', padding: '6px 9px' }}>✏️</button>
                                                <button type="button" title="Delete" disabled={busyDeleteId === s.id} onClick={() => handleDelete(s)} style={{ border: '1px solid #fecaca', background: '#fff1f2', borderRadius: 8, cursor: 'pointer', padding: '6px 9px', opacity: busyDeleteId === s.id ? 0.6 : 1 }}>🗑️</button>
                                            </div>
                                        </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderTop: '1px solid #e2e8f0', background: '#fff' }}>
                    <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ ...selectStyle, minWidth: 95, cursor: 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>Previous</button>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {pageNumbers.map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setPage(n)}
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 8,
                                    border: n === currentPage ? '1px solid #2563eb' : '1px solid #d1d5db',
                                    background: n === currentPage ? '#2563eb' : '#fff',
                                    color: n === currentPage ? '#fff' : '#334155',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                    <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ ...selectStyle, minWidth: 95, cursor: 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}>Next</button>
                </div>
            </div>

            {viewRow && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}>
                    <div style={{ width: '100%', maxWidth: 540, borderRadius: 16, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 16px 40px rgba(2,6,23,0.2)', padding: 18 }}>
                        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Student Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                            <div><b>Name:</b> {viewRow.name || '—'}</div>
                            <div><b>Admission:</b> {viewRow.admission_number || '—'}</div>
                            <div><b>Session:</b> {viewRow.sessionName}</div>
                            <div><b>Gender:</b> {viewRow.gender || 'Unknown'}</div>
                            <div><b>Class:</b> {viewRow.classLabel}</div>
                            <div><b>Section:</b> {viewRow.sectionLabel}</div>
                            <div><b>Guardian:</b> {viewRow.parent_guardian_name || '—'}</div>
                            <div><b>Mobile:</b> {viewRow.parent_contact_number || '—'}</div>
                        </div>
                        <div style={{ marginTop: 16, textAlign: 'right' }}>
                            <button type="button" onClick={() => setViewRow(null)} style={{ ...selectStyle, minWidth: 90, cursor: 'pointer' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {editRow && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 55 }}>
                    <form onSubmit={saveEdit} style={{ width: '100%', maxWidth: 640, borderRadius: 16, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 16px 40px rgba(2,6,23,0.2)', padding: 18 }}>
                        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Edit Student</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <input value={editRow.first_name || ''} onChange={(e) => setEditRow((p) => ({ ...p, first_name: e.target.value }))} placeholder="First name" style={selectStyle} />
                            <input value={editRow.last_name || ''} onChange={(e) => setEditRow((p) => ({ ...p, last_name: e.target.value }))} placeholder="Last name" style={selectStyle} />
                            <input value={editRow.email || ''} onChange={(e) => setEditRow((p) => ({ ...p, email: e.target.value }))} placeholder="Email" style={selectStyle} />
                            <input value={editRow.admission_number || ''} onChange={(e) => setEditRow((p) => ({ ...p, admission_number: e.target.value }))} placeholder="Admission number" style={selectStyle} />
                            <input type="date" value={editRow.dob || ''} onChange={(e) => setEditRow((p) => ({ ...p, dob: e.target.value }))} style={selectStyle} />
                            <select value={editRow.gender || ''} onChange={(e) => setEditRow((p) => ({ ...p, gender: e.target.value }))} style={selectStyle}>
                                <option value="">Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            <input value={editRow.parent_guardian_name || ''} onChange={(e) => setEditRow((p) => ({ ...p, parent_guardian_name: e.target.value }))} placeholder="Guardian name" style={selectStyle} />
                            <input value={editRow.parent_contact_number || ''} onChange={(e) => setEditRow((p) => ({ ...p, parent_contact_number: e.target.value }))} placeholder="Guardian mobile" style={selectStyle} />
                        </div>
                        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button type="button" onClick={() => setEditRow(null)} style={{ ...selectStyle, minWidth: 90, cursor: 'pointer' }}>Cancel</button>
                            <button type="submit" disabled={savingEdit} style={{ ...selectStyle, minWidth: 90, cursor: 'pointer', background: '#1d4ed8', color: '#fff', borderColor: '#1d4ed8', opacity: savingEdit ? 0.7 : 1 }}>{savingEdit ? 'Saving...' : 'Save'}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ManageStudents;