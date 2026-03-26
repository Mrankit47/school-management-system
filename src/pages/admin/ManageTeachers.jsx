import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ManageTeachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('teachers/').then(res => {
            setTeachers(res.data); 
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const getInitials = (name) => {
        return (name || 'T').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-school-text">Faculty Management</h1>
                <p className="text-sm text-school-body">Directory of all registered teachers and academic staff.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teacher</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialization</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {teachers.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-school-blue/10 flex items-center justify-center text-school-blue font-bold text-xs uppercase tracking-tighter shadow-sm">
                                                {getInitials(t.name)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-school-text group-hover:text-school-navy transition-colors">{t.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{t.email || 'No email'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-bold text-school-body bg-slate-100 px-2 py-1 rounded-lg">
                                            {t.employee_id}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-medium text-school-text">
                                            {t.subject_specialization}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 rounded-lg text-slate-400 hover:bg-white hover:text-school-navy hover:shadow-sm transition-all">
                                            <span>⚙️</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {loading && (
                    <div className="p-12 text-center">
                        <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-school-navy rounded-full"></div>
                        <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">Loading Records...</p>
                    </div>
                )}
                
                {!loading && teachers.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-slate-400 font-medium">No faculty members found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageTeachers;
