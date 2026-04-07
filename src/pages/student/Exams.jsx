import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';

function parseYmd(s) {
    if (!s) return null;
    const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
}

export default function StudentExams() {
    const [searchParams] = useSearchParams();
    const highlightId = searchParams.get('exam');
    const highlightRef = useRef(null);

    const [exams, setExams] = useState([]);
    const [schedulesById, setSchedulesById] = useState({});
    const [loadingSched, setLoadingSched] = useState({});
    const [openExamIds, setOpenExamIds] = useState({});
    const [loading, setLoading] = useState(true);

    const loadSchedule = async (examId) => {
        setLoadingSched((prev) => ({ ...prev, [examId]: true }));
        try {
            const res = await api.get(`academics/exams/${examId}/schedule/`);
            setSchedulesById((prev) => ({ ...prev, [examId]: res.data || [] }));
        } catch {
            setSchedulesById((prev) => ({ ...prev, [examId]: [] }));
        } finally {
            setLoadingSched((prev) => ({ ...prev, [examId]: false }));
        }
    };

    useEffect(() => {
        api.get('academics/exams/')
            .then((res) => {
                const list = res.data || [];
                const sorted = [...list].sort((a, b) => {
                    const da = parseYmd(a.start_date || a.date);
                    const db = parseYmd(b.start_date || b.date);
                    if (!da && !db) return 0;
                    if (!da) return 1;
                    if (!db) return -1;
                    return da - db;
                });
                setExams(sorted);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!highlightId || !exams.length) return;
        const id = Number(highlightId);
        if (!Number.isFinite(id)) return;
        setOpenExamIds((prev) => ({ ...prev, [id]: true }));
        loadSchedule(id);
    }, [highlightId, exams]);

    useEffect(() => {
        if (highlightId && highlightRef.current) {
            highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightId, exams, schedulesById]);

    const today = useMemo(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }, []);

    const statusChip = (exam) => {
        const start = parseYmd(exam.start_date || exam.date);
        const end = parseYmd(exam.end_date || exam.start_date || exam.date);
        if (start && end) {
            if (today < start) return { label: 'Upcoming', cls: 'bg-blue-100 text-blue-800' };
            if (today > end) return { label: 'Finished', cls: 'bg-gray-100 text-gray-700' };
            return { label: 'Ongoing', cls: 'bg-amber-100 text-amber-900' };
        }
        return { label: exam.status || '—', cls: 'bg-slate-100 text-slate-700' };
    };

    if (loading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">Loading exams…</div>
        );
    }

    if (!exams.length) {
        return (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
                <div className="text-3xl">📅</div>
                <h1 className="mt-2 text-lg font-bold text-gray-900">No exams for your class</h1>
                <p className="mt-1 text-sm text-gray-600">When your school schedules exams, they will appear here.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-4 pb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Exams</h1>
                <p className="mt-1 text-sm text-gray-600">Upcoming and ongoing exams for your class — open a card to see subject-wise dates.</p>
            </div>

            <div className="space-y-3">
                {exams.map((e) => {
                    const chip = statusChip(e);
                    const isHi = highlightId && String(e.id) === String(highlightId);
                    return (
                        <div
                            key={e.id}
                            ref={isHi ? highlightRef : null}
                            className={`rounded-2xl border bg-white p-4 shadow-sm transition-shadow ${
                                isHi ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200 hover:shadow-md'
                            }`}
                        >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-semibold text-gray-900">{e.name}</h2>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${chip.cls}`}>{chip.label}</span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">
                                        <span className="font-semibold text-gray-800">{e.exam_type}</span>
                                        {e.class_section_display ? ` · ${e.class_section_display}` : null}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {e.start_date && e.end_date ? (
                                            <>
                                                <span className="font-medium">Dates:</span> {e.start_date} → {e.end_date}
                                            </>
                                        ) : (
                                            <span>{e.start_date || e.date || '—'}</span>
                                        )}
                                    </p>
                                    {e.description ? <p className="mt-2 text-sm text-gray-500">{e.description}</p> : null}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = !openExamIds[e.id];
                                        setOpenExamIds((prev) => ({ ...prev, [e.id]: next }));
                                        if (next) loadSchedule(e.id);
                                    }}
                                    className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    {openExamIds[e.id] ? 'Hide timetable' : 'Show timetable'}
                                </button>
                            </div>

                            {openExamIds[e.id] ? (
                                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                    {loadingSched[e.id] ? (
                                        <p className="text-sm text-gray-500">Loading schedule…</p>
                                    ) : (schedulesById[e.id] || []).length === 0 ? (
                                        <p className="text-sm text-gray-500">No subject slots added yet.</p>
                                    ) : (
                                        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
                                            {(schedulesById[e.id] || []).map((row) => (
                                                <li key={row.id} className="flex flex-col gap-1 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                                                    <span className="font-semibold text-gray-900">{row.subject}</span>
                                                    <span className="text-gray-600">
                                                        {row.exam_date} · {row.start_time?.slice?.(0, 5) || row.start_time} –{' '}
                                                        {row.end_time?.slice?.(0, 5) || row.end_time}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
