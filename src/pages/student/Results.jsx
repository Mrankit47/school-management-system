import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Results = () => {
    const [results, setResults] = useState([]);

    useEffect(() => {
        api.get('academics/results/my/').then(res => setResults(res.data));
    }, []);

    const grouped = results.reduce((acc, r) => {
        if (!acc[r.exam]) acc[r.exam] = { exam_name: r.exam_name, rows: [] };
        acc[r.exam].rows.push(r);
        return acc;
    }, {});

    return (
        <div style={{ padding: '20px' }}>
            <h1>My Exam Results</h1>
            {Object.values(grouped).length === 0 ? (
                <p>No published results yet.</p>
            ) : (
                <div style={{ display: 'grid', gap: '14px' }}>
                    {Object.entries(grouped).map(([examId, data]) => {
                        const totalMax = data.rows.reduce((s, r) => s + Number(r.max_marks || 0), 0);
                        const totalObt = data.rows.reduce((s, r) => s + Number(r.marks || 0), 0);
                        const pct = totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(2) : '0.00';
                        return (
                            <div key={examId} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#fff', padding: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                                    <div style={{ fontWeight: 900 }}>{data.exam_name}</div>
                                    <div style={{ fontWeight: 800, color: '#374151' }}>
                                        Total {totalObt}/{totalMax} • {pct}%
                                    </div>
                                </div>
                                <div style={{ marginTop: '10px', overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f2f4f7' }}>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>Subject</th>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>Obtained</th>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>Max</th>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>%</th>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>Grade</th>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.rows.map((r) => (
                                                <tr key={r.id} style={{ borderTop: '1px solid #eef2f7' }}>
                                                    <td style={{ padding: '10px', fontWeight: 800 }}>{r.subject}</td>
                                                    <td style={{ padding: '10px' }}>{r.absent ? 'ABS' : r.marks}</td>
                                                    <td style={{ padding: '10px' }}>{r.max_marks}</td>
                                                    <td style={{ padding: '10px' }}>{r.percentage}</td>
                                                    <td style={{ padding: '10px' }}>{r.grade}</td>
                                                    <td style={{ padding: '10px' }}>{r.result_status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Results;
