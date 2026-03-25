import React, { useMemo, useState } from 'react';
import api from '../../services/api';

const getInitials = (name) => {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'ST';
    const a = parts[0]?.[0] || '';
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    const initials = `${a}${b}`.toUpperCase();
    return initials || 'ST';
};

const StudentCards = ({ students, refreshStudents }) => {
    const [viewStudent, setViewStudent] = useState(null);
    const [editStudent, setEditStudent] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [busy, setBusy] = useState(false);

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        fontSize: '13px',
        outline: 'none',
        boxSizing: 'border-box',
    };

    const labelStyle = {
        fontSize: '12px',
        color: '#6b7280',
        fontWeight: 600,
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
    };

    const cardStyle = useMemo(
        () => ({
            backgroundColor: '#fff',
            borderRadius: '14px',
            border: '1px solid #eef2ff',
            boxShadow: '0 1px 6px rgba(16,24,40,0.06)',
            padding: '18px',
            minWidth: '250px',
        }),
        []
    );

    const closeModal = () => {
        setViewStudent(null);
        setEditStudent(null);
        setEditForm(null);
    };

    const handleDelete = async (id) => {
        const ok = window.confirm('Delete this student?');
        if (!ok) return;
        setBusy(true);
        try {
            await api.delete(`students/delete/${id}/`);
            await refreshStudents();
        } catch (e) {
            // Keep message minimal; UI already shows reload
            alert('Error deleting student');
        } finally {
            setBusy(false);
        }
    };

    const openEdit = (s) => {
        setEditStudent(s);
        setEditForm({
            first_name: s.first_name || '',
            last_name: s.last_name || '',
            email: s.email || '',
            admission_number: s.admission_number || '',
            dob: s.dob || '',
            gender: s.gender || '',
            blood_group: s.blood_group || '',
            parent_guardian_name: s.parent_guardian_name || '',
            parent_contact_number: s.parent_contact_number || '',
            address: s.address || '',
            date_of_admission: s.date_of_admission || '',
            category: s.category || '',
        });
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        if (!editStudent || !editForm) return;
        setBusy(true);
        try {
            await api.patch(`students/update/${editStudent.id}/`, editForm);
            await refreshStudents();
            closeModal();
        } catch (err) {
            alert('Error updating student');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '18px' }}>
                {students.map((s) => {
                    const initials = getInitials(s.name);
                    return (
                        <div key={s.id} style={cardStyle}>
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                <div
                                    style={{
                                        width: '62px',
                                        height: '62px',
                                        borderRadius: '50%',
                                        backgroundColor: '#6366f1',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 800,
                                        fontSize: '18px',
                                        flexShrink: 0,
                                    }}
                                >
                                    {initials}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, color: '#111827', marginBottom: '3px' }}>{s.name}</div>
                                    <div style={{ color: '#6b7280', fontSize: '13px' }}>{s.class_name || 'N/A'}</div>
                                </div>
                            </div>

                            <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setViewStudent(s)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '999px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        backgroundColor: '#6d28d9',
                                        color: '#fff',
                                        fontWeight: 700,
                                    }}
                                >
                                    View
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openEdit(s)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '999px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        backgroundColor: '#16a34a',
                                        color: '#fff',
                                        fontWeight: 700,
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(s.id)}
                                    disabled={busy}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '999px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        backgroundColor: '#ef4444',
                                        color: '#fff',
                                        fontWeight: 700,
                                        opacity: busy ? 0.7 : 1,
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {(viewStudent || editStudent) && (
                <div
                    onClick={closeModal}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '18px',
                        zIndex: 9999,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: 'min(760px, 100%)',
                            backgroundColor: '#fff',
                            borderRadius: '16px',
                            padding: '18px',
                            border: '1px solid #e5e7eb',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                            <h3 style={{ margin: 0 }}>{viewStudent ? 'Student Details' : 'Edit Student'}</h3>
                            <button type="button" onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                                ×
                            </button>
                        </div>

                        {viewStudent && (
                            <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <div style={labelStyle}>Name</div>
                                    <div style={{ fontWeight: 700 }}>{viewStudent.name}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>Admission No</div>
                                    <div style={{ fontWeight: 700 }}>{viewStudent.admission_number}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>Email</div>
                                    <div>{viewStudent.email}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>Username</div>
                                    <div>{viewStudent.username}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>DOB</div>
                                    <div>{viewStudent.dob || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>Gender</div>
                                    <div>{viewStudent.gender || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>Blood Group</div>
                                    <div>{viewStudent.blood_group || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>Category</div>
                                    <div>{viewStudent.category || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>Guardian Name</div>
                                    <div>{viewStudent.parent_guardian_name || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>Guardian Contact</div>
                                    <div>{viewStudent.parent_contact_number || 'N/A'}</div>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={labelStyle}>Residential Address</div>
                                    <div>{viewStudent.address || 'N/A'}</div>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={labelStyle}>Class - Section</div>
                                    <div>{viewStudent.class_name || 'N/A'}</div>
                                </div>
                            </div>
                        )}

                        {editStudent && editForm && (
                            <form onSubmit={saveEdit} style={{ marginTop: '14px', display: 'grid', gap: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <div style={labelStyle}>First Name</div>
                                        <input
                                            type="text"
                                            value={editForm.first_name}
                                            onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <div style={labelStyle}>Last Name</div>
                                        <input
                                            type="text"
                                            value={editForm.last_name}
                                            onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div style={labelStyle}>Email</div>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <div style={labelStyle}>Admission Number</div>
                                    <input
                                        type="text"
                                        value={editForm.admission_number}
                                        onChange={(e) => setEditForm({ ...editForm, admission_number: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <div style={labelStyle}>DOB</div>
                                        <input
                                            type="date"
                                            value={editForm.dob}
                                            onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <div style={labelStyle}>Gender</div>
                                        <input
                                            type="text"
                                            value={editForm.gender}
                                            onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <div style={labelStyle}>Blood Group</div>
                                        <input
                                            type="text"
                                            value={editForm.blood_group}
                                            onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <div style={labelStyle}>Category</div>
                                        <input
                                            type="text"
                                            value={editForm.category}
                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div style={labelStyle}>Parent/Guardian Name</div>
                                    <input
                                        type="text"
                                        value={editForm.parent_guardian_name}
                                        onChange={(e) => setEditForm({ ...editForm, parent_guardian_name: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <div style={labelStyle}>Parent Contact Number</div>
                                    <input
                                        type="text"
                                        value={editForm.parent_contact_number}
                                        onChange={(e) => setEditForm({ ...editForm, parent_contact_number: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <div style={labelStyle}>Residential Address</div>
                                    <textarea
                                        value={editForm.address}
                                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                        style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={busy}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        backgroundColor: '#28a745',
                                        color: '#fff',
                                        fontWeight: 800,
                                        opacity: busy ? 0.7 : 1,
                                    }}
                                >
                                    Save
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCards;

