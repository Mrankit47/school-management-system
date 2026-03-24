import React from 'react';
import MainLayout from './MainLayout';

const StudentLayout = ({ children }) => {
    return (
        <MainLayout>
            <div style={{ borderBottom: '2px solid #17a2b8', marginBottom: '20px', paddingBottom: '10px' }}>
                <span style={{ color: '#17a2b8', fontWeight: 'bold' }}>Student Portal</span>
            </div>
            {children}
        </MainLayout>
    );
};

export default StudentLayout;
    
