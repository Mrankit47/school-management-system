import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Results = () => {
    const [results, setResults] = useState([]);

    useEffect(() => {
        api.get('academics/results/my/').then(res => {
            if (res.data && res.data.data) {
                setResults(res.data.data);
            }
        }).catch(err => console.error(err));
    }, []);

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-black text-slate-800 mb-6">My Exam Results</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-widest text-slate-400 font-bold">
                        <tr>
                            <th className="p-4">Exam</th>
                            <th className="p-4">Subject</th>
                            <th className="p-4 bg-indigo-50/50">Marks Obtained</th>
                            <th className="p-4">Max Marks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {results.map(r => (
                            <tr key={r.id} className="hover:bg-slate-50 transition">
                                <td className="p-4 font-bold text-slate-700">{r.exam_name}</td>
                                <td className="p-4 font-semibold text-slate-600">{r.subject}</td>
                                <td className="p-4 font-black text-indigo-600 bg-indigo-50/30">{r.marks}</td>
                                <td className="p-4 font-bold text-slate-400">{r.max_marks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {results.length === 0 && <div className="p-8 text-center text-slate-400 italic font-semibold border-t border-slate-50">No results posted yet.</div>}
            </div>
        </div>
    );
};

export default Results;
