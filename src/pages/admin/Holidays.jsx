import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const labelStyle = {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 800,
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
};

const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    padding: '18px',
    boxShadow: '0 1px 6px rgba(16,24,40,0.06)',
};

function formatDateRange(h) {
    if (!h?.end_date || h.end_date === h.start_date) return h.start_date;
    return `${h.start_date} — ${h.end_date}`;
}

function parseDateOnly(value) {
    // DRF DateField generally comes as `YYYY-MM-DD`. Using `new Date(value)` may interpret it in UTC
    // and cause timezone shifts. We parse it as local date to keep calendar cells consistent.
    if (typeof value !== 'string') {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return null;
        d.setHours(0, 0, 0, 0);
        return d;
    }
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const da = parseInt(m[3], 10);
    return new Date(y, mo - 1, da);
}

function toDateKey(date) {
    // Local `YYYY-MM-DD` key (NOT UTC-based `toISOString()`), used for Map lookups + rendering.
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

const AdminHolidays = () => {
    const [tab, setTab] = useState('list'); // 'list' | 'calendar'

    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(false);

    const [classes, setClasses] = useState([]);

    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()));
    const [sortDir, setSortDir] = useState('asc'); // asc|desc

    const now = new Date();
    const [calMonth, setCalMonth] = useState(now.getMonth() + 1);
    const [calYear, setCalYear] = useState(now.getFullYear());

    const [selectedDate, setSelectedDate] = useState(null); // 'YYYY-MM-DD'
    const [detailsOpen, setDetailsOpen] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formError, setFormError] = useState('');

    const [form, setForm] = useState({
        title: '',
        start_date: '',
        end_date: '',
        description: '',
        type: 'Public',
        allClasses: true,
        applicable_class_ids: [],
    });

    const openCreate = () => {
        setEditingId(null);
        setFormError('');
        setForm({
            title: '',
            start_date: '',
            end_date: '',
            description: '',
            type: 'Public',
            allClasses: true,
            applicable_class_ids: [],
        });
        setModalOpen(true);
    };

    const openEdit = (h) => {
        setEditingId(h.id);
        setFormError('');
        setForm({
            title: h.title || '',
            start_date: h.start_date || '',
            end_date: h.end_date || '',
            description: h.description || '',
            type: h.type || 'Public',
            allClasses: !h.applicable_classes || h.applicable_classes.length === 0,
            applicable_class_ids: (h.applicable_classes || []).map((c) => c.id),
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingId(null);
        setFormError('');
    };

    const closeDetails = () => {
        setDetailsOpen(false);
        setSelectedDate(null);
    };

    const fetchClasses = async () => {
        const res = await api.get('classes/main-classes/');
        setClasses(res.data || []);
    };

    const loadHolidays = async (params) => {
        setLoading(true);
        try {
            const res = await api.get('holidays/', { params });
            setHolidays(res.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (tab !== 'list') return;
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (filterType !== 'all') params.type = filterType;
        if (filterMonth) params.month = filterMonth;
        if (filterYear) params.year = filterYear;
        loadHolidays(params).catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, search, filterType, filterMonth, filterYear]);

    useEffect(() => {
        if (tab !== 'calendar') return;
        const params = { month: calMonth, year: calYear };
        loadHolidays(params).catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, calMonth, calYear]);

    const sortedHolidays = useMemo(() => {
        const copy = [...holidays];
        copy.sort((a, b) => {
            if (!a.start_date || !b.start_date) return 0;
            const da = new Date(a.start_date).getTime();
            const db = new Date(b.start_date).getTime();
            return sortDir === 'asc' ? da - db : db - da;
        });
        return copy;
    }, [holidays, sortDir]);

    const holidayByDay = useMemo(() => {
        const map = new Map(); // dateString => [holidays]
        const coversDate = (h, d) => {
            const start = new Date(h.start_date);
            const end = new Date(h.end_date || h.start_date);
            const dd = new Date(d);
            dd.setHours(0, 0, 0, 0);
            const s = new Date(start);
            const e = new Date(end);
            s.setHours(0, 0, 0, 0);
            e.setHours(0, 0, 0, 0);
            return dd >= s && dd <= e;
        };

        sortedHolidays.forEach((h) => {
            if (!h.start_date) return;
            const start = parseDateOnly(h.start_date);
            const end = parseDateOnly(h.end_date || h.start_date);
            if (!start || !end) return;

            const cursor = new Date(start);
            while (cursor <= end) {
                const key = toDateKey(cursor);
                if (!map.has(key)) map.set(key, []);
                map.get(key).push(h);
                cursor.setDate(cursor.getDate() + 1);
            }
        });
        return { map, coversDate };
    }, [sortedHolidays]);

    const daysInMonth = (y, m) => new Date(y, m, 0).getDate();
    const buildCalendarCells = () => {
        const first = new Date(calYear, calMonth - 1, 1);
        // Monday=0 ... Sunday=6
        const jsDay = first.getDay(); // 0 Sunday .. 6 Saturday
        const mondayBased = (jsDay + 6) % 7;
        const totalDays = daysInMonth(calYear, calMonth);

        const cells = [];
        for (let i = 0; i < mondayBased; i++) cells.push(null);
        for (let d = 1; d <= totalDays; d++) {
            const key = toDateKey(new Date(calYear, calMonth - 1, d));
            cells.push(key);
        }
        while (cells.length % 7 !== 0) cells.push(null);
        return cells;
    };

    const calendarCells = useMemo(() => buildCalendarCells(), [calMonth, calYear]);

    const classLabel = (hc) => (hc?.applicable_classes?.length ? hc.applicable_classes.map((c) => c.name).join(', ') : 'All Classes');

    const submitHoliday = async (e) => {
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

export default AdminHolidays;
