import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createUserAPI, deleteUserByIdAPI, getUsersAPI, updateUserByIdAPI } from '../service';

// Types
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
  password: '', description: '', active: true, isDefault: false, role: 'USER',
};

// Avatar color palette
const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-sky-500 to-blue-600',
  'from-fuchsia-500 to-violet-600',
];

const getAvatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// Toast component
const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: number) => void }> = ({ toasts, onRemove }) => (
  <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl pointer-events-auto border font-semibold text-sm backdrop-blur-sm animate-toast-in
          ${toast.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-700/50 text-emerald-100'
            : 'bg-red-950/90 border-red-700/50 text-red-100'
          }`}
        style={{ minWidth: 260 }}
      >
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${toast.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
        {toast.message}
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-auto opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
        >×</button>
      </div>
    ))}
  </div>
);

// Stat card component
const StatCard: React.FC<{ label: string; value: number; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className={`relative overflow-hidden rounded-2xl border p-5 bg-white/70 backdrop-blur-sm ${color}`}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-bold uppercase tracking-widest opacity-60">{label}</span>
      <span className="opacity-40">{icon}</span>
    </div>
    <div className="text-4xl font-black tabular-nums">{value}</div>
  </div>
);

// ✅ Defined OUTSIDE UserManagement so it has a stable reference across renders
interface FieldProps {
  label: string;
  name: keyof User;
  required?: boolean;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  formData: User;
  errors: Partial<Record<keyof User, string>>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const Field: React.FC<FieldProps> = ({ label, name, required, type = 'text', disabled, placeholder, formData, errors, onChange }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      type={type}
      name={name as string}
      value={(formData[name] as string) ?? ''}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl border-2 text-slate-800 font-medium text-sm transition-all outline-none
        placeholder:text-slate-300
        disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
        focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50
        ${errors[name] ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
    />
    {errors[name] && (
      <p className="mt-1.5 text-xs font-semibold text-rose-500 flex items-center gap-1">
        <span>⚠</span> {errors[name]}
      </p>
    )}
  </div>
);

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<User>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [errors, setErrors] = useState<Partial<Record<keyof User, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const debouncedSearch = useDebounce(searchQuery, 250);

  // Toast helpers
  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch users
  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUsersAPI();
      if (response?.data) setUsers(response.data);
    } catch (err) {
      addToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  // Stats (memoized)
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.active).length,
    admins: users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
    inactive: users.filter(u => !u.active).length,
  }), [users]);

  // Filtered users (memoized + debounced search)
  const filteredUsers = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return users.filter(user => {
      if (filterRole !== 'all' && user.role !== filterRole) return false;
      if (filterStatus !== 'all' && (filterStatus === 'active') !== user.active) return false;
      if (!q) return true;
      return (
        user.name.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.code.toLowerCase().includes(q)
      );
    });
  }, [users, debouncedSearch, filterRole, filterStatus]);

  const openModal = useCallback((mode: ModalMode, user?: User) => {
    setModalMode(mode);
    setErrors({});
    if (mode === 'edit' && user) {
      setSelectedUser(user);
      setFormData({ ...user });
    } else if (mode === 'delete' && user) {
      setSelectedUser(user);
    } else if (mode === 'add') {
      setSelectedUser(null);
      setFormData({ ...EMPTY_FORM });
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setSelectedUser(null);
    setFormData({ ...EMPTY_FORM });
    setErrors({});
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof User, string>> = {};
    if (!formData.username || formData.username.length < 3 || formData.username.length > 50)
      newErrors.username = 'Username must be 3–50 characters';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Enter a valid email address';
    if (!formData.name || formData.name.length < 2 || formData.name.length > 100)
      newErrors.name = 'Name must be 2–100 characters';
    if (!formData.code || formData.code.length < 2 || formData.code.length > 50)
      newErrors.code = 'Code must be 2–50 characters';
    if (modalMode === 'add' && (!formData.password || formData.password.length < 6))
      newErrors.password = 'Password must be at least 6 characters';
    if (formData.description && formData.description.length > 500)
      newErrors.description = 'Description max 500 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, modalMode]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        await createUserAPI(formData);
        const newUser: User = { ...formData, id: Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setUsers(prev => [...prev, newUser]);
        addToast(`User "${formData.name}" created successfully`, 'success');
      } else if (modalMode === 'edit' && selectedUser) {
        await updateUserByIdAPI(selectedUser.id ?? 0, formData);
        setUsers(prev => prev.map(u => u.id === selectedUser.id
          ? { ...formData, id: selectedUser.id, updatedAt: new Date().toISOString() } : u));
        addToast(`User "${formData.name}" updated`, 'success');
      }
      closeModal();
    } catch {
      addToast('Operation failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [validateForm, modalMode, formData, selectedUser, addToast, closeModal]);

  const handleDelete = useCallback(async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await deleteUserByIdAPI(selectedUser.id ?? 0);
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      addToast(`User "${selectedUser.name}" deleted`, 'success');
      closeModal();
    } catch {
      addToast('Delete failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [selectedUser, addToast, closeModal]);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear error on change
    setErrors(prev => prev[name as keyof User] ? { ...prev, [name]: undefined } : prev);
  }, []);

  const getRoleBadge = (role: string) => {
    const map: Record<string, string> = {
      SUPER_ADMIN: 'bg-violet-100 text-violet-700 border-violet-200',
      ADMIN: 'bg-sky-100 text-sky-700 border-sky-200',
      USER: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return map[role] ?? map.USER;
  };



  return (
    <div className="min-h-screen bg-[#f5f4f0] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        * { font-family: 'Sora', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }

        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-toast-in { animation: toast-in 0.25s cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in { animation: modal-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        .animate-fade-in { animation: fade-in 0.2s ease both; }

        @keyframes row-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-row-in { animation: row-in 0.2s ease both; }

        .shimmer {
          background: linear-gradient(90deg, #e8e8e4 25%, #f0f0ec 50%, #e8e8e4 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }

        input[type="checkbox"] { accent-color: #6366f1; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d4d4c8; border-radius: 10px; }
      `}</style>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-2">Administration</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
              User Management
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              Manage accounts, roles and permissions across your system
            </p>
          </div>
          <button
            onClick={() => openModal('add')}
            className="group flex items-center gap-2.5 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all duration-300 shadow-lg hover:shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Users" value={stats.total} color="border-slate-200 text-slate-800"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>} />
          <StatCard label="Active" value={stats.active} color="border-emerald-200 text-emerald-800"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard label="Admins" value={stats.admins} color="border-violet-200 text-violet-800"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
          <StatCard label="Inactive" value={stats.inactive} color="border-rose-200 text-rose-800"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>} />
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, username, email or code…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all placeholder:text-slate-300"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 hover:text-slate-600 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all text-lg leading-none">
                ×
              </button>
            )}
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all cursor-pointer text-slate-700"
          >
            <option value="all">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all cursor-pointer text-slate-700"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-xs font-semibold text-slate-400 mb-3 px-1">
            {filteredUsers.length === users.length
              ? `${users.length} users`
              : `${filteredUsers.length} of ${users.length} users`}
          </p>
        )}

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-sm border-2 border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Code</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Username</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className={`h-4 rounded-lg shimmer ${j === 1 ? 'w-32' : j === 3 ? 'w-40' : 'w-20'}`} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="font-bold text-slate-400 text-base">No users found</p>
                      <p className="text-slate-300 text-sm mt-1">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr
                      key={user.id}
                      className={`border-b border-slate-50 hover:bg-slate-50/80 transition-colors animate-row-in ${!user.active ? 'opacity-50' : ''}`}
                      style={{ animationDelay: `${Math.min(idx * 30, 200)}ms` }}
                    >
                      <td className="px-6 py-4">
                        <span className="mono text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                          {user.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarColor(user.name)} flex items-center justify-center text-white font-black text-sm shadow-sm flex-shrink-0`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 text-sm leading-tight">{user.name}</div>
                            {user.description && (
                              <div className="text-xs text-slate-400 truncate max-w-[160px]">{user.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="mono text-xs font-medium text-slate-600">@{user.username}</span>
                          {user.isDefault && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded uppercase tracking-wider border border-amber-200">
                              DEFAULT
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500 font-medium">{user.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getRoleBadge(user.role)}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${user.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openModal('edit', user)}
                            disabled={user.isDefault}
                            title="Edit user"
                            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openModal('delete', user)}
                            disabled={user.isDefault}
                            title="Delete user"
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeModal}>
          <div
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-7 py-6 border-b-2 border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                  {modalMode === 'delete' ? 'Confirm Action' : modalMode === 'add' ? 'New Account' : 'Edit Account'}
                </p>
                <h2 className="text-xl font-black text-slate-900">
                  {modalMode === 'add' && 'Add New User'}
                  {modalMode === 'edit' && `Edit ${selectedUser?.name}`}
                  {modalMode === 'delete' && 'Delete User'}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all hover:rotate-90 duration-300 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-7 overflow-y-auto max-h-[calc(90vh-160px)]">
              {modalMode === 'delete' ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(selectedUser?.name ?? 'U')} flex items-center justify-center text-white font-black text-sm`}>
                      {selectedUser?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900">{selectedUser?.name}</p>
                      <p className="text-sm text-slate-500">{selectedUser?.email}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mt-4 max-w-sm mx-auto">
                    This will permanently remove the account and all associated data. This action cannot be undone.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Full Name" name="name" required formData={formData} errors={errors} onChange={handleInputChange} />
                  <Field label="Code" name="code" required disabled={modalMode === 'edit'} formData={formData} errors={errors} onChange={handleInputChange} />
                  <Field label="Username" name="username" required formData={formData} errors={errors} onChange={handleInputChange} />
                  <Field label="Email Address" name="email" required type="email" disabled={modalMode === 'edit'} formData={formData} errors={errors} onChange={handleInputChange} />
                  {modalMode === 'add' && (
                    <Field label="Password" name="password" required type="password" formData={formData} errors={errors} onChange={handleInputChange} />
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Role <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 font-semibold text-sm cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all hover:border-slate-300"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border-2 text-slate-800 font-medium text-sm resize-none focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all placeholder:text-slate-300 ${errors.description ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 hover:border-slate-300'}`}
                      placeholder="Optional description…"
                    />
                    {errors.description && (
                      <p className="mt-1.5 text-xs font-semibold text-rose-500">⚠ {errors.description}</p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer group w-fit">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="active"
                          checked={formData.active}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div
                          onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                          className={`w-10 h-6 rounded-full border-2 transition-all duration-300 cursor-pointer flex items-center px-0.5
                            ${formData.active ? 'bg-indigo-500 border-indigo-500' : 'bg-slate-200 border-slate-300'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${formData.active ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors select-none">
                        Active Account
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-7 py-5 border-t-2 border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                Cancel
              </button>
              {modalMode === 'delete' ? (
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-2xl font-bold text-sm hover:bg-rose-700 transition-all shadow-lg hover:shadow-rose-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                >
                  {submitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Delete User
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit()}
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all duration-300 shadow-lg hover:shadow-indigo-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                >
                  {submitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
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