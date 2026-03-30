import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
};

const labelStyle = {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 700,
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
};

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [hierarchy, setHierarchy] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState('');
<<<<<<< HEAD
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        refreshSections();
    }, []);

    const refreshSections = async () => {
        setLoading(true);
        try {
            const res = await api.get('classes/sections/');
            setSections(res.data);
        } finally {
            setLoading(false);
        }
=======
    const [error, setError] = useState('');

    const [sectionSearch, setSectionSearch] = useState('');
    const [sectionClassFilter, setSectionClassFilter] = useState('');

    const [classModalOpen, setClassModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [classForm, setClassForm] = useState({
        name: '',
        code: '',
        description: '',
    });

    const [sectionModalOpen, setSectionModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [sectionForm, setSectionForm] = useState({
        class_id: '',
        section_name: '',
        class_teacher: '',
        room_number: '',
    });

    const [assignForm, setAssignForm] = useState({
        student_id: '',
        class_section_id: '',
    });

    const clearMessage = () => {
        window.setTimeout(() => {
            setMessage('');
            setError('');
        }, 4000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const sectionParams = {};
            if (sectionClassFilter) sectionParams.class_id = sectionClassFilter;
            if (sectionSearch.trim()) sectionParams.search = sectionSearch.trim();

            const [cRes, sRes, hRes, tRes, stRes] = await Promise.all([
                api.get('classes/main-classes/'),
                api.get('classes/admin-sections/', { params: sectionParams }),
                api.get('classes/admin-structure/'),
                api.get('teachers/'),
                api.get('students/'),
            ]);
            setClasses(cRes.data || []);
            setSections(sRes.data || []);
            setHierarchy(hRes.data || []);
            setTeachers(tRes.data || []);
            setStudents(stRes.data || []);
        } catch (e) {
            setError('Error loading classes & sections');
            clearMessage();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sectionClassFilter, sectionSearch]);

    const openAddClass = () => {
        setEditingClass(null);
        setClassForm({ name: '', code: '', description: '' });
        setClassModalOpen(true);
>>>>>>> shalini-rajput1
    };

    const openEditClass = (c) => {
        setEditingClass(c);
        setClassForm({
            name: c.name || '',
            code: c.code || '',
            description: c.description || '',
        });
        setClassModalOpen(true);
    };

    const saveClass = async (e) => {
        e.preventDefault();
        try {
<<<<<<< HEAD
            await api.post('classes/admin-create-class/', { name: className });
            setMessage({ type: 'success', text: 'Class created successfully!' });
            setClassName('');
            await refreshSections();
        } catch (err) {
            setMessage({ type: 'error', text: 'Error creating class.' });
=======
            if (editingClass) {
                await api.patch(`classes/admin-class/${editingClass.id}/`, classForm);
                setMessage('Class updated');
            } else {
                await api.post('classes/admin-create-class/', classForm);
                setMessage('Class created');
            }
            setClassModalOpen(false);
            await fetchData();
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to save class');
        } finally {
            clearMessage();
>>>>>>> shalini-rajput1
        }
    };

    const deleteClass = async (id) => {
        const ok = window.confirm('Delete this class?');
        if (!ok) return;
        try {
<<<<<<< HEAD
            await api.post('classes/admin-create-section/', { name: sectionName });
            setMessage({ type: 'success', text: 'Section created successfully!' });
            setSectionName('');
            await refreshSections();
        } catch (err) {
            setMessage({ type: 'error', text: 'Error creating section.' });
        }
    };

    const inputClasses = "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium";
    const labelClasses = "text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-school-text">Classes & Sections</h1>
                    <p className="text-sm text-school-body">Manage school academic structure and groupings.</p>
                </div>
                {message && (
                    <div className={`px-4 py-2 rounded-xl text-xs font-bold animate-pulse shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {message.text}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create Class */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <h3 className="text-lg font-bold text-school-text mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 text-sm">🏫</span>
                        New Class
                    </h3>
                    <form onSubmit={handleCreateClass} className="space-y-4">
                        <div className="space-y-1">
                            <label className={labelClasses}>Class Name</label>
                            <input
                                type="text"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                placeholder="e.g., Grade 10"
                                required
                                className={inputClasses}
                            />
                        </div>
                        <button type="submit" className="w-full py-3.5 bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 transition-all">
                            Initialize Class
                        </button>
                    </form>
                </div>

                {/* Create Section */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <h3 className="text-lg font-bold text-school-text mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-school-blue/5 flex items-center justify-center text-school-blue text-sm">🏷️</span>
                        New Section
                    </h3>
                    <form onSubmit={handleCreateSection} className="space-y-4">
                        <div className="space-y-1">
                            <label className={labelClasses}>Section Name</label>
                            <input
                                type="text"
                                value={sectionName}
                                onChange={(e) => setSectionName(e.target.value)}
                                placeholder="e.g., Section A"
                                required
                                className={inputClasses}
                            />
                        </div>
                        <button type="submit" className="w-full py-3.5 bg-school-navy text-white text-xs font-bold rounded-xl shadow-lg shadow-school-navy/10 hover:bg-school-blue transition-all">
                            Initialize Section
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-school-text">Active Classes & Sections</h3>
                    <button onClick={refreshSections} className="p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-400 group">
                        <span className="group-hover:rotate-180 transition-transform inline-block">🔄</span>
                    </button>
                </div>
                
                <div className="p-8">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-school-navy rounded-full"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {sections.map(s => (
                                <div key={s.id} className="bg-slate-50/50 border border-slate-100 p-6 rounded-2xl text-center group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                    <h2 className="text-2xl font-black text-school-navy group-hover:scale-110 transition-transform">{s.class_name}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Section {s.section_name}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
=======
            await api.delete(`classes/admin-class/${id}/`);
            setMessage('Class deleted');
            await fetchData();
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to delete class');
        } finally {
            clearMessage();
        }
    };

    const openAddSection = () => {
        setEditingSection(null);
        setSectionForm({
            class_id: classes[0]?.id || '',
            section_name: '',
            class_teacher: '',
            room_number: '',
        });
        setSectionModalOpen(true);
    };

    const openEditSection = (s) => {
        setEditingSection(s);
        setSectionForm({
            class_id: s.class_id || '',
            section_name: s.section_name || '',
            class_teacher: s.class_teacher || '',
            room_number: s.room_number || '',
        });
        setSectionModalOpen(true);
    };

    const saveSection = async (e) => {
        e.preventDefault();
        const payload = {
            class_id: sectionForm.class_id,
            section_name: sectionForm.section_name,
            class_teacher: sectionForm.class_teacher || null,
            room_number: sectionForm.room_number || null,
        };
        try {
            if (editingSection) {
                await api.patch(`classes/admin-sections/${editingSection.id}/`, payload);
                setMessage('Section updated');
            } else {
                await api.post('classes/admin-sections/create/', payload);
                setMessage('Section created');
            }
            setSectionModalOpen(false);
            await fetchData();
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to save section');
        } finally {
            clearMessage();
        }
    };

    const deleteSection = async (id) => {
        const ok = window.confirm('Delete this section?');
        if (!ok) return;
        try {
            await api.delete(`classes/admin-sections/${id}/`);
            setMessage('Section deleted');
            await fetchData();
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to delete section');
        } finally {
            clearMessage();
        }
    };

    const assignStudent = async (e) => {
        e.preventDefault();
        if (!assignForm.student_id || !assignForm.class_section_id) return;
        try {
            await api.post('classes/admin-assign-student/', assignForm);
            setMessage('Student assigned successfully');
            await fetchData();
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to assign student');
        } finally {
            clearMessage();
        }
    };

    const sectionOptions = useMemo(() => sections, [sections]);

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Class & Section Management</h1>
                    <div style={{ marginTop: '6px', color: '#6b7280', fontSize: '13px', fontWeight: 700 }}>
                        Organize classes, sections, teachers, and student placement.
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="button"
                        onClick={openAddClass}
                        style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontWeight: 900, cursor: 'pointer' }}
                    >
                        + Add Class
                    </button>
                    <button
                        type="button"
                        onClick={openAddSection}
                        style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 900, cursor: 'pointer' }}
                    >
                        + Add Section
                    </button>
                </div>
>>>>>>> shalini-rajput1
            </div>

            {(message || error) && (
                <p style={{ marginTop: '12px', color: error ? '#b91c1c' : '#166534', fontWeight: 800 }}>
                    {error || message}
                </p>
            )}

            <div style={{ marginTop: '18px', border: '1px solid #e5e7eb', borderRadius: '14px', backgroundColor: '#fff', padding: '14px' }}>
                <h2 style={{ margin: '0 0 10px', fontSize: '17px' }}>Class Hierarchy</h2>
                {loading ? (
                    <p style={{ color: '#6b7280' }}>Loading...</p>
                ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {hierarchy.map((c) => (
                            <div key={c.id} style={{ border: '1px solid #eef2f7', borderRadius: '12px', padding: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ fontWeight: 900 }}>{c.name}</div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                            Code: {c.code || 'N/A'} {c.description ? `• ${c.description}` : ''}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            type="button"
                                            onClick={() => openEditClass(c)}
                                            style={{ padding: '6px 10px', borderRadius: '999px', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => deleteClass(c.id)}
                                            style={{ padding: '6px 10px', borderRadius: '999px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                                    {(c.sections || []).length === 0 ? (
                                        <li style={{ color: '#6b7280' }}>No sections</li>
                                    ) : (
                                        c.sections.map((s) => (
                                            <li key={s.id} style={{ color: '#374151', fontWeight: 700, marginBottom: '4px' }}>
                                                Section {s.section_name}
                                                {s.room_number ? ` • Room ${s.room_number}` : ''}
                                                {s.class_teacher_name ? ` • Teacher: ${s.class_teacher_name}` : ''}
                                                {typeof s.student_count === 'number' ? ` • Students: ${s.student_count}` : ''}
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        ))}
                        {!hierarchy.length && <p style={{ color: '#6b7280' }}>No classes yet.</p>}
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '14px', backgroundColor: '#fff', padding: '14px' }}>
                    <h2 style={{ margin: '0 0 10px', fontSize: '17px' }}>Section List</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '10px', marginBottom: '12px' }}>
                        <input
                            value={sectionSearch}
                            onChange={(e) => setSectionSearch(e.target.value)}
                            placeholder="Search class/section..."
                            style={inputStyle}
                        />
                        <select value={sectionClassFilter} onChange={(e) => setSectionClassFilter(e.target.value)} style={inputStyle}>
                            <option value="">All Classes</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f2f4f7' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Class</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Section</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Teacher</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Room</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sections.map((s) => (
                                    <tr key={s.id} style={{ borderTop: '1px solid #eef2f7' }}>
                                        <td style={{ padding: '10px', fontWeight: 800 }}>{s.class_name}</td>
                                        <td style={{ padding: '10px' }}>{s.section_name}</td>
                                        <td style={{ padding: '10px' }}>{s.class_teacher_name || 'N/A'}</td>
                                        <td style={{ padding: '10px' }}>{s.room_number || 'N/A'}</td>
                                        <td style={{ padding: '10px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditSection(s)}
                                                    style={{ padding: '6px 10px', borderRadius: '999px', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteSection(s.id)}
                                                    style={{ padding: '6px 10px', borderRadius: '999px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!sections.length && (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '12px', color: '#6b7280' }}>
                                            No sections found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ border: '1px solid #e5e7eb', borderRadius: '14px', backgroundColor: '#fff', padding: '14px' }}>
                    <h2 style={{ margin: '0 0 10px', fontSize: '17px' }}>Assign Student to Class & Section</h2>
                    <form onSubmit={assignStudent} style={{ display: 'grid', gap: '12px' }}>
                        <div>
                            <div style={labelStyle}>Student</div>
                            <select value={assignForm.student_id} onChange={(e) => setAssignForm({ ...assignForm, student_id: e.target.value })} style={inputStyle} required>
                                <option value="">-- Select Student --</option>
                                {students.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.admission_number})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div style={labelStyle}>Class - Section</div>
                            <select value={assignForm.class_section_id} onChange={(e) => setAssignForm({ ...assignForm, class_section_id: e.target.value })} style={inputStyle} required>
                                <option value="">-- Select Section --</option>
                                {sectionOptions.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.class_name} - {s.section_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            style={{ padding: '12px 14px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 900, cursor: 'pointer' }}
                        >
                            Assign Student
                        </button>
                    </form>
                </div>
            </div>

            {classModalOpen && (
                <div
                    onClick={() => setClassModalOpen(false)}
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
                            width: 'min(640px, 100%)',
                            backgroundColor: '#fff',
                            borderRadius: '16px',
                            padding: '18px',
                            border: '1px solid #e5e7eb',
                        }}
                    >
                        <h3 style={{ marginTop: 0 }}>{editingClass ? 'Edit Class' : 'Add Class'}</h3>
                        <form onSubmit={saveClass} style={{ display: 'grid', gap: '12px' }}>
                            <div>
                                <div style={labelStyle}>Class Name</div>
                                <input value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} style={inputStyle} required />
                            </div>
                            <div>
                                <div style={labelStyle}>Class Code (optional)</div>
                                <input value={classForm.code} onChange={(e) => setClassForm({ ...classForm, code: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <div style={labelStyle}>Description (optional)</div>
                                <textarea value={classForm.description} onChange={(e) => setClassForm({ ...classForm, description: e.target.value })} style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setClassModalOpen(false)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb', backgroundColor: '#fff', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 12px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 900, cursor: 'pointer' }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {sectionModalOpen && (
                <div
                    onClick={() => setSectionModalOpen(false)}
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
                            width: 'min(720px, 100%)',
                            backgroundColor: '#fff',
                            borderRadius: '16px',
                            padding: '18px',
                            border: '1px solid #e5e7eb',
                        }}
                    >
                        <h3 style={{ marginTop: 0 }}>{editingSection ? 'Edit Section' : 'Add Section'}</h3>
                        <form onSubmit={saveSection} style={{ display: 'grid', gap: '12px' }}>
                            <div>
                                <div style={labelStyle}>Class</div>
                                <select value={sectionForm.class_id} onChange={(e) => setSectionForm({ ...sectionForm, class_id: e.target.value })} style={inputStyle} required>
                                    <option value="">-- Select Class --</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div style={labelStyle}>Section Name</div>
                                <input value={sectionForm.section_name} onChange={(e) => setSectionForm({ ...sectionForm, section_name: e.target.value })} style={inputStyle} required />
                            </div>
                            <div>
                                <div style={labelStyle}>Class Teacher</div>
                                <select value={sectionForm.class_teacher} onChange={(e) => setSectionForm({ ...sectionForm, class_teacher: e.target.value })} style={inputStyle}>
                                    <option value="">-- Unassigned --</option>
                                    {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div style={labelStyle}>Room Number (optional)</div>
                                <input value={sectionForm.room_number} onChange={(e) => setSectionForm({ ...sectionForm, room_number: e.target.value })} style={inputStyle} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setSectionModalOpen(false)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb', backgroundColor: '#fff', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 12px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 900, cursor: 'pointer' }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Classes;
