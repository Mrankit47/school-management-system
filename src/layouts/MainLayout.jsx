import React from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

import useAuthStore from '../store/authStore';

const MainLayout = ({ children }) => {
    const { role } = useAuthStore();
    return (
        <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden">
            {/* Full-width Navbar at the very top */}
            <Navbar />
            
            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Sidebar now sits below the Navbar, hide for platform roles */}
                {role !== 'superadmin' && role !== 'dealer' && <Sidebar />}
                
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
