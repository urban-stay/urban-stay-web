import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Search, TrendingUp, AlertCircle, IndianRupee, Users, ChevronDown } from 'lucide-react';
import { fetchRentRecordsAPI, getStudentsAPI, updateRentRecordAPI } from '../service';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Student {
    id: number;
    name: string;
    roomNo: string;
    bedNo: string;
    monthlyFee: string | number;
    status: 'Active' | 'Pending' | 'Inactive';
}

export type PaymentStatus = 'Paid' | 'Unpaid' | 'Partial';

export interface RentRecord {
    id?: number;
    studentId: number;
    year: number;
    month: number;
    status: PaymentStatus;
    paidDate?: string;
    paidAmount?: string;
    note?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

const fetchRentRecords = async (year: number, month: number): Promise<RentRecord[]> => {
    const response = await fetchRentRecordsAPI(year, month);
    return response.data.map((r: any) => ({
        id: r.id,
        studentId: r.student?.id ?? r.studentId,
        year: r.year,
        month: r.month,
        status: r.status as PaymentStatus,
        paidDate: r.paidDate ?? '',
        paidAmount: r.paidAmount != null ? String(r.paidAmount) : '',
        note: r.note ?? '',
    }));
};

const updateRentRecord = async (record: RentRecord): Promise<RentRecord> => {
    const response = await updateRentRecordAPI({
        studentId: record.studentId,
        year: record.year,
        month: record.month,
        status: record.status,
        paidDate: record.paidDate || undefined,
        paidAmount: record.paidAmount || undefined,
        note: record.note || undefined,
    });
    const r = response.data;
    return {
        id: r.id,
        studentId: r.student?.id ?? r.studentId,
        year: r.year,
        month: r.month,
        status: r.status as PaymentStatus,
        paidDate: r.paidDate ?? '',
        paidAmount: r.paidAmount != null ? String(r.paidAmount) : '',
        note: r.note ?? '',
    };
};

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const PAGE_SIZE = 8;

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#06b6d4'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getMonthlyFeeNumber = (fee: string | number): number => Number(String(fee).replace(/[^0-9.]/g, '')) || 0;

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar: React.FC<{ name: string; idx: number; size?: 'sm' | 'md' }> = ({ name, idx, size = 'md' }) => (
    <div className={`${size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'} rounded-xl flex items-center justify-center font-bold text-white shrink-0`}
        style={{ backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
        {name.charAt(0).toUpperCase()}
    </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
    const cfg = {
        Paid: { color: '#166534', bg: '#dcfce7', border: '#86efac', icon: <CheckCircle size={12} /> },
        Partial: { color: '#92400e', bg: '#fef9c3', border: '#fde047', icon: <Clock size={12} /> },
        Unpaid: { color: '#991b1b', bg: '#fee2e2', border: '#fca5a5', icon: <XCircle size={12} /> },
    }[status];
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
            style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
            {cfg.icon}
            {status}
        </span>
    );
};

// ─── Payment Modal ────────────────────────────────────────────────────────────

interface PaymentModalProps {
    student: Student;
    record: RentRecord;
    studentIdx: number;
    onSave: (record: RentRecord) => void;
    onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ student, record, studentIdx, onSave, onClose }) => {
    const maxFee = getMonthlyFeeNumber(student.monthlyFee);
    const [form, setForm] = useState<RentRecord>({ ...record });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [amountError, setAmountError] = useState<string | null>(null);

    const handleAmountChange = (val: string) => {
        setAmountError(null);
        const num = Number(val);
        if (val && num > maxFee) {
            setAmountError(`Amount cannot exceed monthly fee of ₹${maxFee}`);
        }
        setForm(f => ({ ...f, paidAmount: val }));
    };

    const handleSave = async () => {
        const num = Number(form.paidAmount);

        // 🔴 Mandatory validation

        if (!form.paidDate) {
            setError('Paid date is required');
            return;
        }

        if (!form.paidAmount) {
            setAmountError('Paid amount is required');
            return;
        }
        // 🔴 Number validation
        if (isNaN(num) || num < 0) {
            setAmountError('Please enter a valid non-negative number');
            return;
        }

        // 🔴 Max fee validation
        if (num > maxFee) {
            setAmountError(`Amount cannot exceed monthly fee of ₹${maxFee}`);
            return;
        }

        setSaving(true);
        setError(null);

        try {
            console.log(form);

            const saved = await updateRentRecord(form);
            onSave(saved);
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">

                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar name={student.name} idx={studentIdx} />
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                            <p className="text-xs text-gray-400">
                                Room {student.roomNo} · {student.bedNo} ·{' '}
                                <span className="text-[#5B4FE9] font-medium">{MONTHS[form.month - 1]} {form.year}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-lg">×</button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Status */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Payment Status</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['Paid', 'Unpaid', 'Partial'] as PaymentStatus[]).map(s => {
                                const active = form.status === s;
                                const styles = {
                                    Paid: { active: '#15803d', bg: '#dcfce7', border: '#86efac' },
                                    Unpaid: { active: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' },
                                    Partial: { active: '#92400e', bg: '#fef9c3', border: '#fde047' },
                                }[s];
                                return (
                                    <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                                        className="py-2 rounded-xl text-sm font-semibold transition-all"
                                        style={active
                                            ? { color: styles.active, background: styles.bg, border: `2px solid ${styles.border}` }
                                            : { color: '#6b7280', background: 'white', border: '2px solid #e5e7eb' }
                                        }
                                    >{s}</button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date */}
                    {form.status !== 'Unpaid' && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Payment Date</label>
                            <input type="date" max={new Date().toISOString().split("T")[0]} value={form.paidDate || ''}
                                onChange={e => setForm(f => ({ ...f, paidDate: e.target.value }))}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/10 transition-all"
                            />
                        </div>
                    )}

                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                            Amount
                            {form.status === 'Partial' && <span className="text-amber-600 font-normal ml-1">(partial payment)</span>}
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                            <input
                                type="number"
                                value={form.paidAmount || ''}
                                placeholder={String(maxFee)}
                                min={0}
                                max={maxFee}
                                onChange={e => handleAmountChange(e.target.value)}
                                className={`w-full pl-8 pr-4 py-2.5 border rounded-xl text-sm text-gray-800 outline-none transition-all
                                    ${amountError
                                        ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                        : 'border-gray-200 focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/10'
                                    }`}
                            />
                        </div>
                        {amountError ? (
                            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                <AlertCircle size={11} /> {amountError}
                            </p>
                        ) : (
                            <p className="text-xs text-gray-400 mt-1.5">Max: ₹{maxFee} (monthly fee)</p>
                        )}
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Note <span className="font-normal text-gray-400">(optional)</span></label>
                        <textarea value={form.note || ''} rows={2} placeholder="e.g. Paid via UPI, cash, etc."
                            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/10 resize-none transition-all"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                            <AlertCircle size={13} className="text-red-500 shrink-0" />
                            <p className="text-xs text-red-600">{error}</p>
                        </div>
                    )}
                </div>

                <div className="px-5 pb-5 flex gap-2.5">
                    <button type="button" onClick={onClose} disabled={saving}
                        className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSave} disabled={saving || !!amountError}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: '#5B4FE9', boxShadow: '0 4px 12px rgba(91,79,233,0.3)' }}>
                        {saving ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Saving...
                            </span>
                        ) : 'Save Payment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Annual Grid ──────────────────────────────────────────────────────────────

