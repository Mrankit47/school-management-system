import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StudentCards from './StudentCards';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await api.get('students/');
            setStudents(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-school-text">Student Directory</h1>
                    <p className="text-sm text-school-body">Manage all registered students, their profiles, and academic records.</p>
                </div>
                <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {students.length} Total Students
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 border-4 border-school-navy/10 border-t-school-navy rounded-full animate-spin mb-4"></div>
                    <p className="text-sm font-bold text-slate-400">Retrieving student records...</p>
                </div>
            ) : (
                <StudentCards
                    students={students}
                    refreshStudents={fetchStudents}
                />
            )}
        </div>
    );
};

export default ManageStudents;
