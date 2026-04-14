import React, { useEffect, useState } from 'react'
import { createTenantAPI, getAllTenantAPI, updateTenantAPI } from '../service'

// ── Types ────────────────────────────────────────────────────────────────────
interface TenantData {
  tenantId?: string
  tenantName: string
  tenantCode: string
  tenantTimeZone: string
  schemaName: string
  active: boolean
  createdTimestamp?: string
  adminName: string
  adminEmail: string
  adminPassword?: string
}

interface TenantFormData {
  tenantName: string
  tenantCode: string
  tenantTimeZone: string
  adminName: string
  adminEmail: string
  adminPassword: string
}

const EMPTY_FORM: TenantFormData = {
  tenantName: '',
  tenantCode: '',
  tenantTimeZone: 'Asia/Kolkata',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
}

const TIMEZONES = [
  'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore',
  'Europe/London', 'America/New_York', 'America/Los_Angeles', 'UTC',
]

// ── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const BuildingIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M3 9h6" /><path d="M3 15h6" />
    <path d="M15 7h2" /><path d="M15 11h2" /><path d="M15 15h2" />
  </svg>
)
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
)
const EyeOffIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

// ── Field Props ───────────────────────────────────────────────────────────────
interface FieldProps {
  label: string
  name: keyof TenantFormData
  type?: string
  placeholder?: string
  required?: boolean
  hint?: string
  form: TenantFormData
  errors: Partial<TenantFormData>
  showPassword: boolean
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
  onChange: (name: keyof TenantFormData, value: string) => void
}

// ── Field Component (outside Tenant) ─────────────────────────────────────────
const Field = ({
  label, name, type = 'text', placeholder, required, hint,
  form, errors, showPassword, setShowPassword, onChange,
}: FieldProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{
      fontSize: 12, fontWeight: 600, color: '#64748b',
      letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>
      {label}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
    </label>
    <div style={{ position: 'relative' }}>
      <input
        type={name === 'adminPassword' ? (showPassword ? 'text' : 'password') : type}
        value={form[name]}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 14px',
          paddingRight: name === 'adminPassword' ? 42 : 14,
          border: `1.5px solid ${errors[name] ? '#ef4444' : '#e2e8f0'}`,
          borderRadius: 10, fontSize: 14, color: '#1e293b',
          background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = errors[name] ? '#ef4444' : '#6366f1' }}
        onBlur={e => { e.target.style.borderColor = errors[name] ? '#ef4444' : '#e2e8f0' }}
      />
      {name === 'adminPassword' && (
        <button type="button" onClick={() => setShowPassword(p => !p)}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0,
          }}>
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      )}
    </div>
    {errors[name] && <span style={{ fontSize: 12, color: '#ef4444' }}>{errors[name]}</span>}
    {hint && !errors[name] && <span style={{ fontSize: 12, color: '#94a3b8' }}>{hint}</span>}
  </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
