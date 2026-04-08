import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const palette = {
    bg: '#f8fafc',
    card: '#ffffff',
    border: '#e5e7eb',
    text: '#0f172a',
    muted: '#64748b',
    primary: '#2563eb',
    success: '#16a34a',
    danger: '#ef4444',
    warn: '#f59e0b',
    shadow: '0 1px 8px rgba(16,24,40,0.06)',
};

const sidebarItems = [
    { label: 'Dashboard', path: '/teacher/dashboard' },
    { label: 'My Classes', path: '/teacher/students' },
    { label: 'Attendance', path: '/teacher/attendance' },
    { label: 'Assignments', path: '/teacher/assignment' },
    { label: 'Exams & Results', path: '/teacher/upload-result' },
    { label: 'Timetable', path: '#timetable' },
    { label: 'Messages', path: '/teacher/messaging' },
    { label: 'Study Material', path: '#study-material' },
    { label: 'Profile / Settings', path: '/teacher/profile' },
];

function toDateKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function MiniProgress({ value }) {
    const pct = Math.max(0, Math.min(100, Number(value) || 0));
    return (
        <div style={{ height: 9, borderRadius: 999, backgroundColor: '#f1f5f9', border: `1px solid ${palette.border}`, overflow: 'hidden' }}>
            <div
                style={{
                    height: '100%',
                    width: `${pct}%`,
                    backgroundColor: pct < 75 ? palette.danger : palette.primary,
                    transition: 'width 300ms ease',
                }}
            />
        </div>
    );
}

function Card({ children, style, ...rest }) {
    return (
        <div
            {...rest}
            style={{ backgroundColor: palette.card, border: `1px solid ${palette.border}`, borderRadius: 16, padding: 16, boxShadow: palette.shadow, ...style }}
        >
            {children}
        </div>
    );
}

