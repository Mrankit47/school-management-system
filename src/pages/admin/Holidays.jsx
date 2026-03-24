import React, { useState } from 'react';
import api from '../../services/api';

const Holidays = () => {
    const [holidays, setHolidays] = useState([]);

    const handleAdd = (e) => {
        e.preventDefault();
        alert('Holiday added!');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Holidays & Events</h1>
            <form onSubmit={handleAdd} style={{ marginBottom: '30px', maxWidth: '400px', display: 'grid', gap: '10px' }}>
                <input type="text" placeholder="Holiday Title" style={{ padding: '10px' }} required />
                <input type="date" style={{ padding: '10px' }} required />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none' }}>Add Holiday</button>
            </form>
            <h3>Scheduled Holidays</h3>
            <p>No holidays currently in the system.</p>
        </div>
    );
};

export default Holidays;
