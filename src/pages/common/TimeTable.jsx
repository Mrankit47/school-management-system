import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import authService from '../../services/authService';
import {
    Calendar,
    Clock,
    MapPin,
    User as UserIcon,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Plus,
    Edit2,
    Trash2,
    X,
    Save,
    Filter
} from 'lucide-react';

const DAYS = [
    { id: 1, name: 'Monday', short: 'Mon' },
    { id: 2, name: 'Tuesday', short: 'Tue' },
    { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' },
    { id: 5, name: 'Friday', short: 'Fri' },
    { id: 6, name: 'Saturday', short: 'Sat' },
];

const PERIODS = [
    { id: 1, time: '08:00 AM - 09:00 AM', start: '08:00', end: '09:00' },
    { id: 2, time: '09:00 AM - 10:00 AM', start: '09:00', end: '10:00' },
    { id: 3, time: '10:00 AM - 11:00 AM', start: '10:00', end: '11:00' },
    { id: 'lunch', time: '11:00 AM - 12:00 PM', name: 'LUNCH BREAK' },
    { id: 4, time: '12:00 PM - 01:00 PM', start: '12:00', end: '13:00' },
    { id: 5, time: '01:00 PM - 02:00 PM', start: '13:00', end: '14:00' },
    { id: 6, time: '02:00 PM - 03:00 PM', start: '14:00', end: '15:00' },
];

const TimetableGrid = ({ entries, isAdmin, isEditMode, handleCellClick }) => {
    const currentDayNum = new Date().getDay();
    const adjustedCurrentDay = currentDayNum === 0 ? 7 : currentDayNum;

    const gridData = useMemo(() => {
        const data = {};
        DAYS.forEach(day => {
            data[day.id] = entries.filter(e => e.day === day.id);
        });
        return data;
    }, [entries]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <div className="min-w-[1000px]">
                    {/* Grid Header */}
                    <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                        <div className="p-4 text-center border-r border-slate-100 bg-slate-100/30">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Period</span>
                        </div>
                        {DAYS.map(day => (
                            <div
                                key={day.id}
                                className={`p-4 text-center border-r border-slate-100 last:border-0 ${day.id === adjustedCurrentDay ? 'bg-school-blue/5' : ''
                                    }`}
                            >
                                <span className={`text-xs font-bold uppercase tracking-wider ${day.id === adjustedCurrentDay ? 'text-school-blue' : 'text-slate-500'
                                    }`}>
                                    {day.name}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Grid Body */}
                    <div className="relative">
                        {PERIODS.map((period) => {
                            if (period.id === 'lunch') {
                                return (
                                    <div key="lunch" className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80">
                                        <div className="p-3 border-r border-slate-100 flex items-center justify-center bg-slate-100/50">
                                            <span className="text-[10px] font-bold text-slate-400">11:00 AM</span>
                                        </div>
                                        <div className="col-span-6 p-3 flex items-center justify-center gap-3">
                                            <div className="h-px bg-slate-200 flex-1"></div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{period.name} ({period.time})</span>
                                            <div className="h-px bg-slate-200 flex-1"></div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={period.id} className="grid grid-cols-7 border-b border-slate-100 last:border-0">
                                    <div className="p-4 flex flex-col items-center justify-center border-r border-slate-100 bg-slate-50/30">
                                        <span className="text-[10px] font-black text-slate-400">P{period.id}</span>
                                        <span className="text-[9px] font-bold text-slate-500 mt-1 whitespace-nowrap">{period.time.split(' - ')[0]}</span>
                                    </div>

                                    {DAYS.map(day => {
                                        const entry = gridData[day.id]?.find(e => e.period === period.id);
                                        return (
                                            <div
                                                key={`${day.id}-${period.id}`}
                                                onClick={() => handleCellClick(day.id, period.id)}
                                                className={`p-2 border-r border-slate-100 last:border-0 relative h-[100px] transition-all ${isEditMode ? 'cursor-pointer hover:bg-blue-50/50' : ''
                                                    } ${day.id === adjustedCurrentDay ? 'bg-school-blue/[0.01]' : ''}`}
                                            >
                                                {entry ? (
                                                    <div className="h-full w-full p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[9px] font-black text-school-blue uppercase tracking-tight truncate">
                                                                {entry.subject}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-700 truncate">
                                                                {entry.class_name}-{entry.section}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-slate-50">
                                                            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-medium">
                                                                <UserIcon className="w-2.5 h-2.5 text-slate-400" />
                                                                <span className="truncate">{entry.teacher_name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-medium">
                                                                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                                                <span>RM: {entry.room}</span>
                                                            </div>
                                                        </div>
                                                        {isEditMode && isAdmin && (
                                                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="p-1 bg-school-blue text-white rounded-md shadow-sm">
                                                                    <Edit2 className="w-2 h-2" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    isEditMode && isAdmin && (
                                                        <div className="h-full w-full rounded-xl border border-dashed border-slate-200 flex items-center justify-center group/add opacity-40 hover:opacity-100 hover:border-school-blue hover:bg-school-blue/[0.02] transition-all">
                                                            <Plus className="w-5 h-5 text-slate-300 group-hover/add:text-school-blue transition-colors" />
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TimeTable = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Admin Filters State
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [filters, setFilters] = useState({ class_name: '', section: '' });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    // Meta Data State
    const [teachers, setTeachers] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const { role } = authService.getCurrentUser();
    const isAdmin = role === 'admin';
    const isTeacher = role === 'teacher';

    useEffect(() => {
        if (!isAdmin) {
            fetchTimetable();
        }
        if (isAdmin) {
            fetchMetaData();
        }
    }, [isAdmin]);

    useEffect(() => {
        if (isAdmin && filters.class_name && filters.section) {
            fetchTimetable();
        } else if (isAdmin) {
            setEntries([]);
        }
    }, [filters, isAdmin]);

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            let url = 'timetable/';
            if (isAdmin && filters.class_name && filters.section) {
                url += `?class_name=${filters.class_name}&section=${filters.section}`;
            }
            const response = await api.get(url);
            setEntries(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching timetable:', err);
            setError('Failed to load timetable.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMetaData = async () => {
        try {
            const [tRes, sRes, subRes] = await Promise.all([
                api.get('teachers/'),
                api.get('classes/admin-sections/'),
                api.get('subjects/')
            ]);
            setTeachers(tRes.data || []);
            setSections(sRes.data || []);
            setSubjects(subRes.data || []);
        } catch (err) {
            console.error('Error fetching meta data:', err);
        }
    };

    const handleAdminFilterChange = (e) => {
        const sectionId = e.target.value;
        setSelectedSectionId(sectionId);
        const section = sections.find(s => s.id === parseInt(sectionId));
        if (section) {
            setFilters({ class_name: section.class_name, section: section.section_name });
        } else {
            setFilters({ class_name: '', section: '' });
        }
    };

    const handleCellClick = (dayId, periodId) => {
        if (!isAdmin || !isEditMode || periodId === 'lunch') return;

        const existing = entries.find(e => e.day === dayId && e.period === periodId);
        if (existing) {
            openModal(existing);
        } else {
            openModal({
                day: dayId,
                period: periodId,
                class_name: filters.class_name,
                section: filters.section
            });
        }
    };

    const openModal = (entry = null) => {
        setEditingEntry(entry);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEntry(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;
        try {
            await api.delete(`timetable/${id}/`);
            fetchTimetable();
            closeModal();
        } catch (err) {
            alert('Failed to delete entry');
        }
    };

    // Grouping for teacher view
    const teacherGroups = useMemo(() => {
        if (!isTeacher || entries.length === 0) return null;
        const groups = {};
        entries.forEach(entry => {
            const key = `${entry.class_name}-${entry.section}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(entry);
        });
        return groups;
    }, [entries, isTeacher]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-school-blue/10 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-school-blue" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Time Table</h1>
                        <p className="text-slate-500 font-medium text-sm">Weekly School Schedule</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Filter className="w-4 h-4 text-slate-400" />
                                </div>
                                <select
                                    value={selectedSectionId}
                                    onChange={handleAdminFilterChange}
                                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:border-school-blue focus:ring-4 focus:ring-school-blue/5 transition-all appearance-none min-w-[200px]"
                                >
                                    <option value="">-- Choose Class-Section --</option>
                                    {sections.map(s => (
                                        <option key={s.id} value={s.id}>{s.class_name} - {s.section_name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => setIsEditMode(!isEditMode)}
                                disabled={!filters.class_name}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-bold text-sm ${isEditMode
                                        ? 'bg-school-blue text-white border-school-blue shadow-lg shadow-school-blue/20'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-school-blue hover:text-school-blue'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <Edit2 className="w-4 h-4" />
                                {isEditMode ? 'Finish Editing' : 'Edit Mode'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Display Logic */}
            {isAdmin && !filters.class_name ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Filter className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">Select a Class & Section</h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">Please use the filters above to view and manage class schedules.</p>
                </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center h-[40vh] gap-4">
                    <Loader2 className="w-10 h-10 text-school-blue animate-spin" />
                    <p className="text-slate-500 font-medium">Loading schedule...</p>
                </div>
            ) : isTeacher ? (
                <div className="space-y-12">
                    {teacherGroups ? Object.keys(teacherGroups).map(key => (
                        <div key={key} className="space-y-4">
                            <div className="flex items-center gap-3 pl-2">
                                <MapPin className="w-5 h-5 text-school-blue" />
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Class {key}</h2>
                            </div>
                            <TimetableGrid
                                entries={teacherGroups[key]}
                                isAdmin={false}
                                isEditMode={false}
                                handleCellClick={() => { }}
                            />
                        </div>
                    )) : (
                        <div className="text-center py-20 bg-slate-50 rounded-3xl">
                            <p className="text-slate-400 font-medium">No classes assigned to you.</p>
                        </div>
                    )}
                </div>
            ) : (
                <TimetableGrid
                    entries={entries}
                    isAdmin={isAdmin}
                    isEditMode={isEditMode}
                    handleCellClick={handleCellClick}
                />
            )}

            {/* Admin Edit Modal */}
            {isModalOpen && (
                <AdminModal
                    entry={editingEntry}
                    onClose={closeModal}
                    onSuccess={() => { fetchTimetable(); closeModal(); }}
                    onDelete={handleDelete}
                    meta={{ teachers, sections, subjects }}
                />
            )}
        </div>
    );
};

const AdminModal = ({ entry, onClose, onSuccess, onDelete, meta }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        class_name: entry?.class_name || '',
        section: entry?.section || '',
        subject: entry?.subject || '',
        teacher: entry?.teacher || '',
        day: entry?.day || 1,
        period: entry?.period || 1,
        room: entry?.room || ''
    });

    const handleSectionChange = (e) => {
        const sectionId = e.target.value;
        const section = meta.sections.find(s => s.id === parseInt(sectionId));
        if (section) {
            setFormData({
                ...formData,
                class_name: section.class_name,
                section: section.section_name,
                room: section.room_number || formData.room
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (entry?.id) {
                await api.put(`timetable/${entry.id}/`, formData);
            } else {
                await api.post('timetable/', formData);
            }
            onSuccess();
        } catch (err) {
            console.error('Save error:', err.response?.data);
            const data = err.response?.data;
            let errorMsg = 'Failed to save entry.';

            if (data) {
                if (typeof data === 'string') {
                    errorMsg = data;
                } else if (Array.isArray(data)) {
                    errorMsg = data[0];
                } else if (data.non_field_errors) {
                    errorMsg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
                } else if (data.detail) {
                    errorMsg = data.detail;
                } else {
                    const fields = Object.keys(data);
                    if (fields.length > 0) {
                        const firstError = data[fields[0]];
                        errorMsg = Array.isArray(firstError) ? `${fields[0]}: ${firstError[0]}` : `${fields[0]}: ${firstError}`;
                    }
                }
            }
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const isNew = !entry?.id;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800">
                        {isNew ? 'New Entry' : 'Edit Entry'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Day</label>
                            <select
                                value={formData.day}
                                onChange={e => setFormData({ ...formData, day: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-school-blue focus:ring-2 focus:ring-school-blue/10 transition-all"
                            >
                                {DAYS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Period</label>
                            <select
                                value={formData.period}
                                onChange={e => setFormData({ ...formData, period: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-school-blue focus:ring-2 focus:ring-school-blue/10 transition-all"
                            >
                                {PERIODS.filter(p => typeof p.id === 'number').map(p => (
                                    <option key={p.id} value={p.id}>Period {p.id} ({p.time.split(' - ')[0]})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Class & Section</label>
                        <select
                            onChange={handleSectionChange}
                            value={meta.sections.find(s => s.class_name === formData.class_name && s.section_name === formData.section)?.id || ''}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-school-blue focus:ring-2 focus:ring-school-blue/10 transition-all"
                            required
                        >
                            <option value="">-- Choose Class-Section --</option>
                            {meta.sections.map(s => (
                                <option key={s.id} value={s.id}>{s.class_name} - {s.section_name}</option>
                            ))}
                        </select>
                        {formData.class_name && (
                            <div className="flex gap-2 mt-2">
                                <span className="px-2 py-1 bg-blue-50 text-school-blue text-[10px] font-black rounded-lg border border-blue-100 uppercase">Class: {formData.class_name}</span>
                                <span className="px-2 py-1 bg-blue-50 text-school-blue text-[10px] font-black rounded-lg border border-blue-100 uppercase">Section: {formData.section}</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Subject</label>
                            <input
                                list="subject-options"
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-school-blue focus:ring-2 focus:ring-school-blue/10 transition-all"
                                placeholder="Maths, Science..."
                                required
                            />
                            <datalist id="subject-options">
                                {meta.subjects.map(s => <option key={s.id} value={s.name} />)}
                            </datalist>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Room</label>
                            <input
                                type="text"
                                value={formData.room}
                                onChange={e => setFormData({ ...formData, room: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-school-blue focus:ring-2 focus:ring-school-blue/10 transition-all"
                                placeholder="101, Lab A"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Teacher</label>
                        <select
                            value={formData.teacher}
                            onChange={e => setFormData({ ...formData, teacher: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-school-blue focus:ring-2 focus:ring-school-blue/10 transition-all"
                            required
                        >
                            <option value="">-- Assign Teacher --</option>
                            {meta.teachers.map(t => <option key={t.user_id} value={t.user_id}>{t.name} ({t.employee_id})</option>
                            )}
                        </select>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-school-blue text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-school-blue/20 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isNew ? 'Create Entry' : 'Save Changes'}
                        </button>

                        {!isNew && (
                            <button
                                type="button"
                                onClick={() => onDelete(entry.id)}
                                className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Entry
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TimeTable;