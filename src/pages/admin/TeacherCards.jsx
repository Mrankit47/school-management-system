<<<<<<< HEAD
import React, { useState } from 'react';
import api from '../../services/api';

const getInitials = (name) => {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'TC';
    return parts.length > 1 
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() 
        : parts[0][0].toUpperCase();
};

=======
import React, { useMemo, useState } from 'react';
import api from '../../services/api';

>>>>>>> shalini-rajput1
const TeacherCards = ({ teachers, refreshTeachers }) => {
    const [viewTeacher, setViewTeacher] = useState(null);
    const [editTeacher, setEditTeacher] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [busy, setBusy] = useState(false);

<<<<<<< HEAD
=======
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

>>>>>>> shalini-rajput1
    const closeModal = () => {
        setViewTeacher(null);
        setEditTeacher(null);
        setEditForm(null);
    };

<<<<<<< HEAD
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this teacher record?')) return;
        setBusy(true);
        try {
            await api.delete(`teachers/admin/delete-teacher/${id}/`);
=======
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
>>>>>>> shalini-rajput1
            await refreshTeachers();
        } catch (e) {
            alert('Error deleting teacher');
        } finally {
            setBusy(false);
        }
    };

<<<<<<< HEAD
    const openEdit = (t) => {
        setEditTeacher(t);
        setEditForm({ ...t });
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            await api.patch(`teachers/admin/update-teacher/${editTeacher.id}/`, editForm);
=======
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
>>>>>>> shalini-rajput1
            await refreshTeachers();
            closeModal();
        } catch (err) {
            alert('Error updating teacher');
        } finally {
            setBusy(false);
        }
    };

<<<<<<< HEAD
    const inputClasses = "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium";
    const labelClasses = "text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block";

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teachers.map((t) => {
                    const initials = getInitials(t.name);
                    return (
                        <div 
                            key={t.id} 
                            className="group relative bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-school-blue/10 transition-all duration-500 overflow-hidden hover:-translate-y-1"
                        >
                            {/* Decorative Background Gradient */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-school-sky/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                            
                            <div className="p-7 relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-school-blue via-school-sky to-cyan-400 flex items-center justify-center text-white font-poppins font-bold text-xl shadow-xl shadow-school-sky/20 group-hover:-rotate-3 transition-transform duration-500">
                                        {initials}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="px-3 py-1 bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400 rounded-lg uppercase tracking-widest shadow-sm">
                                            {t.employee_id}
                                        </span>
                                        {t.status && (
                                            <span className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-tighter border border-opacity-50 ${t.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                                {t.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <h3 className="font-poppins font-bold text-school-text text-lg group-hover:text-school-blue transition-colors truncate">
                                        {t.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 rounded-full border border-indigo-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                                                {t.subject_specialization || 'General Faculty'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Bar */}
                            <div className="px-7 py-5 bg-slate-50/50 backdrop-blur-md border-t border-slate-100/50 flex items-center justify-between gap-3">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setViewTeacher(t)}
                                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-school-navy hover:border-school-navy/30 hover:shadow-lg hover:shadow-school-navy/10 transition-all flex items-center justify-center group/btn"
                                        title="View Profile"
                                    >
                                        <span className="group-hover/btn:scale-125 transition-transform">👤</span>
                                    </button>
                                    <button
                                        onClick={() => openEdit(t)}
                                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all flex items-center justify-center group/btn"
                                        title="Edit Faculty"
                                    >
                                        <span className="group-hover/btn:scale-125 transition-transform">✏️</span>
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleDelete(t.id)}
                                    disabled={busy}
                                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/10 transition-all flex items-center justify-center group/btn disabled:opacity-50"
                                    title="Remove Faculty"
                                >
                                    <span className="group-hover/btn:scale-125 transition-transform">🗑️</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {(viewTeacher || editTeacher) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold">{viewTeacher ? 'Teacher Profile' : 'Edit Information'}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">{viewTeacher ? 'Comprehensive overview of faculty records' : 'Update the faculty profile details below'}</p>
                            </div>
                            <button onClick={closeModal} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">✕</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {viewTeacher ? (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                                        <div className="w-20 h-20 rounded-3xl bg-school-blue flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-school-blue/20">
                                            {getInitials(viewTeacher.name)}
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-bold text-school-text">{viewTeacher.name}</h4>
                                            <p className="text-school-navy font-bold uppercase tracking-widest text-xs mt-1">{viewTeacher.employee_id}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        {[
                                            { label: 'Email Address', val: viewTeacher.email },
                                            { label: 'Specialization', val: viewTeacher.subject_specialization },
                                            { label: 'Qualification', val: viewTeacher.qualification },
                                            { label: 'Experience', val: `${viewTeacher.experience_years} Years` },
                                            { label: 'Joining Date', val: viewTeacher.joining_date },
                                            { label: 'Phone Number', val: viewTeacher.phone_number },
                                            { label: 'Date of Birth', val: viewTeacher.dob },
                                            { label: 'Gender', val: viewTeacher.gender },
                                            { label: 'Status', val: viewTeacher.status },
                                        ].map((item, i) => (
                                            <div key={i} className="space-y-1">
                                                <p className={labelClasses}>{item.label}</p>
                                                <p className="font-bold text-school-text">{item.val || '—'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={saveEdit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label className={labelClasses}>First Name</label><input type="text" value={editForm.first_name} onChange={e => setEditForm({...editForm, first_name: e.target.value})} className={inputClasses} /></div>
                                        <div><label className={labelClasses}>Last Name</label><input type="text" value={editForm.last_name} onChange={e => setEditForm({...editForm, last_name: e.target.value})} className={inputClasses} /></div>
                                        <div><label className={labelClasses}>Employee ID</label><input type="text" value={editForm.employee_id} onChange={e => setEditForm({...editForm, employee_id: e.target.value})} className={inputClasses} /></div>
                                        <div><label className={labelClasses}>Email</label><input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className={inputClasses} /></div>
                                        <div><label className={labelClasses}>Specialization</label><input type="text" value={editForm.subject_specialization} onChange={e => setEditForm({...editForm, subject_specialization: e.target.value})} className={inputClasses} /></div>
                                        <div><label className={labelClasses}>Status</label><select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className={inputClasses}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
                                    </div>
                                    <div className="pt-6 border-t border-slate-50 flex justify-end gap-3">
                                        <button type="button" onClick={closeModal} className="px-6 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                                        <button type="submit" disabled={busy} className="px-8 py-2.5 bg-school-navy text-white text-xs font-bold rounded-xl shadow-lg shadow-school-navy/10 hover:bg-school-blue transition-all disabled:opacity-50">Save Changes</button>
                                    </div>
                                </form>
                            )}
                        </div>
=======
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
>>>>>>> shalini-rajput1
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherCards;
<<<<<<< HEAD
=======

>>>>>>> shalini-rajput1
