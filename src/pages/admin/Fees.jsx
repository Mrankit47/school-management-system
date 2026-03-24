import React, { useState } from 'react';
import api from '../../services/api';

const AdminFees = () => {
    const [feeId, setFeeId] = useState('');

    const handleMarkPaid = async () => {
        try {
            await api.post(`fees/admin/pay/${feeId}/`);
            alert('Fee marked as paid!');
        } catch (err) {
            alert('Error updating fee.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Finance Management</h1>
            <div style={{ border: '1px solid #ddd', padding: '20px', maxWidth: '400px' }}>
                <h3>Collect Fee</h3>
                <input type="number" placeholder="Student Fee ID" value={feeId} onChange={e => setFeeId(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                <button onClick={handleMarkPaid} style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none' }}>Mark as Paid</button>
            </div>
        </div>
    );
};

export default AdminFees;
