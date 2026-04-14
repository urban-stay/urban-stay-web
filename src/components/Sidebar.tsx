import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  X, ChevronDown, Sparkles, Crown,
  LayoutDashboard, Users, GraduationCap,
  Briefcase, CreditCard, UserCog, DoorOpen,
  type LucideIcon,
  Building2
} from 'lucide-react';
import { useUser } from '../context/UserContext';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface MenuItem {
  icon: LucideIcon;
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
    { icon: LayoutDashboard, label: 'Dashboard', section: 'main', path: '/admin' },
    { icon: Users,           label: 'Employees', section: 'main', path: '/employees' },
    { icon: GraduationCap,  label: 'Students',  section: 'main', path: '/students' },
    { icon: Briefcase,      label: 'Rent',       section: 'main', path: '/rent' },
    { icon: CreditCard,     label: 'Expenses',   section: 'main', path: '/expenses' },
    { icon: DoorOpen,       label: 'Rooms',      section: 'main', path: '/rooms' },
    ...(user?.role === 'SUPER_ADMIN'
    ? [{ icon: Building2, label: 'Tenant', section: 'main' as const, path: '/tenant' }]
    : []),
    ...(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
      ? [{ icon: UserCog, label: 'User', section: 'main' as const, path: '/user' }]
      : []),
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) toggleSidebar();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <style>{`
        /* Desktop: sidebar always visible, no JS needed */
        @media (min-width: 1024px) {
          .sidebar-panel { transform: translateX(0) !important; }
          .sidebar-overlay { display: none !important; }
          .sidebar-close-btn { display: none !important; }
        }
      `}</style>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="sidebar-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(2px)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar panel */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          width: 288,
          background: 'linear-gradient(135deg, #4A3FD8 0%, #5B4FE9 50%, #7B6FFF 100%)',
          color: '#fff',
          zIndex: 50,
          boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        className="sidebar-panel"
      >
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 256, height: 256, background: '#fff', borderRadius: '50%', filter: 'blur(60px)', transform: 'translate(50%,-50%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: 256, height: 256, background: '#c4b5fd', borderRadius: '50%', filter: 'blur(60px)', transform: 'translate(-50%,50%)' }} />
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Logo */}
          <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                onClick={() => handleNavigation('/admin')}
              >
                <div style={{
                  width: 40, height: 40,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  <Crown size={22} color="#fde68a" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px' }}>The Urban Stay</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                    <Sparkles size={10} /> Premium Dashboard
                  </div>
                </div>
              </div>

              {/* Close button — mobile only */}
              <button
                onClick={toggleSidebar}
                className="sidebar-close-btn"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: 8,
                  padding: 6,
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px 8px' }}>
              Main Menu
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {menuItems.filter(i => i.section === 'main').map((item, idx) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigation(item.path)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '11px 16px',
                      borderRadius: 12,
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      position: 'relative',
                      background: active ? '#fff' : 'transparent',
                      color: active ? '#5B4FE9' : 'rgba(255,255,255,0.88)',
                      boxShadow: active ? '0 4px 14px rgba(0,0,0,0.15)' : 'none',
                      transform: active ? 'scale(1.02)' : 'none',
                      animationDelay: `${idx * 40}ms`,
                    }}
                    onMouseEnter={e => {
                      if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={e => {
                      if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                  >
                    {active && (
                      <div style={{
                        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                        width: 3, height: 28, background: '#5B4FE9', borderRadius: '0 4px 4px 0',
                      }} />
                    )}
                    <item.icon size={20} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{
                        background: item.badgeColor ?? 'rgba(255,255,255,0.2)',
                        padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, color: '#fff',
                      }}>{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* User profile */}
          <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
            <div
              onClick={() => setIsProfileOpen(v => !v)}
              style={{
                padding: 14,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.1)'}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#fbbf24,#f97316,#ec4899)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 18, color: '#fff',
                  boxShadow: '0 0 0 2px rgba(255,255,255,0.3)',
                }}>
                  {(user?.name?.[0] ?? 'A').toUpperCase()}
                </div>
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 12, height: 12, background: '#4ade80',
                  borderRadius: '50%', border: '2px solid #5B4FE9',
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {user?.name ?? 'Admin User'}
                  <Crown size={13} color="#fde68a" />
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Administrator</div>
              </div>
              <ChevronDown
                size={17}
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  transform: isProfileOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.3s',
                  flexShrink: 0,
                }}
              />
            </div>

            {/* Dropdown */}
            {isProfileOpen && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: 16,
                right: 16,
                marginBottom: 8,
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 -8px 24px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0',
                padding: 8,
                zIndex: 10,
              }}>
                <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 4, paddingTop: 4 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      logout();
                      handleNavigation('/');
                    }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '8px 12px',
                      fontSize: 13, color: '#dc2626',
                      background: 'none', border: 'none', borderRadius: 8,
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};