import React from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const MainLayout = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Navbar />
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <Sidebar />
                <main style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#f8f9fa' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
