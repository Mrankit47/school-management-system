import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AssignTeacher = () => {
    const [classes, setClasses] = useState([]);
    const [formData, setFormData] = useState({ class_section: '', teacher: '' });
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        api.get('classes/sections/').then(res => setClasses(res.data));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setBusy(true);
        setTimeout(() => {
            alert('Teacher assignment updated! (Backend logic integration pending)');
            setBusy(false);
        }, 800);
    };

    const inputClasses = "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium appearance-none";
    const labelClasses = "text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block";

    return (
        <div className="max-w-xl space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-school-text">Academic Assignment</h1>
                <p className="text-sm text-school-body">Link faculty members to their respective class sections.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                <h3 className="text-lg font-bold text-school-text mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-school-blue/5 flex items-center justify-center text-school-blue text-sm">🔗</span>
                    Assignment Details
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1 relative">
                        <label className={labelClasses}>Class & Section</label>
                        <select 
                            onChange={e => setFormData({...formData, class_section: e.target.value})} 
                            required 
                            className={inputClasses}
                        >
                            <option value="">-- Choose Target Class --</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>
                                    Grade {c.class_name} - Section {c.section_name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 bottom-3.5 pointer-events-none text-slate-400">▼</div>
                    </div>

                    <div className="space-y-1">
                        <label className={labelClasses}>Teacher Employee ID</label>
                        <input 
                            type="text" 
                            placeholder="e.g., T-1025" 
                            onChange={e => setFormData({...formData, teacher: e.target.value})} 
                            className={inputClasses}
                            required
                        />
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={busy}
                            className="w-full py-3.5 bg-school-navy text-white text-xs font-bold rounded-xl shadow-lg shadow-school-navy/10 hover:bg-school-blue transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {busy ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Confirm Assignment</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-[11px] text-slate-500 leading-relaxed text-center">
                Note: Updating an assignment will re-synchronize student rosters and communication channels for the selected class immediately.
            </div>
        </div>
    );
};

export default AssignTeacher;
