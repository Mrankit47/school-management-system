import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    padding: '16px',
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

const Students = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [teacherProfile, setTeacherProfile] = useState(null);
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');

    const [students, setStudents] = useState([]);
    const [studentCounts, setStudentCounts] = useState({});

    const [search, setSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([api.get('teachers/profile/'), api.get('classes/teaching-sections/')])
            .then(async ([teacherRes, sectionRes]) => {
                const profile = teacherRes.data || null;
                const mine = sectionRes.data || [];
                setTeacherProfile(profile);
                setAssignedClasses(mine);
                if (mine.length) setSelectedClassId(String(mine[0].id));

                const counts = {};
                await Promise.all(
                    mine.map(async (c) => {
                        try {
                            const res = await api.get(`students/by-class/${c.id}/`);
                            counts[c.id] = (res.data || []).length;
                        } catch (_) {
                            counts[c.id] = 0;
                        }
                    })
                );
                setStudentCounts(counts);
            })
            .catch(() => setError('Could not load your classes'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedClassId) {
            setStudents([]);
            return;
        }
        api.get(`students/by-class/${selectedClassId}/`)
            .then((res) => setStudents(res.data || []))
            .catch(() => setError('Could not load students for this class'));
    }, [selectedClassId]);

    const selectedClass = useMemo(
        () => assignedClasses.find((c) => String(c.id) === String(selectedClassId)),
        [assignedClasses, selectedClassId]
    );

    const filteredStudents = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return students;
        return (students || []).filter(
            (s) =>
                (s.admission_number || '').toLowerCase().includes(q) ||
                (s.name || '').toLowerCase().includes(q) ||
                (s.email || '').toLowerCase().includes(q)
        );
    }, [students, search]);

    if (loading) {
        return <div style={{ padding: '20px', color: '#6b7280', fontWeight: 900 }}>Loading my students...</div>;
    }

    return (
        <div style={{ padding: '20px', display: 'grid', gap: '12px' }}>
            <div style={cardStyle}>
                <h1 style={{ margin: 0 }}>My Students</h1>
                <div style={{ marginTop: '8px', color: '#6b7280', fontWeight: 900, fontSize: '13px' }}>
                    View only your assigned classes and students.
                </div>
                {teacherProfile ? (
                    <div style={{ marginTop: '8px', color: '#374151', fontSize: '13px', fontWeight: 900 }}>
                        Teacher: {teacherProfile.user?.name || teacherProfile.employee_id}
                    </div>
                ) : null}
                {error ? <div style={{ marginTop: '8px', color: '#b91c1c', fontWeight: 900 }}>{error}</div> : null}
            </div>

            <div style={cardStyle}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 900, textTransform: 'uppercase', marginBottom: '10px' }}>Assigned Classes</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {assignedClasses.map((c) => {
                        const active = String(c.id) === String(selectedClassId);
                        return (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setSelectedClassId(String(c.id))}
                                style={{
                                    borderRadius: '999px',
                                    border: `1px solid ${active ? '#2563eb' : '#e5e7eb'}`,
                                    backgroundColor: active ? '#eff6ff' : '#fff',
                                    color: active ? '#1d4ed8' : '#111827',
                                    cursor: 'pointer',
                                    fontWeight: 1000,
                                    padding: '8px 12px',
                                }}
                            >
                                {c.class_name} {c.section_name} ({studentCounts[c.id] || 0})
                            </button>
                        );
                    })}
                    {assignedClasses.length === 0 ? <div style={{ color: '#6b7280', fontWeight: 900 }}>No classes assigned to you.</div> : null}
                </div>
            </div>

            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 1000, color: '#111827' }}>
                            {selectedClass ? `${selectedClass.class_name} - ${selectedClass.section_name}` : 'Select Class'}
                        </div>
                        <div style={{ marginTop: '4px', color: '#6b7280', fontWeight: 900, fontSize: '12px' }}>
                            Student Count: {filteredStudents.length}
                        </div>
                    </div>
                    <div style={{ minWidth: '260px' }}>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by admission no, name, email..."
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '12px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f2f4f7' }}>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Admission Number</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Student Name</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Class</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Section</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((s) => (
                                <tr key={s.id} style={{ borderTop: '1px solid #eef2f7' }}>
                                    <td style={{ padding: '12px 10px', fontWeight: 900 }}>{s.admission_number || 'N/A'}</td>
                                    <td style={{ padding: '12px 10px' }}>{s.name}</td>
                                    <td style={{ padding: '12px 10px' }}>{s.email || 'N/A'}</td>
                                    <td style={{ padding: '12px 10px' }}>{s.class_name || selectedClass?.class_name || 'N/A'}</td>
                                    <td style={{ padding: '12px 10px' }}>{s.section_name || selectedClass?.section_name || 'N/A'}</td>
                                    <td style={{ padding: '12px 10px' }}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedStudent(s)}
                                            style={{
                                                border: 'none',
                                                borderRadius: '999px',
                                                padding: '8px 12px',
                                                backgroundColor: '#2563eb',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                fontWeight: 900,
                                            }}
                                        >
                                            View Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '14px', color: '#6b7280', fontWeight: 900 }}>
                                        No students found.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedStudent ? (
                <div
                    onClick={() => setSelectedStudent(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                        padding: '18px',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: 'min(520px, 100%)',
                            backgroundColor: '#fff',
                            borderRadius: '16px',
                            border: '1px solid #e5e7eb',
                            padding: '18px',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                            <h3 style={{ margin: 0 }}>Student Profile</h3>
                            <button type="button" onClick={() => setSelectedStudent(null)} style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer' }}>
                                ×
                            </button>
                        </div>
                        <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
                            <div><strong>Name:</strong> {selectedStudent.name || 'N/A'}</div>
                            <div><strong>Admission Number:</strong> {selectedStudent.admission_number || 'N/A'}</div>
                            <div><strong>Email:</strong> {selectedStudent.email || 'N/A'}</div>
                            <div><strong>Class:</strong> {selectedStudent.class_name || selectedClass?.class_name || 'N/A'}</div>
                            <div><strong>Section:</strong> {selectedStudent.section_name || selectedClass?.section_name || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Students;