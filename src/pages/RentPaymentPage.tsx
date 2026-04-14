import React, { useState, useEffect, useCallback } from 'react';
import {
    CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight,
    Search, TrendingUp, AlertCircle, IndianRupee, Users,
    ChevronDown, CalendarDays, LayoutGrid, List, Wallet
} from 'lucide-react';
import { fetchRentRecordsAPI, getStudentsAPI, updateRentRecordAPI } from '../service';

// ─── Types ────────────────────────────────────────────────────────────────────

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
        year: r.year, month: r.month,
        status: r.status as PaymentStatus,
        paidDate: r.paidDate ?? '',
        paidAmount: r.paidAmount != null ? String(r.paidAmount) : '',
        note: r.note ?? '',
    }));
};

const updateRentRecord = async (record: RentRecord): Promise<RentRecord> => {
    const response = await updateRentRecordAPI({
        studentId: record.studentId, year: record.year, month: record.month,
        status: record.status,
        paidDate: record.paidDate || undefined,
        paidAmount: record.paidAmount || undefined,
        note: record.note || undefined,
    });
    const r = response.data;
    return {
        id: r.id,
        studentId: r.student?.id ?? r.studentId,
        year: r.year, month: r.month,
        status: r.status as PaymentStatus,
        paidDate: r.paidDate ?? '',
        paidAmount: r.paidAmount != null ? String(r.paidAmount) : '',
        note: r.note ?? '',
    };
};

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const PAGE_SIZE = 8;

const AVATAR_GRADIENTS = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-teal-500 to-emerald-600',
    'from-orange-500 to-rose-500',
    'from-pink-500 to-fuchsia-600',
    'from-sky-500 to-blue-600',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-indigo-500 to-violet-600',
];

