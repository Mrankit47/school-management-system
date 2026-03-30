import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const AdminFees = () => {
    const [feeId, setFeeId] = useState('');
    const [busy, setBusy] = useState(false);

    const handleMarkPaid = async () => {
        if (!feeId) return;
        setBusy(true);
        try {
            await api.post(`fees/admin/pay/${feeId}/`);
            alert('Fee marked as paid successfully!');
            setFeeId('');
        } catch (err) {
            alert('Error updating fee. Please check the ID.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-school-text">Finance Management</h1>
                <p className="text-sm text-school-body">Process student fee payments and manage school revenue.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <h3 className="text-lg font-bold text-school-text mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-school-navy/5 flex items-center justify-center text-school-navy text-sm">💰</span>
                        Collect Fee
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Student Fee ID</label>
                            <input 
                                type="number" 
                                placeholder="Enter system fee ID (e.g., 204)" 
                                value={feeId} 
                                onChange={e => setFeeId(e.target.value)} 
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-school-navy/5 outline-none focus:bg-white focus:border-school-navy/20 transition-all font-medium" 
                            />
                        </div>
                        <button 
                            onClick={handleMarkPaid} 
                            disabled={busy || !feeId}
                            className="w-full py-3.5 bg-school-navy text-white text-xs font-bold rounded-xl shadow-lg shadow-school-navy/10 hover:bg-school-blue transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {busy ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Mark as Paid</>
                            )}
                        </button>
                    </div>
                </div>

                <div className="bg-school-navy rounded-3xl p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Quick Tip</p>
                        <h4 className="text-lg font-bold mb-4">Financial Records</h4>
                        <p className="text-sm text-white/70 leading-relaxed mb-6">
                            Marking a fee as paid will automatically update the student's financial status and generate a transaction log. Ensure the Fee ID is correct before proceeding.
                        </p>
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">💡</div>
                            <p className="text-xs font-medium text-white/90">Fee IDs can be found in the Student Management report section.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminFees;
