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
            alert('Assignment created successfully!');
            setFormData({ title: '', description: '', class_section: '', due_date: '', file_url: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating assignment.');
        }
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-black text-slate-800 mb-6">Create Assignment</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-xl space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Title</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24"></textarea>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Target Class</label>
                    <select value={formData.class_section} onChange={e => setFormData({...formData, class_section: e.target.value})} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="">-- Select Class --</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.class_name} - {c.section_name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Due Date</label>
                    <input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Resource URL (Optional)</label>
                    <input type="url" value={formData.file_url} onChange={e => setFormData({...formData, file_url: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <button type="submit" className="w-full py-4 mt-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition">Create Assignment</button>
            </form>
        </div>
    );
};

export default Assignment;
