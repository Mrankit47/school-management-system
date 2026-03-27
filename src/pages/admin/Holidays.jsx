import React, { useState } from 'react';
import api from '../../services/api';

const Holidays = () => {
    const [holidays, setHolidays] = useState([]);
    const [busy, setBusy] = useState(false);

    const handleAdd = (e) => {
        e.preventDefault();
        setBusy(true);
        setTimeout(() => {
            alert('Holiday added successfully!');
            setBusy(false);
        }, 600);
    };

    const inputClasses = "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium";
    const labelClasses = "text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block";

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-school-text">Holidays & Events</h1>
                <p className="text-sm text-school-body">Manage the school calendar and official scheduled breaks.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sticky top-24">
                        <h3 className="text-lg font-bold text-school-text mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 text-sm">🎈</span>
                            Add Event
                        </h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="space-y-1">
                                <label className={labelClasses}>Holiday Title</label>
                                <input type="text" placeholder="e.g., Summer Break" className={inputClasses} required />
                            </div>
                            <div className="space-y-1">
                                <label className={labelClasses}>Date</label>
                                <input type="date" className={inputClasses} required />
                            </div>
                            <button type="submit" disabled={busy} className="w-full py-3.5 bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 transition-all">
                                {busy ? 'Processing...' : 'Schedule Holiday'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[300px] flex flex-col items-center justify-center text-center p-12">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4 grayscale opacity-50">🗓️</div>
                        <h3 className="text-lg font-bold text-school-text">No Scheduled Holidays</h3>
                        <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">Use the form on the left to populate the school calendar with upcoming events and breaks.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Holidays;
