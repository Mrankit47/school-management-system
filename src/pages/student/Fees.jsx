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

    if (loading) return <div style={{ padding: '20px', color: '#6b7280' }}>Loading fee status…</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ margin: '0 0 8px' }}>Fee Status</h1>
            <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '14px' }}>Your fees, balance, and payment history.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {feeRecords.map((f) => {
                    const overdue = f.overdue && f.status !== 'paid';
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
                                <div style={{ fontWeight: 900, marginBottom: '10px' }}>Payment history</div>
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
                        </div>
                    );
                })}
            </div>
            {feeRecords.length === 0 && <p style={{ color: '#6b7280' }}>No fee records found. Contact the office if this is unexpected.</p>}
        </div>
    );
};

export default Fees;
