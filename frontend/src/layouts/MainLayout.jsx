import React from "react";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import useAuthStore from "../store/authStore";
import { LayoutProvider, useLayout } from "../context/LayoutContext";

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
};

const MainLayout = ({ children }) => (
  <LayoutProvider>
    <MainLayoutInner>{children}</MainLayoutInner>
  </LayoutProvider>
);

export default MainLayout;
