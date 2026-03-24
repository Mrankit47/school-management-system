import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Assignment = () => {
    const [classes, setClasses] = useState([]);
    const [formData, setFormData] = useState({ title: '', description: '', class_section: '', due_date: '', file_url: '' });

    useEffect(() => {
        api.get('classes/sections/').then(res => setClasses(res.data));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('assignments/create/', formData);
            alert('Assignment created!');
        } catch (err) {
            alert('Error creating assignment.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Create Assignment</h1>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', maxWidth: '400px' }}>
                <input type="text" placeholder="Title" onChange={e => setFormData({...formData, title: e.target.value})} required style={{ padding: '10px' }} />
                <textarea placeholder="Description" onChange={e => setFormData({...formData, description: e.target.value})} style={{ padding: '10px' }}></textarea>
                <select onChange={e => setFormData({...formData, class_section: e.target.value})} required style={{ padding: '10px' }}>
                    <option value="">-- Target Class --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.class_name} - {c.section_name}</option>)}
                </select>
                <input type="date" onChange={e => setFormData({...formData, due_date: e.target.value})} required style={{ padding: '10px' }} />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none' }}>Create</button>
            </form>
        </div>
    );
};

export default Assignment;