interface AnnualGridProps {
    students: Student[];
    year: number;
    allRecords: Map<string, RentRecord>;
    onCellClick: (student: Student, month: number, studentIdx: number) => void;
    page: number;
    onPageChange: (p: number) => void;
}

const AnnualGrid: React.FC<AnnualGridProps> = ({ students, year, allRecords, onCellClick, page, onPageChange }) => {
    const totalPages = Math.ceil(students.length / PAGE_SIZE);
    const paged = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const getStatus = (studentId: number, month: number): PaymentStatus =>
        allRecords.get(`${studentId}-${year}-${month}`)?.status ?? 'Unpaid';

    // Year-level summary stats
    const totalPaid = MONTHS.reduce((acc, _, mi) =>
        acc + students.filter(s => getStatus(s.id, mi + 1) === 'Paid').length, 0);
    const totalPartial = MONTHS.reduce((acc, _, mi) =>
        acc + students.filter(s => getStatus(s.id, mi + 1) === 'Partial').length, 0);
    const totalCells = students.length * 12;
    const collectionRate = totalCells > 0 ? Math.round((totalPaid / totalCells) * 100) : 0;

    return (
        <div>
            {/* Year summary strip */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                    { label: 'Paid Months', value: totalPaid, suffix: 'entries', color: '#166534', bg: '#f0fdf4', border: '#bbf7d0', accent: '#10b981' },
                    { label: 'Partial', value: totalPartial, suffix: 'entries', color: '#92400e', bg: '#fffbeb', border: '#fde68a', accent: '#f59e0b' },
                    { label: 'Collection Rate', value: `${collectionRate}%`, suffix: 'this year', color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe', accent: '#3b82f6' },
                ].map(card => (
                    <div key={card.label} className="rounded-xl p-4 border flex items-center gap-3"
                        style={{ background: card.bg, borderColor: card.border }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `${card.accent}18` }}>
                            <span className="text-lg font-bold leading-none" style={{ color: card.accent }}>{card.value}</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold" style={{ color: card.color }}>{card.label}</p>
                            <p className="text-xs text-gray-400">{card.suffix}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Inline legend */}
            <div className="flex items-center gap-4 mb-3 px-1">
                {[
                    { label: 'Paid', bg: '#dcfce7', color: '#15803d', border: '#86efac', symbol: '✓' },
                    { label: 'Partial', bg: '#fef9c3', color: '#92400e', border: '#fde047', symbol: '~' },
                    { label: 'Unpaid', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5', symbol: '✗' },
                    { label: 'Future', bg: '#f9fafb', color: '#d1d5db', border: '#e5e7eb', symbol: '·' },
                ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center font-bold border"
                            style={{ background: l.bg, color: l.color, borderColor: l.border, fontSize: 9 }}>
                            {l.symbol}
                        </div>
                        <span className="text-xs text-gray-500">{l.label}</span>
                    </div>
                ))}
                <span className="text-xs text-gray-400 ml-2">· Click a cell to update</span>
            </div>

            {/* Grid table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-215 text-sm border-collapse">
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th className="px-4 py-2.5 text-left sticky left-0 z-10 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200"
                                style={{ background: '#f8fafc', minWidth: 160 }}>
                                Student
                            </th>
                            {MONTHS.map((m, mi) => {
                                const isThisMonth = year === currentYear && mi + 1 === currentMonth;
                                return (
                                    <th key={m}
                                        className="py-2.5 text-center text-xs font-semibold uppercase tracking-wider border-b"
                                        style={{
                                            color: isThisMonth ? '#5B4FE9' : '#9ca3af',
                                            background: isThisMonth ? '#eeecfd' : '#f8fafc',
                                            borderColor: isThisMonth ? '#5B4FE9' : '#e5e7eb',
                                            borderBottomWidth: isThisMonth ? 2 : 1,
                                            minWidth: 44,
                                        }}>
                                        {m.slice(0, 3)}
                                    </th>
                                );
                            })}
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200"
                                style={{ background: '#f8fafc', minWidth: 110 }}>
                                Progress
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paged.map((student, i) => {
                            const realIdx = (page - 1) * PAGE_SIZE + i;
                            const paidCount = MONTHS.filter((_, mi) => getStatus(student.id, mi + 1) === 'Paid').length;
                            const partialCount = MONTHS.filter((_, mi) => getStatus(student.id, mi + 1) === 'Partial').length;
                            const pct = Math.round((paidCount / 12) * 100);

                            return (
                                <tr key={student.id}
                                    className="transition-colors"
                                    style={{ borderBottom: '1px solid #f1f5f9', background: 'white' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#fafbff')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}>

                                    {/* Student name */}
                                    <td className="px-4 py-3 sticky left-0 z-10"
                                        style={{ background: 'inherit', borderRight: '1px solid #f1f5f9' }}>
                                        <div className="flex items-center gap-2.5">
                                            <Avatar name={student.name} idx={realIdx} size="sm" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 truncate" style={{ maxWidth: 100 }}>{student.name}</p>
                                                <p className="text-xs text-gray-400">Rm {student.roomNo}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Month status cells */}
                                    {MONTHS.map((_, mi) => {
                                        const m = mi + 1;
                                        const status = getStatus(student.id, m);
                                        const isFuture = year > currentYear || (year === currentYear && m > currentMonth);
                                        const isThisMonth = year === currentYear && m === currentMonth;

                                        const cellBg: React.CSSProperties = isFuture
                                            ? { background: '#f9fafb', color: '#d1d5db', cursor: 'not-allowed', border: '1px solid #f3f4f6' }
                                            : status === 'Paid'
                                                ? { background: '#dcfce7', color: '#15803d', cursor: 'pointer', border: '1px solid #86efac' }
                                                : status === 'Partial'
                                                    ? { background: '#fef9c3', color: '#92400e', cursor: 'pointer', border: '1px solid #fde047' }
                                                    : { background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', border: '1px solid #fca5a5' };

                                        return (
                                            <td key={m} className="py-3 text-center"
                                                style={{ background: isThisMonth ? '#f7f6ff' : undefined }}>
                                                <button
                                                    type="button"
                                                    onClick={() => !isFuture && onCellClick(student, m, realIdx)}
                                                    disabled={isFuture}
                                                    title={`${student.name} — ${MONTHS[mi]} ${year}: ${status}`}
                                                    className="w-8 h-8 rounded-lg text-xs font-bold transition-all duration-100 mx-auto flex items-center justify-center hover:scale-110 hover:shadow-md"
                                                    style={cellBg}
                                                >
                                                    {isFuture ? '·' : status === 'Paid' ? '✓' : status === 'Partial' ? '~' : '✗'}
                                                </button>
                                            </td>
                                        );
                                    })}

                                    {/* Progress */}
                                    <td className="px-4 py-3" style={{ borderLeft: '1px solid #f1f5f9' }}>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-bold"
                                                    style={{ color: paidCount === 12 ? '#15803d' : paidCount > 6 ? '#92400e' : '#b91c1c' }}>
                                                    {paidCount}/12
                                                </span>
                                                <span className="text-xs text-gray-400">{pct}%</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden" style={{ minWidth: 60 }}>
                                                <div className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${pct}%`,
                                                        background: paidCount === 12 ? '#10b981' : paidCount > 6 ? '#f59e0b' : '#ef4444',
                                                    }} />
                                            </div>
                                            {partialCount > 0 && (
                                                <p className="text-xs text-amber-600">{partialCount} partial</p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={onPageChange} total={students.length} />}
        </div>
    );
};

// ─── Monthly List ─────────────────────────────────────────────────────────────

interface MonthlyListProps {
    students: Student[];
    year: number;
    month: number;
    allRecords: Map<string, RentRecord>;
    onRowClick: (student: Student, month: number, studentIdx: number) => void;
    page: number;
    onPageChange: (p: number) => void;
}

const MonthlyList: React.FC<MonthlyListProps> = ({ students, year, month, allRecords, onRowClick, page, onPageChange }) => {
    const getRecord = (studentId: number) => allRecords.get(`${studentId}-${year}-${month}`);
    const paid = students.filter(s => getRecord(s.id)?.status === 'Paid').length;
    const partial = students.filter(s => getRecord(s.id)?.status === 'Partial').length;
    const unpaid = students.length - paid - partial;
    const paidPct = students.length > 0 ? Math.round((paid / students.length) * 100) : 0;

    const totalPages = Math.ceil(students.length / PAGE_SIZE);
    const paged = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                    { label: 'Paid', count: paid, color: '#166534', bg: '#f0fdf4', border: '#bbf7d0', accent: '#10b981' },
                    { label: 'Partial', count: partial, color: '#92400e', bg: '#fffbeb', border: '#fde68a', accent: '#f59e0b' },
                    { label: 'Unpaid', count: unpaid, color: '#991b1b', bg: '#fff1f2', border: '#fecdd3', accent: '#ef4444' },
                ].map(card => (
                    <div key={card.label} className="rounded-xl p-4 border flex items-center gap-3"
                        style={{ background: card.bg, borderColor: card.border }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `${card.accent}20` }}>
                            <span className="text-xl font-bold" style={{ color: card.accent }}>{card.count}</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold" style={{ color: card.color }}>{card.label}</p>
                            <p className="text-xs text-gray-400">students</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <div className="mb-5">
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-gray-500">Collection progress</span>
                    <span className="text-xs font-bold text-[#5B4FE9]">{paidPct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${paidPct}%`, background: 'linear-gradient(90deg, #5B4FE9, #10b981)' }} />
                </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-12 px-3 py-2 mb-1 rounded-lg bg-gray-50 border border-gray-100">
                <div className="col-span-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</div>
                <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Monthly Fee</div>
                <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Date</div>
                <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Status</div>
            </div>

            {/* Student rows */}
            <div className="divide-y divide-gray-100">
                {paged.map((student, i) => {
                    const realIdx = (page - 1) * PAGE_SIZE + i;
                    const record = getRecord(student.id);
                    const status: PaymentStatus = record?.status ?? 'Unpaid';
                    return (
                        <div key={student.id} onClick={() => onRowClick(student, month, realIdx)}
                            className="grid grid-cols-12 items-center px-3 py-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="col-span-5 flex items-center gap-3">
                                <Avatar name={student.name} idx={realIdx} />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{student.name}</p>
                                    <p className="text-xs text-gray-400">Room {student.roomNo} · {student.bedNo}</p>
                                </div>
                            </div>
                            <div className="col-span-3 text-right">
                                <p className="text-sm font-bold text-gray-700">₹{student.monthlyFee}</p>
                                {record?.paidAmount && record.paidAmount !== String(student.monthlyFee) && (
                                    <p className="text-xs text-amber-600">Paid ₹{record.paidAmount}</p>
                                )}
                            </div>
                            <div className="col-span-2 text-center">
                                {record?.paidDate
                                    ? <span className="text-xs text-gray-500">{record.paidDate}</span>
                                    : <span className="text-xs text-gray-300">—</span>
                                }
                            </div>
                            <div className="col-span-2 flex justify-end">
                                <StatusBadge status={status} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={onPageChange} total={students.length} />}
        </div>
    );
};

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination: React.FC<{ page: number; totalPages: number; onChange: (p: number) => void; total: number }> = ({ page, totalPages, onChange, total }) => {
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, total);
    return (
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Showing {start}–{end} of {total} students</p>
            <div className="flex items-center gap-1">
                <button onClick={() => onChange(page - 1)} disabled={page === 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => onChange(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${p === page ? 'text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                            }`}
                        style={p === page ? { background: '#5B4FE9' } : {}}>
                        {p}
                    </button>
                ))}
                <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight size={15} />
                </button>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

type ViewMode = 'monthly' | 'annual';

export const RentPaymentPage: React.FC = () => {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [viewMode, setViewMode] = useState<ViewMode>('monthly');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'All'>('All');
    const [page, setPage] = useState(1);

    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [records, setRecords] = useState<Map<string, RentRecord>>(new Map());
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [editingContext, setEditingContext] = useState<{ student: Student; month: number; idx: number } | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoadingStudents(true);
                const data: any = await getStudentsAPI();
                setAllStudents(data?.data ?? data);
            } catch (err) {
                console.error('Failed to fetch students', err);
            } finally {
                setLoadingStudents(false);
            }
        };
        load();
    }, []);

    const loadRentRecords = useCallback(async (y: number, m: number) => {
        try {
            setLoadingRecords(true);
            const data = await fetchRentRecords(y, m);
            setRecords(prev => {
                const next = new Map(prev);
                for (const key of next.keys()) {
                    if (key.endsWith(`-${y}-${m}`)) next.delete(key);
                }
                data.forEach(r => next.set(`${r.studentId}-${r.year}-${r.month}`, r));
                return next;
            });
        } catch (err) {
            console.error('Failed to fetch rent records', err);
        } finally {
            setLoadingRecords(false);
        }
    }, []);

    useEffect(() => {
        if (viewMode === 'monthly') loadRentRecords(year, month);
    }, [year, month, viewMode, loadRentRecords]);

    useEffect(() => {
        if (viewMode === 'annual') {
            for (let m = 1; m <= 12; m++) loadRentRecords(year, m);
        }
    }, [viewMode, year, loadRentRecords]);

    // Reset page on filter/view change
    useEffect(() => { setPage(1); }, [searchTerm, statusFilter, viewMode, month, year]);

    const handleSave = (record: RentRecord) => {
        const key = `${record.studentId}-${record.year}-${record.month}`;
        setRecords(prev => new Map(prev).set(key, record));
        setEditingContext(null);
    };

    const getEditRecord = (): RentRecord => {
        if (!editingContext) throw new Error();
        const key = `${editingContext.student.id}-${year}-${editingContext.month}`;
        return records.get(key) ?? { studentId: editingContext.student.id, year, month: editingContext.month, status: 'Unpaid' };
    };

    const activeStudents = allStudents?.filter(s => s?.status === 'Active') ?? [];

    const filteredStudents = activeStudents.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.roomNo.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchSearch) return false;
        if (statusFilter !== 'All') {
            const status: PaymentStatus = records.get(`${s.id}-${year}-${month}`)?.status ?? 'Unpaid';
            if (status !== statusFilter) return false;
        }
        return true;
    });

    const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };
    const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - i);

    const paidThisMonth = activeStudents.filter(s => records.get(`${s.id}-${year}-${month}`)?.status === 'Paid').length;
    const unpaidThisMonth = activeStudents.length - paidThisMonth;

    return (
        <div className="min-h-screen bg-gray-50/70">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg,#5B4FE9,#8b5cf6)', boxShadow: '0 4px 12px rgba(91,79,233,0.3)' }}>
                                <IndianRupee size={17} className="text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Rent Payment Tracker</h1>
                        </div>
                        <p className="text-sm text-gray-500 ml-11">Track and manage monthly rent payments · {activeStudents.length} active students</p>
                    </div>
                    <div className="flex items-center gap-2 ml-11 sm:ml-0">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                            <TrendingUp size={13} className="text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-700">{paidThisMonth} paid</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
                            <AlertCircle size={13} className="text-red-500" />
                            <span className="text-xs font-semibold text-red-600">{unpaidThisMonth} due</span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 mb-5 flex flex-wrap items-center gap-3">

                    {/* View toggle */}
                    <div className="flex rounded-lg overflow-hidden gap-4">
                        {(['monthly', 'annual'] as ViewMode[]).map(v => (
                            <button key={v} onClick={() => setViewMode(v)}
                                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${viewMode === v ? 'bg-[#5B4FE9] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                                    }`}>{v}</button>
                        ))}
                    </div>

                    {/* Month nav */}
                    {viewMode === 'monthly' && (
                        <div className="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-200 px-1 py-1">
                            <button onClick={prevMonth}
                            //  className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-white hover:text-gray-600 transition-all"
                            >
                                <ChevronLeft size={15} />
                            </button>
                            <span className="text-sm font-semibold text-gray-700 min-w-30 text-center px-1">
                                {MONTHS[month - 1]} {year}
                            </span>
                            <button onClick={nextMonth}
                            // className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-white hover:text-gray-600 transition-all"
                            >
                                <ChevronRight size={15} />
                            </button>
                        </div>
                    )}

                    {/* Year select */}
                    {viewMode === 'annual' && (
                        <div className="relative">
                            <select value={year} onChange={e => setYear(Number(e.target.value))}
                                className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white outline-none focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/10 cursor-pointer">
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    )}

                    <div className="flex-1" />

                    {/* Search */}
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search student or room..." value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/10 w-52 bg-white transition-all"
                        />
                    </div>

                    {/* Status filter */}
                    {viewMode === 'monthly' && (
                        <div className="relative">
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as PaymentStatus | 'All')}
                                className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white outline-none focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/10 cursor-pointer">
                                <option value="All">All Status</option>
                                <option value="Paid">Paid</option>
                                <option value="Partial">Partial</option>
                                <option value="Unpaid">Unpaid</option>
                            </select>
                            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    )}
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Card top bar */}
                    <div className="px-5 py-2.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Paid
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />Partial
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-200 border border-gray-300" />Unpaid
                            </div>
                            {viewMode === 'annual' && (
                                <span className="text-xs text-gray-400 hidden sm:inline">· click any cell to update</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {loadingRecords && <div className="h-4 w-4 border-2 border-[#5B4FE9]/30 border-t-[#5B4FE9] rounded-full animate-spin" />}
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Users size={12} />{filteredStudents.length} students
                            </div>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6">
                        {loadingStudents ? (
                            <div className="py-16 text-center">
                                <div className="h-9 w-9 border-2 border-[#5B4FE9]/20 border-t-[#5B4FE9] rounded-full animate-spin mx-auto mb-3" />
                                <p className="text-sm text-gray-400">Loading students...</p>
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="py-16 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                    <Users size={24} className="text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-400">No students found</p>
                                {searchTerm && <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>}
                            </div>
                        ) : viewMode === 'monthly' ? (
                            <MonthlyList
                                students={filteredStudents} year={year} month={month} allRecords={records}
                                onRowClick={(student, m, idx) => setEditingContext({ student, month: m, idx })}
                                page={page} onPageChange={setPage}
                            />
                        ) : (
                            <AnnualGrid
                                students={filteredStudents} year={year} allRecords={records}
                                onCellClick={(student, m, idx) => setEditingContext({ student, month: m, idx })}
                                page={page} onPageChange={setPage}
                            />
                        )}
                    </div>
                </div>
            </div>

            {editingContext && (
                <PaymentModal
                    student={editingContext.student}
                    record={getEditRecord()}
                    studentIdx={editingContext.idx}
                    onSave={handleSave}
                    onClose={() => setEditingContext(null)}
                />
            )}
        </div>
    );
};

export default RentPaymentPage;