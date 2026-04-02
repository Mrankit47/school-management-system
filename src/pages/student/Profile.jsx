import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const card = {
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    background: '#fff',
    padding: 16,
};

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [attendanceRows, setAttendanceRows] = useState([]);
    const [feeRecords, setFeeRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        Promise.allSettled([
            api.get('students/profile/'),
            api.get('assignments/'),
            api.get('assignments/my-submissions/'),
            api.get('attendance/my-attendance/'),
            api.get('fees/my/'),
        ]).then(([profileRes, assignmentRes, submissionRes, attendanceRes, feesRes]) => {
                if (profileRes.status === 'fulfilled') {
                    setProfile(profileRes.value?.data || null);
                } else {
                    setProfile(null);
                }

                if (assignmentRes.status === 'fulfilled') {
                    setAssignments(assignmentRes.value?.data || []);
                } else {
                    setAssignments([]);
                }

                if (submissionRes.status === 'fulfilled') {
                    setSubmissions(submissionRes.value?.data || []);
                } else {
                    setSubmissions([]);
                }

                if (attendanceRes.status === 'fulfilled') {
                    setAttendanceRows(attendanceRes.value?.data || []);
                } else {
                    setAttendanceRows([]);
                }

                if (feesRes.status === 'fulfilled') {
                    setFeeRecords(feesRes.value?.data || []);
                } else {
                    setFeeRecords([]);
                }

                if (
                    profileRes.status !== 'fulfilled' &&
                    assignmentRes.status !== 'fulfilled' &&
                    submissionRes.status !== 'fulfilled' &&
                    attendanceRes.status !== 'fulfilled' &&
                    feesRes.status !== 'fulfilled'
                ) {
                    setError('Could not load student profile data.');
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const submissionMap = useMemo(() => {
        const m = new Map();
        (submissions || []).forEach((s) => m.set(Number(s.assignment_id), !!s.submitted));
        return m;
    }, [submissions]);

    const sortedAssignments = useMemo(() => {
        return (assignments || [])
            .slice()
            .sort((a, b) => String(a.due_date || '').localeCompare(String(b.due_date || '')));
    }, [assignments]);

    const assignmentSummary = useMemo(() => {
        const total = sortedAssignments.length;
        const submitted = sortedAssignments.filter((a) => submissionMap.get(Number(a.id))).length;
        const pending = total - submitted;
        return { total, submitted, pending };
    }, [sortedAssignments, submissionMap]);

    const attendanceSummary = useMemo(() => {
        const normalized = (attendanceRows || []).map((r) => String(r.status || '').toLowerCase());
        const present = normalized.filter((s) => s === 'present' || s === 'late').length;
        const absent = normalized.filter((s) => s === 'absent').length;
        const marked = present + absent;
        const percentage = marked ? (present / marked) * 100 : 0;
        return { present, absent, percentage };
    }, [attendanceRows]);

    const feesSummary = useMemo(() => {
        const total = (feeRecords || []).reduce((sum, r) => sum + Number(r.total_fees || 0), 0);
        const paid = (feeRecords || []).reduce((sum, r) => sum + Number(r.amount_paid || 0), 0);
        const due = (feeRecords || []).reduce((sum, r) => sum + Number(r.due_amount || 0), 0);
        return { total, paid, due };
    }, [feeRecords]);

    if (loading) return <p style={{ padding: 20 }}>Loading profile...</p>;
    if (!profile) return <p style={{ padding: 20, color: '#b91c1c', fontWeight: 900 }}>Profile not found.</p>;

    const classDisplay = profile.class_name || profile.class_ref_name || 'N/A';
    const fatherName = profile.parent_guardian_name || '—';
    const motherName = profile.mother_name || '—';
    const photoInitial = (profile.name || 'S').slice(0, 1).toUpperCase();
    const openIdCard = () => {
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`
            <html><head><title>Student ID Card</title></head>
            <body style="font-family:Arial;padding:24px">
                <h2>Student ID Card</h2>
                <p><strong>Name:</strong> ${profile.name || '-'}</p>
                <p><strong>Admission Number:</strong> ${profile.admission_number || '-'}</p>
                <p><strong>Class:</strong> ${classDisplay}</p>
                <p><strong>Email:</strong> ${profile.email || '-'}</p>
                <p><strong>Phone:</strong> ${profile.phone || profile.parent_contact_number || '-'}</p>
            </body></html>
        `);
        win.document.close();
        win.print();
    };

    return (
        <div style={{ padding: 20, background: '#f8fafc', minHeight: 'calc(100vh - 60px)' }}>
            <h1 style={{ marginTop: 0 }}>My Profile</h1>
            {error ? <div style={{ color: '#b91c1c', fontWeight: 900, marginBottom: 12 }}>{error}</div> : null}

            <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 1000, fontSize: 28 }}>
                    {photoInitial}
                </div>
                <div>
                    <div style={{ fontWeight: 1000, fontSize: 20 }}>{profile.name || 'Student'}</div>
                    <div style={{ marginTop: 4, color: '#6b7280', fontWeight: 900, fontSize: 13 }}>
                        Admission: {profile.admission_number || '—'} | {classDisplay}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0,1fr))', gap: 12 }}>
                <div style={{ ...card, gridColumn: 'span 8' }}>
                    <div style={{ fontWeight: 1000, marginBottom: 10 }}>Basic Information</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                        <div><strong>Name:</strong> {profile.name || '—'}</div>
                        <div><strong>Admission Number:</strong> {profile.admission_number || '—'}</div>
                        <div><strong>Class & Section:</strong> {classDisplay}</div>
                        <div><strong>Gender:</strong> {profile.gender || '—'}</div>
                        <div><strong>Date of Birth:</strong> {profile.dob || '—'}</div>
                        <div><strong>Date of Admission:</strong> {profile.date_of_admission || '—'}</div>
                        <div><strong>Email:</strong> {profile.email || '—'}</div>
                        <div><strong>Phone Number:</strong> {profile.phone || profile.parent_contact_number || '—'}</div>
                    </div>
                </div>

                <div style={{ ...card, gridColumn: 'span 4' }}>
                    <div style={{ fontWeight: 1000, marginBottom: 10 }}>Quick Actions</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                        <button type="button" onClick={() => navigate('/student/attendance')} style={{ padding: '10px 12px', borderRadius: 10, border: 'none', background: '#e0f2fe', color: '#0369a1', fontWeight: 900, cursor: 'pointer' }}>View Attendance</button>
                        <button type="button" onClick={() => navigate('/student/fees')} style={{ padding: '10px 12px', borderRadius: 10, border: 'none', background: '#ecfccb', color: '#3f6212', fontWeight: 900, cursor: 'pointer' }}>View Fees</button>
                        <button type="button" onClick={() => navigate('/student/results/exam')} style={{ padding: '10px 12px', borderRadius: 10, border: 'none', background: '#ede9fe', color: '#5b21b6', fontWeight: 900, cursor: 'pointer' }}>View Results</button>
                        <button type="button" onClick={openIdCard} style={{ padding: '10px 12px', borderRadius: 10, border: 'none', background: '#fee2e2', color: '#991b1b', fontWeight: 900, cursor: 'pointer' }}>Download ID Card</button>
                    </div>
                </div>

                <div style={{ ...card, gridColumn: 'span 6' }}>
                    <div style={{ fontWeight: 1000, marginBottom: 10 }}>Parent Details</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                        <div><strong>Father Name:</strong> {fatherName}</div>
                        <div><strong>Mother Name:</strong> {motherName}</div>
                        <div><strong>Parent Contact Number:</strong> {profile.parent_contact_number || '—'}</div>
                        <div><strong>Address:</strong> {profile.address || '—'}</div>
                    </div>
                </div>

                <div style={{ ...card, gridColumn: 'span 6' }}>
                    <div style={{ fontWeight: 1000, marginBottom: 10 }}>Academic Summary</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10 }}>
                        <div style={{ background: '#eff6ff', borderRadius: 10, padding: 10 }}>
                            <div style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 900 }}>Attendance %</div>
                            <div style={{ marginTop: 4, fontWeight: 1000, fontSize: 20 }}>{attendanceSummary.percentage.toFixed(1)}%</div>
                        </div>
                        <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 10 }}>
                            <div style={{ fontSize: 12, color: '#166534', fontWeight: 900 }}>Total Assignments</div>
                            <div style={{ marginTop: 4, fontWeight: 1000, fontSize: 20 }}>{assignmentSummary.total}</div>
                        </div>
                        <div style={{ background: '#fff7ed', borderRadius: 10, padding: 10 }}>
                            <div style={{ fontSize: 12, color: '#c2410c', fontWeight: 900 }}>Pending Assignments</div>
                            <div style={{ marginTop: 4, fontWeight: 1000, fontSize: 20 }}>{assignmentSummary.pending}</div>
                        </div>
                    </div>
                </div>

                <div style={{ ...card, gridColumn: 'span 6' }}>
                    <div style={{ fontWeight: 1000, marginBottom: 10 }}>Attendance Summary</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10 }}>
                        <div style={{ background: '#ecfdf5', borderRadius: 10, padding: 10 }}>
                            <div style={{ fontSize: 12, color: '#166534', fontWeight: 900 }}>Present Days</div>
                            <div style={{ marginTop: 4, fontSize: 20, fontWeight: 1000 }}>{attendanceSummary.present}</div>
                        </div>
                        <div style={{ background: '#fef2f2', borderRadius: 10, padding: 10 }}>
                            <div style={{ fontSize: 12, color: '#b91c1c', fontWeight: 900 }}>Absent Days</div>
                            <div style={{ marginTop: 4, fontSize: 20, fontWeight: 1000 }}>{attendanceSummary.absent}</div>
                        </div>
                        <div style={{ background: '#eff6ff', borderRadius: 10, padding: 10 }}>
                            <div style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 900 }}>Attendance %</div>
                            <div style={{ marginTop: 4, fontSize: 20, fontWeight: 1000 }}>{attendanceSummary.percentage.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>

                <div style={{ ...card, gridColumn: 'span 6' }}>
                    <div style={{ fontWeight: 1000, marginBottom: 10 }}>Fees Summary</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10 }}>
                        <div style={{ background: '#f8fafc', borderRadius: 10, padding: 10 }}>
                            <div style={{ fontSize: 12, color: '#475569', fontWeight: 900 }}>Total Fees</div>
                            <div style={{ marginTop: 4, fontSize: 20, fontWeight: 1000 }}>₹{feesSummary.total.toFixed(2)}</div>
                        </div>
                        <div style={{ background: '#ecfdf5', borderRadius: 10, padding: 10 }}>
                            <div style={{ fontSize: 12, color: '#166534', fontWeight: 900 }}>Paid Amount</div>
                            <div style={{ marginTop: 4, fontSize: 20, fontWeight: 1000 }}>₹{feesSummary.paid.toFixed(2)}</div>
                        </div>
                        <div style={{ background: '#fff7ed', borderRadius: 10, padding: 10 }}>
                            <div style={{ fontSize: 12, color: '#c2410c', fontWeight: 900 }}>Remaining Amount</div>
                            <div style={{ marginTop: 4, fontSize: 20, fontWeight: 1000 }}>₹{feesSummary.due.toFixed(2)}</div>
                        </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <button type="button" onClick={() => navigate('/student/ledger')} style={{ padding: '9px 12px', borderRadius: 10, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 900 }}>
                            View Ledger
                        </button>
                    </div>
                </div>

                <div style={{ ...card, gridColumn: 'span 12' }}>
                    <div style={{ fontWeight: 1000, fontSize: 16 }}>Assignments</div>
                    <div style={{ marginTop: 4, color: '#6b7280', fontWeight: 900, fontSize: 13 }}>
                        Total: {assignmentSummary.total} | Pending: {assignmentSummary.pending}
                    </div>
                    <div style={{ marginTop: 12, overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#64748b' }}>Title</th>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#64748b' }}>Subject</th>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#64748b' }}>Due Date</th>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#64748b' }}>Status</th>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#64748b' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAssignments.length ? (
                                sortedAssignments.map((a) => (
                                    <tr key={a.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: 10, fontWeight: 900 }}>{a.title}</td>
                                        <td style={{ padding: 10 }}>{a.subject || '—'}</td>
                                        <td style={{ padding: 10 }}>{a.due_date || '—'}</td>
                                        <td style={{ padding: 10 }}>
                                            <span style={{ padding: '5px 10px', borderRadius: 999, fontSize: 12, fontWeight: 900, background: submissionMap.get(Number(a.id)) ? '#dcfce7' : '#fef3c7', color: submissionMap.get(Number(a.id)) ? '#166534' : '#a16207' }}>
                                                {submissionMap.get(Number(a.id)) ? 'Submitted' : 'Pending'}
                                            </span>
                                        </td>
                                        <td style={{ padding: 10 }}>
                                            <button type="button" onClick={() => navigate('/student/assignments')} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 900 }}>
                                                {submissionMap.get(Number(a.id)) ? 'View' : 'Submit'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ padding: 12, color: '#6b7280', fontWeight: 900 }}>
                                        No assignments found for your class.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Profile;