import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const colors = {
    bg: '#f9fafb',
    card: '#ffffff',
    border: '#e5e7eb',
    text: '#0f172a',
    muted: '#6b7280',
    primary: '#2563eb',
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
            <div style={{ width: 'min(920px, 100%)', background: '#fff', borderRadius: 16, border: `1px solid ${colors.border}`, boxShadow: colors.shadow, overflow: 'hidden' }}>
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

export default function StudentSyllabus() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({ class_id: '', class_name: '', subjects: [] });
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [search, setSearch] = useState('');

    const [syllabi, setSyllabi] = useState([]);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detail, setDetail] = useState(null);

    const loadMetaAndList = async (opts = {}) => {
        setLoading(true);
        setError('');
        try {
            const metaRes = await api.get('syllabus/student/filters/');
            const f = metaRes.data || { class_id: '', class_name: '', subjects: [] };
            setFilters(f);

            const initialSubject = opts.subject_id ?? selectedSubjectId ?? (f.subjects?.[0]?.id ? String(f.subjects[0].id) : '');
            setSelectedSubjectId(initialSubject);

            const params = {};
            if (initialSubject) params.subject_id = initialSubject;
            if (opts.search !== undefined) params.search = opts.search;
            else if (search.trim()) params.search = search.trim();

            const listRes = await api.get('syllabus/student/', { params });
            setSyllabi(listRes.data || []);
        } catch (e) {
            setError(e?.response?.data?.error || 'Could not load syllabus.');
            setSyllabi([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMetaAndList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // When subject changes, refetch list only.
        const run = async () => {
            if (!filters.class_id && !filters.subjects?.length) return;
            setLoading(true);
            try {
                const params = {};
                if (selectedSubjectId) params.subject_id = selectedSubjectId;
                if (search.trim()) params.search = search.trim();
                const listRes = await api.get('syllabus/student/', { params });
                setSyllabi(listRes.data || []);
            } catch (e) {
                setError(e?.response?.data?.error || 'Could not load syllabus.');
            } finally {
                setLoading(false);
            }
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSubjectId]);

    const openDetails = (row) => {
        setDetail(row);
        setDetailOpen(true);
    };

    const subtitle = useMemo(() => {
        const subject = filters.subjects.find((s) => String(s.id) === String(selectedSubjectId));
        return subject ? subject.name : '';
    }, [filters.subjects, selectedSubjectId]);

    const closeDetail = () => {
        setDetailOpen(false);
        setDetail(null);
    };

    const searchHint = 'Search by subject/title';

    const applySearch = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (selectedSubjectId) params.subject_id = selectedSubjectId;
            if (search.trim()) params.search = search.trim();
            const listRes = await api.get('syllabus/student/', { params });
            setSyllabi(listRes.data || []);
        } catch (e) {
            setError(e?.response?.data?.error || 'Search failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 20, background: colors.bg, minHeight: 'calc(100vh - 60px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <div>
                    <h1 style={{ margin: 0, fontWeight: 1000, color: colors.text }}>Student Syllabus</h1>
                    <div style={{ marginTop: 4, color: colors.muted, fontWeight: 900, fontSize: 13 }}>
                        Automatically filtered by your class. Download and view PDF.
                    </div>
                </div>
                <div style={{ color: colors.muted, fontWeight: 900, fontSize: 13 }}>
                    Total: {syllabi.length}
                </div>
            </div>

            {error ? <div style={{ border: '1px solid #fecaca', background: '#fff7ed', color: '#b91c1c', padding: '10px 12px', borderRadius: 12, fontWeight: 900, marginBottom: 12 }}>{error}</div> : null}

            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 16, boxShadow: colors.shadow }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                    <div>
                        <div style={labelStyle}>Class</div>
                        <select value={filters.class_id} disabled style={{ ...inputStyle, opacity: 0.7 }}>
                            <option value={filters.class_id}>{filters.class_name || '—'}</option>
                        </select>
                    </div>
                    <div>
                        <div style={labelStyle}>Subject</div>
                        <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} style={inputStyle}>
                            {filters.subjects?.length ? null : <option value="">No subjects</option>}
                            {filters.subjects.map((s) => (
                                <option key={s.id} value={String(s.id)}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <div style={labelStyle}>Search</div>
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={searchHint} style={inputStyle} />
                    </div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={applySearch} style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: colors.primary, color: '#fff', fontWeight: 1000, cursor: 'pointer' }}>
                        Search
                    </button>
                </div>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', color: colors.muted, fontWeight: 900 }}>Loading...</div>
                ) : syllabi.length ? (
                    syllabi.map((s) => (
                        <div key={s.id} style={{ border: `1px solid ${colors.border}`, borderRadius: 16, background: colors.card, boxShadow: colors.shadow, padding: 14 }}>
                            <div style={{ fontWeight: 1000, color: colors.text }}>{s.title}</div>
                            <div style={{ marginTop: 4, color: colors.muted, fontWeight: 900, fontSize: 12 }}>
                                {s.class_name} • {s.subject_name}
                            </div>
                            <div style={{ marginTop: 6, color: colors.muted, fontWeight: 900, fontSize: 12 }}>
                                Uploaded: {s.uploaded_at ? new Date(s.uploaded_at).toLocaleDateString() : '—'}
                            </div>
                            <div style={{ marginTop: 8, color: colors.muted, fontWeight: 900, fontSize: 13, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                                {(s.description || '').slice(0, 160)}
                                {(s.description || '').length > 160 ? '...' : ''}
                            </div>
                            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <button type="button" onClick={() => openDetails(s)} style={{ padding: '7px 10px', borderRadius: 10, border: `1px solid ${colors.border}`, background: '#fff', cursor: 'pointer', fontWeight: 1000 }}>
                                    View Details
                                </button>
                                {s.pdf_url ? (
                                    <a href={s.pdf_url} target="_blank" rel="noreferrer" download style={{ padding: '7px 10px', borderRadius: 10, border: 'none', background: colors.primary, color: '#fff', fontWeight: 1000, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
                                        Download PDF
                                    </a>
                                ) : null}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', color: colors.muted, fontWeight: 900 }}>No syllabus found for selected filter.</div>
                )}
            </div>

            <Modal open={detailOpen} title={detail ? detail.title : 'Syllabus Details'} onClose={closeDetail}>
                {detail ? (
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ color: colors.muted, fontWeight: 900 }}>
                            {detail.class_name} • {detail.subject_name} • Uploaded {detail.uploaded_at ? new Date(detail.uploaded_at).toLocaleString() : '—'}
                        </div>
                        <div style={{ color: colors.muted, fontWeight: 900, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                            {detail.description || '—'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                            {detail.pdf_url ? (
                                <a href={detail.pdf_url} target="_blank" rel="noreferrer" download style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: colors.primary, color: '#fff', fontWeight: 1000, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
                                    Download PDF
                                </a>
                            ) : null}
                            <button type="button" onClick={closeDetail} style={{ padding: '10px 14px', borderRadius: 12, border: `1px solid ${colors.border}`, background: '#fff', cursor: 'pointer', fontWeight: 1000 }}>
                                Close
                            </button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}

