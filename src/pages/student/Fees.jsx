import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Fees = () => {
    const [fees, setFees] = useState([]);

    useEffect(() => {
        api.get('fees/my/').then(res => setFees(res.data));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Fee Status</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {fees.map(f => (
                    <div key={f.id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '10px', backgroundColor: f.status === 'paid' ? '#e9f5e9' : '#fff5f5' }}>
                        <h3>Fee Detail</h3>
                        <p><strong>Status:</strong> <span style={{ color: f.status === 'paid' ? 'green' : 'red', fontWeight: 'bold' }}>{f.status.toUpperCase()}</span></p>
                        <p><strong>Due Date:</strong> {f.due_date}</p>
                        <p><strong>Paid Amount:</strong> ₹{f.amount_paid}</p>
                    </div>
                ))}
            </div>
            {fees.length === 0 && <p>No fee records found.</p>}
        </div>
    );
};

export default Fees;
