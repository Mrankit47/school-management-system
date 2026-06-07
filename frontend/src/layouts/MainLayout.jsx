import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

import useAuthStore from "../store/authStore";

const MainLayout = ({ children }) => {
  const { role } = useAuthStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden">
      {/* Full-width Navbar at the very top */}
      <Navbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar now sits below the Navbar, hide for platform roles */}
        {role !== "superadmin" && role !== "dealer" && (
          <>
            {/* Desktop Sidebar (hidden below lg breakpoint) */}
            <div className="hidden lg:flex h-full">
              <Sidebar />
            </div>

            {/* Mobile/Tablet Sidebar Drawer */}
            {isMobileSidebarOpen && (
              <div className="fixed inset-0 z-50 lg:hidden flex">
                {/* Backdrop Overlay */}
                <div
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
                  onClick={() => setIsMobileSidebarOpen(false)}
                ></div>

                {/* Drawer Panel */}
                <div className="relative flex flex-col w-64 bg-white h-full shadow-2xl z-10 transition-transform duration-300 transform translate-x-0 animate-in slide-in-from-left">
                  {/* Header/Close section */}
                  <div className="p-4 flex justify-between items-center border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-800">Navigation Menu</span>
                    <button
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="p-2 text-slate-400 hover:text-slate-900 text-lg transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Sidebar Content */}
                  <div className="flex-1 overflow-y-auto" onClick={() => setIsMobileSidebarOpen(false)}>
                    <Sidebar isMobile={true} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
