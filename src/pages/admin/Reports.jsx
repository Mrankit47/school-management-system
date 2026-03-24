import React from 'react';

const Reports = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h1>School Reports & Analytics</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={reportCardStyle}><h3>Student Attendance</h3><p>94% Average</p></div>
                <div style={reportCardStyle}><h3>Pass Percentage</h3><p>88% (Exams)</p></div>
                <div style={reportCardStyle}><h3>Fees Collected</h3><p>₹4.5L / ₹6L</p></div>
            </div>
        </div>
    );
};

const reportCardStyle = {
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    textAlign: 'center',
    backgroundColor: '#fff'
};

export default Reports;
