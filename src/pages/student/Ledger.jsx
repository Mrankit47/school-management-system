import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const card = {
    backgroundColor: '#fff',
    borderRadius: '14px',
    border: '1px solid #e5e7eb',
    padding: '18px',
    boxShadow: '0 1px 6px rgba(16,24,40,0.06)',
};

const toNum = (v) => {
    const n = Number(v || 0);
    return Number.isFinite(n) ? n : 0;
};

const formatINR = (n) => `₹${toNum(n).toFixed(2)}`;

const toIsoDate = (d) => {
    if (!d) return '';
    const m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${m[1]}-${m[2]}-${m[3]}` : '';
};

const StudentLedger = () => {
    const [feeRecords, setFeeRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [monthFilter, setMonthFilter] = useState('');

    useEffect(() => {
        api
            .get('fees/my/')
            .then((res) => setFeeRecords(res.data || []))
            .catch(() => setFeeRecords([]))
            .finally(() => setLoading(false));
    }, []);

    const ledgerRows = useMemo(() => {
        const rows = [];

        (feeRecords || []).forEach((record) => {
            const feeDate = toIsoDate(record.due_date) || '';
            const breakdown = record.fee_breakdown || {};

            // IMPORTANT: tuition_fees intentionally excluded as requested.
            const admissionFees = toNum(breakdown.admission_fees || 0);
            const examFees = toNum(breakdown.exam_fees || 0);
            const activitiesFees = toNum(breakdown.other_charges || breakdown.activities_fees || 0);

            if (admissionFees > 0) {
                rows.push({
                    date: feeDate,
                    description: 'Admission Fees',
                    debit: admissionFees,
                    credit: 0,
                    paymentMode: '-',
                    receiptNumber: '-',
                    paymentId: null,
                    classDisplay: record.class_display || '',
                });
            }
            if (examFees > 0) {
                rows.push({
                    date: feeDate,
                    description: 'Exam Fees',
                    debit: examFees,
                    credit: 0,
                    paymentMode: '-',
                    receiptNumber: '-',
                    paymentId: null,
                    classDisplay: record.class_display || '',
                });
            }
            if (activitiesFees > 0) {
                rows.push({
                    date: feeDate,
                    description: 'Activities Fees',
                    debit: activitiesFees,
                    credit: 0,
                    paymentMode: '-',
                    receiptNumber: '-',
                    paymentId: null,
                    classDisplay: record.class_display || '',
                });
            }

            (record.payments || []).forEach((p) => {
                rows.push({
                    date: toIsoDate(p.payment_date),
                    description: 'Payment',
                    debit: 0,
                    credit: toNum(p.amount),
                    paymentMode: p.payment_mode || '-',
                    receiptNumber: `RCPT-${p.id}`,
                    paymentId: p.id,
                    classDisplay: record.class_display || '',
                });
            });
        });

        const sorted = rows.sort((a, b) => {
            const d = String(a.date).localeCompare(String(b.date));
            if (d !== 0) return d;
            return a.description === 'Payment' ? 1 : -1;
        });

        let running = 0;
        return sorted.map((r) => {
            running += toNum(r.debit) - toNum(r.credit);
            return { ...r, balance: running };
        });
    }, [feeRecords]);

    const filteredRows = useMemo(() => {
        return ledgerRows.filter((r) => {
            if (fromDate && r.date && r.date < fromDate) return false;
            if (toDate && r.date && r.date > toDate) return false;
            if (monthFilter && r.date) {
                const rowMonth = r.date.slice(0, 7);
                if (rowMonth !== monthFilter) return false;
            }
            return true;
        });
    }, [ledgerRows, fromDate, toDate, monthFilter]);

    const summary = useMemo(() => {
        const totalFees = filteredRows.reduce((sum, r) => sum + toNum(r.debit), 0);
        const totalPaid = filteredRows.reduce((sum, r) => sum + toNum(r.credit), 0);
        const remaining = Math.max(totalFees - totalPaid, 0);
        return { totalFees, totalPaid, remaining };
    }, [filteredRows]);

    const downloadReceipt = async (paymentId) => {
        if (!paymentId) return;
        try {
            const res = await api.get(`fees/my/receipt/${paymentId}/`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `fee_receipt_${paymentId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (_) {
            alert('Could not download receipt.');
        }
    };

    if (loading) return <div style={{ padding: 20, color: '#6b7280' }}>Loading ledger...</div>;

    return (
        <div style={{ padding: 20 }}>
            <h1 style={{ margin: '0 0 8px' }}>Student Ledger</h1>
            <p style={{ margin: '0 0 14px', color: '#6b7280', fontSize: 14 }}>
                Admission, Exam and Activities fees with payment history and running balance.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 14 }}>
                <div style={card}>
                    <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 800, textTransform: 'uppercase' }}>Total Fees</div>
                    <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900 }}>{formatINR(summary.totalFees)}</div>
                </div>
                <div style={card}>
                    <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 800, textTransform: 'uppercase' }}>Total Paid</div>
                    <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900, color: '#166534' }}>{formatINR(summary.totalPaid)}</div>
                </div>
                <div style={{ ...card, borderColor: summary.remaining > 0 ? '#fecaca' : '#bbf7d0', backgroundColor: summary.remaining > 0 ? '#fff7ed' : '#f0fdf4' }}>
                    <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 800, textTransform: 'uppercase' }}>Remaining Balance</div>
                    <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900, color: summary.remaining > 0 ? '#b91c1c' : '#166534' }}>{formatINR(summary.remaining)}</div>
                </div>
            </div>

            <div style={{ ...card, marginBottom: 14, padding: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                <div>
                    <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 800, marginBottom: 4 }}>From Date</div>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ width: '100%', padding: '9px 10px', border: '1px solid #e5e7eb', borderRadius: 10 }} />
                </div>
                <div>
                    <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 800, marginBottom: 4 }}>To Date</div>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ width: '100%', padding: '9px 10px', border: '1px solid #e5e7eb', borderRadius: 10 }} />
                </div>
                <div>
                    <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 800, marginBottom: 4 }}>Month</div>
                    <input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={{ width: '100%', padding: '9px 10px', border: '1px solid #e5e7eb', borderRadius: 10 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'end' }}>
                    <button
                        type="button"
                        onClick={() => {
                            setFromDate('');
                            setToDate('');
                            setMonthFilter('');
                        }}
                        style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid #e5e7eb', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 800 }}
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1050 }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#6b7280' }}>Date</th>
                            <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#6b7280' }}>Description</th>
                            <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#6b7280' }}>Debit</th>
                            <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#6b7280' }}>Credit</th>
                            <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#6b7280' }}>Balance</th>
                            <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#6b7280' }}>Payment Mode</th>
                            <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#6b7280' }}>Receipt Number</th>
                            <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#6b7280' }}>Receipt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ padding: 12, color: '#6b7280' }}>
                                    No ledger entries found for selected filter.
                                </td>
                            </tr>
                        ) : (
                            filteredRows.map((r, idx) => (
                                <tr key={`${r.date}-${r.description}-${idx}`} style={{ borderTop: '1px solid #eef2f7' }}>
                                    <td style={{ padding: 10 }}>{r.date || '-'}</td>
                                    <td style={{ padding: 10, fontWeight: r.description === 'Payment' ? 700 : 900 }}>{r.description}</td>
                                    <td style={{ padding: 10, color: r.debit > 0 ? '#b91c1c' : '#6b7280', fontWeight: 800 }}>{r.debit > 0 ? formatINR(r.debit) : '-'}</td>
                                    <td style={{ padding: 10, color: r.credit > 0 ? '#166534' : '#6b7280', fontWeight: 800 }}>{r.credit > 0 ? formatINR(r.credit) : '-'}</td>
                                    <td style={{ padding: 10, color: r.balance > 0 ? '#b91c1c' : '#166534', fontWeight: 900 }}>{formatINR(r.balance)}</td>
                                    <td style={{ padding: 10 }}>{r.paymentMode}</td>
                                    <td style={{ padding: 10 }}>{r.receiptNumber}</td>
                                    <td style={{ padding: 10 }}>
                                        {r.paymentId ? (
                                            <button
                                                type="button"
                                                onClick={() => downloadReceipt(r.paymentId)}
                                                style={{ padding: '6px 10px', borderRadius: 8, border: 'none', backgroundColor: '#6d28d9', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                                            >
                                                Download Receipt
                                            </button>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentLedger;

