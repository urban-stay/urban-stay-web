import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Search, Plus, Edit2, Trash2, X, Users, Clock, Phone,
  Mail, CreditCard, Building, Eye,
  Download, FileText, IndianRupee, CheckCircle, Loader2, AlertCircle,
  ImageIcon, ShieldCheck, BookOpen, Paperclip
} from 'lucide-react';
import { deleteEmployeeByIdAPI, getEmployeesAPI } from '../service';
import { useUser } from '../context/UserContext';
import { BASE_URL } from '../../config';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Employee {
  id?: number;
  name: string;
  email: string;
  phoneNumber: string;
  designation: string;
  employeeId: string;
  joinDate: string;
  salary: number;
  shift: string;
  address?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  status: string;
  isActive?: boolean;
  aadharNumber?: string;
  updatedBy?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  aadhaarCardDocument?: string; employeePhotoDocument?: string; bankPassbookDocument?: string
}

interface SalaryRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  designation: string;
  salaryDue: number;
  paidAmount: number;
  status: 'Paid' | 'Pending' | 'Partial';
  year: number;
  month: number;
  paidDate: string | null;
  note: string | null;
  paidBy: string | null;
}

interface DocumentPreview { type: string; url: string; name: string; }

const SALARY_API = `${BASE_URL}/salary`;
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const fmt = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L`
    : n >= 1000 ? `₹${(n / 1000).toFixed(0)}k`
      : `₹${n}`;

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1',
];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ─── Salary Modal ─────────────────────────────────────────────────────────────

interface SalaryModalProps {
  employee: Employee;
  currentUser: string;
  onClose: () => void;
}

const SalaryModal: React.FC<SalaryModalProps> = ({ employee, currentUser, onClose }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [record, setRecord] = useState<SalaryRecord | null>(null);
  const [history, setHistory] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [paidAmount, setPaidAmount] = useState(employee.salary);
  const [status, setStatus] = useState<'Paid' | 'Partial' | 'Pending'>('Paid');

  const loadRecord = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [monthRes, histRes] = await Promise.all([
        fetch(`${SALARY_API}/month?year=${year}&month=${month}`),
        fetch(`${SALARY_API}/employee/${employee.id}`)
      ]);
      if (!monthRes.ok) throw new Error('Failed to load');
      const all: SalaryRecord[] = await monthRes.json();
      const found = all.find(r => r.employeeId === employee.id) ?? null;
      setRecord(found);
      setNote(found?.note ?? '');
      setPaidAmount(found?.paidAmount ?? employee.salary);
      setStatus(found?.status ?? 'Paid');
      if (histRes.ok) setHistory(await histRes.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [year, month, employee.id, employee.salary]);

  useEffect(() => { loadRecord(); }, [loadRecord]);

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      const res = await fetch(`${SALARY_API}/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employee.id, year, month, status, paidAmount, paidDate: new Date().toISOString().split('T')[0], note, paidBy: currentUser })
      });
      if (!res.ok) throw new Error(await res.text());
      await loadRecord();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!record) return;
    setSaving(true);
    try {
      await fetch(`${SALARY_API}/${record.id}`, { method: 'DELETE' });
      await loadRecord();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const statusConfig = {
    Paid: { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', dot: '●' },
    Partial: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', dot: '◐' },
    Pending: { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', dot: '○' },
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: '#1e40af', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: avatarColor(employee.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '15px' }}>
              {employee.name.charAt(0)}
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '15px', letterSpacing: '-0.2px' }}>{employee.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginTop: '1px' }}>{employee.employeeId} · {employee.designation} · {fmt(employee.salary)}/mo</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Period selector */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Period</span>
          <select value={year} onChange={e => setYear(+e.target.value)} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#1e40af', background: '#fff', outline: 'none', cursor: 'pointer' }}>
            {[2022, 2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
          </select>
          <select value={month} onChange={e => setMonth(+e.target.value)} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}>
            {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <div style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: record ? '#ecfdf5' : '#f9fafb', color: record ? '#059669' : '#9ca3af', border: `1px solid ${record ? '#a7f3d0' : '#e5e7eb'}` }}>
            {record ? '● Record exists' : '○ No record'}
          </div>
        </div>

        {error && (
          <div style={{ margin: '12px 24px 0', display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', fontWeight: 500, flexShrink: 0 }}>
            <AlertCircle size={14} />{error}
          </div>
        )}

        {/* Form */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '14px' }}>
            Mark Salary — {MONTH_NAMES[month - 1]} {year}
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Loader2 size={18} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '5px' }}>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as any)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: statusConfig[status]?.color, background: '#fff', outline: 'none', cursor: 'pointer' }}>
                  <option value="Paid">✓ Paid</option>
                  <option value="Partial">~ Partial</option>
                  <option value="Pending">○ Pending</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '5px' }}>Amount Paid (₹)</label>
                <input type="number" value={paidAmount} onChange={e => setPaidAmount(+e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#1e40af', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '5px' }}>Note (optional)</label>
                <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. advance deducted" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#374151', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <button onClick={handleSave} disabled={saving || loading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: saving || loading ? 0.6 : 1 }}>
              {saving ? <Loader2 size={13} /> : <CheckCircle size={13} />}
              {record ? 'Update' : 'Save'}
            </button>
            {record && (
              <button onClick={handleDelete} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#fff', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                <Trash2 size={13} /> Undo
              </button>
            )}
          </div>
        </div>

        {/* History */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '12px' }}>Salary History</div>
          {history.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>No salary records yet</p>
          ) : (
            <div>
              {history.slice(0, 12).map(h => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 0', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', minWidth: 64 }}>{MONTH_NAMES[h.month - 1]} {h.year}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>{fmt(h.paidAmount)}</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, marginLeft: 'auto', color: statusConfig[h.status]?.color, background: statusConfig[h.status]?.bg, border: `1px solid ${statusConfig[h.status]?.border}` }}>{h.status}</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af', minWidth: 80, textAlign: 'right' }}>{h.paidDate ?? '—'}</span>
                  {h.note && <span style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.note}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 600, color: '#374151', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── Employee Row ─────────────────────────────────────────────────────────────

