import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const card = {
    backgroundColor: '#fff',
    borderRadius: '14px',
    border: '1px solid #e5e7eb',
    padding: '18px',
    boxShadow: '0 1px 6px rgba(16,24,40,0.06)',
};

const Fees = () => {
    const [feeRecords, setFeeRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .get('fees/my/')
            .then((res) => setFeeRecords(res.data || []))
            .catch(() => setFeeRecords([]))
            .finally(() => setLoading(false));
    }, []);

    const downloadReceipt = async (paymentId) => {
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

    const downloadLedgerCsv = (record) => {
        const rows = [];
        rows.push(['Date', 'Particulars', 'Debit', 'Credit', 'Balance']);

        const payments = (record.payments || [])
            .slice()
            .sort((a, b) => String(a.payment_date || '').localeCompare(String(b.payment_date || '')));

        const totalFees = Number(record.total_fees || 0);
        let runningPaid = 0;

        rows.push([record.due_date || '', 'Fee Charged', String(record.total_fees || 0), '', String(record.total_fees || 0)]);

        payments.forEach((p) => {
            const credit = Number(p.amount || 0);
            runningPaid += credit;
            const balance = Math.max(totalFees - runningPaid, 0);
            rows.push([p.payment_date || '', `Payment (${p.payment_mode || ''})`, '', String(p.amount || 0), balance.toFixed(2)]);
        });

        const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `student_ledger_${record.id}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) return <div style={{ padding: '20px', color: '#6b7280' }}>Loading fee status…</div>;

    const totals = (feeRecords || []).reduce(
        (acc, r) => {
            acc.total += Number(r.total_fees || 0);
            acc.paid += Number(r.amount_paid || 0);
            acc.due += Number(r.due_amount || 0);
            if (r.overdue && r.status !== 'paid') acc.overdueCount += 1;
            return acc;
        },
        { total: 0, paid: 0, due: 0, overdueCount: 0 }
    );

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ margin: '0 0 8px' }}>Fee Status</h1>
            <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '14px' }}>Your fees, balance, and payment history.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div style={card}>
                    <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 800, textTransform: 'uppercase' }}>Total Fees</div>
                    <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900 }}>₹{totals.total.toFixed(2)}</div>
                </div>
                <div style={card}>
                    <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 800, textTransform: 'uppercase' }}>Total Paid</div>
                    <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900, color: '#166534' }}>₹{totals.paid.toFixed(2)}</div>
                </div>
                <div style={card}>
                    <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 800, textTransform: 'uppercase' }}>Total Due</div>
                    <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900, color: '#b45309' }}>₹{totals.due.toFixed(2)}</div>
                </div>
                <div style={{ ...card, borderColor: totals.overdueCount > 0 ? '#fecaca' : '#e5e7eb', backgroundColor: totals.overdueCount > 0 ? '#fff7ed' : '#fff' }}>
                    <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 800, textTransform: 'uppercase' }}>Overdue Records</div>
                    <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900, color: totals.overdueCount > 0 ? '#b91c1c' : '#111827' }}>{totals.overdueCount}</div>
                </div>
            </div>

            {totals.overdueCount > 0 ? (
                <div style={{ marginBottom: '16px', border: '1px solid #fecaca', backgroundColor: '#fff7ed', color: '#991b1b', borderRadius: 12, padding: '10px 12px', fontWeight: 900 }}>
                    You have overdue fee record(s). Please contact the office or pay as soon as possible.
                </div>
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {feeRecords.map((f) => {
                    const overdue = f.overdue && f.status !== 'paid';
                    const ledgerRows = (f.payments || []).slice().sort((a, b) => String(a.payment_date || '').localeCompare(String(b.payment_date || '')));
                    let runningPaid = 0;
                    const totalFees = Number(f.total_fees || 0);
                    return (
                        <div key={f.id} style={{ ...card, borderColor: overdue ? '#fecaca' : '#e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                                <div>
                                    <h2 style={{ margin: '0 0 6px', fontSize: '18px' }}>Fee record #{f.id}</h2>
                                    <div style={{ color: '#6b7280', fontSize: '13px' }}>{f.class_display}</div>
                                </div>
                                <span
                                    style={{
                                        display: 'inline-block',
                                        padding: '6px 12px',
                                        borderRadius: '999px',
                                        fontSize: '12px',
                                        fontWeight: 900,
                                        backgroundColor: f.status === 'paid' ? '#dcfce7' : f.status === 'partial' ? '#fef9c3' : '#fee2e2',
                                        color: f.status === 'paid' ? '#166534' : f.status === 'partial' ? '#854d0e' : '#991b1b',
                                    }}
                                >
                                    {f.status?.toUpperCase()}
                                    {overdue ? ' · OVERDUE' : ''}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 800, textTransform: 'uppercase' }}>Total fees</div>
                                    <div style={{ fontSize: '18px', fontWeight: 900 }}>₹{f.total_fees}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 800, textTransform: 'uppercase' }}>Paid</div>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#166534' }}>₹{f.amount_paid}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 800, textTransform: 'uppercase' }}>Due</div>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#b45309' }}>₹{f.due_amount}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 800, textTransform: 'uppercase' }}>Due date</div>
                                    <div style={{ fontSize: '16px', fontWeight: 800 }}>{f.due_date}</div>
                                </div>
                            </div>

                            {f.fee_breakdown && (
                                <div style={{ marginTop: '12px', fontSize: '12px', color: '#4b5563' }}>
                                    Tuition ₹{f.fee_breakdown.tuition_fees} · Exam ₹{f.fee_breakdown.exam_fees} · Other ₹{f.fee_breakdown.other_charges}
                                </div>
                            )}

                            <div style={{ marginTop: '18px' }}>
                                <div style={{ fontWeight: 900, marginBottom: '10px' }}>Fees Receipt</div>
                                {(f.payments || []).length === 0 ? (
                                    <p style={{ color: '#6b7280', margin: 0 }}>No payments yet.</p>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f2f4f7' }}>
                                                    <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                                                    <th style={{ padding: '8px', textAlign: 'left' }}>Amount</th>
                                                    <th style={{ padding: '8px', textAlign: 'left' }}>Mode</th>
                                                    <th style={{ padding: '8px', textAlign: 'left' }}>Txn</th>
                                                    <th style={{ padding: '8px', textAlign: 'left' }}>Receipt</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(f.payments || []).map((p) => (
                                                    <tr key={p.id} style={{ borderTop: '1px solid #eef2f7' }}>
                                                        <td style={{ padding: '8px' }}>{p.payment_date}</td>
                                                        <td style={{ padding: '8px', fontWeight: 800 }}>₹{p.amount}</td>
                                                        <td style={{ padding: '8px' }}>{p.payment_mode}</td>
                                                        <td style={{ padding: '8px' }}>{p.transaction_id || '—'}</td>
                                                        <td style={{ padding: '8px' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => downloadReceipt(p.id)}
                                                                style={{
                                                                    padding: '6px 10px',
                                                                    borderRadius: '8px',
                                                                    border: 'none',
                                                                    backgroundColor: '#6d28d9',
                                                                    color: '#fff',
                                                                    fontWeight: 800,
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                PDF
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '18px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: '10px' }}>
                                    <div style={{ fontWeight: 900 }}>Student Ledger</div>
                                    <button
                                        type="button"
                                        onClick={() => downloadLedgerCsv(f)}
                                        style={{
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                            backgroundColor: '#fff',
                                            color: '#111827',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Export CSV
                                    </button>
                                </div>
                                {ledgerRows.length === 0 ? (
                                    <p style={{ color: '#6b7280', margin: 0 }}>No ledger entries yet.</p>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f2f4f7' }}>
                                                    <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                                                    <th style={{ padding: '8px', textAlign: 'left' }}>Particulars</th>
                                                    <th style={{ padding: '8px', textAlign: 'left' }}>Debit</th>
                                                    <th style={{ padding: '8px', textAlign: 'left' }}>Credit</th>
                                                    <th style={{ padding: '8px', textAlign: 'left' }}>Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{ borderTop: '1px solid #eef2f7' }}>
                                                    <td style={{ padding: '8px' }}>{f.due_date || '—'}</td>
                                                    <td style={{ padding: '8px', fontWeight: 800 }}>Fee Charged</td>
                                                    <td style={{ padding: '8px', fontWeight: 800 }}>₹{f.total_fees}</td>
                                                    <td style={{ padding: '8px' }}>—</td>
                                                    <td style={{ padding: '8px', fontWeight: 900 }}>₹{f.total_fees}</td>
                                                </tr>
                                                {ledgerRows.map((p) => {
                                                    const credit = Number(p.amount || 0);
                                                    runningPaid += credit;
                                                    const balance = Math.max(totalFees - runningPaid, 0);
                                                    return (
                                                        <tr key={`ledger-${p.id}`} style={{ borderTop: '1px solid #eef2f7' }}>
                                                            <td style={{ padding: '8px' }}>{p.payment_date}</td>
                                                            <td style={{ padding: '8px' }}>Payment ({p.payment_mode})</td>
                                                            <td style={{ padding: '8px' }}>—</td>
                                                            <td style={{ padding: '8px', fontWeight: 800, color: '#166534' }}>₹{p.amount}</td>
                                                            <td style={{ padding: '8px', fontWeight: 900 }}>₹{balance.toFixed(2)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {feeRecords.length === 0 && <p style={{ color: '#6b7280' }}>No fee records found. Contact the office if this is unexpected.</p>}
        </div>
    );
};

export default Fees;