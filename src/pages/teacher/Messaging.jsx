import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 6px rgba(16,24,40,0.06)',
};

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
};

function fmtTime(v) {
    if (!v) return '';
    return new Date(v).toLocaleString();
}

function isImageAttachment(url) {
    const lower = (url || '').toLowerCase();
    return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || lower.endsWith('.webp');
}

const Messaging = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [unreadOnly, setUnreadOnly] = useState(false);

    const [threads, setThreads] = useState([]);
    const [activeUserId, setActiveUserId] = useState(null);
    const [messages, setMessages] = useState([]);

    const [messageText, setMessageText] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [sending, setSending] = useState(false);

    const [search, setSearch] = useState('');

    const loadThreads = async (opts = {}) => {
        const params = {};
        const classId = opts.classId ?? selectedClassId;
        const onlyUnread = opts.unreadOnly ?? unreadOnly;
        if (classId) params.class_section_id = classId;
        if (onlyUnread) params.unread_only = 1;

        const res = await api.get('communication/threads/', { params });
        setThreads(res.data || []);
        if (!activeUserId && res.data?.length) {
            setActiveUserId(res.data[0].user_id);
        }
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([api.get('teachers/profile/'), api.get('classes/sections/')])
            .then(async ([profileRes, classRes]) => {
                const myTeacherId = profileRes.data?.id;
                const allSections = classRes.data || [];
                const mine = allSections.filter((c) => c.class_teacher === myTeacherId);
                setClasses(mine);
                if (mine.length) setSelectedClassId(String(mine[0].id));
                await loadThreads({ classId: mine.length ? String(mine[0].id) : '', unreadOnly: false });
            })
            .catch(() => setError('Could not load messaging data'))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!activeUserId) {
            setMessages([]);
            return;
        }
        api.get(`communication/conversation/${activeUserId}/`)
            .then((res) => setMessages(res.data || []))
            .catch(() => setError('Could not load conversation'));
    }, [activeUserId]);

    useEffect(() => {
        const timer = setInterval(() => {
            loadThreads().catch(() => {});
            if (activeUserId) {
                api.get(`communication/conversation/${activeUserId}/`)
                    .then((res) => setMessages(res.data || []))
                    .catch(() => {});
            }
        }, 15000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeUserId, selectedClassId, unreadOnly]);

    const filteredThreads = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return threads;
        return (threads || []).filter((t) => {
            const n = (t.user_name || '').toLowerCase();
            const c = (t.class_name || '').toLowerCase();
            const s = (t.section_name || '').toLowerCase();
            return n.includes(q) || c.includes(q) || s.includes(q);
        });
    }, [threads, search]);

    const activeThread = useMemo(
        () => (threads || []).find((t) => t.user_id === activeUserId) || null,
        [threads, activeUserId]
    );

    const sendMessage = async () => {
        if (!activeUserId) return;
        if (!messageText.trim() && !attachment) return;

        const form = new FormData();
        form.append('content', messageText.trim());
        if (attachment) form.append('attachment', attachment);

        setSending(true);
        try {
            await api.post(`communication/conversation/${activeUserId}/`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessageText('');
            setAttachment(null);
            const [msgRes, threadRes] = await Promise.all([
                api.get(`communication/conversation/${activeUserId}/`),
                api.get('communication/threads/', {
                    params: {
                        ...(selectedClassId ? { class_section_id: selectedClassId } : {}),
                        ...(unreadOnly ? { unread_only: 1 } : {}),
                    },
                }),
            ]);
            setMessages(msgRes.data || []);
            setThreads(threadRes.data || []);
        } catch (e) {
            setError(e?.response?.data?.error || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', color: '#6b7280', fontWeight: 900 }}>Loading messaging system...</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ ...cardStyle, padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                        <h1 style={{ margin: 0 }}>Messaging System</h1>
                        <div style={{ marginTop: 4, color: '#6b7280', fontWeight: 900, fontSize: '13px' }}>
                            Student doubts and teacher replies with attachments.
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <select
                            value={selectedClassId}
                            onChange={(e) => {
                                const v = e.target.value;
                                setSelectedClassId(v);
                                loadThreads({ classId: v }).catch(() => {});
                            }}
                            style={{ ...inputStyle, minWidth: 180 }}
                        >
                            <option value="">All Assigned Classes</option>
                            {classes.map((c) => (
                                <option key={c.id} value={String(c.id)}>
                                    {c.class_name} - {c.section_name}
                                </option>
                            ))}
                        </select>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151', fontWeight: 900, fontSize: 13 }}>
                            <input
                                type="checkbox"
                                checked={unreadOnly}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setUnreadOnly(checked);
                                    loadThreads({ unreadOnly: checked }).catch(() => {});
                                }}
                            />
                            Unread only
                        </label>
                    </div>
                </div>

                {error ? <div style={{ marginTop: 10, color: '#b91c1c', fontWeight: 900 }}>{error}</div> : null}
            </div>

            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '330px 1fr', gap: 12 }}>
                {/* Inbox list */}
                <div style={{ ...cardStyle, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '70vh' }}>
                    <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #eef2f7' }}>
                        <div style={{ fontWeight: 1000 }}>Teacher Inbox</div>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search student/class..."
                            style={{ ...inputStyle, marginTop: 10 }}
                        />
                    </div>

                    <div style={{ overflowY: 'auto', padding: 10 }}>
                        {filteredThreads.map((t) => {
                            const active = t.user_id === activeUserId;
                            return (
                                <button
                                    key={t.user_id}
                                    type="button"
                                    onClick={() => setActiveUserId(t.user_id)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        border: `1px solid ${active ? '#2563eb' : '#e5e7eb'}`,
                                        borderRadius: 12,
                                        backgroundColor: active ? '#eff6ff' : '#fff',
                                        padding: 10,
                                        marginBottom: 8,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                        <div style={{ fontWeight: 1000 }}>{t.user_name}</div>
                                        <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 900 }}>{fmtTime(t.last_message_at)}</div>
                                    </div>
                                    <div style={{ marginTop: 2, color: '#6b7280', fontSize: 12, fontWeight: 900 }}>
                                        {t.class_name || 'N/A'} - {t.section_name || 'N/A'}
                                    </div>
                                    <div style={{ marginTop: 6, color: '#374151', fontSize: 12, fontWeight: 900, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                        <span>{t.last_message_preview || '...'}</span>
                                        {t.unread_count > 0 ? (
                                            <span style={{ backgroundColor: '#dc2626', color: '#fff', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 1000 }}>
                                                {t.unread_count}
                                            </span>
                                        ) : null}
                                    </div>
                                </button>
                            );
                        })}
                        {filteredThreads.length === 0 ? <div style={{ color: '#6b7280', fontWeight: 900, padding: 8 }}>No conversations found.</div> : null}
                    </div>
                </div>

                {/* Chat view */}
                <div style={{ ...cardStyle, minHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
                    {activeThread ? (
                        <>
                            <div style={{ padding: 14, borderBottom: '1px solid #eef2f7', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 1000 }}>{activeThread.user_name}</div>
                                    <div style={{ marginTop: 2, color: '#6b7280', fontSize: 12, fontWeight: 900 }}>
                                        {activeThread.class_name || 'N/A'} - {activeThread.section_name || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: 14, backgroundColor: '#fafafa' }}>
                                {messages.map((m) => {
                                    const mine = m.sender_role === 'teacher';
                                    return (
                                        <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                                            <div
                                                style={{
                                                    maxWidth: '70%',
                                                    borderRadius: 14,
                                                    border: `1px solid ${mine ? '#93c5fd' : '#e5e7eb'}`,
                                                    backgroundColor: mine ? '#eff6ff' : '#fff',
                                                    padding: '10px 12px',
                                                }}
                                            >
                                                {m.content ? <div style={{ whiteSpace: 'pre-wrap', color: '#111827', fontSize: 13 }}>{m.content}</div> : null}
                                                {m.attachment_url ? (
                                                    <div style={{ marginTop: 8 }}>
                                                        {isImageAttachment(m.attachment_url) ? (
                                                            <a href={m.attachment_url} target="_blank" rel="noreferrer">
                                                                <img src={m.attachment_url} alt="attachment" style={{ maxWidth: '220px', borderRadius: 10, border: '1px solid #e5e7eb' }} />
                                                            </a>
                                                        ) : (
                                                            <a
                                                                href={m.attachment_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                style={{ color: '#2563eb', fontWeight: 1000, textDecoration: 'none' }}
                                                            >
                                                                Open Attachment (PDF/File)
                                                            </a>
                                                        )}
                                                    </div>
                                                ) : null}
                                                <div style={{ marginTop: 6, color: '#6b7280', fontSize: 11, fontWeight: 900 }}>
                                                    {fmtTime(m.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {messages.length === 0 ? <div style={{ color: '#6b7280', fontWeight: 900 }}>No messages yet. Start conversation.</div> : null}
                            </div>

                            <div style={{ borderTop: '1px solid #eef2f7', padding: 12, display: 'grid', gap: 10 }}>
                                <textarea
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    placeholder="Reply to student..."
                                    style={{ ...inputStyle, minHeight: 78, resize: 'vertical' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                    <div>
                                        <input
                                            type="file"
                                            accept=".png,.jpg,.jpeg,.gif,.webp,.pdf"
                                            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                        />
                                        {attachment ? <div style={{ marginTop: 4, color: '#374151', fontSize: 12, fontWeight: 900 }}>Selected: {attachment.name}</div> : null}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={sendMessage}
                                        disabled={sending || (!messageText.trim() && !attachment)}
                                        style={{
                                            border: 'none',
                                            borderRadius: 12,
                                            backgroundColor: '#2563eb',
                                            color: '#fff',
                                            fontWeight: 1000,
                                            padding: '10px 16px',
                                            cursor: sending ? 'not-allowed' : 'pointer',
                                            opacity: sending ? 0.75 : 1,
                                        }}
                                    >
                                        {sending ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontWeight: 900 }}>
                            Select a student conversation from inbox.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messaging;