function Sparkline({ points }) {
    if (!points || points.length < 2) {
        return <div style={{ color: palette.muted, fontWeight: 900, fontSize: 12 }}>No chart data</div>;
    }

    const width = 360;
    const height = 110;
    const pad = 12;
    const ys = points.map((p) => p.y);
    const minY = 0;
    const maxY = Math.max(100, ...ys);
    const xScale = (i) => pad + ((width - 2 * pad) * i) / (points.length - 1);
    const yScale = (y) => height - pad - ((height - 2 * pad) * (y - minY)) / (maxY - minY || 1);

    const path = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(p.y)}`)
        .join(' ');

    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
                <path d={path} fill="none" stroke={palette.primary} strokeWidth="3" strokeLinecap="round" />
                {points.map((p, i) => (
                    <circle key={`${p.x}-${i}`} cx={xScale(i)} cy={yScale(p.y)} r="4" fill="#fff" stroke={palette.primary} strokeWidth="2" />
                ))}
            </svg>
        </div>
    );
}

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    const [profile, setProfile] = useState(null);
    const [myClasses, setMyClasses] = useState([]);
    const [classStudentCount, setClassStudentCount] = useState({});
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));

    const [attendanceSummary, setAttendanceSummary] = useState(null);
    const [attendanceRows, setAttendanceRows] = useState([]);
    const [attendanceTrend, setAttendanceTrend] = useState([]);

    const [assignments, setAssignments] = useState([]);
    const [exams, setExams] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [messages, setMessages] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get('teachers/profile/'),
            api.get('classes/teaching-sections/'),
            api.get('assignments/'),
            api.get('academics/exams/'),
            api.get('timetable/'),
            api.get('communication/my/'),
            api.get('subjects/', { params: { status: 'Active' } }),
        ])
            .then(async ([profileRes, teachingRes, assignRes, examsRes, timetableRes, messageRes, subjectsRes]) => {
                const teacherProfile = profileRes.data || null;
                const mine = teachingRes.data || [];
                setProfile(teacherProfile);
                setAssignments(assignRes.data || []);
                setExams(examsRes.data || []);
                setTimetable(timetableRes.data || []);
                setMessages(messageRes.data || []);
                setSubjects(subjectsRes.data || []);

                setMyClasses(mine);

                if (mine.length > 0) {
                    const defaultClassId = String(mine[0].id);
                    setSelectedClassId(defaultClassId);
                }

                // Fetch student counts for each class assigned to teacher.
                const counts = {};
                await Promise.all(
                    mine.map(async (c) => {
                        try {
                            const res = await api.get(`students/by-class/${c.id}/`);
                            counts[c.id] = (res.data || []).length;
                        } catch (_) {
                            counts[c.id] = 0;
                        }
                    })
                );
                setClassStudentCount(counts);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedClassId) {
            setAttendanceSummary(null);
            setAttendanceRows([]);
            setAttendanceTrend([]);
            return;
        }

        const loadClassAttendance = async () => {
            try {
                const summaryRes = await api.get('attendance/class-summary/', {
                    params: { class_section_id: selectedClassId, date: selectedDate },
                });
                const data = summaryRes.data || {};
                setAttendanceSummary(data.summary || null);
                setAttendanceRows(data.students || []);

                // Build last 7-day trend.
                const trendDays = 7;
                const base = new Date(selectedDate);
                const calls = [];
                for (let i = trendDays - 1; i >= 0; i--) {
                    const d = new Date(base);
                    d.setDate(base.getDate() - i);
                    calls.push(
                        api
                            .get('attendance/class-summary/', {
                                params: {
                                    class_section_id: selectedClassId,
                                    date: toDateKey(d),
                                },
                            })
                            .then((res) => ({
                                x: toDateKey(d),
                                y: Number(res?.data?.summary?.attendance_percentage || 0),
                            }))
                            .catch(() => ({
                                x: toDateKey(d),
                                y: 0,
                            }))
                    );
                }
                const trend = await Promise.all(calls);
                setAttendanceTrend(trend);
            } catch (_) {
                setAttendanceSummary(null);
                setAttendanceRows([]);
                setAttendanceTrend([]);
            }
        };

        loadClassAttendance();
    }, [selectedClassId, selectedDate]);

    const totalStudents = useMemo(() => {
        return myClasses.reduce((sum, c) => sum + Number(classStudentCount[c.id] || 0), 0);
    }, [myClasses, classStudentCount]);

    const pendingAssignments = useMemo(() => {
        const today = toDateKey(new Date());
        return (assignments || []).filter((a) => a.due_date >= today).length;
    }, [assignments]);

    const upcomingExams = useMemo(() => {
        const today = toDateKey(new Date());
        const classIds = new Set(myClasses.map((c) => c.id));
        return (exams || [])
            .filter((e) => classIds.has(e.class_section))
            .filter((e) => (e.start_date || e.date || e.end_date || '') >= today)
            .sort((a, b) => String(a.start_date || a.date).localeCompare(String(b.start_date || b.date)));
    }, [exams, myClasses]);

    const todayClasses = useMemo(() => {
        const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        return (timetable || []).filter((t) => t.day === day);
    }, [timetable]);

    const filteredStudents = useMemo(() => {
        if (!searchText.trim()) return attendanceRows;
        const q = searchText.trim().toLowerCase();
        return (attendanceRows || []).filter(
            (s) =>
                (s.name || '').toLowerCase().includes(q) ||
                (s.admission_number || '').toLowerCase().includes(q)
        );
    }, [attendanceRows, searchText]);

    const recentActivity = useMemo(() => {
        const items = [];
        (messages || []).slice(0, 3).forEach((m) => {
            items.push({
                type: 'message',
                title: m.title,
                time: m.created_at,
            });
        });
        (assignments || []).slice(0, 3).forEach((a) => {
            items.push({
                type: 'assignment',
                title: `Assignment: ${a.title}`,
                time: a.created_at || a.due_date,
            });
        });
        (upcomingExams || []).slice(0, 2).forEach((e) => {
            items.push({
                type: 'exam',
                title: `Upcoming exam: ${e.name}`,
                time: e.start_date || e.date,
            });
        });
        return items
            .sort((a, b) => String(b.time || '').localeCompare(String(a.time || '')))
            .slice(0, 7);
    }, [messages, assignments, upcomingExams]);

    const markAttendance = async (studentId, status) => {
        if (!selectedDate) return;
        try {
            await api.post('attendance/mark/', {
                student: studentId,
                date: selectedDate,
                status,
            });
            const res = await api.get('attendance/class-summary/', {
                params: { class_section_id: selectedClassId, date: selectedDate },
            });
            setAttendanceSummary(res.data?.summary || null);
            setAttendanceRows(res.data?.students || []);
        } catch (_) {
            alert('Could not mark attendance.');
        }
    };

    if (loading) return <div style={{ padding: 20, color: palette.muted, fontWeight: 900 }}>Loading teacher dashboard...</div>;

    return (
        <div style={{ padding: 20, backgroundColor: palette.bg, minHeight: 'calc(100vh - 60px)' }}>
            {/* Top Header */}
            <Card style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontWeight: 1000, fontSize: 22, color: palette.text }}>Teacher Dashboard</div>
                        <div style={{ marginTop: 4, color: palette.muted, fontWeight: 900, fontSize: 13 }}>
                            Welcome {profile?.user?.name || profile?.employee_id || 'Teacher'}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search students..."
                            style={{
                                width: 220,
                                padding: '10px 12px',
                                borderRadius: 12,
                                border: `1px solid ${palette.border}`,
                                outline: 'none',
                                backgroundColor: '#fff',
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => navigate('/teacher/messaging')}
                            style={{
                                padding: '10px 12px',
                                borderRadius: 12,
                                border: `1px solid ${palette.border}`,
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                fontWeight: 1000,
                            }}
                        >
                            Notifications ({messages.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/teacher/profile')}
                            style={{
                                padding: '10px 12px',
                                borderRadius: 12,
                                border: `1px solid ${palette.border}`,
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                fontWeight: 1000,
                            }}
                        >
                            Profile
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                logout();
                                navigate('/login');
                            }}
                            style={{
                                padding: '10px 12px',
                                borderRadius: 12,
                                border: 'none',
                                backgroundColor: palette.primary,
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: 1000,
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </Card>

            {/* Sidebar Menu (quick navigation strip) */}
            <Card style={{ marginBottom: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                    {sidebarItems.map((item) => (
                        <button
                            key={item.label}
                            type="button"
                            onClick={() => {
                                if (item.path.startsWith('#')) {
                                    const id = item.path.replace('#', '');
                                    const el = document.getElementById(id);
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    return;
                                }
                                navigate(item.path);
                            }}
                            style={{
                                border: `1px solid ${palette.border}`,
                                borderRadius: 12,
                                padding: '10px 12px',
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                color: palette.text,
                                fontWeight: 900,
                                textAlign: 'left',
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0,1fr))', gap: 12 }}>
                <Card style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: palette.muted, textTransform: 'uppercase' }}>Total Classes</div>
                    <div style={{ marginTop: 8, fontWeight: 1000, fontSize: 24 }}>{myClasses.length}</div>
                </Card>
                <Card style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: palette.muted, textTransform: 'uppercase' }}>Total Students</div>
                    <div style={{ marginTop: 8, fontWeight: 1000, fontSize: 24 }}>{totalStudents}</div>
                </Card>
                <Card style={{ gridColumn: 'span 3' }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: palette.muted, textTransform: 'uppercase' }}>Today's Attendance %</div>
                    <div style={{ marginTop: 8, fontWeight: 1000, fontSize: 24, color: (attendanceSummary?.attendance_percentage || 0) < 75 ? palette.danger : palette.success }}>
                        {attendanceSummary ? `${Number(attendanceSummary.attendance_percentage || 0).toFixed(1)}%` : '0.0%'}
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <MiniProgress value={attendanceSummary?.attendance_percentage || 0} />
                    </div>
                </Card>
                <Card style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: palette.muted, textTransform: 'uppercase' }}>Pending Assignments</div>
                    <div style={{ marginTop: 8, fontWeight: 1000, fontSize: 24 }}>{pendingAssignments}</div>
                </Card>
                <Card style={{ gridColumn: 'span 3' }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: palette.muted, textTransform: 'uppercase' }}>Upcoming Exams</div>
                    <div style={{ marginTop: 8, fontWeight: 1000, fontSize: 24 }}>{upcomingExams.length}</div>
                    <div style={{ marginTop: 8, color: palette.muted, fontWeight: 900, fontSize: 12 }}>
                        {upcomingExams[0] ? `${upcomingExams[0].name} on ${upcomingExams[0].start_date || upcomingExams[0].date}` : 'No upcoming exams'}
                    </div>
                </Card>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0,1fr))', gap: 12 }}>
                {/* Attendance Management + chart */}
                <Card style={{ gridColumn: 'span 7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontWeight: 1000, color: palette.text }}>Attendance Management</div>
                            <div style={{ marginTop: 4, color: palette.muted, fontSize: 12, fontWeight: 900 }}>
                                Mark present/absent/late and track class performance.
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <select
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${palette.border}`, backgroundColor: '#fff', fontWeight: 900 }}
                            >
                                {myClasses.length === 0 ? <option value="">No assigned classes</option> : null}
                                {myClasses.map((c) => (
                                    <option key={c.id} value={String(c.id)}>
                                        {c.class_name} - {c.section_name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${palette.border}`, backgroundColor: '#fff', fontWeight: 900 }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <Sparkline points={attendanceTrend} />
                    </div>

                    <div style={{ marginTop: 12, overflowX: 'auto', border: `1px solid ${palette.border}`, borderRadius: 12 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                                <tr style={{ backgroundColor: '#f1f5f9' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Admission No</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Recent %</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((s) => (
                                    <tr key={s.id} style={{ borderTop: `1px solid ${palette.border}`, backgroundColor: s.low_attendance ? '#fff7ed' : '#fff' }}>
                                        <td style={{ padding: '10px', fontWeight: 900 }}>{s.admission_number}</td>
                                        <td style={{ padding: '10px' }}>{s.name}</td>
                                        <td style={{ padding: '10px', fontWeight: 900, color: s.status === 'absent' ? palette.danger : s.status === 'late' || s.status === 'pending' ? palette.warn : palette.success }}>
                                            {s.status ? s.status.toUpperCase() : 'UNMARKED'}
                                        </td>
                                        <td style={{ padding: '10px', fontWeight: 900 }}>
                                            {s.recent_attendance_percentage}%
                                            {s.low_attendance ? <span style={{ marginLeft: 8, color: palette.danger, fontSize: 11 }}>Low</span> : null}
                                        </td>
                                        <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                                            <button
                                                type="button"
                                                onClick={() => markAttendance(s.id, 'present')}
                                                style={{ padding: '6px 10px', marginRight: 6, borderRadius: 8, border: 'none', backgroundColor: palette.success, color: '#fff', fontWeight: 900, cursor: 'pointer' }}
                                            >
                                                Present
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => markAttendance(s.id, 'absent')}
                                                style={{ padding: '6px 10px', marginRight: 6, borderRadius: 8, border: 'none', backgroundColor: palette.danger, color: '#fff', fontWeight: 900, cursor: 'pointer' }}
                                            >
                                                Absent
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => markAttendance(s.id, 'late')}
                                                style={{ padding: '6px 10px', borderRadius: 8, border: 'none', backgroundColor: palette.warn, color: '#111827', fontWeight: 900, cursor: 'pointer' }}
                                            >
                                                Late
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: 12, color: palette.muted, fontWeight: 900 }}>
                                            No students found for selected class/date.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Right pane quick modules */}
                <Card style={{ gridColumn: 'span 5' }}>
                    <div style={{ fontWeight: 1000, color: palette.text }}>Recent Activity</div>
                    <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                        {recentActivity.map((a, idx) => (
                            <div key={`${a.type}-${idx}`} style={{ border: `1px solid ${palette.border}`, borderRadius: 12, padding: 10 }}>
                                <div style={{ fontWeight: 900, fontSize: 13 }}>{a.title}</div>
                                <div style={{ marginTop: 4, color: palette.muted, fontSize: 12, fontWeight: 900 }}>
                                    {a.type.toUpperCase()} • {String(a.time || '')}
                                </div>
                            </div>
                        ))}
                        {recentActivity.length === 0 ? <div style={{ color: palette.muted, fontWeight: 900 }}>No activity yet.</div> : null}
                    </div>
                </Card>

                <Card style={{ gridColumn: 'span 4' }}>
                    <div style={{ fontWeight: 1000, color: palette.text }}>My Classes</div>
                    <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                        {myClasses.map((c) => (
                            <div key={c.id} style={{ border: `1px solid ${palette.border}`, borderRadius: 12, padding: 10 }}>
                                <div style={{ fontWeight: 900 }}>
                                    {c.class_name} - {c.section_name}
                                </div>
                                <div style={{ marginTop: 4, color: palette.muted, fontSize: 12, fontWeight: 900 }}>
                                    Students: {classStudentCount[c.id] || 0} | Room: {c.room_number || 'N/A'}
                                </div>
                            </div>
                        ))}
                        {myClasses.length === 0 ? <div style={{ color: palette.muted, fontWeight: 900 }}>No classes assigned to you (class teacher or subject).</div> : null}
                    </div>
                </Card>

                <Card style={{ gridColumn: 'span 4' }}>
                    <div style={{ fontWeight: 1000, color: palette.text }}>Assignments</div>
                    <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                        {(assignments || []).slice(0, 5).map((a) => (
                            <div key={a.id} style={{ border: `1px solid ${palette.border}`, borderRadius: 12, padding: 10 }}>
                                <div style={{ fontWeight: 900 }}>{a.title}</div>
                                <div style={{ marginTop: 4, color: palette.muted, fontSize: 12, fontWeight: 900 }}>
                                    Deadline: {a.due_date}
                                </div>
                            </div>
                        ))}
                        {(assignments || []).length === 0 ? <div style={{ color: palette.muted, fontWeight: 900 }}>No assignments yet.</div> : null}
                    </div>
                </Card>

                <Card style={{ gridColumn: 'span 4' }}>
                    <div style={{ fontWeight: 1000, color: palette.text }}>Exams & Results</div>
                    <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                        {upcomingExams.slice(0, 5).map((e) => (
                            <div key={e.id} style={{ border: `1px solid ${palette.border}`, borderRadius: 12, padding: 10 }}>
                                <div style={{ fontWeight: 900 }}>{e.name}</div>
                                <div style={{ marginTop: 4, color: palette.muted, fontSize: 12, fontWeight: 900 }}>
                                    {e.class_name} - {e.section_name} | {e.start_date || e.date}
                                </div>
                            </div>
                        ))}
                        {upcomingExams.length === 0 ? <div style={{ color: palette.muted, fontWeight: 900 }}>No upcoming exams.</div> : null}
                    </div>
                </Card>

                <Card style={{ gridColumn: 'span 6' }} id="timetable">
                    <div style={{ fontWeight: 1000, color: palette.text }}>Today's Timetable</div>
                    <div style={{ marginTop: 10, overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f1f5f9' }}>
                                    <th style={{ padding: 10, textAlign: 'left' }}>Subject</th>
                                    <th style={{ padding: 10, textAlign: 'left' }}>Time</th>
                                    <th style={{ padding: 10, textAlign: 'left' }}>Class</th>
                    </tr>
                </thead>
                <tbody>
                                {todayClasses.map((t) => (
                                    <tr key={t.id} style={{ borderTop: `1px solid ${palette.border}` }}>
                                        <td style={{ padding: 10, fontWeight: 900 }}>{t.subject}</td>
                                        <td style={{ padding: 10 }}>{t.start_time} - {t.end_time}</td>
                                        <td style={{ padding: 10 }}>{t.class_section}</td>
                        </tr>
                    ))}
                                {todayClasses.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} style={{ padding: 10, color: palette.muted, fontWeight: 900 }}>
                                            No classes scheduled today.
                                        </td>
                                    </tr>
                                ) : null}
                </tbody>
            </table>
                    </div>
                </Card>

                <Card style={{ gridColumn: 'span 6' }} id="study-material">
                    <div style={{ fontWeight: 1000, color: palette.text }}>Study Material (Subject-wise)</div>
                    <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                        {(subjects || []).slice(0, 6).map((s) => (
                            <div key={s.id} style={{ border: `1px solid ${palette.border}`, borderRadius: 12, padding: 10 }}>
                                <div style={{ fontWeight: 900 }}>{s.name}</div>
                                <div style={{ marginTop: 4, color: palette.muted, fontSize: 12, fontWeight: 900 }}>
                                    Class: {s.class_name} | Status: {s.status}
                                </div>
                            </div>
                        ))}
                        {(subjects || []).length === 0 ? <div style={{ color: palette.muted, fontWeight: 900 }}>No active subjects/material found.</div> : null}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TeacherDashboard;
