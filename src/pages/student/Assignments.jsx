import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        api.get('assignments/').then(res => {
            if (res.data && res.data.data) {
                setAssignments(res.data.data);
            }
        }).catch(err => console.error(err));
    }, []);

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-black text-slate-800 mb-6">My Assignments</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map(a => (
                    <div key={a.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{a.title}</h3>
                        <p className="text-sm text-slate-500 mb-4">{a.description}</p>
                        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wide">
                            <span>Due: {a.due_date}</span>
                            <span>By: {a.teacher_name}</span>
                        </div>
                        {a.file_url && <a href={a.file_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-bold text-sm">Download Attachment &rarr;</a>}
                    </div>
                ))}
            </div>
            {assignments.length === 0 && <p className="text-slate-500 italic mt-4 font-semibold">No assignments currently.</p>}
        </div>
    );
};

export default Assignments;
