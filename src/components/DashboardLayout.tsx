import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/students': 'Students',
  '/employees': 'Employees',
  '/expenses': 'Expenses',
  '/rooms': 'Rooms',
  '/rent': 'Rent Payments',
  '/user': 'User Management',
};

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(window.innerWidth >= 1024);
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] ?? 'Dashboard';

  const toggleSidebar = (): void => setSidebarOpen(prev => !prev);
  const closeSidebar = (): void => setSidebarOpen(false);

  // Detect mobile (< 1024px = lg breakpoint)
  // const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)' }}>

      <style>{`
        @media (min-width: 1024px) {
          .mobile-topbar { display: none !important; }
          .content-area  { margin-left: 288px !important; }
          .mobile-backdrop { display: none !important; }
        }
      `}</style>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Backdrop — only rendered when sidebar open on mobile */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="mobile-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 35,
            background: 'rgba(0,0,0,0.5)',
          }}
        />
      )}

      {/* Main content area */}
      <div
        className="content-area"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin 0.3s ease',
        }}
      >
        {/* Mobile topbar */}
        <header
          className="mobile-topbar"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
            padding: '0 16px',
            height: 56,
          }}
        >
          <button
            onClick={toggleSidebar}
            aria-label="Open sidebar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 10, // 👈 important
              borderRadius: 10,
              background: '#eef2ff',
              border: '1.5px solid #c7d2fe',
              color: '#4f46e5',
              cursor: 'pointer',
            }}
          >
            <Menu size={20} />
          </button>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>
            {pageTitle}
          </span>
        </header>

        {/* Page content */}
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;