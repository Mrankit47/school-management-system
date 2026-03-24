import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AssignTeacher = () => {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]); // This would need a list-all-teachers API
    const [formData, setFormData] = useState({ class_section: '', teacher: '' });

    useEffect(() => {
        api.get('classes/sections/').then(res => setClasses(res.data));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Teacher assignment updated! (Backend logic integration pending)');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Assign Teacher to Class</h1>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', maxWidth: '400px' }}>
                <select onChange={e => setFormData({...formData, class_section: e.target.value})} required style={{ padding: '10px' }}>
                    <option value="">-- Choose Class --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.class_name} - {c.section_name}</option>)}
                </select>
                <input type="text" placeholder="Teacher Employee ID" onChange={e => setFormData({...formData, teacher: e.target.value})} style={{ padding: '10px' }} />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none' }}>Assign</button>
            </form>
        </div>
    );
};

export default AssignTeacher;
