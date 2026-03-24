import React from 'react';
import MainLayout from './MainLayout';

const TeacherLayout = ({ children }) => {
    return (
        <MainLayout>
            <div style={{ borderBottom: '2px solid #28a745', marginBottom: '20px', paddingBottom: '10px' }}>
                <span style={{ color: '#28a745', fontWeight: 'bold' }}>Teacher's Workspace</span>
            </div>
            {children}
        </MainLayout>
    );
};

export default TeacherLayout;
