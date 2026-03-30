import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const UploadResult = () => {
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({ exam: '', student: '', subject: '', marks: '', max_marks: '' });

    useEffect(() => {
        api.get('academics/exams/').then(res => {
            if (res.data && res.data.data) setExams(res.data.data);
        });
    }, []);

    const fetchStudents = (examId) => {
        const exam = exams.find(e => e.id === parseInt(examId));
        if (exam) {
            api.get(`students/by-class/${exam.class_section}/`).then(res => setStudents(res.data));
        } else {
            setStudents([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('academics/results/upload/', formData);
            alert('Result uploaded successfully!');
            setFormData({...formData, marks: '', max_marks: ''});
        } catch (err) {
            alert(err.response?.data?.message || 'Error uploading result.');
        }
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-black text-slate-800 mb-6">Upload Student Results</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-xl space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Exam Target</label>
                    <select value={formData.exam} onChange={e => { setFormData({...formData, exam: e.target.value}); fetchStudents(e.target.value); }} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="">-- Select Exam --</option>
                        {exams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.class_name})</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Student</label>
                    <select value={formData.student} onChange={e => setFormData({...formData, student: e.target.value})} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="">-- Select Student --</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.user.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Subject</label>
                    <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Marks Obtained</label>
                        <input type="number" step="0.01" value={formData.marks} onChange={e => setFormData({...formData, marks: e.target.value})} required className="w-full p-3 bg-indigo-50 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-indigo-800 font-bold" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Max Marks</label>
                        <input type="number" step="0.01" value={formData.max_marks} onChange={e => setFormData({...formData, max_marks: e.target.value})} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                </div>
                <button type="submit" className="w-full py-4 mt-4 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 transition">Upload Result</button>
            </form>
        </div>
    );
};

export default UploadResult;
