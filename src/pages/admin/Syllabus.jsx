import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const colors = {
    bg: '#f9fafb',
    card: '#ffffff',
    border: '#e5e7eb',
    text: '#0f172a',
    muted: '#6b7280',
    primary: '#2563eb',
    success: '#166534',
    danger: '#ef4444',
    shadow: '0 1px 6px rgba(16,24,40,0.06)',
};

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
};

const labelStyle = {
    fontSize: 12,
    color: colors.muted,
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    marginBottom: 6,
};

function Modal({ open, title, onClose, children }) {
    if (!open) return null;
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15,23,42,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 18,
                zIndex: 50,
            }}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div style={{ width: 'min(860px, 100%)', background: '#fff', borderRadius: 16, border: `1px solid ${colors.border}`, boxShadow: colors.shadow, overflow: 'hidden' }}>
                <div style={{ padding: 16, borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontWeight: 1000, color: colors.text, fontSize: 16 }}>{title}</div>
                    <button type="button" onClick={onClose} style={{ background: '#fff', border: `1px solid ${colors.border}`, padding: '8px 12px', borderRadius: 12, cursor: 'pointer', fontWeight: 1000 }}>
                        Close
                    </button>
                </div>
                <div style={{ padding: 16 }}>{children}</div>
            </div>
        </div>
    );
}

export default function AdminSyllabus() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [syllabi, setSyllabi] = useState([]);

    const [editOpen, setEditOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editPdf, setEditPdf] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = async (forceSearch) => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            const q = (forceSearch ?? search).trim();
            if (q) params.search = q;
            const res = await api.get('syllabus/admin/', { params });
            setSyllabi(res.data || []);
        } catch (e) {
            setError(e?.response?.data?.error || 'Could not load syllabus.');
            setSyllabi([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const t = setTimeout(() => load(), 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const openEdit = (row) => {
        setEditId(row.id);
        setEditTitle(row.title || '');
        setEditDesc(row.description || '');
        setEditPdf(null);
        setEditOpen(true);
    };

    const saveEdit = async () => {
        if (!editId) return;
        setSaving(true);
        setError('');
        try {
            const payload = new FormData();
            payload.append('title', editTitle.trim());
            payload.append('description', editDesc || '');
            if (editPdf) payload.append('pdf', editPdf);

            await api.patch(`syllabus/${editId}/`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });

            setEditOpen(false);
            setEditId(null);
            setEditPdf(null);
            await load();
        } catch (e) {
            setError(e?.response?.data?.error || 'Update failed.');
        } finally {
            setSaving(false);
        }
    };

    const deleteSyllabus = async (id) => {
        if (!window.confirm('Delete this syllabus?')) return;
        setError('');
        try {
            await api.delete(`syllabus/${id}/`);
            await load();
        } catch (e) {
            setError(e?.response?.data?.error || 'Delete failed.');
        }
    };

    return (
        <div style={{ padding: 20, background: colors.bg, minHeight: 'calc(100vh - 60px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 1000, color: colors.text }}>Admin Syllabus Management</h1>
                    <div style={{ marginTop: 4, color: colors.muted, fontWeight: 900, fontSize: 13 }}>Full control over syllabus uploads.</div>
                </div>
                <div style={{ minWidth: 260 }}>
                    <div style={labelStyle}>Search (Subject / Title)</div>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. Mathematics" style={inputStyle} />
                </div>
            </div>

            {error ? <div style={{ border: '1px solid #fecaca', background: '#fff7ed', color: '#b91c1c', padding: '10px 12px', borderRadius: 12, fontWeight: 900, marginBottom: 12 }}>{error}</div> : null}

            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, boxShadow: colors.shadow, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 1000 }}>Total Syllabus Files</div>
                    <div style={{ color: colors.muted, fontWeight: 900, fontSize: 13 }}>{syllabi.length}</div>
                </div>

                {loading ? <div style={{ marginTop: 12, color: colors.muted, fontWeight: 900 }}>Loading...</div> : null}

                <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                    {syllabi.map((s) => (
                        <div key={s.id} style={{ border: `1px solid ${colors.border}`, borderRadius: 14, background: '#fafafa', padding: 12 }}>
                            <div style={{ fontWeight: 1000, color: colors.text }}>{s.title}</div>
                            <div style={{ marginTop: 4, color: colors.muted, fontWeight: 900, fontSize: 12 }}>
                                {s.class_name} • {s.subject_name}
                            </div>
                            <div style={{ marginTop: 6, color: colors.muted, fontWeight: 900, fontSize: 12 }}>
                                Uploaded: {s.uploaded_at ? new Date(s.uploaded_at).toLocaleDateString() : '—'}
                            </div>
                            <div style={{ marginTop: 8, color: colors.muted, fontWeight: 900, fontSize: 13, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                                {(s.description || '').slice(0, 140)}
                                {(s.description || '').length > 140 ? '...' : ''}
                            </div>

                            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {s.pdf_url ? (
                                    <a href={s.pdf_url} target="_blank" rel="noreferrer" download style={{ padding: '7px 10px', borderRadius: 10, border: `1px solid ${colors.border}`, background: '#fff', color: colors.primary, fontWeight: 1000, textDecoration: 'none' }}>
                                        Download
                                    </a>
                                ) : null}
                                <button type="button" onClick={() => openEdit(s)} style={{ padding: '7px 10px', borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 1000, cursor: 'pointer' }}>
                                    Edit
                                </button>
                                <button type="button" onClick={() => deleteSyllabus(s.id)} style={{ padding: '7px 10px', borderRadius: 10, border: 'none', background: colors.danger, color: '#fff', fontWeight: 1000, cursor: 'pointer' }}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}

                    {!loading && !syllabi.length ? <div style={{ gridColumn: '1/-1', color: colors.muted, fontWeight: 900 }}>No syllabus found.</div> : null}
                </div>
            </div>

            <Modal open={editOpen} title="Edit Syllabus" onClose={() => setEditOpen(false)}>
                <div style={{ display: 'grid', gap: 12 }}>
                    <div>
                        <div style={labelStyle}>Title *</div>
                        <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        <div style={labelStyle}>Description</div>
                        <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} />
                    </div>
                    <div>
                        <div style={labelStyle}>PDF (optional)</div>
                        <input type="file" accept=".pdf" onChange={(e) => setEditPdf(e.target.files?.[0] || null)} style={inputStyle} />
                        <div style={{ marginTop: 6, color: colors.muted, fontWeight: 900, fontSize: 12 }}>Leave empty to keep existing PDF.</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <button type="button" onClick={() => setEditOpen(false)} style={{ padding: '10px 14px', borderRadius: 12, border: `1px solid ${colors.border}`, background: '#fff', cursor: 'pointer', fontWeight: 1000 }}>
                            Cancel
                        </button>
                        <button type="button" disabled={saving || !editTitle.trim()} onClick={saveEdit} style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: colors.primary, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 1000, opacity: saving ? 0.7 : 1 }}>
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

