import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Profile = () => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        api.get('students/profile/').then(res => setProfile(res.data));
    }, []);

    if (!profile) return <p>Loading profile...</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>My Profile</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', border: '1px solid #eee', padding: '20px' }}>
                <div><strong>Name:</strong> {profile.user.name}</div>
                <div><strong>Admission No:</strong> {profile.admission_number}</div>
                <div><strong>Email:</strong> {profile.user.email}</div>
                <div><strong>Class:</strong> {profile.class_name} - {profile.section_name}</div>
                <div><strong>RFID Code:</strong> {profile.rfid_code || 'N/A'}</div>
                <div><strong>Gender:</strong> {profile.gender}</div>
                <div><strong>Address:</strong> {profile.address}</div>
            </div>
        </div>
    );
};

export default Profile;
