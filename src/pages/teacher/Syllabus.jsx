import React, { useEffect, useMemo, useState } from 'react';
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
    warning: '#a16207',
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
                    <div style={{ fontWeight: 1000, fontSize: 16, color: colors.text }}>{title}</div>
                    <button onClick={onClose} type="button" style={{ background: '#fff', border: `1px solid ${colors.border}`, padding: '8px 12px', borderRadius: 12, cursor: 'pointer', fontWeight: 1000 }}>
                        Close
                    </button>
                </div>
                <div style={{ padding: 16 }}>{children}</div>
            </div>
        </div>
    );
}

export default function TeacherSyllabus() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [search, setSearch] = useState('');

    const [options, setOptions] = useState([]); // {class_id,class_name,subject_id,subject_name}
    const classes = useMemo(() => Array.from(new Map((options || []).map((o) => [String(o.class_id), { id: String(o.class_id), name: o.class_name }])).values()), [options]);

    const [selectedClassId, setSelectedClassId] = useState('');
    const subjects = useMemo(() => (selectedClassId ? (options || []).filter((o) => String(o.class_id) === String(selectedClassId)) : options), [options, selectedClassId]);
    const subjectList = useMemo(() => Array.from(new Map(subjects.map((o) => [String(o.subject_id), { id: String(o.subject_id), name: o.subject_name }])).values()), [subjects]);

    const [form, setForm] = useState({ class_id: '', subject_id: '', title: '', description: '', pdf: null });

    const [syllabi, setSyllabi] = useState([]);

    const loadAll = async () => {
        setLoading(true);
        setError('');
        try {
            // Load options first (class/subject dropdown). Even if list fails, options should show.
            const optRes = await api.get('syllabus/teacher/options/');
            const opts = optRes.data || [];
            setOptions(opts);

            const initialClass = opts?.length ? String(opts[0].class_id) : '';
            setSelectedClassId((prev) => prev || initialClass);

            // Then load syllabus list
            const listParams = {};
            if (search.trim()) listParams.search = search.trim();
            try {
                const listRes = await api.get('syllabus/teacher/', { params: listParams });
                setSyllabi(listRes.data || []);
            } catch (listErr) {
                setSyllabi([]);
                // keep options UI usable; show only list error
                setError(listErr?.response?.data?.error || 'Could not load syllabus list.');
            }
        } catch (e) {
            setError(e?.response?.data?.error || 'Could not load syllabus data.');
            // If options fail, keep dropdown empty.
            setSyllabi([]);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            const params = {};
            if (search.trim()) params.search = search.trim();
            setLoading(true);
            api
                .get('syllabus/teacher/', { params })
                .then((res) => setSyllabi(res.data || []))
                .catch((e) => setError(e?.response?.data?.error || 'Could not load syllabus.'))
                .finally(() => setLoading(false));
        }, 350);

        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    useEffect(() => {
        // keep form in sync with selected class
        if (selectedClassId && String(form.class_id) !== String(selectedClassId)) {
            setForm((p) => ({ ...p, class_id: String(selectedClassId), subject_id: '' }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClassId]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');
        try {
            const payload = new FormData();
            payload.append('class_id', form.class_id);
            payload.append('subject_id', form.subject_id);
            payload.append('title', form.title.trim());
            payload.append('description', form.description || '');
            payload.append('pdf', form.pdf);

            await api.post('syllabus/teacher/upload/', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setForm({ class_id: form.class_id, subject_id: '', title: '', description: '', pdf: null });
            setMessage('Syllabus uploaded successfully.');
            await loadAll();
        } catch (e2) {
            const detail =
                e2?.response?.data?.error ||
                e2?.response?.data?.detail ||
                e2?.response?.data?.details ||
                e2?.message ||
                'Upload failed.';
            setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
        } finally {
            setSaving(false);
        }
    };

    const [editOpen, setEditOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editPdf, setEditPdf] = useState(null);

    const openEdit = (row) => {
        setEditId(row.id);
        setEditTitle(row.title || '');
        setEditDesc(row.description || '');
        setEditPdf(null);
        setEditOpen(true);
    };

    const onEditSave = async () => {
        if (!editId) return;
        setSaving(true);
        setError('');
        setMessage('');
        try {
            const payload = new FormData();
            payload.append('title', editTitle.trim());
            payload.append('description', editDesc || '');
            if (editPdf) payload.append('pdf', editPdf);

            await api.patch(`syllabus/${editId}/`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setEditOpen(false);
            setEditId(null);
            await loadAll();
            setMessage('Syllabus updated successfully.');
        } catch (e) {
            setError(e?.response?.data?.error || 'Update failed.');
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async (id) => {
        if (!window.confirm('Delete this syllabus?')) return;
        setError('');
        setMessage('');
        try {
            await api.delete(`syllabus/${id}/`);
            await loadAll();
            setMessage('Syllabus deleted successfully.');
        } catch (e) {
            setError(e?.response?.data?.error || 'Delete failed.');
        }
    };

    return (
        <div style={{ padding: 20, background: colors.bg, minHeight: 'calc(100vh - 60px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <div>
                    <h1 style={{ margin: 0, fontWeight: 1000, color: colors.text }}>Teacher Syllabus Management</h1>
                    <div style={{ marginTop: 4, color: colors.muted, fontWeight: 900, fontSize: 13 }}>Upload and manage syllabus for your assigned class/subject.</div>
                </div>
            </div>

            {error ? <div style={{ border: `1px solid #fecaca`, background: '#fff7ed', color: '#b91c1c', padding: '10px 12px', borderRadius: 12, fontWeight: 900, marginBottom: 12 }}>{error}</div> : null}
            {message ? <div style={{ border: `1px solid #bbf7d0`, background: '#ecfdf5', color: colors.success, padding: '10px 12px', borderRadius: 12, fontWeight: 900, marginBottom: 12 }}>{message}</div> : null}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
                <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, boxShadow: colors.shadow, padding: 16 }}>
                    <div style={{ fontWeight: 1000, marginBottom: 8 }}>Upload Syllabus</div>
                    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                            <div>
                                <div style={labelStyle}>Class *</div>
                                <select
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                    style={inputStyle}
                                >
                                    {classes.length ? null : <option value="">No classes assigned</option>}
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div style={labelStyle}>Subject *</div>
                                <select
                                    value={form.subject_id}
                                    onChange={(e) => setForm((p) => ({ ...p, subject_id: e.target.value }))}
                                    style={inputStyle}
                                >
                                    <option value="">-- Select Subject --</option>
                                    {subjectList.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <div style={labelStyle}>Title *</div>
                            <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Algebra Chapters" style={inputStyle} />
                        </div>

                        <div>
                            <div style={labelStyle}>Description (Topics / Chapters)</div>
                            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="List chapters/topics..." style={{ ...inputStyle, minHeight: 92, resize: 'vertical' }} />
                        </div>

                        <div>
                            <div style={labelStyle}>PDF File *</div>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setForm((p) => ({ ...p, pdf: e.target.files?.[0] || null }))}
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => setForm({ class_id: selectedClassId, subject_id: '', title: '', description: '', pdf: null })}
                                style={{ padding: '10px 14px', borderRadius: 12, border: `1px solid ${colors.border}`, background: '#fff', cursor: 'pointer', fontWeight: 1000, opacity: saving ? 0.6 : 1 }}
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !form.subject_id || !form.title.trim() || !form.pdf}
                                style={{ padding: '10px 16px', borderRadius: 12, border: 'none', background: colors.primary, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 1000, opacity: saving ? 0.7 : 1 }}
                            >
                                {saving ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </form>
                </div>

                <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, boxShadow: colors.shadow, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 1000 }}>My Syllabus</div>
                        <div style={{ color: colors.muted, fontWeight: 900, fontSize: 13 }}>Total: {syllabi.length}</div>
                        <div style={{ minWidth: 260 }}>
                            <div style={labelStyle}>Search (Subject / Title)</div>
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. Science" style={{ ...inputStyle, padding: '10px 12px' }} />
                        </div>
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
                                    <button type="button" onClick={() => onDelete(s.id)} style={{ padding: '7px 10px', borderRadius: 10, border: 'none', background: colors.danger, color: '#fff', fontWeight: 1000, cursor: 'pointer' }}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!syllabi.length && !loading ? <div style={{ gridColumn: '1/-1', color: colors.muted, fontWeight: 900 }}>No syllabus uploaded yet.</div> : null}
                    </div>
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
                        <div style={{ marginTop: 6, color: colors.muted, fontWeight: 900, fontSize: 12 }}>If not selected, existing PDF will be kept.</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <button type="button" onClick={() => setEditOpen(false)} style={{ padding: '10px 14px', borderRadius: 12, border: `1px solid ${colors.border}`, background: '#fff', cursor: 'pointer', fontWeight: 1000 }}>
                            Cancel
                        </button>
                        <button type="button" disabled={saving || !editTitle.trim()} onClick={onEditSave} style={{ padding: '10px 16px', borderRadius: 12, border: 'none', background: colors.primary, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 1000, opacity: saving ? 0.7 : 1 }}>
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

