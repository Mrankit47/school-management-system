import React from "react";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import useAuthStore from "../store/authStore";
import { LayoutProvider, useLayout } from "../context/LayoutContext";

<<<<<<< HEAD
const MainLayoutInner = ({ children }) => {
  const { role } = useAuthStore();
  const { sidebarOpen, closeSidebar } = useLayout();
  const showSidebar = role !== "superadmin" && role !== "dealer";

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden">
      <Navbar showMenuButton={showSidebar} />

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {showSidebar && (
          <>
            {sidebarOpen && (
              <button
                type="button"
                className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
                aria-label="Close menu"
                onClick={closeSidebar}
              />
            )}
            <Sidebar />
          </>
        )}

        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full page-root">{children}</div>
        </main>
      </div>
    </div>
  );
=======
import authService from '../services/authService';

const MainLayout = ({ children }) => {
    const { role } = authService.getCurrentUser();

    return (
        <div className="app-shell h-screen flex flex-col bg-[#f8fafc] overflow-hidden">
            {/* Full-width Navbar at the very top */}
            <Navbar />
            
            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Sidebar now sits below the Navbar, hide for platform roles */}
                {role !== 'superadmin' && role !== 'dealer' && <Sidebar />}
                
                <main className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 custom-scrollbar">
                    <div className="app-content-surface w-full max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
>>>>>>> 92f67f0882aee1dc0c8b0ac2cf8decd6c701d545
};

const MainLayout = ({ children }) => (
  <LayoutProvider>
    <MainLayoutInner>{children}</MainLayoutInner>
  </LayoutProvider>
);

export default MainLayout;
