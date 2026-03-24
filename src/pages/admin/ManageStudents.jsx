import React, { useState, useEffect } from 'react';
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
            <h1>Manage Students</h1>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th>Admission No</th>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Class - Section</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(s => (
                        <tr key={s.id}>
                            <td>{s.admission_number}</td>
                            <td>{s.name}</td>
                            <td>{s.username}</td>
                            <td>{s.email}</td>
                            <td>{s.class_name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {loading && <p>Loading students...</p>}
        </div>
    );
};

export default ManageStudents;
