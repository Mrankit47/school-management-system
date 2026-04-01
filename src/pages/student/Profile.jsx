import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const card = {
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    background: '#fff',
    padding: 16,
};

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        Promise.allSettled([api.get('students/profile/'), api.get('assignments/')])
            .then(([profileRes, assignmentRes]) => {
                if (profileRes.status === 'fulfilled') {
                    setProfile(profileRes.value?.data || null);
                } else {
                    setProfile(null);
                }

                if (assignmentRes.status === 'fulfilled') {
                    setAssignments(assignmentRes.value?.data || []);
                } else {
                    setAssignments([]);
                }

                if (profileRes.status !== 'fulfilled' && assignmentRes.status !== 'fulfilled') {
                    setError('Could not load profile and assignments.');
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const sortedAssignments = useMemo(() => {
        return (assignments || [])
            .slice()
            .sort((a, b) => String(a.due_date || '').localeCompare(String(b.due_date || '')));
    }, [assignments]);

    if (loading) return <p style={{ padding: 20 }}>Loading profile...</p>;
    if (!profile) return <p style={{ padding: 20, color: '#b91c1c', fontWeight: 900 }}>Profile not found.</p>;

    const classDisplay = profile.class_name || profile.class_ref_name || 'N/A';

    return (
        <div style={{ padding: 20, background: '#f8fafc', minHeight: 'calc(100vh - 60px)' }}>
            <h1 style={{ marginTop: 0 }}>My Profile</h1>
            {error ? <div style={{ color: '#b91c1c', fontWeight: 900, marginBottom: 12 }}>{error}</div> : null}

            <div style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <div><strong>Name:</strong> {profile.name || '—'}</div>
                <div><strong>Admission No:</strong> {profile.admission_number || '—'}</div>
                <div><strong>Email:</strong> {profile.email || '—'}</div>
                <div><strong>Class:</strong> {classDisplay}</div>
                <div><strong>Section:</strong> {profile.section_name || '—'}</div>
                <div><strong>Gender:</strong> {profile.gender || '—'}</div>
                <div><strong>Date of Admission:</strong> {profile.date_of_admission || '—'}</div>
                <div><strong>Date of Birth:</strong> {profile.dob || '—'}</div>
            </div>

            <div style={{ ...card, marginTop: 14 }}>
                <div style={{ fontWeight: 1000, fontSize: 16 }}>Assignments For Your Class ({classDisplay})</div>
                <div style={{ marginTop: 4, color: '#6b7280', fontWeight: 900, fontSize: 13 }}>
                    Total assignments: {sortedAssignments.length}
                </div>

                <div style={{ marginTop: 12, overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#64748b' }}>Title</th>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#64748b' }}>Subject</th>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#64748b' }}>Given To Class</th>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#64748b' }}>Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAssignments.length ? (
                                sortedAssignments.map((a) => (
                                    <tr key={a.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: 10, fontWeight: 900 }}>{a.title}</td>
                                        <td style={{ padding: 10 }}>{a.subject || '—'}</td>
                                        <td style={{ padding: 10 }}>{a.class_section_display || `${a.class_name || ''}${a.section_name ? ` - ${a.section_name}` : ''}` || classDisplay}</td>
                                        <td style={{ padding: 10 }}>{a.due_date || '—'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} style={{ padding: 12, color: '#6b7280', fontWeight: 900 }}>
                                        No assignments found for your class.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Profile;