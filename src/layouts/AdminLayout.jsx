import React from 'react';
import MainLayout from './MainLayout';

const AdminLayout = ({ children }) => {
    return (
        <MainLayout>
            <div style={{ borderBottom: '2px solid #007bff', marginBottom: '20px', paddingBottom: '10px' }}>
                <span style={{ color: '#007bff', fontWeight: 'bold' }}>Admin Control Panel</span>
            </div>
            {children}
        </MainLayout>
    );
};

export default AdminLayout;
