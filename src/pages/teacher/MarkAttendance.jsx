import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const MarkAttendance = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [students, setStudents] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        api.get('classes/sections/').then(res => setClasses(res.data));
    }, []);

    const fetchStudents = (classId) => {
        setSelectedClass(classId);
        if (classId) {
            api.get(`students/by-class/${classId}/`).then(res => setStudents(res.data));
        }
    };

    const markAttendance = async (studentId, status) => {
        try {
            await api.post('attendance/mark/', {
                student: studentId,
                date: date,
                status: status
            });
            alert('Attendance marked!');
        } catch (err) {
            alert('Error marking attendance.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Mark Student Attendance</h1>
            <div style={{ marginBottom: '20px' }}>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '10px', marginRight: '10px' }} />
                <select onChange={e => fetchStudents(e.target.value)} value={selectedClass} style={{ padding: '10px' }}>
                    <option value="">-- Select Class --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.class_name} - {c.section_name}</option>)}
                </select>
            </div>

            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr><th>Name</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {students.map(s => (
                        <tr key={s.id}>
                            <td>{s.user.name}</td>
                            <td>
                                <button onClick={() => markAttendance(s.id, 'present')} style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '5px 10px', marginRight: '5px' }}>Present</button>
                                <button onClick={() => markAttendance(s.id, 'absent')} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px' }}>Absent</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MarkAttendance;
