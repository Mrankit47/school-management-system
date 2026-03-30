import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const card = {
    backgroundColor: '#fff',
    borderRadius: '14px',
    border: '1px solid #e5e7eb',
    padding: '16px',
    boxShadow: '0 1px 6px rgba(16,24,40,0.06)',
};

const input = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
};

const label = {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 700,
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
};

const TAB_KEYS = ['student', 'teacher', 'fees', 'attendance', 'exam'];

const tabTitle = {
    student: 'Student Report',
    teacher: 'Teacher Report',
    fees: 'Fees Report',
    attendance: 'Attendance Report',
    exam: 'Exam & Result Report',
};

const Reports = () => {
    const stats = [
        { label: 'Student Attendance', val: '94%', change: '+0.5%', icon: '📊', color: 'bg-blue-500' },
        { label: 'Pass Percentage', val: '88%', change: '+2%', icon: '📝', color: 'bg-indigo-500' },
        { label: 'Fees Collected', val: '₹4.5L / ₹6L', change: '75%', icon: '💰', color: 'bg-emerald-500' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-school-text">Analytics & Reports</h1>
                <p className="text-sm text-school-body">Insightful data visualizations and performance metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                                {s.icon}
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                                {s.change}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{s.label}</p>
                        <h4 className="text-2xl font-black text-school-text mt-1">{s.val}</h4>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="relative mb-8">
                    <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-4xl grayscale opacity-30">📉</div>
                    <div className="absolute inset-0 border-4 border-dashed border-slate-100 rounded-full animate-spin-slow"></div>
                </div>
                <h3 className="text-xl font-bold text-school-text">Data Generation in Progress</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                    The reporting engine is currently indexing system logs to generate real-time performance charts. Check back soon for deeper insights into academic growth.
                </p>
                <button className="mt-8 px-8 py-3 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl hover:bg-school-navy hover:text-white transition-all">
                    Configure Reporting Metrics
                </button>
            </div>
        </div>
    );
};

export default Reports;
