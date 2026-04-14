import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const pageWrap = {
    padding: 24,
    maxWidth: 1200,
};

const panel = {
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
};

const StudentFinanceCards = () => {
    const [cards, setCards] = useState([]);
    const [myClass, setMyClass] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .get('fees/my/class-fee-cards/')
            .then((res) => {
                setCards(res.data?.cards || []);
                setMyClass(res.data?.student_class_name || '');
            })
            .catch(() => {
                setCards([]);
                setMyClass('');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: 24, color: '#6b7280' }}>Loading finance cards...</div>;

    const normalizeClassLabel = (value) => {
        const raw = String(value || '').trim().toLowerCase();
        if (!raw) return '';
        const numberMatch = raw.match(/\d+/);
        if (numberMatch) return numberMatch[0];
        if (raw.includes('nursery')) return 'nursery';
        if (raw === 'lkg' || raw.includes('lkg')) return 'lkg';
        if (raw === 'ukg' || raw.includes('ukg')) return 'ukg';
        return raw.replace(/\s+/g, '');
    };

    const myClassKey = normalizeClassLabel(myClass);
    const myCard = cards.find((row) => myClassKey && normalizeClassLabel(row.class_name) === myClassKey);

    return (
        <div style={pageWrap}>
            <div style={{ marginBottom: 16 }}>
                <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#0f172a' }}>Class-wise Fees Card</h1>
                <p style={{ marginTop: 8, color: '#64748b', fontSize: 14 }}>
                    View class fee details in card and table format. {myClass ? `Your class: ${myClass}` : ''}
                </p>
            </div>

            {myCard ? (
                <div
                    style={{
                        ...panel,
                        borderColor: '#bfdbfe',
                        background: 'linear-gradient(180deg, #eff6ff 0%, #f8fbff 100%)',
                        padding: 18,
                        maxWidth: 620,
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 10 }}>
                        <h3 style={{ margin: 0, fontSize: 20, color: '#0f172a' }}>{myCard.class_name}</h3>
                        <span style={{ backgroundColor: '#1d4ed8', color: '#fff', borderRadius: 999, padding: '6px 10px', fontSize: 12, fontWeight: 700 }}>
                            Your Class
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, fontSize: 14, color: '#1f2937' }}>
                        <div>Registration Fee</div>
                        <div style={{ textAlign: 'right', fontWeight: 600 }}>₹{myCard.registration_fee}</div>
                        <div>Admission Fee</div>
                        <div style={{ textAlign: 'right', fontWeight: 600 }}>₹{myCard.admission_fee}</div>
                        <div>Tuition Fee</div>
                        <div style={{ textAlign: 'right', fontWeight: 600 }}>₹{myCard.tuition_fee}</div>
                        <div>Computer Fee</div>
                        <div style={{ textAlign: 'right', fontWeight: 600 }}>₹{myCard.computer_fee}</div>
                        <div>Annual Charges</div>
                        <div style={{ textAlign: 'right', fontWeight: 600 }}>₹{myCard.annual_charges}</div>
                        <div>Science Fee</div>
                        <div style={{ textAlign: 'right', fontWeight: 600 }}>₹{myCard.science_fee}</div>
                        <div>Sports Fee</div>
                        <div style={{ textAlign: 'right', fontWeight: 600 }}>₹{myCard.sports_fee}</div>
                    </div>
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #cbd5e1', fontWeight: 800, display: 'flex', justifyContent: 'space-between', fontSize: 18, color: '#0f172a' }}>
                        <span>Total Fee</span>
                        <span>₹{myCard.total_fee}</span>
                    </div>
                </div>
            ) : (
                <div style={{ ...panel, marginTop: 14, padding: 14, color: '#6b7280', fontSize: 14 }}>
                    Your class fee card is not available yet. Please contact the admin office.
                </div>
            )}

            <div style={{ ...panel, marginTop: 18, padding: 12 }}>
                <h3 style={{ margin: '0 0 10px', color: '#111827' }}>All Fee Cards</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f3f4f6' }}>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 13 }}>Class Name</th>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 13 }}>Registration</th>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 13 }}>Admission</th>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 13 }}>Tuition</th>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 13 }}>Computer</th>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 13 }}>Annual</th>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 13 }}>Science</th>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 13 }}>Sports</th>
                                <th style={{ textAlign: 'left', padding: 10, fontSize: 13 }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cards.map((row) => (
                                <tr key={row.id} style={{ borderTop: '1px solid #eef2f7', backgroundColor: normalizeClassLabel(row.class_name) === myClassKey ? '#f8fbff' : '#fff' }}>
                                    <td style={{ padding: 10, fontWeight: 700, color: '#111827' }}>{row.class_name}</td>
                                    <td style={{ padding: 10 }}>₹{row.registration_fee}</td>
                                    <td style={{ padding: 10 }}>₹{row.admission_fee}</td>
                                    <td style={{ padding: 10 }}>₹{row.tuition_fee}</td>
                                    <td style={{ padding: 10 }}>₹{row.computer_fee}</td>
                                    <td style={{ padding: 10 }}>₹{row.annual_charges}</td>
                                    <td style={{ padding: 10 }}>₹{row.science_fee}</td>
                                    <td style={{ padding: 10 }}>₹{row.sports_fee}</td>
                                    <td style={{ padding: 10, fontWeight: 800, color: '#111827' }}>₹{row.total_fee}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {cards.length === 0 && <p style={{ color: '#6b7280', marginTop: 12 }}>Fee cards have not been uploaded yet. Please contact the admin office.</p>}
        </div>
    );
};

export default StudentFinanceCards;