const STATUS_STYLES = {
    Paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400', pill: 'bg-emerald-500' },
    Partial: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400', pill: 'bg-amber-500' },
    Unpaid: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-400', pill: 'bg-rose-500' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getMonthlyFeeNumber = (fee: string | number) =>
    Number(String(fee).replace(/[^0-9.]/g, '')) || 0;

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar: React.FC<{ name: string; idx: number; size?: 'sm' | 'md' | 'lg' }> = ({ name, idx, size = 'md' }) => {
    const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 sm:w-10 sm:h-10 text-sm';
    return (
        <div className={`${sizeClass} rounded-xl bg-gradient-to-br ${AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]} flex items-center justify-center font-bold text-white shrink-0 shadow-sm`}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
    const s = STATUS_STYLES[status];
    const icon = { Paid: <CheckCircle size={11} />, Partial: <Clock size={11} />, Unpaid: <XCircle size={11} /> }[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${s.bg} ${s.text} ${s.border}`}>
            {icon}{status}
        </span>
    );
};

// ─── Payment Modal ────────────────────────────────────────────────────────────

const PaymentModal: React.FC<{
    student: Student; record: RentRecord; studentIdx: number;
    onSave: (r: RentRecord) => void; onClose: () => void;
}> = ({ student, record, studentIdx, onSave, onClose }) => {
    const maxFee = getMonthlyFeeNumber(student.monthlyFee);
    const [form, setForm] = useState<RentRecord>({ ...record });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [amountError, setAmountError] = useState<string | null>(null);

    const handleAmountChange = (val: string) => {
        setAmountError(null);
        if (val && Number(val) > maxFee) setAmountError(`Cannot exceed ₹${maxFee}`);
        setForm(f => ({ ...f, paidAmount: val }));
    };

    const handleSave = async () => {
        const num = Number(form.paidAmount);
        if (!form.paidDate && form.status !== 'Unpaid') { setError('Paid date is required'); return; }
        if (!form.paidAmount) { setAmountError('Paid amount is required'); return; }
        if (isNaN(num) || num < 0) { setAmountError('Enter a valid non-negative number'); return; }
        if (num > maxFee) { setAmountError(`Cannot exceed ₹${maxFee}`); return; }
        setSaving(true); setError(null);
        try {
            const saved = await updateRentRecord(form);
            onSave(saved);
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to save. Please try again.');
        } finally { setSaving(false); }
    };

    const monthName = MONTHS[form.month - 1];

    return (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full sm:rounded-2xl sm:max-w-md rounded-t-2xl shadow-2xl border border-slate-100 max-h-[95vh] flex flex-col overflow-hidden">

                {/* Colored top stripe based on status */}
                <div className={`h-1 w-full ${STATUS_STYLES[form.status].pill}`} />

                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/60">
                    <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={student.name} idx={studentIdx} size="lg" />
                        <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{student.name}</p>
                            <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                                Room {student.roomNo} · {student.bedNo}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                <CalendarDays size={10} className="text-violet-500" />
                                <span className="text-[11px] text-violet-600 font-bold">{monthName} {form.year}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors text-lg font-light shrink-0">
                        ×
                    </button>
                </div>

                <div className="p-5 space-y-5 overflow-y-auto flex-1">

                    {/* Fee info bar */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <span className="text-xs text-slate-500 font-semibold">Monthly Rent</span>
                        <div className="flex items-center gap-1">
                            <IndianRupee size={13} className="text-slate-500" />
                            <span className="text-sm font-bold text-slate-800">{maxFee.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    {/* Status selector */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payment Status</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['Paid', 'Partial', 'Unpaid'] as PaymentStatus[]).map(s => {
                                const active = form.status === s;
                                const st = STATUS_STYLES[s];
                                return (
                                    <button key={s} type="button"
                                        onClick={() => setForm(f => ({ ...f, status: s }))}
                                        className={`py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${active ? `${st.bg} ${st.text} ${st.border} shadow-sm` : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}>
                                        {s}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date */}
                    {form.status !== 'Unpaid' && (
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payment Date</label>
                            <input type="date" max={new Date().toISOString().split('T')[0]} value={form.paidDate || ''}
                                onChange={e => setForm(f => ({ ...f, paidDate: e.target.value }))}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white shadow-sm" />
                        </div>
                    )}

                    {/* Amount */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Amount {form.status === 'Partial' && <span className="text-amber-500 font-semibold normal-case tracking-normal ml-1">(partial)</span>}
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">₹</span>
                            <input type="number" value={form.paidAmount || ''} placeholder={String(maxFee)} min={0} max={maxFee}
                                onChange={e => handleAmountChange(e.target.value)}
                                className={`w-full pl-8 pr-4 py-2.5 border rounded-xl text-sm text-slate-800 outline-none transition-all bg-white shadow-sm font-semibold
                                    ${amountError
                                        ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                                        : 'border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100'}`} />
                        </div>
                        {amountError
                            ? <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-medium"><AlertCircle size={11} />{amountError}</p>
                            : <p className="text-xs text-slate-400 mt-1.5 font-medium">Max: ₹{maxFee.toLocaleString('en-IN')}</p>
                        }
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Note <span className="font-normal text-slate-300 normal-case tracking-normal">(optional)</span>
                        </label>
                        <textarea value={form.note || ''} rows={2} placeholder="e.g. Paid via UPI, cash…"
                            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none transition-all bg-white shadow-sm" />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 px-3.5 py-3 bg-rose-50 border border-rose-100 rounded-xl">
                            <AlertCircle size={13} className="text-rose-500 shrink-0" />
                            <p className="text-xs text-rose-600 font-medium">{error}</p>
                        </div>
                    )}
                </div>

                <div className="px-5 pb-5 pt-3 flex gap-3 shrink-0 border-t border-slate-100 bg-slate-50/40">
                    <button type="button" onClick={onClose} disabled={saving}
                        className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50 shadow-sm">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSave} disabled={saving || !!amountError}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-200 active:scale-95">
                        {saving ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…
                            </span>
                        ) : 'Save Payment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Annual Grid ──────────────────────────────────────────────────────────────

const AnnualGrid: React.FC<{
    students: Student[]; year: number; allRecords: Map<string, RentRecord>;
    onCellClick: (student: Student, month: number, idx: number) => void;
    page: number; onPageChange: (p: number) => void;
}> = ({ students, year, allRecords, onCellClick, page, onPageChange }) => {
    const totalPages = Math.ceil(students.length / PAGE_SIZE);
    const paged = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const getStatus = (studentId: number, month: number): PaymentStatus =>
        allRecords.get(`${studentId}-${year}-${month}`)?.status ?? 'Unpaid';

    const totalPaid = MONTHS.reduce((acc, _, mi) =>
        acc + students.filter(s => getStatus(s.id, mi + 1) === 'Paid').length, 0);
    const totalPartial = MONTHS.reduce((acc, _, mi) =>
        acc + students.filter(s => getStatus(s.id, mi + 1) === 'Partial').length, 0);
    const collectionRate = students.length > 0 ? Math.round((totalPaid / (students.length * 12)) * 100) : 0;

    return (
        <div>
            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
                {[
                    { label: 'Paid Months', value: totalPaid, sub: 'entries', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', num: 'text-emerald-600' },
                    { label: 'Partial', value: totalPartial, sub: 'entries', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', num: 'text-amber-600' },
                    { label: 'Collection Rate', value: `${collectionRate}%`, sub: 'this year', bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', num: 'text-violet-600' },
                ].map(c => (
                    <div key={c.label} className={`rounded-xl p-3 sm:p-4 border ${c.bg} ${c.border} flex flex-col gap-0.5`}>
                        <p className={`text-lg sm:text-2xl font-bold ${c.num} leading-none`}>{c.value}</p>
                        <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide ${c.text} mt-0.5`}>{c.label}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{c.sub}</p>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 mb-4 px-1">
                {[
                    { label: 'Paid', bg: 'bg-emerald-100', text: 'text-emerald-700', symbol: '✓' },
                    { label: 'Partial', bg: 'bg-amber-100', text: 'text-amber-700', symbol: '~' },
                    { label: 'Unpaid', bg: 'bg-rose-100', text: 'text-rose-700', symbol: '✗' },
                    { label: 'Future', bg: 'bg-slate-100', text: 'text-slate-400', symbol: '·' },
                ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[9px] ${l.bg} ${l.text}`}>
                            {l.symbol}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{l.label}</span>
                    </div>
                ))}
                <span className="text-xs text-slate-400 hidden sm:inline ml-1">· Click a cell to update</span>
            </div>

            {/* Scrollable grid */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 -mx-1 sm:mx-0 shadow-sm">
                <table className="w-full text-sm border-collapse" style={{ minWidth: 580 }}>
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-3 py-3 text-left sticky left-0 z-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-r border-slate-100" style={{ minWidth: 140 }}>
                                Student
                            </th>
                            {MONTHS.map((m, mi) => {
                                const isThis = year === currentYear && mi + 1 === currentMonth;
                                return (
                                    <th key={m} className={`py-3 text-center text-[10px] font-bold uppercase tracking-wider ${isThis ? 'text-violet-600 bg-violet-50' : 'text-slate-400 bg-slate-50'}`}
                                        style={{ minWidth: 36, borderBottom: isThis ? '2px solid #7c3aed' : undefined }}>
                                        {m.slice(0, 1)}
                                        <span className="hidden sm:inline">{m.slice(1, 3)}</span>
                                    </th>
                                );
                            })}
                            <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-l border-slate-100" style={{ minWidth: 80 }}>
                                Rate
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {paged.map((student, i) => {
                            const realIdx = (page - 1) * PAGE_SIZE + i;
                            const paidCount = MONTHS.filter((_, mi) => getStatus(student.id, mi + 1) === 'Paid').length;
                            const partialCount = MONTHS.filter((_, mi) => getStatus(student.id, mi + 1) === 'Partial').length;
                            const pct = Math.round((paidCount / 12) * 100);

                            return (
                                <tr key={student.id} className="hover:bg-violet-50/20 transition-colors bg-white">
                                    <td className="px-3 py-2.5 sticky left-0 z-10 bg-inherit border-r border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <Avatar name={student.name} idx={realIdx} size="sm" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-800 truncate" style={{ maxWidth: 80 }}>{student.name}</p>
                                                <p className="text-[10px] text-slate-400 font-semibold">R{student.roomNo}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {MONTHS.map((_, mi) => {
                                        const m = mi + 1;
                                        const status = getStatus(student.id, m);
                                        const isFuture = year > currentYear || (year === currentYear && m > currentMonth);
                                        const isThis = year === currentYear && m === currentMonth;

                                        let cellClass = '';
                                        let symbol = '';
                                        if (isFuture) { cellClass = 'bg-slate-100 text-slate-300 cursor-not-allowed'; symbol = '·'; }
                                        else if (status === 'Paid') { cellClass = 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:scale-110 hover:shadow-md cursor-pointer'; symbol = '✓'; }
                                        else if (status === 'Partial') { cellClass = 'bg-amber-100 text-amber-700 hover:bg-amber-200 hover:scale-110 hover:shadow-md cursor-pointer'; symbol = '~'; }
                                        else { cellClass = 'bg-rose-100 text-rose-700 hover:bg-rose-200 hover:scale-110 hover:shadow-md cursor-pointer'; symbol = '✗'; }

                                        return (
                                            <td key={m} className={`py-2.5 text-center ${isThis ? 'bg-violet-50/60' : ''}`}>
                                                <button type="button"
                                                    onClick={() => !isFuture && onCellClick(student, m, realIdx)}
                                                    disabled={isFuture}
                                                    title={`${student.name} — ${MONTHS[mi]} ${year}: ${status}`}
                                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all duration-150 mx-auto flex items-center justify-center ${cellClass}`}>
                                                    {symbol}
                                                </button>
                                            </td>
                                        );
                                    })}

                                    <td className="px-3 py-2.5 border-l border-slate-100">
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-xs font-bold ${paidCount === 12 ? 'text-emerald-600' : paidCount > 6 ? 'text-amber-600' : 'text-rose-600'}`}>
                                                {paidCount}/12
                                            </span>
                                            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden" style={{ minWidth: 48 }}>
                                                <div className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${pct}%`,
                                                        background: paidCount === 12 ? '#10b981' : paidCount > 6 ? '#f59e0b' : '#ef4444'
                                                    }} />
                                            </div>
                                            {partialCount > 0 && (
                                                <p className="text-[10px] text-amber-500 font-bold hidden sm:block">{partialCount}p</p>
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

const MonthlyList: React.FC<{
    students: Student[]; year: number; month: number; allRecords: Map<string, RentRecord>;
    onRowClick: (student: Student, month: number, idx: number) => void;
    page: number; onPageChange: (p: number) => void;
}> = ({ students, year, month, allRecords, onRowClick, page, onPageChange }) => {
    const getRecord = (id: number) => allRecords.get(`${id}-${year}-${month}`);
    const paid = students.filter(s => getRecord(s.id)?.status === 'Paid').length;
    const partial = students.filter(s => getRecord(s.id)?.status === 'Partial').length;
    const unpaid = students.length - paid - partial;
    const paidPct = students.length > 0 ? Math.round((paid / students.length) * 100) : 0;

    const totalPages = Math.ceil(students.length / PAGE_SIZE);
    const paged = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
                {[
                    { label: 'Paid', count: paid, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', num: 'text-emerald-600' },
                    { label: 'Partial', count: partial, bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', num: 'text-amber-600' },
                    { label: 'Unpaid', count: unpaid, bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', num: 'text-rose-600' },
                ].map(c => (
                    <div key={c.label} className={`rounded-xl p-3 sm:p-4 border ${c.bg} ${c.border} flex flex-col gap-0.5`}>
                        <p className={`text-xl sm:text-3xl font-bold ${c.num} leading-none`}>{c.count}</p>
                        <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide ${c.text} mt-0.5`}>{c.label}</p>
                        <p className="text-[10px] text-slate-400 font-medium">students</p>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <div className="mb-5">
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collection progress</span>
                    <span className="text-xs font-bold text-violet-600">{paidPct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-violet-500 to-emerald-500"
                        style={{ width: `${paidPct}%` }} />
                </div>
            </div>

            {/* Table header — desktop only */}
            <div className="hidden sm:grid grid-cols-12 px-3.5 py-2.5 mb-1 rounded-xl bg-slate-50 border border-slate-100">
                {[
                    { label: 'Student', cls: 'col-span-5 text-left' },
                    { label: 'Monthly Fee', cls: 'col-span-3 text-right' },
                    { label: 'Date', cls: 'col-span-2 text-center' },
                    { label: 'Status', cls: 'col-span-2 text-right' },
                ].map(h => (
                    <div key={h.label} className={`${h.cls} text-[10px] font-bold text-slate-400 uppercase tracking-widest`}>{h.label}</div>
                ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-50">
                {paged.map((student, i) => {
                    const realIdx = (page - 1) * PAGE_SIZE + i;
                    const record = getRecord(student.id);
                    const status: PaymentStatus = record?.status ?? 'Unpaid';
                    // const ss = STATUS_STYLES[status];

                    return (
                        <div key={student.id}
                            onClick={() => onRowClick(student, month, realIdx)}
                            className="cursor-pointer hover:bg-violet-50/30 transition-colors rounded-xl group">

                            {/* Desktop row */}
                            <div className="hidden sm:grid grid-cols-12 items-center px-3.5 py-3">
                                <div className="col-span-5 flex items-center gap-3">
                                    <Avatar name={student.name} idx={realIdx} />
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-violet-700 transition-colors">{student.name}</p>
                                        <p className="text-xs text-slate-400 font-medium">Room {student.roomNo} · {student.bedNo}</p>
                                    </div>
                                </div>
                                <div className="col-span-3 text-right">
                                    <div className="flex items-center justify-end gap-0.5">
                                        <IndianRupee size={12} className="text-slate-500" />
                                        <p className="text-sm font-bold text-slate-700">{Number(student.monthlyFee).toLocaleString('en-IN')}</p>
                                    </div>
                                    {record?.paidAmount && record.paidAmount !== String(student.monthlyFee) && (
                                        <p className="text-xs text-amber-600 font-semibold">Paid ₹{record.paidAmount}</p>
                                    )}
                                </div>
                                <div className="col-span-2 text-center">
                                    {record?.paidDate
                                        ? <span className="text-xs text-slate-500 font-medium">{record.paidDate}</span>
                                        : <span className="text-xs text-slate-300">—</span>
                                    }
                                </div>
                                <div className="col-span-2 flex justify-end">
                                    <StatusBadge status={status} />
                                </div>
                            </div>

                            {/* Mobile card */}
                            <div className="sm:hidden flex items-center gap-3 px-2 py-3">
                                <Avatar name={student.name} idx={realIdx} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate">{student.name}</p>
                                    <p className="text-xs text-slate-400 font-medium">Rm {student.roomNo} · {student.bedNo}</p>
                                </div>
                                <div className="text-right shrink-0 mr-1">
                                    <p className="text-xs font-bold text-slate-700">₹{student.monthlyFee}</p>
                                    {record?.paidDate && <p className="text-xs text-slate-400">{record.paidDate}</p>}
                                </div>
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
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 flex-wrap gap-2">
            <p className="text-xs text-slate-400 font-medium">Showing {start}–{end} of {total}</p>
            <div className="flex items-center gap-1">
                <button onClick={() => onChange(page - 1)} disabled={page === 1}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-slate-200">
                    <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => onChange(p)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all border ${p === page ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-200' : 'text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                        {p}
                    </button>
                ))}
                <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-slate-200">
                    <ChevronRight size={14} />
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
            } catch (err) { console.error('Failed to fetch students', err); }
            finally { setLoadingStudents(false); }
        };
        load();
    }, []);

    const loadRentRecords = useCallback(async (y: number, m: number) => {
        try {
            setLoadingRecords(true);
            const data = await fetchRentRecords(y, m);
            setRecords(prev => {
                const next = new Map(prev);
                for (const key of next.keys()) { if (key.endsWith(`-${y}-${m}`)) next.delete(key); }
                data.forEach(r => next.set(`${r.studentId}-${r.year}-${r.month}`, r));
                return next;
            });
        } catch (err) { console.error('Failed to fetch rent records', err); }
        finally { setLoadingRecords(false); }
    }, []);

    useEffect(() => { if (viewMode === 'monthly') loadRentRecords(year, month); }, [year, month, viewMode, loadRentRecords]);
    useEffect(() => { if (viewMode === 'annual') for (let m = 1; m <= 12; m++) loadRentRecords(year, m); }, [viewMode, year, loadRentRecords]);
    useEffect(() => { setPage(1); }, [searchTerm, statusFilter, viewMode, month, year]);

    const handleSave = (record: RentRecord) => {
        setRecords(prev => new Map(prev).set(`${record.studentId}-${record.year}-${record.month}`, record));
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

    // Estimated collection
    // const totalDue = activeStudents.reduce((sum, s) => sum + getMonthlyFeeNumber(s.monthlyFee), 0);
    const totalCollected = activeStudents.reduce((sum, s) => {
        const rec = records.get(`${s.id}-${year}-${month}`);
        return sum + (rec?.paidAmount ? Number(rec.paidAmount) : 0);
    }, 0);

    return (
        <div className="min-h-screen bg-[#f6f7fb]">
            {/* Top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-500" />

            <div className="max-w mx-auto px-3 sm:px-4 md:px-6 py-5 sm:py-8 space-y-5">

                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                        {/* <div className="flex items-center gap-3 mb-1">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-600 shadow-lg shadow-violet-200 shrink-0">
                                <Wallet size={16} className="text-white" />
                            </div>
                            <h1 className="text-xl text-wrap font-bold text-slate-900 tracking-tight">Rent Payment Tracker</h1>
                        </div> */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-600 shadow-lg shadow-violet-200 shrink-0">
                                <Wallet size={16} className="text-white" />
                            </div>

                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight truncate">
                                    Rent Payment Tracker
                                </h1>

                                <p className="text-xs sm:text-sm text-slate-500 truncate">
                                    Track and manage rent payments efficiently
                                </p>
                            </div>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 font-medium ml-12">
                            {activeStudents.length} active residents · {MONTHS[month - 1]} {year}
                        </p>
                    </div>
                    {/* Quick pills */}
                    <div className="flex items-center gap-2 ml-12 sm:ml-0 flex-wrap">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm">
                            <TrendingUp size={12} className="text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-700">{paidThisMonth} paid</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-100 shadow-sm">
                            <AlertCircle size={12} className="text-rose-500" />
                            <span className="text-xs font-bold text-rose-600">{unpaidThisMonth} due</span>
                        </div>
                        {totalCollected > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-100 shadow-sm">
                                <IndianRupee size={12} className="text-violet-600" />
                                <span className="text-xs font-bold text-violet-700">{totalCollected.toLocaleString('en-IN')} collected</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Controls bar ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3 sm:px-4 py-3 flex flex-wrap items-center gap-2 sm:gap-3">

                    {/* View toggle */}
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 shrink-0 p-0.5 bg-slate-50 gap-0.5">
                        {([
                            { val: 'monthly', icon: List },
                            { val: 'annual', icon: LayoutGrid },
                        ] as { val: ViewMode; icon: React.ElementType }[]).map(({ val, icon: Icon }) => (
                            <button key={val} onClick={() => setViewMode(val)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${viewMode === val ? 'bg-violet-600 text-white shadow-sm shadow-violet-200' : 'text-slate-500 hover:text-slate-700'}`}>
                                <Icon size={12} strokeWidth={2.5} />{val}
                            </button>
                        ))}
                    </div>

                    {/* Month nav */}
                    {viewMode === 'monthly' && (
                        <div className="flex items-center gap-1 bg-slate-50 rounded-xl border border-slate-200 px-1.5 py-1 shrink-0">
                            <button style={{
                                overflow: 'visible',
                                padding: 0,
                                lineHeight: 0,
                            }} onClick={prevMonth}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-600 transition-all hover:shadow-sm">
                                <ChevronLeft size={14} strokeWidth={2.5} />
                            </button>
                            <span className="text-xs sm:text-sm font-bold text-slate-700 px-2 whitespace-nowrap" style={{ minWidth: 100, textAlign: 'center' }}>
                                {MONTHS[month - 1].slice(0, 3)} {year}
                            </span>
                            <button style={{
                                overflow: 'visible',
                                padding: 0,
                                lineHeight: 0,
                            }} onClick={nextMonth}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-600 transition-all hover:shadow-sm">
                                <ChevronRight size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    )}

                    {/* Year select */}
                    {viewMode === 'annual' && (
                        <div className="relative shrink-0">
                            <select value={year} onChange={e => setYear(Number(e.target.value))}
                                className="appearance-none pl-3.5 pr-8 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white outline-none focus:border-violet-400 cursor-pointer shadow-sm">
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    )}

                    <div className="hidden sm:flex flex-1" />

                    {/* Search */}
                    <div className="relative w-full sm:w-auto">
                        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
                        <input type="text" placeholder="Search name or room…" value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full sm:w-44 md:w-52 pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white transition-all shadow-sm font-medium placeholder:font-normal" />
                    </div>

                    {/* Status filter */}
                    {viewMode === 'monthly' && (
                        <div className="relative w-full sm:w-auto">
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as PaymentStatus | 'All')}
                                className="w-full sm:w-auto appearance-none pl-3.5 pr-8 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white outline-none focus:border-violet-400 cursor-pointer shadow-sm">
                                <option value="All">All Status</option>
                                <option value="Paid">Paid</option>
                                <option value="Partial">Partial</option>
                                <option value="Unpaid">Unpaid</option>
                            </select>
                            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    )}
                </div>

                {/* ── Main card ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Card header bar */}
                    <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                            {[
                                { dot: 'bg-emerald-400', label: 'Paid' },
                                { dot: 'bg-amber-400', label: 'Partial' },
                                { dot: 'bg-rose-400', label: 'Unpaid' },
                            ].map(l => (
                                <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                                    <span className={`w-2 h-2 rounded-full ${l.dot}`} />{l.label}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2.5">
                            {loadingRecords && (
                                <div className="h-4 w-4 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                            )}
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                                <Users size={12} />
                                <span>{filteredStudents.length} students</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 md:p-6">
                        {loadingStudents ? (
                            <div className="py-20 text-center">
                                <div className="h-10 w-10 border-2 border-violet-100 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-sm text-slate-400 font-medium">Loading students…</p>
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="py-20 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                    <Users size={24} className="text-slate-300" />
                                </div>
                                <p className="text-sm font-semibold text-slate-500">No students found</p>
                                {searchTerm && <p className="text-xs text-slate-400 mt-1 font-medium">Try adjusting your search</p>}
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