export default function Tenant() {
  const [tenants, setTenants] = useState<TenantData[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState<TenantData | null>(null)
  const [editTarget, setEditTarget] = useState<TenantData | null>(null)
  const [form, setForm] = useState<TenantFormData>(EMPTY_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<TenantFormData>>({})
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => { getAllTenant() }, [])

  const getAllTenant = async () => {
    try {
      const res = await getAllTenantAPI()
      if (res?.data) setTenants(res.data)
    } catch (error) {
      console.error('Error fetching tenants:', error)
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = tenants.filter(t =>
    t.tenantName.toLowerCase().includes(search.toLowerCase()) ||
    t.tenantCode.toLowerCase().includes(search.toLowerCase()) ||
    t.adminEmail?.toLowerCase().includes(search.toLowerCase())
  )

  const validate = (): boolean => {
    const e: Partial<TenantFormData> = {}
    if (!form.tenantName.trim()) e.tenantName = 'Tenant name is required'
    if (!form.tenantCode.trim()) e.tenantCode = 'Tenant code is required'
    else if (form.tenantCode.length > 4) e.tenantCode = 'Max 4 characters'
    if (!form.adminName.trim()) e.adminName = 'Admin name is required'
    if (!form.adminEmail.trim()) e.adminEmail = 'Admin email is required'
    else if (!/\S+@\S+\.\S+/.test(form.adminEmail)) e.adminEmail = 'Invalid email'
    // if (!editTarget && !form.adminPassword.trim()) e.adminPassword = 'Password is required'
    // else if (!editTarget && form.adminPassword.length < 6) e.adminPassword = 'Min 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleFieldChange = (name: keyof TenantFormData, value: string) => {
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: undefined }))
  }

  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setShowPassword(false)
    setModalOpen(true)
  }

  const openEdit = (t: TenantData) => {
    setEditTarget(t)
    setForm({
      tenantName: t.tenantName,
      tenantCode: t.tenantCode,
      tenantTimeZone: t.tenantTimeZone,
      adminName: t.adminName,
      adminEmail: t.adminEmail,
      adminPassword: '',
    })
    setErrors({})
    setShowPassword(false)
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    if (editTarget) {
      setTenants(prev => prev.map(t =>
        t.tenantId === editTarget.tenantId
          ? {
            ...t,
            tenantName: form.tenantName,
            tenantCode: form.tenantCode.toUpperCase(),
            tenantTimeZone: form.tenantTimeZone,
            adminName: form.adminName,
            adminEmail: form.adminEmail,
          }
          : t
      ))
      const updatedTenant: TenantData = {
        tenantId: editTarget.tenantId,
        tenantName: form.tenantName,
        tenantCode: form.tenantCode.toUpperCase(),
        tenantTimeZone: form.tenantTimeZone,
        schemaName: editTarget.schemaName,
        active: editTarget.active,
        createdTimestamp: editTarget.createdTimestamp,
        adminName: form.adminName,
        adminEmail: form.adminEmail,
      }
      const response = await updateTenantAPI(updatedTenant)
      if (response?.data) {
        getAllTenant();
        showToast('Tenant updated successfully')
      }
    } else {
      const newTenant: TenantData = {
        tenantId: Math.random().toString(36).slice(2),
        tenantName: form.tenantName,
        tenantCode: form.tenantCode.toUpperCase(),
        tenantTimeZone: form.tenantTimeZone,
        schemaName: 't_' + Math.random().toString(36).slice(2, 10),
        active: true,
        createdTimestamp: new Date().toISOString(),
        adminName: form.adminName,
        adminEmail: form.adminEmail,
        // adminPassword: form.adminPassword,
      }
      const response = await createTenantAPI(newTenant);
      if (response?.data) {
        // setTenants(prev => [response?.data, ...prev])
        getAllTenant();
        showToast('Tenant created successfully')
      }
    }
    setLoading(false)
    setModalOpen(false)
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    setTenants(prev => prev.filter(t => t.tenantId !== deleteModal.tenantId))
    showToast('Tenant deleted', 'error')
    setLoading(false)
    setDeleteModal(null)
  }

  const toggleActive = (id: string) => {
    setTenants(prev => prev.map(t =>
      t.tenantId === id ? { ...t, active: !t.active } : t
    ))
  }

  // ── Shared field props ─────────────────────────────────────────────────────
  const fieldProps = { form, errors, showPassword, setShowPassword, onChange: handleFieldChange }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        .tenant-card { transition: box-shadow 0.2s, transform 0.2s; }
        .tenant-card:hover { box-shadow: 0 8px 32px rgba(99,102,241,0.13); transform: translateY(-2px); }
        .action-btn { transition: background 0.15s, color 0.15s, transform 0.15s; }
        .action-btn:hover { transform: scale(1.08); }
        .submit-btn { transition: background 0.2s, box-shadow 0.2s; }
        .submit-btn:hover { box-shadow: 0 4px 20px rgba(99,102,241,0.4); }
        .delete-btn:hover { background: #fef2f2 !important; }
        .modal-overlay { animation: fadeIn 0.18s ease; }
        .modal-box { animation: slideUp 0.22s cubic-bezier(.34,1.56,.64,1); }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
        .toast { animation: toastIn 0.3s cubic-bezier(.34,1.56,.64,1); }
        @keyframes toastIn { from { opacity:0; transform:translateX(60px) } to { opacity:1; transform:translateX(0) } }
        .badge { font-family: 'Space Mono', monospace; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .card-grid { grid-template-columns: 1fr !important; }
          .header-row { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .search-input { width: 100% !important; }
          .modal-box { width: 95vw !important; max-height: 92vh !important; }
          .form-row { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .card-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="toast" style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: toast.type === 'success' ? '#1e293b' : '#ef4444',
          color: '#fff', padding: '12px 20px', borderRadius: 12,
          fontSize: 14, fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.msg}
        </div>
      )}

      <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          padding: '32px 32px 48px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', bottom: -60, left: 120, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', color: '#fff' }}>
                <BuildingIcon />
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
                  Super Admin
                </div>
                <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>
                  Tenant Management
                </h1>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginTop: 4 }}>
              Manage all tenant organizations and their administrators
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: '18px 28px',
            marginTop: -28, display: 'flex', gap: 0,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)', flexWrap: 'wrap',
          }}>
            {[
              { label: 'Total Tenants', value: tenants.length, color: '#6366f1' },
              { label: 'Active', value: tenants.filter(t => t.active).length, color: '#10b981' },
              { label: 'Inactive', value: tenants.filter(t => !t.active).length, color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, minWidth: 100, padding: '8px 20px', borderLeft: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "'Space Mono', monospace" }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>

          {/* Search + Create */}
          <div className="header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
            <div className="search-input" style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <SearchIcon />
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tenants..."
                style={{
                  width: '100%', padding: '11px 14px 11px 40px',
                  border: '1.5px solid #e2e8f0', borderRadius: 12,
                  fontSize: 14, color: '#1e293b', background: '#fff',
                  outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              />
            </div>
            <button onClick={openCreate} className="submit-btn" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #6366f1, #4338ca)',
              color: '#fff', border: 'none', borderRadius: 12,
              padding: '11px 22px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: '0 2px 12px rgba(99,102,241,0.25)',
            }}>
              <PlusIcon /> New Tenant
            </button>
          </div>

          {/* Cards Grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#64748b' }}>No tenants found</div>
              <div style={{ fontSize: 14, marginTop: 6 }}>Try a different search or create a new tenant</div>
            </div>
          ) : (
            <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {filtered.map(t => (
                <div key={t.tenantId} className="tenant-card" style={{
                  background: '#fff', borderRadius: 18,
                  border: '1.5px solid #f1f5f9',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden',
                }}>
                  <div style={{ height: 5, background: t.active ? 'linear-gradient(90deg, #6366f1, #10b981)' : 'linear-gradient(90deg, #e2e8f0, #cbd5e1)' }} />
                  <div style={{ padding: '20px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: t.active ? 'linear-gradient(135deg, #eef2ff, #e0e7ff)' : '#f8fafc',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 18, fontWeight: 700, color: t.active ? '#6366f1' : '#94a3b8',
                          fontFamily: "'Space Mono', monospace",
                        }}>
                          {t.tenantCode.slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, lineHeight: 1.3 }}>{t.tenantName}</div>
                          <div className="badge" style={{
                            display: 'inline-block', marginTop: 4,
                            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                            color: '#6366f1', background: '#eef2ff', padding: '2px 8px', borderRadius: 6,
                          }}>
                            {t.tenantCode}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => toggleActive(t?.tenantId ?? '')} style={{
                        padding: '4px 12px', borderRadius: 99, border: 'none',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: t.active ? '#dcfce7' : '#fee2e2',
                        color: t.active ? '#16a34a' : '#dc2626',
                        transition: 'all 0.2s',
                      }}>
                        {t.active ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                      {[
                        { label: 'Admin', value: t.adminName },
                        { label: 'Email', value: t.adminEmail },
                        { label: 'Schema', value: t.schemaName },
                        { label: 'Timezone', value: t.tenantTimeZone },
                        {
                          label: 'Created', value: new Date(t.createdTimestamp ?? '').toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })
                        },
                      ].map(row => (
                        <div key={row.label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: 60, paddingTop: 1 }}>
                            {row.label}
                          </span>
                          <span style={{ fontSize: 13, color: '#475569', fontWeight: 500, wordBreak: 'break-all', lineHeight: 1.4 }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                      <button onClick={() => openEdit(t)} className="action-btn" style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 0', borderRadius: 10, border: '1.5px solid #e2e8f0',
                        background: '#f8fafc', color: '#6366f1', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}>
                        <EditIcon /> Edit
                      </button>
                      {/* <button onClick={() => setDeleteModal(t)} className="action-btn delete-btn" style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 0', borderRadius: 10, border: '1.5px solid #fee2e2',
                        background: '#fff5f5', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}>
                        <TrashIcon /> Delete
                      </button>*/}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16, backdropFilter: 'blur(4px)',
        }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 22, width: '100%', maxWidth: 580,
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
          }}>
            {/* Modal header */}
            <div style={{
              padding: '24px 28px 20px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'sticky', top: 0, background: '#fff', zIndex: 1, borderRadius: '22px 22px 0 0',
            }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.3px' }}>
                  {editTarget ? 'Edit Tenant' : 'Create New Tenant'}
                </h2>
                <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>
                  {editTarget ? 'Update tenant information below' : 'Fill in the details to onboard a new tenant'}
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} style={{
                background: '#f1f5f9', border: 'none', borderRadius: 10,
                width: 36, height: 36, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#64748b',
              }}>
                <CloseIcon />
              </button>
            </div>

            {/* Form body */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Tenant Info */}
              <div style={{
                background: '#f8fafc', borderRadius: 14, padding: '18px 20px',
                border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  🏢 Tenant Information
                </div>
                <Field label="Tenant Name" name="tenantName" placeholder="e.g. Urban Hostel Chennai" required {...fieldProps} />
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Tenant Code" name="tenantCode" placeholder="e.g. UCH" required hint="Max 4 characters" {...fieldProps} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Timezone
                    </label>
                    <select
                      value={form.tenantTimeZone}
                      onChange={e => setForm(p => ({ ...p, tenantTimeZone: e.target.value }))}
                      style={{
                        padding: '10px 14px', border: '1.5px solid #e2e8f0',
                        borderRadius: 10, fontSize: 14, color: '#1e293b',
                        background: '#f8fafc', outline: 'none', cursor: 'pointer',
                      }}>
                      {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Admin Info */}
              <div style={{
                background: '#f8fafc', borderRadius: 14, padding: '18px 20px',
                border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  👤 Admin Account
                </div>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Admin Name" name="adminName" placeholder="Full name" required {...fieldProps} />
                  <Field label="Admin Email" name="adminEmail" type="email" placeholder="admin@company.com" required {...fieldProps} />
                </div>
                {/* <Field
                  label={editTarget ? 'New Password (optional)' : 'Admin Password'}
                  name="adminPassword"
                  placeholder="Min 6 characters"
                  required={!editTarget}
                  hint={editTarget ? 'Leave blank to keep current password' : undefined}
                  {...fieldProps}
                /> */}
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ padding: '16px 28px 24px', display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9' }}>
              <button onClick={() => setModalOpen(false)} style={{
                padding: '11px 24px', borderRadius: 12, border: '1.5px solid #e2e8f0',
                background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading} className="submit-btn" style={{
                padding: '11px 28px', borderRadius: 12, border: 'none',
                background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #4338ca)',
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, minWidth: 130, justifyContent: 'center',
              }}>
                {loading ? (
                  <>
                    <div style={{
                      width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                      borderTop: '2px solid #fff', borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    {editTarget ? 'Saving...' : 'Creating...'}
                  </>
                ) : (editTarget ? '💾 Save Changes' : '🚀 Create Tenant')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16, backdropFilter: 'blur(4px)',
        }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420,
            boxShadow: '0 24px 80px rgba(0,0,0,0.22)', overflow: 'hidden',
          }}>
            <div style={{ height: 5, background: 'linear-gradient(90deg, #ef4444, #f97316)' }} />
            <div style={{ padding: '28px 28px 24px' }}>
              <div style={{ fontSize: 40, marginBottom: 16, textAlign: 'center' }}>🗑️</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', textAlign: 'center', marginBottom: 8 }}>
                Delete Tenant
              </h2>
              <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 1.6, marginBottom: 8 }}>
                Are you sure you want to delete
              </p>
              <div style={{ background: '#fef2f2', borderRadius: 12, padding: '12px 16px', textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontWeight: 700, color: '#ef4444', fontSize: 16 }}>{deleteModal.tenantName}</div>
                <div style={{ fontSize: 12, color: '#f87171', marginTop: 2, fontFamily: "'Space Mono', monospace" }}>
                  {deleteModal.tenantCode} · {deleteModal.schemaName}
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 24 }}>
                This action cannot be undone. All tenant data and schema will be permanently removed.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setDeleteModal(null)} style={{
                  flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0',
                  background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={loading} style={{
                  flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                  background: loading ? '#fca5a5' : '#ef4444',
                  color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {loading
                    ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    : <><TrashIcon /> Delete</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}