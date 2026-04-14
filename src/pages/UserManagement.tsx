import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createUserAPI, deleteUserByIdAPI, getUsersAPI, updateUserByIdAPI } from '../service';
import { getAllTenantAPI } from '../service';

// Types
interface Tenant {
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  tenantTimeZone: string;
  schemaName: string;
  active: boolean;
  createdTimestamp: string;
  adminName: string | null;
  adminEmail: string | null;
  adminPassword: string | null;
}

interface User {
  id?: number;
  username: string;
  email: string;
  name: string;
  code: string;
  password: string;
  description?: string;
  active: boolean;
  isDefault: boolean;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

type ModalMode = 'add' | 'edit' | 'delete' | null;

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const EMPTY_FORM: User = {
  username: '', email: '', name: '', code: '',
  password: '', description: '', active: true, isDefault: false, role: 'USER', tenantId: '',
};

const AVATAR_COLORS = [
  ['#6366f1', '#8b5cf6'],
  ['#f43f5e', '#ec4899'],
  ['#f59e0b', '#f97316'],
  ['#10b981', '#14b8a6'],
  ['#0ea5e9', '#3b82f6'],
  ['#a855f7', '#8b5cf6'],
];

const getAvatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// Toast
const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: number) => void }> = ({ toasts, onRemove }) => (
  <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 12, pointerEvents: 'none' }}>
    {toasts.map((toast) => (
      <div key={toast.id} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 18px', borderRadius: 16, minWidth: 280,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        pointerEvents: 'auto',
        background: toast.type === 'success' ? '#f0fdf4' : '#fff1f2',
        border: `1.5px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecdd3'}`,
        color: toast.type === 'success' ? '#166534' : '#9f1239',
        fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
        animation: 'toastIn 0.25s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: toast.type === 'success' ? '#22c55e' : '#f43f5e',
        }} />
        {toast.message}
        <button onClick={() => onRemove(toast.id)} style={{
          marginLeft: 'auto', background: 'none', border: 'none',
          cursor: 'pointer', fontSize: 18, lineHeight: 1, opacity: 0.5,
          color: 'inherit', padding: 0,
        }}>×</button>
      </div>
    ))}
  </div>
);

