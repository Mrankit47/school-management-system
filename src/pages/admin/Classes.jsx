import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Classes = () => {
    const [hierarchy, setHierarchy] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Assignment Form
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [hierRes, studentRes] = await Promise.all([
                api.get('admin/classes-hierarchy'),
                api.get('students/')
            ]);
            setHierarchy(hierRes.data.data);
            setStudents(studentRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClass = async () => {
        const name = prompt("Enter new Class Name (e.g., Grade 10):");
        if (name) {
            try {
                await api.post('classes/admin-create-class/', { name });
                fetchData();
            } catch (e) {
                alert("Failed to create class");
            }
        }
    };

    const handleAddSection = async () => {
        const name = prompt("Enter new Section Name (e.g., A):");
        if (name) {
            try {
                await api.post('classes/admin-create-section/', { name });
                fetchData();
            } catch (e) {
                alert("Failed to create section");
            }
        }
    };

    const handleAssignStudent = async (e) => {
        e.preventDefault();
        try {
            await api.post('admin/students/assign', {
                student_id: parseInt(selectedStudent),
                class_section_id: parseInt(selectedSection)
            });
            setMessage({ text: "Student assigned successfully!", type: "success" });
            setSelectedStudent('');
            setSelectedSection('');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage({ text: "Failed to assign student.", type: "error" });
        }
    };

    // Flatten sections for the table and dropdown
    const allSections = [];
    hierarchy.forEach(c => {
        c.sections.forEach(s => {
            allSections.push({ ...s, class_name: c.name });
        });
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-[1.35rem] font-semibold text-slate-800">Class & Section Management</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Organize classes, sections, teachers, and student placement.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleAddClass} className="px-4 py-2 bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors">
                        + Add Class
                    </button>
                    <button onClick={handleAddSection} className="px-4 py-2 bg-indigo-500/90 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors">
                        + Add Section
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-6">
                    {/* Class Hierarchy Panel */}
                    <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-5">
                        <h3 className="text-sm font-semibold text-slate-600 mb-3">Class Hierarchy</h3>
                        {hierarchy.length === 0 ? (
                            <div className="text-xs text-slate-400">No classes yet.</div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {hierarchy.map(c => (
                                    <div key={c.id} className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 shadow-sm">
                                        {c.name} <span className="text-slate-400 ml-1">({c.sections.length})</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Section List Table */}
                    <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-slate-600">Section List</h3>
                            <div className="flex gap-2">
                                <input type="text" placeholder="Search class/section..." className="text-xs border border-slate-200 rounded px-3 py-1.5 bg-white w-48" />
                                <select className="text-xs border border-slate-200 rounded px-3 py-1.5 bg-white">
                                    <option>All Classes</option>
                                    {hierarchy.map(c => <option key={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {allSections.length === 0 ? (
                            <div className="text-xs text-slate-400 py-6 text-center">No sections found.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-slate-600">
                                    <thead className="bg-slate-100/50 text-slate-500 font-medium">
                                        <tr>
                                            <th className="py-2.5 px-4 rounded-l-lg">Class</th>
                                            <th className="py-2.5 px-4">Section</th>
                                            <th className="py-2.5 px-4">Teacher</th>
                                            <th className="py-2.5 px-4">Room</th>
                                            <th className="py-2.5 px-4 text-right rounded-r-lg">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {allSections.map(s => (
                                            <tr key={s.id}>
                                                <td className="py-3 px-4 font-medium">{s.class_name}</td>
                                                <td className="py-3 px-4">{s.name}</td>
                                                <td className="py-3 px-4">{s.teacher}</td>
                                                <td className="py-3 px-4 text-slate-400">TBD</td>
                                                <td className="py-3 px-4 text-right">
                                                    <button className="text-indigo-500 hover:underline">Edit</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Assign Student Panel */}
                <div>
                    <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-600 mb-6 border-b border-slate-200 pb-2">Assign Student to Class & Section</h3>
                        
                        {message && (
                            <div className={`mb-4 px-3 py-2 rounded text-xs font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleAssignStudent} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Student</label>
                                <select 
                                    value={selectedStudent} 
                                    onChange={e => setSelectedStudent(e.target.value)}
                                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-white text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    required
                                >
                                    <option value="">-- Select Student --</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.username})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Class - Section</label>
                                <select 
                                    value={selectedSection} 
                                    onChange={e => setSelectedSection(e.target.value)}
                                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-white text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    required
                                >
                                    <option value="">-- Select Section --</option>
                                    {allSections.map(s => (
                                        <option key={s.id} value={s.id}>{s.class_name} - {s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full mt-2 py-2.5 bg-[#4B70F5] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                                Assign Student
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Classes;
