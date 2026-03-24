import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const UploadResult = () => {
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({ exam: '', student: '', subject: '', marks: '', max_marks: '' });

    useEffect(() => {
        api.get('academics/exams/').then(res => setExams(res.data));
    }, []);

    const fetchStudents = (examId) => {
        const exam = exams.find(e => e.id === parseInt(examId));
        if (exam) {
            api.get(`students/by-class/${exam.class_section}/`).then(res => setStudents(res.data));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('academics/results/upload/', formData);
            alert('Result uploaded!');
        } catch (err) {
            alert('Error uploading result.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Upload Student Results</h1>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', maxWidth: '400px' }}>
                <select onChange={e => { setFormData({...formData, exam: e.target.value}); fetchStudents(e.target.value); }} required style={{ padding: '10px' }}>
                    <option value="">-- Select Exam --</option>
                    {exams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.class_name})</option>)}
                </select>
                <select onChange={e => setFormData({...formData, student: e.target.value})} required style={{ padding: '10px' }}>
                    <option value="">-- Select Student --</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.user.name}</option>)}
                </select>
                <input type="text" placeholder="Subject" onChange={e => setFormData({...formData, subject: e.target.value})} required style={{ padding: '10px' }} />
                <input type="number" placeholder="Marks" onChange={e => setFormData({...formData, marks: e.target.value})} required style={{ padding: '10px' }} />
                <input type="number" placeholder="Max Marks" onChange={e => setFormData({...formData, max_marks: e.target.value})} required style={{ padding: '10px' }} />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none' }}>Upload</button>
            </form>
        </div>
    );
};

export default UploadResult;