const EmployeeRow = memo(({ employee, onEdit, onDelete, onSalary, onPreview, showActions }: {
  employee: Employee;
  onEdit: (e: Employee) => void;
  onDelete: (e: Employee) => void;
  onSalary: (e: Employee) => void;
  onPreview: (type: any, url: string, name: string) => void;
  showActions: boolean;
}) => {
  const statusStyles: Record<string, { color: string; bg: string; border: string }> = {
    'Active': { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    'On Leave': { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    'Resigned': { color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
    'Terminated': { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
  };
  const ss = statusStyles[employee.status] ?? { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' };

  return (
    <tr style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

      <td style={{ padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: avatarColor(employee.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
            {employee.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', lineHeight: '1.3' }}>{employee.name}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>{employee.employeeId}</div>
          </div>
        </div>
      </td>

      <td style={{ padding: '12px 20px' }}>
        <div style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>{employee.designation}</div>
        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Clock size={10} />{employee.shift}
        </div>
      </td>

      <td style={{ padding: '12px 20px' }}>
        <div style={{ fontSize: '12px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={11} style={{ color: '#9ca3af' }} />{employee.phoneNumber}</div>
        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={10} />{employee.email}</div>
      </td>

      <td style={{ padding: '12px 20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e40af' }}>₹{employee.salary.toLocaleString()}</div>
      </td>

      <td style={{ padding: '12px 20px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '12px', color: ss.color, background: ss.bg, border: `1px solid ${ss.border}` }}>
          {employee.status}
        </span>
      </td>

      <td style={{ padding: '12px 20px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {employee?.aadhaarCardDocument && (
            <button onClick={() => onPreview('aadhar', employee?.aadhaarCardDocument!, 'Aadhar Card')} title="Aadhar" style={{ padding: '5px', color: '#3b82f6', background: '#eff6ff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><FileText size={13} /></button>
          )}
          {employee?.employeePhotoDocument && (
            <button onClick={() => onPreview('photo', employee?.employeePhotoDocument!, 'Employee Photo')} title="Photo" style={{ padding: '5px', color: '#10b981', background: '#ecfdf5', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Eye size={13} /></button>
          )}
          {employee?.bankPassbookDocument && (
            <button onClick={() => onPreview('bankPassbook', employee?.bankPassbookDocument!, 'Bank Passbook')} title="Passbook" style={{ padding: '5px', color: '#8b5cf6', background: '#f5f3ff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><FileText size={13} /></button>
          )}
          {!employee?.aadhaarCardDocument && !employee?.employeePhotoDocument && !employee?.bankPassbookDocument && (
            <span style={{ fontSize: '11px', color: '#d1d5db' }}>—</span>
          )}
        </div>
      </td>

      <td style={{ padding: '12px 20px' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>{employee.updatedBy ?? '—'}</span>
      </td>

      <td style={{ padding: '12px 20px' }}>
        <button onClick={() => onSalary(employee)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <IndianRupee size={11} />Salary
        </button>
      </td>

      {showActions && (
        <td style={{ padding: '12px 20px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => onEdit(employee)} style={{ padding: '6px', color: '#3b82f6', background: '#eff6ff', border: 'none', borderRadius: '7px', cursor: 'pointer' }}><Edit2 size={13} /></button>
            <button onClick={() => onDelete(employee)} style={{ padding: '6px', color: '#ef4444', background: '#fef2f2', border: 'none', borderRadius: '7px', cursor: 'pointer' }}><Trash2 size={13} /></button>
          </div>
        </td>
      )}
    </tr>
  );
});

// ─── Main ─────────────────────────────────────────────────────────────────────

const DEFAULT_FORM: Employee = {
  name: '', email: '', phoneNumber: '', designation: 'Warden', employeeId: '',
  joinDate: '', salary: 0, shift: 'Full Day', address: '', emergencyContact: '',
  emergencyContactName: '', status: 'Active', aadharNumber: '', bankAccountNumber: '',
  ifscCode: '', updatedBy: '',
};

const EmployeePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [salaryEmployee, setSalaryEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<DocumentPreview | null>(null);
  const { user } = useUser();

  const [formData, setFormData] = useState<Employee>(DEFAULT_FORM);
  const [documents, setDocuments] = useState<{ aadhar: File | null; photo: File | null; bankPassbook: File | null }>({ aadhar: null, photo: null, bankPassbook: null });
  const [documentPreviews, setDocumentPreviews] = useState<{ aadhar: string | null; photo: string | null; bankPassbook: string | null }>({ aadhar: null, photo: null, bankPassbook: null });

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await getEmployeesAPI();
      setEmployees(response.data);
    } catch (error) { console.error('Error fetching employees:', error); }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  useEffect(() => {
    let f = employees;
    const s = searchTerm.toLowerCase();
    if (s) f = f.filter(e => e.name.toLowerCase().includes(s) || e.email.toLowerCase().includes(s) || e.employeeId.toLowerCase().includes(s) || e.designation.toLowerCase().includes(s));
    if (filterDesignation) f = f.filter(e => e.designation === filterDesignation);
    if (filterShift) f = f.filter(e => e.shift === filterShift);
    if (filterStatus) f = f.filter(e => e.status === filterStatus);
    setFilteredEmployees(f);
  }, [searchTerm, filterDesignation, filterShift, filterStatus, employees]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'aadhar' | 'photo' | 'bankPassbook') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('File size should not exceed 5MB'); return; }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)) { setError('Only JPG, PNG, and PDF files are allowed'); return; }
    setDocuments(prev => ({ ...prev, [type]: file }));
    const reader = new FileReader();
    reader.onloadend = () => setDocumentPreviews(prev => ({ ...prev, [type]: reader.result as string }));
    reader.readAsDataURL(file);
    setError(null);
  };

  const handlePreviewDocument = useCallback((type: any, url: string, name: string) => setPreviewDocument({ type, url, name }), []);
  const handleDownloadDocument = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const resetFormDocs = () => {
    setDocuments({ aadhar: null, photo: null, bankPassbook: null });
    setDocumentPreviews({ aadhar: null, photo: null, bankPassbook: null });
  };

  const handleOpenModal = (employee?: Employee) => {
    setEditingEmployee(employee ?? null);
    setFormData(employee ? { ...employee } : { ...DEFAULT_FORM });
    resetFormDocs(); setError(null); setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingEmployee(null); setError(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setError(null);
    try {
      // Build multipart/form-data to match Spring Boot @RequestParam fields
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('phoneNumber', formData.phoneNumber);
      fd.append('designation', formData.designation);
      fd.append('joinDate', formData.joinDate);
      fd.append('salary', String(formData.salary));
      fd.append('shift', formData.shift);
      fd.append('status', formData.status);
      if (formData.address) fd.append('address', formData.address);
      if (formData.emergencyContact) fd.append('emergencyContact', formData.emergencyContact);
      if (formData.emergencyContactName) fd.append('emergencyContactName', formData.emergencyContactName);
      if (formData.aadharNumber) fd.append('aadharNumber', formData.aadharNumber);
      if (formData.bankAccountNumber) fd.append('bankAccountNumber', formData.bankAccountNumber);
      if (formData.ifscCode) fd.append('ifscCode', formData.ifscCode);
      if (editingEmployee) {
        fd.append('updatedBy', user?.name ?? '');
        fd.append('isActive', String(formData.isActive ?? true));
      }
      // Attach files using exact backend param names
      if (documents.aadhar) fd.append('aadhaarCard', documents.aadhar);
      if (documents.photo) fd.append('employeePhoto', documents.photo);
      if (documents.bankPassbook) fd.append('bankPassbook', documents.bankPassbook);

      const BASE = `${BASE_URL}/employees`;
      const res = await fetch(
        editingEmployee ? `${BASE}/${editingEmployee.id}` : BASE,
        { method: editingEmployee ? 'PUT' : 'POST', body: fd }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || 'Failed to save employee');
      }
      handleCloseModal(); fetchEmployees();
    } catch (error: any) {
      setError(error?.message || 'Failed to save employee. Please try again.');
    } finally { setIsLoading(false); }
  };

  const handleDelete = useCallback((employee: Employee) => { setDeletingEmployee(employee); setIsDeleteModalOpen(true); }, []);
  const confirmDelete = async () => {
    if (!deletingEmployee) return;
    try {
      await deleteEmployeeByIdAPI(deletingEmployee.id!);
      setEmployees(prev => prev.filter(emp => emp.id !== deletingEmployee.id));
      setIsDeleteModalOpen(false); setDeletingEmployee(null);
    } catch (error) { console.error('Delete failed:', error); }
  };

  const isTodayView = new Date().toDateString() === new Date().toDateString();
  const showActions = user?.role === 'SUPER_ADMIN' || isTodayView;

  const activeCount = employees.filter(e => e.status === 'Active').length;
  const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);

  // ── Shared input style ──
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
    borderRadius: '8px', fontSize: '13px', color: '#374151', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.15s',
    fontFamily: 'inherit',
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '5px' };

  const setField = (key: string, val: any) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '"Inter", "DM Sans", system-ui, sans-serif' }}>

      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', letterSpacing: '-0.3px', margin: 0 }}>Employee Management</h1>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, marginTop: '1px' }}>Manage hostel staff and workforce</p>
              </div>
              {/* Stats pills */}
              <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
                <div style={{ padding: '4px 12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#059669' }}>
                  {activeCount} Active
                </div>
                <div style={{ padding: '4px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#1e40af' }}>
                  {fmt(totalSalary)}/mo
                </div>
              </div>
            </div>
            <button onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(30,64,175,0.25)' }}>
              <Plus size={15} />Add Employee
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 24px' }}>

        {/* Filters */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input type="text" placeholder="Search employees…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '32px' }} />
          </div>
          {[
            { val: filterDesignation, set: setFilterDesignation, placeholder: 'Designation', opts: ['Warden', 'Cook', 'Security Guard', 'Cleaning Staff', 'Maintenance', 'Manager'] },
            { val: filterShift, set: setFilterShift, placeholder: 'Shift', opts: ['Morning', 'Evening', 'Night', 'Full Day'] },
            { val: filterStatus, set: setFilterStatus, placeholder: 'Status', opts: ['Active', 'On Leave', 'Resigned', 'Terminated'] },
          ].map((f, i) => (
            <select key={i} value={f.val} onChange={e => f.set(e.target.value)}
              style={{ ...inputStyle, width: 'auto', minWidth: '130px', paddingRight: '28px', cursor: 'pointer', flex: '0 0 auto' }}>
              <option value="">All {f.placeholder}s</option>
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
          {(searchTerm || filterDesignation || filterShift || filterStatus) && (
            <button onClick={() => { setSearchTerm(''); setFilterDesignation(''); setFilterShift(''); setFilterStatus(''); }}
              style={{ padding: '7px 14px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {filteredEmployees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Users size={40} style={{ color: '#e5e7eb', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>No employees found</h3>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
                    {['Employee', 'Designation', 'Contact', 'Salary', 'Status', 'Documents', 'Updated By', 'Salary'].map(h => (
                      <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                    {showActions && <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => (
                    <EmployeeRow
                      key={emp.id}
                      employee={emp}
                      onEdit={handleOpenModal}
                      onDelete={handleDelete}
                      onSalary={setSalaryEmployee}
                      onPreview={handlePreviewDocument}
                      showActions={showActions}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Row count */}
        {filteredEmployees.length > 0 && (
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#9ca3af', textAlign: 'right' }}>
            Showing {filteredEmployees.length} of {employees.length} employees
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ background: '#1e40af', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '16px 16px 0 0', position: 'sticky', top: 0, zIndex: 10 }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button onClick={handleCloseModal} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#fff', display: 'flex' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {/* Section: Basic */}
              <div style={{ marginBottom: '6px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                  <Users size={14} style={{ color: '#1e40af' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', letterSpacing: '-0.1px' }}>Basic Information</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {[
                    { label: 'Full Name', key: 'name', type: 'text', req: true, ph: 'Enter full name' },
                    { label: 'Email Address', key: 'email', type: 'email', req: true, ph: 'employee@hostel.com' },
                    { label: 'Phone Number', key: 'phoneNumber', type: 'tel', req: true, ph: '9876543210' },
                    { label: 'Aadhar Number', key: 'aadharNumber', type: 'number', req: true, ph: '123456789012' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={labelStyle}>{f.label}{f.req && <span style={{ color: '#ef4444' }}> *</span>}</label>
                      <input type={f.type} required={f.req} value={(formData as any)[f.key] ?? ''}
                        onChange={e => setField(f.key, f.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                        placeholder={f.ph} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#1e40af'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Job */}
              <div style={{ margin: '20px 0 6px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                  <Building size={14} style={{ color: '#1e40af' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Job Details</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Designation <span style={{ color: '#ef4444' }}>*</span></label>
                    <select required value={formData.designation} onChange={e => setField('designation', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {['Warden', 'Cook', 'Security Guard', 'Cleaning Staff', 'Maintenance', 'Manager'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Shift <span style={{ color: '#ef4444' }}>*</span></label>
                    <select required value={formData.shift} onChange={e => setField('shift', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {['Morning', 'Evening', 'Night', 'Full Day'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Join Date <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="date" required value={formData.joinDate} onChange={e => setField('joinDate', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Monthly Salary (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="number" required value={formData.salary} onWheel={e => (e.target as HTMLInputElement).blur()}
                      onChange={e => setField('salary', parseFloat(e.target.value))} placeholder="35000" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Status <span style={{ color: '#ef4444' }}>*</span></label>
                    <select required value={formData.status} onChange={e => setField('status', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {['Active', 'On Leave', 'Resigned', 'Terminated'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Address</label>
                    <textarea value={formData.address ?? ''} onChange={e => setField('address', e.target.value)}
                      placeholder="Full address" rows={2}
                      style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                  </div>
                </div>
              </div>

              {/* Section: Emergency */}
              <div style={{ margin: '20px 0 6px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                  <Phone size={14} style={{ color: '#1e40af' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Emergency Contact</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Contact Name</label>
                    <input type="text" value={formData.emergencyContactName ?? ''} onChange={e => setField('emergencyContactName', e.target.value)} placeholder="Contact person name" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Contact Number</label>
                    <input type="tel" value={formData.emergencyContact ?? ''} onChange={e => setField('emergencyContact', e.target.value)} placeholder="9876543210" style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Section: Bank */}
              <div style={{ margin: '20px 0 6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                  <CreditCard size={14} style={{ color: '#1e40af' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Bank Details</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Account Number <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" required value={formData.bankAccountNumber ?? ''} onChange={e => setField('bankAccountNumber', e.target.value)} placeholder="123456789012" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>IFSC Code <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" required value={formData.ifscCode ?? ''} onChange={e => setField('ifscCode', e.target.value)} placeholder="SBIN0001234" style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Section: Documents */}
              <div style={{ margin: '20px 0 6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                  <Paperclip size={14} style={{ color: '#1e40af' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Documents</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '4px' }}>JPG, PNG or PDF · max 5MB each</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {([
                    { key: 'aadhar' as const, label: 'Aadhar Card', icon: <ShieldCheck size={18} />, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', existingField: 'aadhaarCardDocument' },
                    { key: 'photo' as const, label: 'Employee Photo', icon: <ImageIcon size={18} />, color: '#10b981', bg: '#ecfdf5', border: '#6ee7b7', existingField: 'employeePhotoDocument' },
                    { key: 'bankPassbook' as const, label: 'Bank Passbook', icon: <BookOpen size={18} />, color: '#8b5cf6', bg: '#f5f3ff', border: '#c4b5fd', existingField: 'bankPassbookDocument' },
                  ]).map(doc => {
                    const hasNew = !!documents[doc.key];
                    const existingUrl = editingEmployee?.[doc.existingField as keyof Employee];
                    const preview = documentPreviews[doc.key];
                    return (
                      <div key={doc.key} style={{ border: `1.5px dashed ${hasNew ? doc.border : '#e5e7eb'}`, borderRadius: '10px', overflow: 'hidden', background: hasNew ? doc.bg : '#fafafa', transition: 'all 0.15s' }}>
                        {/* Upload zone */}
                        {!hasNew ? (
                          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '20px 12px', cursor: 'pointer', minHeight: '110px' }}>
                            <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }}
                              onChange={e => handleFileChange(e, doc.key)} />
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: doc.bg, border: `1px solid ${doc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: doc.color }}>
                              {doc.icon}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{doc.label}</div>
                              {existingUrl ? (
                                <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                                  <CheckCircle size={10} />Already uploaded · click to replace
                                </div>
                              ) : (
                                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>Click to upload</div>
                              )}
                            </div>
                          </label>
                        ) : (
                          <div style={{ padding: '10px' }}>
                            {/* Preview */}
                            {preview && (
                              preview.startsWith('data:image') ? (
                                <img src={preview} alt={doc.label} style={{ width: '100%', height: '72px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
                              ) : (
                                <div style={{ width: '100%', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '6px', marginBottom: '8px' }}>
                                  <FileText size={24} style={{ color: '#6b7280' }} />
                                </div>
                              )
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: doc.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                                {documents[doc.key]?.name}
                              </span>
                              <button type="button" onClick={() => {
                                setDocuments(prev => ({ ...prev, [doc.key]: null }));
                                setDocumentPreviews(prev => ({ ...prev, [doc.key]: null }));
                              }} style={{ padding: '2px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex' }}>
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                        {/* Existing doc actions (no new file yet) */}
                        {!hasNew && existingUrl && (
                          <div style={{ padding: '6px 10px', borderTop: `1px solid ${doc.border}`, display: 'flex', gap: '6px', background: '#fff' }}>
                            <button type="button" onClick={() => handlePreviewDocument(doc.key as string, existingUrl as string, doc.label)}
                              style={{ flex: 1, padding: '4px', fontSize: '11px', fontWeight: 600, color: doc.color, background: doc.bg, border: `1px solid ${doc.border}`, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                              <Eye size={11} />View
                            </button>
                            <button type="button" onClick={() => handleDownloadDocument(existingUrl as string, doc.label)}
                              style={{ flex: 1, padding: '4px', fontSize: '11px', fontWeight: 600, color: '#6b7280', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                              <Download size={11} />Download
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div style={{ marginTop: '14px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', color: '#dc2626', fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <button type="button" onClick={handleCloseModal} disabled={isLoading}
                  style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isLoading}
                  style={{ flex: 1, padding: '10px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                  {isLoading ? (editingEmployee ? 'Updating…' : 'Adding…') : editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && deletingEmployee && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: '400px', padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={22} style={{ color: '#ef4444' }} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Delete Employee?</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px' }}>Are you sure you want to delete <strong style={{ color: '#374151' }}>{deletingEmployee.name}</strong>? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setIsDeleteModalOpen(false)} style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDocument && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>{previewDocument.name}</h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleDownloadDocument(previewDocument.url, previewDocument.name)} style={{ padding: '6px', color: '#3b82f6', background: '#eff6ff', border: 'none', borderRadius: '7px', cursor: 'pointer', display: 'flex' }}><Download size={15} /></button>
                <button onClick={() => setPreviewDocument(null)} style={{ padding: '6px', color: '#6b7280', background: '#f9fafb', border: 'none', borderRadius: '7px', cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '20px', background: '#f8fafc' }}>
              {previewDocument.url.includes('application/pdf')
                ? <embed src={previewDocument.url} type="application/pdf" style={{ width: '100%', minHeight: '500px', borderRadius: '8px' }} />
                : <img src={previewDocument.url} alt={previewDocument.name} style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              }
            </div>
          </div>
        </div>
      )}

      {/* Salary Modal */}
      {salaryEmployee && (
        <SalaryModal employee={salaryEmployee} currentUser={user?.name ?? 'Admin'} onClose={() => setSalaryEmployee(null)} />
      )}
    </div>
  );
};

export default EmployeePage;