import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Classes = () => {
    const [sections, setSections] = useState([]);
    const [className, setClassName] = useState('');
    const [sectionName, setSectionName] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        refreshSections();
    }, []);

    const refreshSections = async () => {
        setLoading(true);
        try {
            const res = await api.get('classes/sections/');
            setSections(res.data);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await api.post('classes/admin-create-class/', { name: className });
            setMessage({ type: 'success', text: 'Class created successfully!' });
            setClassName('');
            await refreshSections();
        } catch (err) {
            setMessage({ type: 'error', text: 'Error creating class.' });
        }
    };

    const handleCreateSection = async (e) => {
        e.preventDefault();
        try {
            await api.post('classes/admin-create-section/', { name: sectionName });
            setMessage({ type: 'success', text: 'Section created successfully!' });
            setSectionName('');
            await refreshSections();
        } catch (err) {
            setMessage({ type: 'error', text: 'Error creating section.' });
        }
    };

    const inputClasses = "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium";
    const labelClasses = "text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-school-text">Classes & Sections</h1>
                    <p className="text-sm text-school-body">Manage school academic structure and groupings.</p>
                </div>
                {message && (
                    <div className={`px-4 py-2 rounded-xl text-xs font-bold animate-pulse shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {message.text}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create Class */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <h3 className="text-lg font-bold text-school-text mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 text-sm">🏫</span>
                        New Class
                    </h3>
                    <form onSubmit={handleCreateClass} className="space-y-4">
                        <div className="space-y-1">
                            <label className={labelClasses}>Class Name</label>
                            <input
                                type="text"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                placeholder="e.g., Grade 10"
                                required
                                className={inputClasses}
                            />
                        </div>
                        <button type="submit" className="w-full py-3.5 bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 transition-all">
                            Initialize Class
                        </button>
                    </form>
                </div>

                {/* Create Section */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <h3 className="text-lg font-bold text-school-text mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-school-blue/5 flex items-center justify-center text-school-blue text-sm">🏷️</span>
                        New Section
                    </h3>
                    <form onSubmit={handleCreateSection} className="space-y-4">
                        <div className="space-y-1">
                            <label className={labelClasses}>Section Name</label>
                            <input
                                type="text"
                                value={sectionName}
                                onChange={(e) => setSectionName(e.target.value)}
                                placeholder="e.g., Section A"
                                required
                                className={inputClasses}
                            />
                        </div>
                        <button type="submit" className="w-full py-3.5 bg-school-navy text-white text-xs font-bold rounded-xl shadow-lg shadow-school-navy/10 hover:bg-school-blue transition-all">
                            Initialize Section
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-school-text">Active Classes & Sections</h3>
                    <button onClick={refreshSections} className="p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-400 group">
                        <span className="group-hover:rotate-180 transition-transform inline-block">🔄</span>
                    </button>
                </div>
                
                <div className="p-8">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-school-navy rounded-full"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {sections.map(s => (
                                <div key={s.id} className="bg-slate-50/50 border border-slate-100 p-6 rounded-2xl text-center group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                    <h2 className="text-2xl font-black text-school-navy group-hover:scale-110 transition-transform">{s.class_name}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Section {s.section_name}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Classes;
