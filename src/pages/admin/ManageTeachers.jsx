import React, { useState, useEffect } from 'react';
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
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr><th>Employee ID</th><th>Name</th><th>Specialization</th></tr>
                </thead>
                <tbody>
                    {teachers.map((t) => (
                        <tr key={t.id}>
                            <td>{t.employee_id}</td>
                            <td>{t.name}</td>
                            <td>{t.subject_specialization}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {loading && <p>Loading teachers...</p>}
        </div>
    );
};

export default ManageTeachers;
