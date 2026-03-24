import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const StudentAttendance = () => {
    const [attendance, setAttendance] = useState([]);

    useEffect(() => {
        api.get('attendance/my-attendance/').then(res => setAttendance(res.data));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>My Attendance History</h1>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr><th>Date</th><th>Status</th><th>Marked Via</th></tr>
                </thead>
                <tbody>
                    {attendance.map(record => (
                        <tr key={record.id}>
                            <td>{record.date}</td>
                            <td style={{ color: record.status === 'present' ? 'green' : 'red', fontWeight: 'bold' }}>{record.status.toUpperCase()}</td>
                            <td>{record.marked_via}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {attendance.length === 0 && <p>No attendance records available.</p>}
        </div>
    );
};

export default StudentAttendance;
