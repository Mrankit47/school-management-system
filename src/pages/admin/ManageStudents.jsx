import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('students/').then((res) => {
            setStudents(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Student List</h1>
            {loading ? (
                <p>Loading students...</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            backgroundColor: '#fff',
                            minWidth: '900px',
                        }}
                    >
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Admission No</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Username</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Class - Section</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                                <tr key={s.id} style={{ borderTop: '1px solid #eef2f7' }}>
                                    <td style={{ padding: '12px 10px' }}>{s.admission_number}</td>
                                    <td style={{ padding: '12px 10px', fontWeight: 700 }}>{s.name}</td>
                                    <td style={{ padding: '12px 10px' }}>{s.username}</td>
                                    <td style={{ padding: '12px 10px' }}>{s.email}</td>
                                    <td style={{ padding: '12px 10px' }}>{s.class_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageStudents;