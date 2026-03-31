import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Subjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [search, setSearch] = useState('');
    const [filterClass, setFilterClass] = useState('All Classes');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subjRes, classRes] = await Promise.all([
                api.get('admin/subjects'),
                api.get('admin/classes-hierarchy')
            ]);
            setSubjects(subjRes.data.data);
            setClasses(classRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = async () => {
        const name = prompt("Enter Subject Name (e.g., Mathematics):");
        if (!name) return;
        
        const classChoice = prompt("Enter Class Name to assign this to, or leave blank for All Classes:");
        let class_id = null;
        if (classChoice) {
            const found = classes.find(c => c.name.toLowerCase() === classChoice.toLowerCase());
            if (found) class_id = found.id;
        }

        try {
            await api.post('admin/subjects', { name, class_id, status: 'Active' });
            fetchData();
        } catch (e) {
            alert("Failed to create subject");
        }
    };

    const handleReset = () => {
        setSearch('');
        setFilterClass('All Classes');
        setFilterStatus('All');
    };

    // Filter logic
    const filteredSubjects = subjects.filter(s => {
        if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterClass !== 'All Classes' && s.class_name !== filterClass) return false;
        if (filterStatus !== 'All' && s.status !== filterStatus) return false;
        return true;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-[1.35rem] font-semibold text-slate-800">Subjects</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Manage subjects class-wise and connect them with teachers.</p>
                </div>
                <button onClick={handleAddSubject} className="px-4 py-2 bg-[#4B70F5] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors">
                    + Add Subject
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
                <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-1.5">
                        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Search</label>
                        <input 
                            type="text" 
                            placeholder="Maths, Science..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#4B70F5]"
                        />
                    </div>
                    
                    <div className="space-y-1.5 w-48">
                        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Class</label>
                        <select 
                            value={filterClass}
                            onChange={e => setFilterClass(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#4B70F5]"
                        >
                            <option>All Classes</option>
                            {classes.map(c => <option key={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5 w-40">
                        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                        <select 
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#4B70F5]"
                        >
                            <option>All</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                    </div>

                    <button onClick={handleReset} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors border border-slate-200 h-9">
                        Reset
                    </button>
                </div>

                <div className="pt-4">
                    {loading ? (
                        <div className="text-center py-6 text-xs text-slate-500">Loading...</div>
                    ) : filteredSubjects.length === 0 ? (
                        <div className="text-xs text-slate-400 py-6 text-center">No subjects found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                    <tr>
                                        <th className="py-2.5 px-4 rounded-tl-lg">Subject Name</th>
                                        <th className="py-2.5 px-4">Class</th>
                                        <th className="py-2.5 px-4">Status</th>
                                        <th className="py-2.5 px-4 text-right rounded-tr-lg">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredSubjects.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50/50">
                                            <td className="py-3 px-4 font-medium">{s.name}</td>
                                            <td className="py-3 px-4">{s.class_name}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button className="text-[#4B70F5] hover:underline">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Subjects;
