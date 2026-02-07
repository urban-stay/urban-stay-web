import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = (): void => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area with left margin for sidebar on desktop */}
      <div className="lg:ml-72 min-h-screen transition-all duration-300">
        {/* Mobile Menu Button - Only visible on mobile */}
        <div className="lg:hidden fixed top-4 left-4 z-30">
          <button
            onClick={toggleSidebar}
            className="p-3 bg-white rounded-xl shadow-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Page Content */}
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;