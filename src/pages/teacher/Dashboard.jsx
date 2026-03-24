import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const TeacherDashboard = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [students, setStudents] = useState([]);

    useEffect(() => {
        // Fetch list of all classes/sections
        api.get('classes/sections/').then(res => setClasses(res.data));
    }, []);

    const fetchStudents = (id) => {
        setSelectedClassId(id);
        if (id) {
            api.get(`students/by-class/${id}/`).then(res => setStudents(res.data));
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Teacher Dashboard</h1>
            
            <div style={{ marginBottom: '20px' }}>
                <label>Select Class: </label>
                <select onChange={(e) => fetchStudents(e.target.value)} value={selectedClassId}>
                    <option value="">-- Choose --</option>
                    {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.class_name} - {c.section_name}</option>
                    ))}
                </select>
            </div>

            <h3>Student List</h3>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Admission No</th>
                        <th>Name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(s => (
                        <tr key={s.id}>
                            <td>{s.admission_number}</td>
                            <td>{s.user.username}</td>
                            <td><button>Mark Attendance</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TeacherDashboard;
