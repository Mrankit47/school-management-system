import React, { useState } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', 
        name: '', admission_number: '', class_section: ''
    });
    const [teacherFormData, setTeacherFormData] = useState({
        username: '', email: '', password: '', 
        name: '', employee_id: '', subject_specialization: ''
    });
    const [message, setMessage] = useState('');
    const [teacherMessage, setTeacherMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('students/admin/create-student/', formData);
            setMessage('Student created successfully!');
            setFormData({ username: '', email: '', password: '', name: '', admission_number: '', class_section: '' });
        } catch (err) {
            setMessage('Error creating student.');
        }
    };

    const handleTeacherSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('teachers/admin/create-teacher/', teacherFormData);
            setTeacherMessage('Teacher created successfully!');
            setTeacherFormData({ username: '', email: '', password: '', name: '', employee_id: '', subject_specialization: '' });
        } catch (err) {
            setTeacherMessage('Error creating teacher.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin Dashboard</h1>
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {/* Student Form */}
                <div style={{ border: '1px solid #ddd', padding: '20px', width: '400px', backgroundColor: '#fff' }}>
                    <h3>Quick Addition: New Student</h3>
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} style={{ display: 'block', marginBottom: '10px', width: '100%' }} required />
                        <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ display: 'block', marginBottom: '10px', width: '100%' }} required />
                        <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ display: 'block', marginBottom: '10px', width: '100%' }} required />
                        <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ display: 'block', marginBottom: '10px', width: '100%' }} />
                        <input type="text" placeholder="Admission Number" value={formData.admission_number} onChange={e => setFormData({...formData, admission_number: e.target.value})} style={{ display: 'block', marginBottom: '10px', width: '100%' }} required />
                        <input type="text" placeholder="Class-Section (e.g., 10-A or 2B)" value={formData.class_section} onChange={e => setFormData({...formData, class_section: e.target.value})} style={{ display: 'block', marginBottom: '10px', width: '100%' }} required />
                        
                        <button type="submit" style={{ backgroundColor: '#28a745', color: '#fff', padding: '10px 20px', border: 'none', cursor: 'pointer' }}>Create Student</button>
                    </form>
                    {message && <p style={{ color: 'green' }}>{message}</p>}
                </div>

                {/* Teacher Form */}
                <div style={{ border: '1px solid #ddd', padding: '20px', width: '400px', backgroundColor: '#fff' }}>
                    <h3>Quick Addition: New Teacher</h3>
                    <form onSubmit={handleTeacherSubmit}>
                        <input type="text" placeholder="Username" value={teacherFormData.username} onChange={e => setTeacherFormData({...teacherFormData, username: e.target.value})} style={{ display: 'block', marginBottom: '10px', width: '100%' }} required />
                        <input type="email" placeholder="Email" value={teacherFormData.email} onChange={e => setTeacherFormData({...teacherFormData, email: e.target.value})} style={{ display: 'block', marginBottom: '10px', width: '100%' }} required />
                        <input type="password" placeholder="Password" value={teacherFormData.password} onChange={e => setTeacherFormData({...teacherFormData, password: e.target.value})} style={{ display: 'block', marginBottom: '10px', width: '100%' }} required />
                        <input type="text" placeholder="Full Name" value={teacherFormData.name} onChange={e => setTeacherFormData({...teacherFormData, name: e.target.value})} style={{ display: 'block', marginBottom: '10px', width: '100%' }} />
                        <input type="text" placeholder="Employee ID" value={teacherFormData.employee_id} onChange={e => setTeacherFormData({...teacherFormData, employee_id: e.target.value})} style={{ display: 'block', marginBottom: '10px', width: '100%' }} required />
                        <input type="text" placeholder="Subject Specialization" value={teacherFormData.subject_specialization} onChange={e => setTeacherFormData({...teacherFormData, subject_specialization: e.target.value})} style={{ display: 'block', marginBottom: '10px', width: '100%' }} />
                        
                        <button type="submit" style={{ backgroundColor: '#007bff', color: '#fff', padding: '10px 20px', border: 'none', cursor: 'pointer' }}>Create Teacher</button>
                    </form>
                    {teacherMessage && <p style={{ color: 'blue' }}>{teacherMessage}</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
