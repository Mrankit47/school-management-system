import React from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const MainLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-[#f8fafc] overflow-hidden">
            {/* Sidebar remains fixed on the left */}
            <Sidebar />
            
            <div className="flex-1 flex flex-col min-w-0">
                {/* Navbar is sticky at the top of the content area */}
                <Navbar />
                
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
