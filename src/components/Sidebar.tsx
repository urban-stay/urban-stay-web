import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronDown, Sparkles, Crown, TrendingUp } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface MenuItem {
  icon: string;
  label: string;
  section: 'main' | 'manage';
  badge?: string;
  badgeColor?: string;
  path: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useUser();

  const menuItems: MenuItem[] = [
    { icon: '📊', label: 'Dashboard', section: 'main', badge: 'New', badgeColor: 'bg-green-400', path: '/admin' },
    { icon: '👥', label: 'Employees', section: 'main', path: '/employees' },
    // { icon: '🌐', label: 'Online Bookings', section: 'main', badge: '12', badgeColor: 'bg-blue-400', path: '/bookings/online' },
    // { icon: '📴', label: 'Offline Bookings', section: 'main', path: '/bookings/offline' },
    // { icon: '💼', label: 'Salaries', section: 'main', path: '/salaries' },
    { icon: '💳', label: 'Expenses', section: 'main', badge: '5', badgeColor: 'bg-red-400', path: '/expenses' },
    // { icon: '🏠', label: 'Rooms', section: 'manage', path: '/rooms' },
    // { icon: '🔖', label: 'Manage Bookings', section: 'manage', path: '/manage-bookings' },
    // { icon: '🔧', label: 'Maintenance', section: 'manage', path: '/maintenance' },
    // { icon: '🌙', label: 'Other Expense', section: 'manage', path: '/other-expenses' },
    // { icon: '📊', label: 'Reports', section: 'manage', path: '/reports' }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay with Blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-linear-to-br from-[#4A3FD8] via-[#5B4FE9] to-[#7B6FFF] 
          text-white w-72 transform transition-all duration-500 ease-out z-50 shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-300 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative flex flex-col h-full">
          {/* Logo Section with Premium Badge */}
          <div className="p-6 border-b border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleNavigation('/admin')}
              >
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
                  <Crown className="text-yellow-300" size={24} />
                </div>
                <div>
                  <h5 className="text-xl font-bold tracking-tight">The Urban Stay</h5>
                  <p className="text-xs text-white/60 flex items-center gap-1">
                    <Sparkles size={10} />
                    Premium Dashboard
                  </p>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-all hover:rotate-90 duration-300"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Stats Summary Card */}
          <div className="mx-3 mt-4 mb-2 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/70 font-medium">Monthly Revenue</span>
              <TrendingUp size={14} className="text-green-300" />
            </div>
            <div className="text-2xl font-bold">₹6,32,000</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-green-300">↑ 12.5%</span>
              <span className="text-xs text-white/50">vs last month</span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <div className="space-y-1">
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Main Menu</p>
              </div>
              {menuItems.filter(item => item.section === 'main').map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.path)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`
                    w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-300
                    group relative overflow-hidden
                    ${isActive(item.path)
                      ? 'bg-white text-[#5B4FE9] shadow-2xl scale-105'
                      : 'text-white/90 hover:bg-white/10 hover:translate-x-1'
                    }
                  `}
                >
                  {/* Active Indicator */}
                  {isActive(item.path) && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#5B4FE9] rounded-r-full" />
                  )}

                  <div className="flex items-center gap-3 flex-1">
                    <span className={`text-2xl transform transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>

                  {/* Badge */}
                  {item.badge && (
                    <span className={`${item.badgeColor || 'bg-white/20'} px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-lg`}>
                      {item.badge}
                    </span>
                  )}

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                </button>
              ))}
            </div>

            {/* <div className="mt-6 pt-4 space-y-1">
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Management</p>
              </div>
              {menuItems.filter(item => item.section === 'manage').map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.path)}
                  style={{ animationDelay: `${(index + 6) * 50}ms` }}
                  className={`
                    w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-300
                    group relative overflow-hidden
                    ${isActive(item.path)
                      ? 'bg-white text-[#5B4FE9] shadow-2xl scale-105' 
                      : 'text-white/90 hover:bg-white/10 hover:translate-x-1'
                    }
                  `}
                >
                  {isActive(item.path) && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#5B4FE9] rounded-r-full" />
                  )}
                  
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`text-2xl transform transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>

                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                </button>
              ))}
            </div> */}
          </nav>

          {/* User Profile Section - Enhanced */}
          <div className="p-4 border-t border-white/10 backdrop-blur-sm">
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="relative p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white/30">
                    F
                  </div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white shadow-sm" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white flex items-center gap-2">
                    {user?.name || 'Admin User'}
                    <Crown size={14} className="text-yellow-300" />
                  </div>
                  <div className="text-xs text-white/70">Administrator</div>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-white/70 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}
                />
              </div>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute bottom-full left-4 right-4 mb-2 p-2 bg-white rounded-xl shadow-2xl border border-gray-200 animate-fade-in">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigation('/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    👤 View Profile
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigation('/settings');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ⚙️ Settings
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigation('/notifications');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    🔔 Notifications
                  </button>
                  <div className="border-t border-gray-200 my-2" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      logout();
                      handleNavigation('/');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  );
};