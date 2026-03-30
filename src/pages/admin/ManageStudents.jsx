import React, { useEffect, useState } from 'react';
import api from '../../services/api';

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
<<<<<<< HEAD
                <StudentCards
                    students={students}
                    refreshStudents={fetchStudents}
                />
=======
                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            backgroundColor: '#fff',
                            minWidth: '900px',
                        }}
                    >
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Admission No</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Username</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Class - Section</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                                <tr key={s.id} style={{ borderTop: '1px solid #eef2f7' }}>
                                    <td style={{ padding: '12px 10px' }}>{s.admission_number}</td>
                                    <td style={{ padding: '12px 10px', fontWeight: 700 }}>{s.name}</td>
                                    <td style={{ padding: '12px 10px' }}>{s.username}</td>
                                    <td style={{ padding: '12px 10px' }}>{s.email}</td>
                                    <td style={{ padding: '12px 10px' }}>{s.class_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
>>>>>>> shalini-rajput1
            )}
        </div>
    );
};

export default ManageStudents;
