import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const [attendance, setAttendance] = useState([]);

    useEffect(() => {
        // Fetch student profile and attendance
        api.get('students/profile/').then(res => setProfile(res.data));
        api.get('attendance/my-attendance/').then(res => setAttendance(res.data));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Student Dashboard</h1>
            {profile && <p>Welcome, {profile.user.name} | Class: {profile.class_name}</p>}
            
            <h3>My Attendance</h3>
            <ul>
                {attendance.map(record => (
                    <li key={record.id}>{record.date}: {record.status}</li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
