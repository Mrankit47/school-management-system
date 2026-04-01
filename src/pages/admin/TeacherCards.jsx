import React, { useMemo, useState } from 'react';
import api from '../../services/api';

const TeacherCards = ({ teachers, refreshTeachers }) => {
    const [viewTeacher, setViewTeacher] = useState(null);
    const [editTeacher, setEditTeacher] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [busy, setBusy] = useState(false);

    const labelStyle = useMemo(
        () => ({
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: 700,
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
        }),
        []
    );

    const inputStyle = useMemo(
        () => ({
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '13px',
            outline: 'none',
            boxSizing: 'border-box',
            backgroundColor: '#fff',
        }),
        []
    );

    const closeModal = () => {
        setViewTeacher(null);
        setEditTeacher(null);
        setEditForm(null);
    };

    const openEdit = (t) => {
        setEditTeacher(t);
        setEditForm({
            name: t.name || '',
            email: t.email || '',
            employee_id: t.employee_id || '',
            subject_specialization: t.subject_specialization || '',

            phone_number: t.phone_number || '',
            gender: t.gender || '',
            dob: t.dob || '',

            qualification: t.qualification || '',
            experience_years: t.experience_years ?? '',
            joining_date: t.joining_date || '',
            status: t.status || 'Active',
        });
    };

    const handleDelete = async (id) => {
        const ok = window.confirm('Delete this teacher?');
        if (!ok) return;
        setBusy(true);
        try {
            await api.delete(`teachers/delete/${id}/`);
            await refreshTeachers();
        } catch (e) {
            alert(e?.response?.data?.error || 'Error deleting teacher');
        } finally {
            setBusy(false);
        }
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        if (!editTeacher || !editForm) return;
        const phoneDigits = (editForm.phone_number || '').replace(/\D/g, '').slice(0, 10);
        if (phoneDigits && phoneDigits.length !== 10) {
            alert('Phone number must be exactly 10 digits');
            return;
        }
        setBusy(true);
        try {
            // Normalize values to avoid type issues (e.g., PositiveIntegerField)
            const payload = {
                ...editForm,
                experience_years:
                    editForm.experience_years === '' || editForm.experience_years === null
                        ? null
                        : editForm.experience_years,
                dob: editForm.dob === '' ? null : editForm.dob,
                joining_date: editForm.joining_date === '' ? null : editForm.joining_date,
                phone_number: phoneDigits === '' ? null : `+91${phoneDigits}`,
                qualification: editForm.qualification === '' ? null : editForm.qualification,
            };

            await api.patch(`teachers/update/${editTeacher.id}/`, payload);
            await refreshTeachers();
            closeModal();
        } catch (err) {
            alert('Error updating teacher');
        } finally {
            setBusy(false);
        }
    };

    const initialsFromName = (name) => {
        const parts = (name || '').trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return 'T';
        const first = parts[0]?.[0] || '';
        const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] || '') : '';
        return `${first}${last}`.toUpperCase();
    };

    const cardStyle = {
        backgroundColor: '#fff',
        borderRadius: '14px',
        border: '1px solid #eef2ff',
        boxShadow: '0 1px 6px rgba(16,24,40,0.06)',
        padding: '18px',
        minWidth: '250px',
        width: '270px',
    };

    return (
        <div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 270px))',
                    gap: '18px',
                    justifyContent: 'flex-start',
                    alignItems: 'start',
                }}
            >
                {teachers.map((t) => (
                    <div key={t.id} style={cardStyle}>
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                            <div
                                style={{
                                    width: '62px',
                                    height: '62px',
                                    borderRadius: '50%',
                                    backgroundColor: '#2563eb',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: '18px',
                                    flexShrink: 0,
                                }}
                            >
                                {initialsFromName(t.name)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, color: '#111827', marginBottom: '3px' }}>{t.name}</div>
                                <div style={{ color: '#6b7280', fontSize: '13px' }}>{t.subject_specialization || 'N/A'}</div>
                                <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>Employee ID: {t.employee_id}</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={() => setViewTeacher(t)}
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
                                onClick={() => openEdit(t)}
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
                                onClick={() => handleDelete(t.id)}
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
                ))}
            </div>

            {(viewTeacher || editTeacher) && (
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
                            <h3 style={{ margin: 0 }}>{viewTeacher ? 'Teacher Details' : 'Edit Teacher'}</h3>
                            <button type="button" onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                                ×
                            </button>
                        </div>

                        {viewTeacher && (
                            <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <div style={labelStyle}>Name</div>
                                    <div style={{ fontWeight: 800 }}>{viewTeacher.name}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>Employee ID</div>
                                    <div style={{ fontWeight: 800 }}>{viewTeacher.employee_id}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>Email</div>
                                    <div>{viewTeacher.email}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>Specialization</div>
                                    <div>{viewTeacher.subject_specialization}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>Phone</div>
                                    <div>{viewTeacher.phone_number || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>Gender</div>
                                    <div>{viewTeacher.gender || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>DOB</div>
                                    <div>{viewTeacher.dob || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>Qualification</div>
                                    <div>{viewTeacher.qualification || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>Experience (Years)</div>
                                    <div>{viewTeacher.experience_years ?? 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={labelStyle}>Joining Date</div>
                                    <div>{viewTeacher.joining_date || 'N/A'}</div>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={labelStyle}>Status</div>
                                    <div>{viewTeacher.status}</div>
                                </div>
                            </div>
                        )}

                        {editTeacher && editForm && (
                            <form onSubmit={saveEdit} style={{ marginTop: '14px', display: 'grid', gap: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <div style={labelStyle}>Name</div>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            style={inputStyle}
                                        />
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
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <div style={labelStyle}>Employee ID</div>
                                        <input
                                            type="text"
                                            value={editForm.employee_id}
                                            onChange={(e) => setEditForm({ ...editForm, employee_id: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <div style={labelStyle}>Specialization</div>
                                        <input
                                            type="text"
                                            value={editForm.subject_specialization}
                                            onChange={(e) => setEditForm({ ...editForm, subject_specialization: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <div style={labelStyle}>Phone</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '8px' }}>
                                            <input
                                                type="text"
                                                value="+91"
                                                disabled
                                                style={{ ...inputStyle, textAlign: 'center', backgroundColor: '#f9fafb', color: '#6b7280' }}
                                            />
                                            <input
                                                type="tel"
                                                inputMode="numeric"
                                                pattern="[0-9]{10}"
                                                value={(editForm.phone_number || '').replace(/\D/g, '').slice(0, 10)}
                                                onChange={(e) => {
                                                    const digits = (e.target.value || '').replace(/\D/g, '').slice(0, 10);
                                                    setEditForm({ ...editForm, phone_number: digits });
                                                }}
                                                style={inputStyle}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={labelStyle}>Gender</div>
                                        <select
                                            value={editForm.gender}
                                            onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                            style={inputStyle}
                                        >
                                            <option value="">-- Select Gender --</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
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
                                        <div style={labelStyle}>Qualification</div>
                                        <input
                                            type="text"
                                            value={editForm.qualification}
                                            onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <div style={labelStyle}>Experience (Years)</div>
                                        <input
                                            type="number"
                                            value={editForm.experience_years}
                                            onChange={(e) => setEditForm({ ...editForm, experience_years: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <div style={labelStyle}>Joining Date</div>
                                        <input
                                            type="date"
                                            value={editForm.joining_date}
                                            onChange={(e) => setEditForm({ ...editForm, joining_date: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div style={labelStyle}>Status</div>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                        style={inputStyle}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={busy}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        backgroundColor: '#28a745',
                                        color: '#fff',
                                        fontWeight: 900,
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

export default TeacherCards;