// Tenant Dropdown with search
const TenantDropdown: React.FC<{
  tenants: Tenant[];
  value: string;
  onChange: (tenantId: string) => void;
  error?: string;
  loading?: boolean;
}> = ({ tenants, value, onChange, error, loading }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const selectedTenant = tenants.find(t => t.tenantId === value);
  const filtered = useMemo(() =>
    tenants.filter(t =>
      t.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      t.tenantCode.toLowerCase().includes(search.toLowerCase())
    ), [tenants, search]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label style={styles.label}>Tenant <span style={{ color: '#f43f5e' }}>*</span></label>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        style={{
          ...styles.input,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', textAlign: 'left',
          borderColor: error ? '#fca5a5' : open ? '#6366f1' : '#e2e8f0',
          background: error ? '#fff5f5' : '#fff',
          boxShadow: open ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
        }}
        disabled={loading}
      >
        {loading ? (
          <span style={{ color: '#94a3b8', fontSize: 13 }}>Loading tenants…</span>
        ) : selectedTenant ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
              background: '#eef2ff', color: '#4f46e5', letterSpacing: '0.05em',
            }}>{selectedTenant.tenantCode}</span>
            <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 600 }}>{selectedTenant.tenantName}</span>
          </div>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: 13 }}>Select a tenant…</span>
        )}
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          style={{ flexShrink: 0, color: '#94a3b8', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: '#fff', borderRadius: 14, border: '1.5px solid #e2e8f0',
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden',
          animation: 'dropIn 0.18s cubic-bezier(0.22,1,0.36,1) both',
        }}>
          {/* Search */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                autoFocus
                type="text"
                placeholder="Search tenants…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '7px 10px 7px 32px', borderRadius: 8,
                  border: '1.5px solid #e2e8f0', fontSize: 12, fontWeight: 500,
                  outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
                  color: '#1e293b',
                }}
              />
            </div>
          </div>
          {/* Options */}
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {/* Clear option */}
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
              style={{
                width: '100%', padding: '10px 14px', border: 'none', background: 'none',
                cursor: 'pointer', textAlign: 'left', fontSize: 12, color: '#94a3b8',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                borderBottom: '1px solid #f8fafc',
              }}
            >
              — No tenant selected
            </button>
            {filtered.length === 0 ? (
              <div style={{ padding: '16px 14px', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
                No tenants found
              </div>
            ) : filtered.map(tenant => (
              <button
                key={tenant.tenantId}
                type="button"
                onClick={() => { onChange(tenant.tenantId); setOpen(false); setSearch(''); }}
                style={{
                  width: '100%', padding: '10px 14px', border: 'none',
                  background: value === tenant.tenantId ? '#eef2ff' : 'none',
                  cursor: 'pointer', textAlign: 'left', display: 'flex',
                  alignItems: 'center', gap: 10, transition: 'background 0.15s',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={e => { if (value !== tenant.tenantId) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (value !== tenant.tenantId) (e.currentTarget as HTMLElement).style.background = 'none'; }}
              >
                <span style={{
                  padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                  background: '#eef2ff', color: '#4f46e5', letterSpacing: '0.06em',
                  flexShrink: 0,
                }}>{tenant.tenantCode}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="truncate text-[13px] font-semibold text-slate-800">
                    {tenant.tenantName}
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{tenant.tenantTimeZone}</div>
                </div>
                {!tenant.active && (
                  <span style={{ fontSize: 10, color: '#f43f5e', fontWeight: 700 }}>Inactive</span>
                )}
                {value === tenant.tenantId && (
                  <svg width="14" height="14" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      {error && <p style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {error}</p>}
    </div>
  );
};

// Shared styles
const styles = {
  label: {
    display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b',
    textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 8,
    fontFamily: "'DM Sans', sans-serif",
  },
  input: {
    width: '100%', padding: '11px 14px', borderRadius: 12,
    border: '1.5px solid #e2e8f0', fontSize: 13, fontWeight: 500,
    outline: 'none', color: '#1e293b', background: '#fff',
    fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
};

// Field component
interface FieldProps {
  label: string; name: keyof User; required?: boolean; type?: string;
  disabled?: boolean; placeholder?: string; formData: User;
  errors: Partial<Record<keyof User, string>>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const Field: React.FC<FieldProps> = ({ label, name, required, type = 'text', disabled, placeholder, formData, errors, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={styles.label}>{label} {required && <span style={{ color: '#f43f5e' }}>*</span>}</label>
      <input
        type={type} name={name as string} value={(formData[name] as string) ?? ''}
        onChange={onChange} disabled={disabled} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          ...styles.input,
          borderColor: errors[name] ? '#fca5a5' : focused ? '#6366f1' : '#e2e8f0',
          background: errors[name] ? '#fff5f5' : disabled ? '#f8fafc' : '#fff',
          color: disabled ? '#94a3b8' : '#1e293b',
          cursor: disabled ? 'not-allowed' : 'text',
          boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
        }}
      />
      {errors[name] && <p style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {errors[name]}</p>}
    </div>
  );
};

// Avatar
const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 36 }) => {
  const [from, to] = getAvatarColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3, flexShrink: 0,
      background: `linear-gradient(135deg, ${from}, ${to})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: size * 0.38,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

const ROLE_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  SUPER_ADMIN: { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe', label: 'Super Admin' },
  ADMIN: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Admin' },
  USER: { bg: '#f8fafc', color: '#475569', border: '#e2e8f0', label: 'User' },
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<User>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [errors, setErrors] = useState<Partial<Record<keyof User, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);
  const debouncedSearch = useDebounce(searchQuery, 250);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUsersAPI();
      if (response?.data) setUsers(response.data);
    } catch { addToast('Failed to load users', 'error'); }
    finally { setLoading(false); }
  }, [addToast]);

  const fetchTenants = useCallback(async () => {
    setTenantsLoading(true);
    try {
      const response = await getAllTenantAPI();
      if (response?.data) setTenants(response.data);
    } catch { addToast('Failed to load tenants', 'error'); }
    finally { setTenantsLoading(false); }
  }, [addToast]);

  useEffect(() => { fetchUser(); fetchTenants(); }, [fetchUser, fetchTenants]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.active).length,
    admins: users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
    inactive: users.filter(u => !u.active).length,
  }), [users]);

  const filteredUsers = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return users.filter(user => {
      if (filterRole !== 'all' && user.role !== filterRole) return false;
      if (filterStatus !== 'all' && (filterStatus === 'active') !== user.active) return false;
      if (!q) return true;
      return user.name.toLowerCase().includes(q) || user.username.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) || user.code.toLowerCase().includes(q);
    });
  }, [users, debouncedSearch, filterRole, filterStatus]);

  const openModal = useCallback((mode: ModalMode, user?: User) => {
    setModalMode(mode); setErrors({});
    if (mode === 'edit' && user) { setSelectedUser(user); setFormData({ ...user }); }
    else if (mode === 'delete' && user) { setSelectedUser(user); }
    else if (mode === 'add') { setSelectedUser(null); setFormData({ ...EMPTY_FORM }); }
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null); setSelectedUser(null);
    setFormData({ ...EMPTY_FORM }); setErrors({});
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof User, string>> = {};
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Enter a valid email address';
    if (!formData.name || formData.name.length < 2 || formData.name.length > 100)
      newErrors.name = 'Name must be 2–100 characters';
    if (formData.description && formData.description.length > 500)
      newErrors.description = 'Description max 500 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        await createUserAPI(formData);
        setUsers(prev => [...prev, { ...formData, id: Date.now(), createdAt: new Date().toISOString() }]);
        addToast(`User "${formData.name}" created successfully`, 'success');
      } else if (modalMode === 'edit' && selectedUser) {
        await updateUserByIdAPI(selectedUser.id ?? 0, formData);
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...formData, id: selectedUser.id, updatedAt: new Date().toISOString() } : u));
        addToast(`User "${formData.name}" updated`, 'success');
      }
      closeModal();
    } catch { addToast('Operation failed. Please try again.', 'error'); }
    finally { setSubmitting(false); }
  }, [validateForm, modalMode, formData, selectedUser, addToast, closeModal]);

  const handleDelete = useCallback(async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await deleteUserByIdAPI(selectedUser.id ?? 0);
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      addToast(`User "${selectedUser.name}" deleted`, 'success');
      closeModal();
    } catch { addToast('Delete failed. Please try again.', 'error'); }
    finally { setSubmitting(false); }
  }, [selectedUser, addToast, closeModal]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
    setErrors(prev => prev[name as keyof User] ? { ...prev, [name]: undefined } : prev);
  }, []);

  const getTenantName = (tenantId?: string) => {
    if (!tenantId) return null;
    return tenants.find(t => t.tenantId === tenantId);
  };

  const statCards = [
    { label: 'Total Users', value: stats.total, accent: '#6366f1', bg: '#eef2ff', icon: '👥' },
    { label: 'Active', value: stats.active, accent: '#10b981', bg: '#ecfdf5', icon: '✓' },
    { label: 'Admins', value: stats.admins, accent: '#8b5cf6', bg: '#f5f3ff', icon: '🛡' },
    { label: 'Inactive', value: stats.inactive, accent: '#f43f5e', bg: '#fff1f2', icon: '✕' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes toastIn { from { opacity:0; transform:translateY(12px) scale(0.96) } to { opacity:1; transform:none } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.97) translateY(10px) } to { opacity:1; transform:none } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes dropIn { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:none } }
        @keyframes rowIn { from { opacity:0; transform:translateX(-6px) } to { opacity:1; transform:none } }
        @keyframes shimmer { 0%,100% { opacity:0.5 } 50% { opacity:1 } }
        .um-row:hover { background: #f8fafc !important; }
        .um-btn:hover { opacity: 0.85; }
        .um-icon-btn:hover { background: #f1f5f9 !important; }
        .um-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 16px; padding-right: 40px !important; }
        @media (max-width: 768px) {
          .um-grid-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .um-filters { flex-direction: column !important; }
          .um-header { flex-direction: column !important; align-items: flex-start !important; }
          .um-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .um-modal { max-width: calc(100vw - 32px) !important; margin: 16px !important; }
          .um-form-grid { grid-template-columns: 1fr !important; }
          .um-hide-mobile { display: none !important; }
        }
        @media (max-width: 480px) {
          .um-grid-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .um-stat-value { font-size: 28px !important; }
        }
        input::placeholder { color: #cbd5e1; }
        textarea::placeholder { color: #cbd5e1; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div className="um-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Administration</span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.1 }}>User Management</h1>
            <p style={{ color: '#64748b', marginTop: 6, fontSize: 13, fontWeight: 500, margin: '6px 0 0' }}>
              Manage accounts, roles and permissions across your system
            </p>
          </div>
          <button onClick={() => openModal('add')} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
            padding: '11px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13,
            border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
            fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
            transition: 'opacity 0.2s, transform 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>

        {/* Stats */}
        <div className="um-grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {statCards.map(card => (
            <div key={card.label} style={{
              background: '#fff', borderRadius: 16, padding: '18px 20px',
              border: '1.5px solid #f1f5f9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{card.label}</span>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{card.icon}</div>
              </div>
              <div className="um-stat-value" style={{ fontSize: 34, fontWeight: 800, color: card.accent, lineHeight: 1 }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="um-filters" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <svg width="15" height="15" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"
              style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search by name, username, email or code…"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ ...styles.input, paddingLeft: 40, paddingRight: searchQuery ? 36 : 14 }}
              onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                fontSize: 18, lineHeight: 1, padding: 4,
              }}>×</button>
            )}
          </div>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
            className="um-select"
            style={{ ...styles.input, width: 'auto', minWidth: 130, cursor: 'pointer', fontWeight: 600 }}
            onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <option value="all">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="um-select"
            style={{ ...styles.input, width: 'auto', minWidth: 130, cursor: 'pointer', fontWeight: 600 }}
            onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {!loading && (
          <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 10, paddingLeft: 2 }}>
            {filteredUsers.length === users.length ? `${users.length} users` : `${filteredUsers.length} of ${users.length} users`}
          </p>
        )}

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div className="um-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #f1f5f9' }}>
                  {['Code', 'User', 'Email', 'Tenant', 'Role', 'Status', ''].map((h, i) => (
                    <th key={i} style={{
                      padding: '14px 18px', textAlign: i === 6 ? 'right' : 'left',
                      fontSize: 10, fontWeight: 700, color: '#94a3b8',
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      fontFamily: "'DM Sans', sans-serif",
                    }} className={h === 'Tenant' ? 'um-hide-mobile' : ''}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} style={{ padding: '16px 18px' }}>
                          <div style={{ height: 14, borderRadius: 8, background: '#f1f5f9', width: j === 1 ? 120 : j === 2 ? 160 : 80, animation: 'shimmer 1.4s infinite' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '60px 0', textAlign: 'center' }}>
                      <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>👤</div>
                      <p style={{ fontWeight: 700, color: '#94a3b8', fontSize: 15, margin: '0 0 4px' }}>No users found</p>
                      <p style={{ color: '#cbd5e1', fontSize: 13, margin: 0 }}>Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : filteredUsers.map((user, idx) => {
                  const tenant = getTenantName(user.tenantId);
                  const role = ROLE_STYLES[user.role] ?? ROLE_STYLES.USER;
                  return (
                    <tr key={user.id} className="um-row"
                      style={{ borderBottom: '1px solid #f8fafc', opacity: user.active ? 1 : 0.5, transition: 'background 0.15s', animation: `rowIn 0.2s ease ${Math.min(idx * 25, 180)}ms both` }}>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 7, fontSize: 11, fontWeight: 600, background: '#f8fafc', color: '#475569', fontFamily: "'DM Mono', monospace", border: '1px solid #e2e8f0' }}>
                          {user.code}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={user.name} />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{user.name}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'DM Mono', monospace", marginTop: 1 }}>@{user.username}</div>
                          </div>
                          {user.isDefault && (
                            <span style={{ padding: '2px 6px', background: '#fffbeb', color: '#b45309', fontSize: 9, fontWeight: 800, borderRadius: 5, border: '1px solid #fde68a', letterSpacing: '0.05em' }}>DEFAULT</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{user.email}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }} className="um-hide-mobile">
                        {tenant ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 800, background: '#eef2ff', color: '#4f46e5', letterSpacing: '0.05em' }}>{tenant.tenantCode}</span>
                            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{tenant.tenantName}</span>
                          </span>
                        ) : <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ padding: '3px 9px', borderRadius: 7, fontSize: 11, fontWeight: 700, background: role.bg, color: role.color, border: `1px solid ${role.border}` }}>
                          {role.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: user.active ? '#f0fdf4' : '#f8fafc', color: user.active ? '#16a34a' : '#64748b', border: `1px solid ${user.active ? '#bbf7d0' : '#e2e8f0'}` }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: user.active ? '#22c55e' : '#94a3b8' }} />
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                          <button onClick={() => openModal('edit', user)} disabled={user.isDefault} title="Edit" className="um-icon-btn"
                            style={{ padding: 8, borderRadius: 9, background: 'none', border: 'none', cursor: user.isDefault ? 'not-allowed' : 'pointer', color: '#64748b', opacity: user.isDefault ? 0.3 : 1, transition: 'background 0.15s, color 0.15s' }}
                            onMouseEnter={e => { if (!user.isDefault) { (e.currentTarget as HTMLElement).style.background = '#eef2ff'; (e.currentTarget as HTMLElement).style.color = '#6366f1'; } }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
                          >
                            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => openModal('delete', user)} disabled={user.isDefault} title="Delete" className="um-icon-btn"
                            style={{ padding: 8, borderRadius: 9, background: 'none', border: 'none', cursor: user.isDefault ? 'not-allowed' : 'pointer', color: '#64748b', opacity: user.isDefault ? 0.3 : 1, transition: 'background 0.15s, color 0.15s' }}
                            onMouseEnter={e => { if (!user.isDefault) { (e.currentTarget as HTMLElement).style.background = '#fff1f2'; (e.currentTarget as HTMLElement).style.color = '#f43f5e'; } }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
                          >
                            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalMode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 16, animation: 'fadeIn 0.2s ease' }}
          onClick={closeModal}>
          <div className="um-modal" onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.18)', animation: 'modalIn 0.28s cubic-bezier(0.22,1,0.36,1) both', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '22px 28px', borderBottom: '1.5px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
                  {modalMode === 'delete' ? 'Confirm Action' : modalMode === 'add' ? 'New Account' : 'Edit Account'}
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {modalMode === 'add' && 'Add New User'}
                  {modalMode === 'edit' && `Edit ${selectedUser?.name}`}
                  {modalMode === 'delete' && 'Delete User'}
                </h2>
              </div>
              <button onClick={closeModal} style={{
                width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#f8fafc', border: '1.5px solid #f1f5f9', cursor: 'pointer', color: '#64748b', fontSize: 20, lineHeight: 1, transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f1f5f9'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
              >×</button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
              {modalMode === 'delete' ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: 60, height: 60, borderRadius: 18, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>🗑</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
                    <Avatar name={selectedUser?.name ?? 'U'} size={40} />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontWeight: 700, color: '#0f172a', margin: 0, fontSize: 15 }}>{selectedUser?.name}</p>
                      <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{selectedUser?.email}</p>
                    </div>
                  </div>
                  <p style={{ color: '#64748b', fontSize: 13, maxWidth: 360, margin: '16px auto 0', lineHeight: 1.6 }}>
                    This will permanently remove the account and all associated data. This action cannot be undone.
                  </p>
                </div>
              ) : (
                <div className="um-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <Field label="Full Name" name="name" required formData={formData} errors={errors} onChange={handleInputChange} />
                  <Field label="Email Address" name="email" required type="email" disabled={modalMode === 'edit'} formData={formData} errors={errors} onChange={handleInputChange} />
                  <div>
                    <label style={styles.label}>Role <span style={{ color: '#f43f5e' }}>*</span></label>
                    <select name="role" value={formData.role} onChange={handleInputChange}
                      className="um-select"
                      style={{ ...styles.input, cursor: 'pointer', fontWeight: 600 }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                  <TenantDropdown
                    tenants={tenants}
                    value={formData.tenantId ?? ''}
                    onChange={(tenantId) => setFormData(prev => ({ ...prev, tenantId }))}
                    error={errors.tenantId}
                    loading={tenantsLoading}
                  />
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={styles.label}>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3}
                      placeholder="Optional description…"
                      style={{
                        ...styles.input, resize: 'none',
                        borderColor: errors.description ? '#fca5a5' : '#e2e8f0',
                        background: errors.description ? '#fff5f5' : '#fff',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors.description ? '#fca5a5' : '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                    {errors.description && <p style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: '#f43f5e' }}>⚠ {errors.description}</p>}
                  </div>
                  <div>
                    <label style={{ ...styles.label, marginBottom: 12 }}>Account Status</label>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
                      <div style={{
                        width: 44, height: 26, borderRadius: 13, border: '2px solid',
                        borderColor: formData.active ? '#6366f1' : '#e2e8f0',
                        background: formData.active ? '#6366f1' : '#f8fafc',
                        padding: '0 2px', display: 'flex', alignItems: 'center', transition: 'all 0.25s',
                      }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%', background: '#fff',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                          transform: formData.active ? 'translateX(18px)' : 'translateX(0)',
                          transition: 'transform 0.25s',
                        }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: formData.active ? '#4f46e5' : '#94a3b8' }}>
                        {formData.active ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '18px 28px', borderTop: '1.5px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
              <button onClick={closeModal} style={{
                padding: '10px 20px', borderRadius: 10, border: '1.5px solid #e2e8f0',
                background: '#fff', color: '#475569', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
              >Cancel</button>
              {modalMode === 'delete' ? (
                <button onClick={handleDelete} disabled={submitting} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #f43f5e, #e11d48)', color: '#fff',
                  fontWeight: 700, fontSize: 13, cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1, fontFamily: "'DM Sans', sans-serif",
                  boxShadow: '0 4px 14px rgba(244,63,94,0.3)',
                }}>
                  {submitting && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />}
                  Delete User
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
                  fontWeight: 700, fontSize: 13, cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1, fontFamily: "'DM Sans', sans-serif",
                  boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                }}>
                  {submitting && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />}
                  {modalMode === 'add' ? 'Create User' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;