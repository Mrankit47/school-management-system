import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const ManageTeachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('teachers/').then(res => {
            setTeachers(res.data); 
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Teacher List</h1>
            {loading ? (
                <p>Loading teachers...</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            backgroundColor: '#fff',
                            minWidth: '1200px',
                        }}
                    >
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Employee ID</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Specialization</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Phone</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Gender</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>DOB</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Qualification</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Experience (Years)</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Joining Date</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map((t) => (
                                <tr key={t.id} style={{ borderTop: '1px solid #eef2f7' }}>
                                    <td style={{ padding: '12px 10px' }}>{t.employee_id}</td>
                                    <td style={{ padding: '12px 10px', fontWeight: 700 }}>{t.name}</td>
                                    <td style={{ padding: '12px 10px' }}>{t.subject_specialization}</td>
                                    <td style={{ padding: '12px 10px' }}>{t.email}</td>
                                    <td style={{ padding: '12px 10px' }}>{t.phone_number ?? 'N/A'}</td>
                                    <td style={{ padding: '12px 10px' }}>{t.gender ?? 'N/A'}</td>
                                    <td style={{ padding: '12px 10px' }}>{t.dob ?? 'N/A'}</td>
                                    <td style={{ padding: '12px 10px' }}>{t.qualification ?? 'N/A'}</td>
                                    <td style={{ padding: '12px 10px' }}>{t.experience_years ?? 'N/A'}</td>
                                    <td style={{ padding: '12px 10px' }}>{t.joining_date ?? 'N/A'}</td>
                                    <td style={{ padding: '12px 10px' }}>{t.status ?? 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageTeachers;