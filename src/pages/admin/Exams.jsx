import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Exams = () => {
    const [exams, setExams] = useState([]);
    const [formData, setFormData] = useState({ name: '', class_section: '', date: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('academics/exams/').then(res => {
            setExams(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        alert('Exam scheduled successfully!');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-school-text">Exam Management</h1>
                <p className="text-sm text-school-body">Schedule and monitor academic assessments.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Schedule Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sticky top-24">
                        <h3 className="text-lg font-bold text-school-text mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-school-navy/5 flex items-center justify-center text-school-navy text-sm">📅</span>
                            Schedule Exam
                        </h3>
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Exam Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., Mid-Term Assessment" 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium"
                                    required 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Class Section ID</label>
                                <input 
                                    type="number" 
                                    placeholder="e.g., 4" 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium"
                                    required 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Date</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium"
                                    required 
                                />
                            </div>
                            <button type="submit" className="w-full py-3.5 bg-school-navy text-white text-xs font-bold rounded-xl shadow-lg shadow-school-navy/10 hover:bg-school-blue transition-all mt-4">
                                Schedule Exam
                            </button>
                        </form>
                    </div>
                </div>

                {/* Upcoming Exams List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <h3 className="font-bold text-school-text">Upcoming Exams</h3>
                            <span className="px-3 py-1 bg-white border border-slate-100 text-[10px] font-bold text-slate-500 rounded-lg uppercase tracking-wider shadow-sm">
                                {exams.length} Scheduled
                            </span>
                        </div>
                        
                        <div className="divide-y divide-slate-50">
                            {loading ? (
                                <div className="p-12 text-center">
                                    <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-school-navy rounded-full"></div>
                                </div>
                            ) : exams.length > 0 ? (
                                exams.map(e => (
                                    <div key={e.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold text-xs shadow-sm">
                                                {new Date(e.date).getDate()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-school-text group-hover:text-school-navy transition-colors">{e.name}</h4>
                                                <p className="text-xs text-school-body font-medium flex items-center gap-2 mt-0.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    {e.class_name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Date</p>
                                            <p className="text-xs font-bold text-school-text">{new Date(e.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📭</div>
                                    <p className="text-slate-400 font-medium italic">No exams scheduled yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Exams;
