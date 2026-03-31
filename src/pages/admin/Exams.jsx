import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Exams = () => {
    const [exams, setExams] = useState([]);
    const [hierarchy, setHierarchy] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        class_section_id: '',
        exam_type: 'Midterm',
        start_date: '',
        end_date: '',
        total_marks: 100,
        passing_marks: 33,
        status: 'Draft',
        description: ''
    });

    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [hierRes, examRes] = await Promise.all([
                api.get('admin/classes-hierarchy'),
                api.get('admin/exams')
            ]);
            setHierarchy(hierRes.data.data);
            setExams(examRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            await api.post('admin/exams', {
                ...formData,
                class_section_id: parseInt(formData.class_section_id)
            });
            setMessage({ text: 'Exam created successfully!', type: 'success' });
            fetchData();
            setTimeout(() => setMessage(''), 3000);
            
            // reset basically
            setFormData({...formData, name: '', description: ''});
        } catch (err) {
            setMessage({ text: 'Failed to create exam.', type: 'error' });
        }
    };

    const inputClasses = "w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none";
    const labelClasses = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

    const allSections = [];
    hierarchy.forEach(c => c.sections.forEach(s => allSections.push({ ...s, class_name: c.name })));

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl">
            <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-[1.35rem] font-semibold text-slate-800">Exam Management</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Create exams, add schedule, and publish/unpublish results.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button className="px-4 py-1.5 bg-white shadow-sm text-school-navy text-xs font-semibold rounded-lg">Step 1: Create Exam</button>
                    <button className="px-4 py-1.5 text-slate-500 text-xs font-medium hover:text-slate-700">Step 2: Add Schedule</button>
                    <button className="px-4 py-1.5 text-slate-500 text-xs font-medium hover:text-slate-700">Step 3: Publish Result</button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Step 1 & 2 Combined Left Side */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Step 1 */}
                        <div className="bg-slate-50/50 rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-3 mb-5">Step 1: Create Exam</h3>
                            <form onSubmit={handleCreateExam} className="space-y-4">
                                <div>
                                    <label className={labelClasses}>EXAM NAME</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClasses} required />
                                </div>
                                
                                <div>
                                    <label className={labelClasses}>CLASS / SECTION</label>
                                    <select value={formData.class_section_id} onChange={e => setFormData({...formData, class_section_id: e.target.value})} className={inputClasses} required>
                                        <option value="">-- Select --</option>
                                        {allSections.map(s => <option key={s.id} value={s.id}>{s.class_name} - {s.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClasses}>EXAM TYPE</label>
                                    <select value={formData.exam_type} onChange={e => setFormData({...formData, exam_type: e.target.value})} className={inputClasses}>
                                        <option>Midterm</option>
                                        <option>Final</option>
                                        <option>Quiz</option>
                                        <option>Assignment</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>START DATE</label>
                                        <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className={inputClasses} required />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>END DATE</label>
                                        <input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className={inputClasses} required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>TOTAL MARKS</label>
                                        <input type="number" value={formData.total_marks} onChange={e => setFormData({...formData, total_marks: e.target.value})} className={inputClasses} required />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>PASSING MARKS</label>
                                        <input type="number" value={formData.passing_marks} onChange={e => setFormData({...formData, passing_marks: e.target.value})} className={inputClasses} required />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClasses}>STATUS</label>
                                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className={inputClasses}>
                                        <option>Draft</option>
                                        <option>Published</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className={labelClasses}>DESCRIPTION (OPTIONAL)</label>
                                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={`${inputClasses} h-20 resize-none`}></textarea>
                                </div>

                                <button type="submit" className="w-full py-2.5 bg-[#4B70F5] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors">
                                    Create Exam
                                </button>
                            </form>
                        </div>

                        {/* Step 2 & 3 Placeholder */}
                        <div className="space-y-6">
                            <div className="bg-slate-50/50 rounded-2xl border border-slate-200 p-6 shadow-sm h-[200px]">
                                <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-3 mb-5">Step 2: Add Schedule</h3>
                                <div className="space-y-4">
                                    <select className={inputClasses}>
                                        <option>-- Select Exam --</option>
                                        {exams.map(e => <option key={e.id}>{e.name} ({e.class_name})</option>)}
                                    </select>
                                    <p className="text-xs text-slate-500 font-medium">Create exam first, then select it to add schedule.</p>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 rounded-2xl border border-slate-200 p-6 shadow-sm flex-1/2">
                                <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-3 mb-5">Step 3: Publish Result</h3>
                                <p className="text-xs text-slate-500 font-medium">Create/select an exam first.</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Exam Overview Sidebar */}
                <div className="bg-slate-50/50 rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-3 mb-5">Exam Overview</h3>
                    <div className="space-y-3 mb-6">
                        <select className={inputClasses}><option>All Classes/Sections</option></select>
                        <select className={inputClasses}><option>All Status</option></select>
                    </div>
                    
                    <div className="text-xs font-bold text-slate-600 mb-4">Total Exams: {exams.length}</div>
                    
                    {loading ? (
                        <div className="text-center text-xs text-slate-500">Loading...</div>
                    ) : exams.length === 0 ? (
                        <div className="text-sm font-semibold text-slate-500">No exams found for selected filters.</div>
                    ) : (
                        <div className="space-y-3">
                            {exams.map(e => (
                                <div key={e.id} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <div className="font-semibold text-sm text-slate-800">{e.name}</div>
                                    <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                                        <span>{e.class_name}</span>
                                        <span className={e.status === 'Published' ? 'text-emerald-500 font-bold' : 'text-orange-500 font-bold'}>{e.status}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-2">{e.start_date} to {e.end_date}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Exams;
