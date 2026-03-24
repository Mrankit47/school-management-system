import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const TeacherProfile = () => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        api.get('teachers/profile/').then(res => setProfile(res.data));
    }, []);

    if (!profile) return <p>Loading profile...</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Teacher Profile</h1>
            <div style={{ border: '1px solid #ddd', padding: '20px', backgroundColor: '#f9f9f9' }}>
                <p><strong>Name:</strong> {profile.user.name}</p>
                <p><strong>Employee ID:</strong> {profile.employee_id}</p>
                <p><strong>Specialization:</strong> {profile.subject_specialization}</p>
                <p><strong>Email:</strong> {profile.user.email}</p>
            </div>
        </div>
    );
};

export default TeacherProfile;
