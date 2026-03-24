import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Students = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        api.get('classes/sections/').then(res => setClasses(res.data));
    }, []);

    const fetchStudents = (id) => {
        if (id) {
            api.get(`students/by-class/${id}/`).then(res => setStudents(res.data));
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>My Students</h1>
            <select onChange={e => fetchStudents(e.target.value)} style={{ marginBottom: '20px', padding: '10px' }}>
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.class_name} - {c.section_name}</option>)}
            </select>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr><th>Admission No</th><th>Name</th><th>Email</th></tr>
                </thead>
                <tbody>
                    {students.map(s => (
                        <tr key={s.id}>
                            <td>{s.admission_number}</td>
                            <td>{s.user.name}</td>
                            <td>{s.user.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Students;
