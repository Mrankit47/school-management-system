import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const AssignTeacher = () => {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [sections, setSections] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [classFilter, setClassFilter] = useState('all');
    const [teacherSearch, setTeacherSearch] = useState('');

    const [formData, setFormData] = useState({
        class_id: '',
        section_id: '',
        subject_id: '',
        teacher_id: '',
        role: 'Subject Teacher',
    });
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        fontSize: '14px',
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

    const fetchMeta = async () => {
        const [classRes, teacherRes] = await Promise.all([
            api.get('classes/main-classes/'),
            api.get('teachers/'),
        ]);
        setClasses(classRes.data || []);
        setTeachers(teacherRes.data || []);
    };

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const params = {};
            if (classFilter !== 'all') params.class_id = classFilter;
            const res = await api.get('subjects/teacher-assignments/', { params });
            setAssignments(res.data || []);
        } catch (err) {
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSectionsForClass = async (classId) => {
        if (!classId) {
            setSections([]);
            return;
        }
        try {
            const res = await api.get('classes/admin-sections/', { params: { class_id: classId } });
            setSections(res.data || []);
        } catch (err) {
            setSections([]);
        }
    };

    const fetchSubjectsForClass = async (classId) => {
        if (!classId) {
            setSubjects([]);
            return;
        }
        try {
            const res = await api.get('subjects/', { params: { class_id: classId, status: 'Active' } });
            setSubjects(res.data || []);
        } catch (err) {
            setSubjects([]);
        }
    };

    useEffect(() => {
        fetchMeta();
    }, []);

    useEffect(() => {
        fetchAssignments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classFilter]);

    useEffect(() => {
        fetchSubjectsForClass(formData.class_id);
        fetchSectionsForClass(formData.class_id);
        setFormData((prev) => ({ ...prev, subject_id: '', section_id: '' }));
    }, [formData.class_id]);

    const filteredTeachers = useMemo(() => {
        const q = teacherSearch.trim().toLowerCase();
        if (!q) return teachers;
        return teachers.filter((t) => {
            const name = (t.name || '').toLowerCase();
            const emp = (t.employee_id || '').toLowerCase();
            return name.includes(q) || emp.includes(q);
        });
    }, [teachers, teacherSearch]);

    const resetForm = () => {
        setFormData({ class_id: '', section_id: '', subject_id: '', teacher_id: '', role: 'Subject Teacher' });
        setEditingId(null);
        setTeacherSearch('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!formData.class_id || !formData.subject_id || !formData.teacher_id) {
            setMessage('Error: Class, Subject and Teacher are required.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                class_id: Number(formData.class_id),
                section: formData.section_id ? Number(formData.section_id) : null,
                subject_id: Number(formData.subject_id),
                teacher_id: Number(formData.teacher_id),
                role: formData.role,
            };

            if (editingId) {
                await api.patch(`subjects/teacher-assignments/${editingId}/`, payload);
                setMessage('Assignment updated successfully.');
            } else {
                await api.post('subjects/teacher-assignments/', payload);
                setMessage('Teacher assigned successfully.');
            }
            await fetchAssignments();
            resetForm();
        } catch (err) {
            setMessage(`Error: ${err?.response?.data?.error || 'Unable to save assignment.'}`);
        } finally {
            setSaving(false);
        }
    };

    const startEdit = async (row) => {
        setEditingId(row.id);
        setFormData({
            class_id: String(row.class_ref),
            section_id: row.section ? String(row.section) : '',
            subject_id: String(row.subject),
            teacher_id: String(row.teacher),
            role: row.role || 'Subject Teacher',
        });
        setTeacherSearch(`${row.teacher_name || ''} ${row.employee_id || ''}`.trim());
        await Promise.all([
            fetchSubjectsForClass(row.class_ref),
            fetchSectionsForClass(row.class_ref)
        ]);
    };

    const deleteAssignment = async (id) => {
        const ok = window.confirm('Delete this assignment?');
        if (!ok) return;
        try {
            await api.delete(`subjects/teacher-assignments/${id}/`);
            setMessage('Assignment deleted successfully.');
            await fetchAssignments();
        } catch (err) {
            setMessage(`Error: ${err?.response?.data?.error || 'Unable to delete assignment.'}`);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 1000, color: '#0f172a' }}>Assign Teacher to Class</h1>
                    <div style={{ color: '#6b7280', marginTop: '6px', fontSize: '13px' }}>
                        Link teacher with class and subject in one place.
                    </div>
                </div>
            </div>

            <div
                style={{
                    marginTop: '18px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '14px',
                    backgroundColor: '#fff',
                    padding: '16px',
                    maxWidth: '760px',
                }}
            >
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
                    <div>
                        <div style={labelStyle}>Class</div>
                        <select
                            value={formData.class_id}
                            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                            style={inputStyle}
                            required
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div style={labelStyle}>Section</div>
                        <select
                            value={formData.section_id}
                            onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                            style={inputStyle}
                            disabled={!formData.class_id}
                        >
                            <option value="">-- All Sections --</option>
                            {sections.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.section_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div style={labelStyle}>Subject</div>
                        <select
                            value={formData.subject_id}
                            onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                            style={inputStyle}
                            required
                            disabled={!formData.class_id}
                        >
                            <option value="">{formData.class_id ? '-- Select Subject --' : 'Select class first'}</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} {s.code ? `(${s.code})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div style={labelStyle}>Teacher (search by name or employee ID)</div>
                        <input
                            type="text"
                            placeholder="Search teacher..."
                            value={teacherSearch}
                            onChange={(e) => setTeacherSearch(e.target.value)}
                            style={{ ...inputStyle, marginBottom: '8px' }}
                        />
                        <select
                            value={formData.teacher_id}
                            onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                            style={inputStyle}
                            required
                        >
                            <option value="">-- Select Teacher --</option>
                            {filteredTeachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {(t.name || 'Teacher')} ({t.employee_id})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div style={labelStyle}>Assign Role</div>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            style={inputStyle}
                            required
                        >
                            <option value="Subject Teacher">Subject Teacher</option>
                            <option value="Class Teacher">Class Teacher</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: '#1677e6',
                                color: '#fff',
                                fontWeight: 800,
                                cursor: 'pointer',
                                opacity: saving ? 0.7 : 1,
                            }}
                        >
                            {saving ? 'Saving...' : editingId ? 'Update Assignment' : 'Assign'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '10px',
                                    border: '1px solid #d1d5db',
                                    backgroundColor: '#fff',
                                    color: '#111827',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
                {message && (
                    <p style={{ marginTop: '10px', color: message.startsWith('Error:') ? '#dc2626' : '#15803d', fontWeight: 600 }}>
                        {message}
                    </p>
                )}
            </div>

            <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '10px', marginBottom: '10px', maxWidth: '620px' }}>
                    <div>
                        <div style={labelStyle}>Filter by Class</div>
                        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={inputStyle}>
                            <option value="all">All Classes</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc' }}>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Class</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Section</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Subject</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Teacher</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Role</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Employee ID</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '14px 10px', color: '#6b7280' }}>
                                        Loading assignments...
                                    </td>
                                </tr>
                            ) : assignments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '14px 10px', color: '#6b7280' }}>
                                        No assignments found.
                                    </td>
                                </tr>
                            ) : (
                                assignments.map((row) => (
                                    <tr key={row.id} style={{ borderTop: '1px solid #eef2f7' }}>
                                        <td style={{ padding: '12px 10px' }}>{row.class_name}</td>
                                        <td style={{ padding: '12px 10px' }}>{row.section_name || 'All Sections'}</td>
                                        <td style={{ padding: '12px 10px' }}>{row.subject_name}</td>
                                        <td style={{ padding: '12px 10px' }}>{row.teacher_name}</td>
                                        <td style={{ padding: '12px 10px' }}>
                                            <span style={{ 
                                                padding: '4px 8px', 
                                                borderRadius: '6px', 
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                backgroundColor: row.role === 'Class Teacher' ? '#ecfdf5' : '#f3f4f6',
                                                color: row.role === 'Class Teacher' ? '#065f46' : '#374151'
                                            }}>
                                                {row.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 10px' }}>{row.employee_id}</td>
                                        <td style={{ padding: '12px 10px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(row)}
                                                    style={{
                                                        border: 'none',
                                                        borderRadius: '999px',
                                                        padding: '7px 12px',
                                                        backgroundColor: '#16a34a',
                                                        color: '#fff',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteAssignment(row.id)}
                                                    style={{
                                                        border: 'none',
                                                        borderRadius: '999px',
                                                        padding: '7px 12px',
                                                        backgroundColor: '#ef4444',
                                                        color: '#fff',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AssignTeacher;