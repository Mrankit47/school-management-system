import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Exams = () => {
    const [exams, setExams] = useState([]);
    const [formData, setFormData] = useState({ name: '', class_section: '', date: '' });

    useEffect(() => {
        api.get('academics/exams/').then(res => setExams(res.data));
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        alert('Exam created successfully! (Mock)');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Exam Management</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div>
                    <h3>Schedule New Exam</h3>
                    <form onSubmit={handleCreate} style={{ display: 'grid', gap: '10px' }}>
                        <input type="text" placeholder="Exam Name" style={{ padding: '10px' }} required />
                        <input type="number" placeholder="Class Section ID" style={{ padding: '10px' }} required />
                        <input type="date" style={{ padding: '10px' }} required />
                        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none' }}>Schedule</button>
                    </form>
                </div>
                <div>
                    <h3>Upcoming Exams</h3>
                    <ul>
                        {exams.map(e => <li key={e.id}>{e.name} - {e.class_name} ({e.date})</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Exams;
