import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Edit2, Trash2, X, Calendar, Tag,
  Receipt, FileText, Download, Upload, Paperclip,
  Wallet, Clock, CheckCircle2,
} from 'lucide-react';
import { createExpensesAPI, getExpensesAPI, updateExpensesAPI } from '../service';
import { useUser } from '../context/UserContext';

interface Expense {
  id?: number;
  title: string;
  amount: number;
  expenseType: string;
  category: string;
  date: string;
  year: number;
  month: string;
  description?: string;
  paymentMethod: string;
  vendor?: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  billFile?: File | null;
  billFileName?: string;
  billUrl?: string;
  createdAt?: string;
}

/* ─────────────── DESIGN TOKENS & GLOBAL CSS ─────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Mulish:wght@300;400;500;600;700&display=swap');

  :root {
    --bg:         #F0EEE9;
    --surface:    #FFFFFF;
    --surface2:   #F7F5F2;
    --border:     rgba(0,0,0,0.07);
    --border2:    rgba(0,0,0,0.12);
    --text:       #1A1612;
    --text2:      #6B6560;
    --text3:      #A09A94;
    --gold:       #C47E1A;
    --gold-dim:   rgba(196,126,26,0.10);
    --gold-glow:  rgba(196,126,26,0.22);
    --green:      #1A7A40;
    --green-dim:  rgba(26,122,64,0.09);
    --amber:      #B86A10;
    --amber-dim:  rgba(184,106,16,0.09);
    --red:        #C0392B;
    --red-dim:    rgba(192,57,43,0.09);
    --blue:       #1A5CB8;
    --blue-dim:   rgba(26,92,184,0.09);
    --radius:     14px;
    --radius-sm:  9px;
    --radius-xs:  6px;
  }

  .ex { 
    font-family: 'Mulish', -apple-system, sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
  }

  /* Subtle dot texture overlay */
  .ex::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    z-index: 0;
  }

  .ex > * { position: relative; z-index: 1; }

  .ex-serif {  }

  /* ── Header ── */
  .ex-header {
    background: rgba(255,255,255,0.88);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100;
    box-shadow: 0 1px 8px rgba(0,0,0,0.06);
  }
  .ex-header-inner {
    max-width: 1320px; margin: 0 auto;
    padding: 0 32px; height: 64px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .ex-brand {
    display: flex; align-items: center; gap: 14px;
  }
  .ex-brand-icon {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, var(--gold) 0%, #E8A030 100%);
    border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 16px var(--gold-glow), 0 4px 10px rgba(0,0,0,0.12);
    flex-shrink: 0;
  }
  .ex-brand-title {
    
    font-size: 18px; font-weight: 800;
    color: var(--text); letter-spacing: -0.03em; line-height: 1;
  }
  .ex-brand-sub {
    font-size: 11px; color: var(--text3); margin-top: 3px;
    font-weight: 400; letter-spacing: 0.01em;
  }

  /* ── Buttons ── */
  .ex-btn {
    font-family: 'Mulish', sans-serif;
    font-weight: 700; font-size: 12px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    display: inline-flex; align-items: center; gap: 6px;
    transition: all 0.2s ease;
    border: none; outline: none;
  }
  .ex-btn-gold {
    background: var(--gold);
    color: #FFFFFF;
    padding: 10px 20px;
    box-shadow: 0 3px 12px var(--gold-glow), 0 2px 4px rgba(0,0,0,0.1);
    letter-spacing: 0.01em;
  }
  .ex-btn-gold:hover {
    background: #B06A10;
    box-shadow: 0 5px 20px rgba(196,126,26,0.38), 0 2px 6px rgba(0,0,0,0.12);
    transform: translateY(-1px);
  }
  .ex-btn-ghost {
    background: transparent;
    border: 1px solid var(--border2) !important;
    color: var(--text2);
    padding: 10px 18px;
  }
  .ex-btn-ghost:hover { background: var(--surface2); color: var(--text); }

  .ex-btn-danger {
    background: var(--red);
    color: white;
    padding: 10px 20px;
    box-shadow: 0 4px 14px rgba(192,57,43,0.25);
  }
  .ex-btn-danger:hover { background: #A93226; transform: translateY(-1px); }

  /* ── Content ── */
  .ex-content { max-width: 1320px; margin: 0 auto; padding: 28px 32px; }

  /* ── Stats ── */
  .ex-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 20px; }

  .ex-stat {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 22px 24px;
    position: relative; overflow: hidden;
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    cursor: default;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .ex-stat:hover {
    transform: translateY(-2px);
    border-color: var(--border2);
    box-shadow: 0 12px 32px rgba(0,0,0,0.10);
  }
  /* Glow accent corner */
  .ex-stat::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 120px; height: 120px;
    border-radius: 50%;
    opacity: 0.07;
    transition: opacity 0.2s;
  }
  .ex-stat:hover::before { opacity: 0.14; }
  .ex-stat.st-total::before { background: var(--gold); }
  .ex-stat.st-paid::before  { background: var(--green); }
  .ex-stat.st-pend::before  { background: var(--amber); }

  /* Left accent bar */
  .ex-stat::after {
    content: '';
    position: absolute;
    top: 16px; bottom: 16px; left: 0;
    width: 3px; border-radius: 0 3px 3px 0;
  }
  .ex-stat.st-total::after { background: var(--gold); box-shadow: 0 0 8px var(--gold-glow); }
  .ex-stat.st-paid::after  { background: var(--green); box-shadow: 0 0 8px rgba(63,185,80,0.4); }
  .ex-stat.st-pend::after  { background: var(--amber); box-shadow: 0 0 8px var(--gold-glow); }

  .ex-stat-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .ex-stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text3); }
  .ex-stat-icon { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
  .si-gold  { background: var(--gold-dim); }
  .si-green { background: var(--green-dim); }
  .si-amber { background: var(--amber-dim); }

  .ex-stat-val {
    
    font-size: 28px; font-weight: 800;
    letter-spacing: -0.04em; line-height: 1;
    margin-bottom: 8px;
  }
  .sv-gold  { color: var(--gold); }
  .sv-green { color: var(--green); }
  .sv-amber { color: var(--amber); }

  .ex-stat-foot { display: flex; align-items: center; gap: 6px; }
  .ex-badge {
    font-size: 10px; font-weight: 700;
    padding: 2px 8px; border-radius: 4px;
    letter-spacing: 0.03em;
  }
  .eb-gold  { background: var(--gold-dim); color: var(--gold); }
  .eb-green { background: var(--green-dim); color: var(--green); }
  .eb-red   { background: var(--red-dim); color: var(--red); }
  .eb-gray  { background: rgba(255,255,255,0.06); color: var(--text2); }
  .ex-stat-foot-label { font-size: 11px; color: var(--text3); }

  /* ── Panel (card) ── */
  .ex-panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  /* ── Filter bar ── */
  .ex-filters { padding: 16px 20px; margin-bottom: 16px; }
  .ex-filters-row { display: grid; grid-template-columns: 1.6fr 0.9fr 1fr 1.1fr 1.1fr; gap: 10px; }

  .ex-input {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 9px 12px;
    font-size: 12px; font-weight: 500;
    font-family: 'Mulish', sans-serif;
    color: var(--text);
    outline: none;
    transition: all 0.18s;
    width: 100%;
    appearance: none;
    -webkit-appearance: none;
  }
  .ex-input:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px var(--gold-dim);
    background: #fff;
  }
  .ex-input::placeholder { color: var(--text3); }
  .ex-input option { background: #fff; color: var(--text); }

  .ex-search-wrap { position: relative; }
  .ex-search-ico { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text3); pointer-events: none; }
  .ex-search-field { padding-left: 32px !important; }

  /* ── Table ── */
  .ex-table-wrap { overflow-x: auto; }
  .ex-table { width: 100%; border-collapse: collapse; min-width: 900px; }

  .ex-th {
    padding: 11px 18px;
    text-align: left;
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.09em;
    color: var(--text3);
    background: var(--surface2);
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }

  .ex-tr { border-bottom: 1px solid rgba(0,0,0,0.05); transition: background 0.12s; }
  .ex-tr:last-child { border-bottom: none; }
  .ex-tr:hover { background: #F7F5F0; }

  .ex-td { padding: 14px 18px; vertical-align: middle; }

  .ex-date-wrap { display: flex; align-items: center; gap: 10px; }
  .ex-date-box {
    width: 34px; height: 34px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .ex-date-main { font-size: 12px; font-weight: 600; color: var(--text); }
  .ex-date-sub  { font-size: 10px; color: var(--text3); margin-top: 1px; }
  .ex-title-main { font-size: 12px; font-weight: 700; color: var(--text); }
  .ex-title-sub  { font-size: 10px; color: var(--text3); margin-top: 2px; font-weight: 400; }

  .ex-type-chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 6px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.04em;
    background: var(--gold-dim);
    color: var(--gold);
    border: 1px solid rgba(240,165,0,0.2);
  }

  .ex-amt {
    
    font-size: 14px; font-weight: 700;
    color: var(--text); letter-spacing: -0.02em;
  }

  .ex-pay-tag {
    font-size: 10px; font-weight: 600;
    color: var(--text2);
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    padding: 3px 9px; border-radius: 5px;
    letter-spacing: 0.02em;
  }

  .ex-status {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 11px; border-radius: 20px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.04em;
  }
  .es-paid    { background: var(--green-dim); color: var(--green); border: 1px solid rgba(63,185,80,0.2); }
  .es-pending { background: var(--amber-dim); color: var(--amber); border: 1px solid rgba(240,165,0,0.2); }
  .es-overdue { background: var(--red-dim);   color: var(--red);   border: 1px solid rgba(248,81,73,0.2); }
  .es-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

  .ex-dl-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 11px;
    background: var(--blue-dim);
    color: var(--blue);
    border: 1px solid rgba(88,166,255,0.2);
    border-radius: 7px;
    font-size: 10px; font-weight: 700;
    cursor: pointer; transition: all 0.15s;
    letter-spacing: 0.03em;
  }
  .ex-dl-btn:hover { background: rgba(88,166,255,0.18); border-color: rgba(88,166,255,0.4); }

  .ex-act {
    width: 30px; height: 30px;
    border-radius: 8px; border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; background: var(--surface2);
    transition: all 0.15s; opacity: 1;
  }
  .ea-edit:hover { background: var(--gold-dim); border-color: rgba(196,126,26,0.35); transform: scale(1.08); }
  .ea-del:hover  { background: var(--red-dim);  border-color: rgba(192,57,43,0.35);  transform: scale(1.08); }

  /* ── Empty ── */
  .ex-empty { text-align: center; padding: 72px 24px; }
  .ex-empty-ico {
    width: 56px; height: 56px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px;
  }
  /* ── Footer row ── */
  .ex-tfoot { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
  .ex-tfoot-txt { font-size: 11px; color: var(--text3); }

  /* ── Modal Overlay ── */
  .ex-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; padding: 16px;
  }

  .ex-modal {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 20px;
    width: 100%; max-width: 700px; max-height: 92vh;
    overflow-y: auto;
    box-shadow: 0 24px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05);
    animation: mIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes mIn {
    from { opacity:0; transform: scale(0.94) translateY(10px); }
    to   { opacity:1; transform: scale(1)    translateY(0);    }
  }

  .ex-mhead {
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0;
    background: var(--surface);
    z-index: 10;
    border-radius: 20px 20px 0 0;
    display: flex; align-items: center; justify-content: space-between;
  }
  .ex-mhead-ico {
    width: 36px; height: 36px;
    background: var(--gold);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px var(--gold-glow);
  }
  .ex-mtitle {
    
    font-size: 16px; font-weight: 800;
    color: var(--text); letter-spacing: -0.02em;
  }
  .ex-msub { font-size: 11px; color: var(--text3); margin-top: 2px; }
  .ex-mclose {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 9px; cursor: pointer; color: var(--text2);
    transition: all 0.15s;
  }
  .ex-mclose:hover { background: var(--red-dim); color: var(--red); border-color: rgba(192,57,43,0.25); }

  /* Form */
  .ex-form { padding: 22px 24px; }
  .ex-sec-lbl {
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--text3);
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 16px; padding-bottom: 10px;
    border-bottom: 1px solid var(--border);
  }
  .ex-sec-lbl-ico {
    width: 22px; height: 22px;
    background: var(--gold-dim);
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
  }

  .ex-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .ex-span { grid-column: 1 / -1; }

  .ex-flabel {
    display: block;
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.07em;
    color: var(--text3); margin-bottom: 5px;
  }
  .ex-fstar { color: var(--gold); margin-left: 2px; }
  .ex-field {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 13px;
    font-size: 12px; font-weight: 500;
    font-family: 'Mulish', sans-serif;
    color: var(--text);
    outline: none; transition: all 0.18s;
  }
  .ex-field:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px var(--gold-dim);
    background: #fff;
  }
  .ex-field::placeholder { color: var(--text3); }
  .ex-field option { background: #fff; color: var(--text); }

  /* Upload zone */
  .ex-upload {
    border: 2px dashed var(--border2);
    border-radius: var(--radius-sm);
    padding: 20px;
    background: var(--surface2);
    cursor: pointer; transition: all 0.18s;
  }
  .ex-upload:hover { border-color: var(--gold); background: rgba(196,126,26,0.04); }
  .ex-upload-inner { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .ex-upload-ico {
    width: 42px; height: 42px;
    background: var(--gold-dim);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid rgba(196,126,26,0.18);
  }
  .ex-file-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .ex-file-ico {
    width: 38px; height: 38px;
    background: var(--blue-dim);
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .ex-file-rm {
    width: 30px; height: 30px;
    background: var(--red-dim); border: 1px solid rgba(192,57,43,0.18);
    border-radius: 8px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--red); transition: all 0.15s;
  }
  .ex-file-rm:hover { background: rgba(192,57,43,0.16); }

  .ex-form-foot {
    display: flex; gap: 10px;
    margin-top: 22px; padding-top: 18px;
    border-top: 1px solid var(--border);
  }

  /* Delete modal */
  .ex-del-body { padding: 32px 28px; text-align: center; }
  .ex-del-ico {
    width: 52px; height: 52px;
    background: var(--red-dim);
    border: 1px solid rgba(192,57,43,0.18);
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px;
  }
  .ex-del-title {
    
    font-size: 18px; font-weight: 800;
    color: var(--text); letter-spacing: -0.02em; margin-bottom: 8px;
  }
  .ex-del-desc { font-size: 12px; color: var(--text2); margin-bottom: 24px; line-height: 1.7; }
  .ex-del-btns { display: flex; gap: 10px; }

  /* Animations */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .a1 { animation: fadeUp 0.35s ease both 0ms;   }
  .a2 { animation: fadeUp 0.35s ease both 60ms;  }
  .a3 { animation: fadeUp 0.35s ease both 110ms; }
  .a4 { animation: fadeUp 0.35s ease both 150ms; }
  .a5 { animation: fadeUp 0.35s ease both 185ms; }
  .a6 { animation: fadeUp 0.35s ease both 215ms; }
`;

/* ─────────────────────────────────────────────────────────── */

/* ── Field helper ── */
const F = ({ label, req, span, children }: { label: string; req?: boolean; span?: boolean; children: React.ReactNode }) => (
  <div className={span ? 'ex-span' : ''}>
    <label className="ex-flabel">{label}{req && <span className="ex-fstar">*</span>}</label>
    {children}
  </div>
);

const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const { user } = useUser();

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const TYPES = ['Operating', 'Utilities', 'Maintenance', 'Salaries', 'Supplies', 'Food & Catering', 'Transportation', 'Administrative', 'Marketing', 'Miscellaneous'];
  const CATS = ['Grocery', 'Provision', 'Electricity Charges', 'Cylinder Expenses', 'Water', 'Gas', 'Internet', 'Salary & Wages', 'Repair & Maintenance', 'Vehicle Maintenance', 'Printing And Stationery', 'Office Supplies', 'Furniture', 'Petrol Expenses', 'Freight Charges', 'Transportation', 'Cleaning Supplies', 'Insurance', 'Taxes', 'Other'];
  const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const PAYMENTS = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card'];
  const STATUSES = ['Pending', 'Paid', 'Overdue'];

  const blank: Expense = { title: '', amount: 0, expenseType: 'Operating', category: 'Utilities', date: '', year: new Date().getFullYear(), month: '', description: '', paymentMethod: 'Cash', vendor: '', status: 'Pending', billFile: null, billFileName: '', billUrl: '' };
  const [form, setForm] = useState<Expense>(blank);

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    try {
      const r = await getExpensesAPI();
      if (r?.data) {
        console.log(r?.data);

        setExpenses(r.data);
        setFilteredExpenses(r.data);
      }
    }

    catch {

    }
  };

  useEffect(() => {
    let f = expenses;
    if (searchTerm) f = f.filter(e => [e.title, e.expenseType, e.vendor || ''].some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
    if (filterYear) f = f.filter(e => e.year === filterYear);
    if (filterMonth) f = f.filter(e => e.month === filterMonth);
    if (filterType) f = f.filter(e => e.expenseType === filterType);
    if (filterCategory) f = f.filter(e => e.category === filterCategory);
    setFilteredExpenses(f);
  }, [searchTerm, filterYear, filterMonth, filterType, filterCategory, expenses]);

  const openModal = (exp?: Expense) => {
    console.log(exp);

    if (exp) { setEditingExpense(exp); setForm(exp); }
    else { setEditingExpense(null); const t = new Date(); setForm({ ...blank, date: t.toISOString().split('T')[0], year: t.getFullYear(), month: MONTHS[t.getMonth()] }); }
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingExpense(null); };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 5242880) { alert('Max 5MB'); return; }
    if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(f.type)) { alert('PDF / JPG / PNG only'); return; }
    setForm(p => ({ ...p, billFile: f, billFileName: f.name, billUrl: URL.createObjectURL(f) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const d = new Date(form.date);
    const upd = { ...form, year: d.getFullYear(), month: MONTHS[d.getMonth()] };
    if (editingExpense) {
      console.log(upd);

      await updateExpensesAPI(upd, upd.billFile || undefined);
      setExpenses(prev => prev.map(ex => ex.id === editingExpense.id ? { ...upd, id: editingExpense.id } : ex));
    } else {
      await createExpensesAPI(upd, upd.billFile || undefined);
      setExpenses(prev => [...prev, { ...upd, id: Date.now() }]);
    }
    closeModal();
  };

  const openDelete = (e: Expense) => { setDeletingExpense(e); setIsDeleteModalOpen(true); };
  const confirmDelete = () => { if (deletingExpense) { setExpenses(p => p.filter(e => e.id !== deletingExpense.id)); setIsDeleteModalOpen(false); setDeletingExpense(null); } };

  const isToday = (date: string | Date) => { if (!date) return false; const t = new Date(), d = new Date(date); return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate(); };
  const hasTodayExp = expenses.some((e: any) => isToday(e?.createdAt));
  const canEdit = (e: Expense) => user?.role === 'SUPER_ADMIN' || isToday(e?.createdAt || '');
  const showActs = user?.role === 'SUPER_ADMIN' || hasTodayExp;

  const total = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const paid = filteredExpenses.filter(e => e.status === 'Paid').reduce((s, e) => s + e.amount, 0);
  const pending = filteredExpenses.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0);
  const overdue = filteredExpenses.filter(e => e.status === 'Overdue').reduce((s, e) => s + e.amount, 0);

  const statusCls = (s: string) => s === 'Paid' ? 'es-paid' : s === 'Pending' ? 'es-pending' : 'es-overdue';
  const dotClr = (s: string) => s === 'Paid' ? '#3FB950' : s === 'Pending' ? '#F0A500' : '#F85149';
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const fmtDate = (d: string) => { try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d; } };

  const TH_COLS = ['Date', 'Expense', 'Type', 'Category', 'Amount', 'Payment', 'Status', 'Bill', ...(showActs ? ['Actions'] : [])];

  console.log("filteredExpenses==>", filteredExpenses);

  return (
    <div className="ex">
      <style>{STYLES}</style>

      {/* ══ HEADER ══ */}
      <header className="ex-header">
        <div className="ex-header-inner">
          <div className="ex-brand">
            <div className="ex-brand-icon">
              <Wallet size={17} color="#FFFFFF" strokeWidth={2.5} />
            </div>
            <div>
              <div className="ex-brand-title">Expense Management</div>
              <div className="ex-brand-sub">Track and manage hostel expenses</div>
            </div>
          </div>
          <button className="ex-btn ex-btn-gold" onClick={() => openModal()}>
            <Plus size={13} strokeWidth={3} />
            Add Expense
          </button>
        </div>
      </header>

      <main className="ex-content">

        {/* ══ STATS ══ */}
        <div className="ex-stats">
          {/* Total */}
          <div className="ex-stat st-total a1">
            <div className="ex-stat-header">
              <span className="ex-stat-label">Total Expenses</span>
              <div className="ex-stat-icon si-gold"><Receipt size={15} color="#F0A500" /></div>
            </div>
            <div className="ex-stat-val sv-gold">{fmt(total)}</div>
            <div className="ex-stat-foot">
              <span className="ex-badge eb-gold">{filteredExpenses.length}</span>
              <span className="ex-stat-foot-label">transactions recorded</span>
            </div>
          </div>

          {/* Paid */}
          <div className="ex-stat st-paid a2">
            <div className="ex-stat-header">
              <span className="ex-stat-label">Paid</span>
              <div className="ex-stat-icon si-green"><CheckCircle2 size={15} color="#3FB950" /></div>
            </div>
            <div className="ex-stat-val sv-green">{fmt(paid)}</div>
            <div className="ex-stat-foot">
              <span className="ex-badge eb-green">{filteredExpenses.filter(e => e.status === 'Paid').length}</span>
              <span className="ex-stat-foot-label">completed payments</span>
            </div>
          </div>

          {/* Pending */}
          <div className="ex-stat st-pend a3">
            <div className="ex-stat-header">
              <span className="ex-stat-label">Pending</span>
              <div className="ex-stat-icon si-amber"><Clock size={15} color="#F0A500" /></div>
            </div>
            <div className="ex-stat-val sv-amber">{fmt(pending)}</div>
            <div className="ex-stat-foot">
              <span className="ex-badge eb-gold">{filteredExpenses.filter(e => e.status === 'Pending').length}</span>
              <span className="ex-stat-foot-label">awaiting payment</span>
              {overdue > 0 && <span className="ex-badge eb-red" style={{ marginLeft: 'auto' }}>{filteredExpenses.filter(e => e.status === 'Overdue').length} overdue</span>}
            </div>
          </div>
        </div>

        {/* ══ FILTERS ══ */}
        <div className="ex-panel ex-filters a4">
          <div className="ex-filters-row">
            <div className="ex-search-wrap">
              <Search size={13} className="ex-search-ico" />
              <input className="ex-input ex-search-field" type="text" placeholder="Search expenses, vendors…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            {[
              { val: String(filterYear), set: (v: string) => setFilterYear(Number(v)), ph: 'All Years', opts: YEARS.map(y => [String(y), String(y)]) },
              { val: filterMonth, set: setFilterMonth, ph: 'All Months', opts: MONTHS.map(m => [m, m]) },
              { val: filterType, set: setFilterType, ph: 'All Types', opts: TYPES.map(t => [t, t]) },
              { val: filterCategory, set: setFilterCategory, ph: 'All Categories', opts: CATS.map(c => [c, c]) },
            ].map(({ val, set, ph, opts }, i) => (
              <select key={i} value={val} onChange={e => set(e.target.value)} className="ex-input">
                <option value="">{ph}</option>
                {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ))}
          </div>
        </div>

        {/* ══ TABLE ══ */}
        <div className="ex-panel a5">
          <div className="ex-table-wrap">
            <table className="ex-table">
              <thead>
                <tr>{TH_COLS.map(h => <th key={h} className="ex-th">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} className="ex-tr">

                    {/* Date */}
                    <td className="ex-td">
                      <div className="ex-date-wrap">
                        <div className="ex-date-box"><Calendar size={13} color="#C0BAB4" /></div>
                        <div>
                          <div className="ex-date-main">{fmtDate(exp.date)}</div>
                          <div className="ex-date-sub">{exp.month} {exp.year}</div>
                        </div>
                      </div>
                    </td>

                    {/* Expense */}
                    <td className="ex-td">
                      <div className="ex-title-main">{exp.title}</div>
                      {exp.vendor && <div className="ex-title-sub">{exp.vendor}</div>}
                    </td>

                    {/* Type */}
                    <td className="ex-td">
                      <span className="ex-type-chip"><Tag size={9} />{exp.expenseType}</span>
                    </td>

                    {/* Category */}
                    <td className="ex-td" style={{ fontSize: 11, color: '#8B949E' }}>{exp.category}</td>

                    {/* Amount */}
                    <td className="ex-td"><span className="ex-amt">{fmt(exp.amount)}</span></td>

                    {/* Payment */}
                    <td className="ex-td"><span className="ex-pay-tag">{exp.paymentMethod}</span></td>

                    {/* Status */}
                    <td className="ex-td">
                      <span className={`ex-status ${statusCls(exp.status)}`}>
                        <span className="es-dot" style={{ background: dotClr(exp.status) }} />
                        {exp.status}
                      </span>
                    </td>

                    {/* Bill */}
                    <td className="ex-td">
                      {exp.billFileName
                        ? <button className="ex-dl-btn" onClick={() => { if (exp.billUrl) { const a = document.createElement('a'); a.href = exp.billUrl!; a.download = exp.billFileName || `bill_${exp.id}`; document.body.appendChild(a); a.click(); document.body.removeChild(a); } }}><Download size={10} />Bill</button>
                        : <span style={{ fontSize: 13, color: '#D0CAC4' }}>—</span>
                      }
                    </td>

                    {/* Actions */}
                    {showActs && (
                      <td className="ex-td">
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button
                            onClick={() => openModal(exp)}
                            title="Edit"
                            style={{
                              width: 32, height: 32,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: '#FEF3E2',
                              border: '1px solid #E8C07A',
                              borderRadius: 8,
                              cursor: canEdit(exp) ? 'pointer' : 'not-allowed',
                              opacity: canEdit(exp) ? 1 : 0.4,
                              flexShrink: 0,
                              padding: 0,
                            }}
                          >
                            <Edit2 size={14} color="#C47E1A" strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => openDelete(exp)}
                            title="Delete"
                            style={{
                              width: 32, height: 32,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: '#FDECEA',
                              border: '1px solid #E8A09A',
                              borderRadius: 8,
                              cursor: canEdit(exp) ? 'pointer' : 'not-allowed',
                              opacity: canEdit(exp) ? 1 : 0.4,
                              flexShrink: 0,
                              padding: 0,
                            }}
                          >
                            <Trash2 size={14} color="#C0392B" strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty state */}
            {filteredExpenses.length === 0 && (
              <div className="ex-empty">
                <div className="ex-empty-ico"><Receipt size={24} color="#C0BAB4" /></div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 800, color: '#6B6560', marginBottom: 6 }}>No expenses found</div>
                <div style={{ fontSize: 12, color: '#A09A94', marginBottom: 20 }}>Adjust filters or add a new expense</div>
                <button className="ex-btn ex-btn-gold" style={{ margin: '0 auto' }} onClick={() => { setSearchTerm(''); setFilterYear(new Date().getFullYear()); setFilterMonth(''); setFilterType(''); setFilterCategory(''); }}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table footer */}
        {filteredExpenses.length > 0 && (
          <div className="ex-tfoot a6">
            <span className="ex-tfoot-txt">Showing <strong style={{ color: '#6B6560' }}>{filteredExpenses.length}</strong> of {expenses.length} records</span>
            <span className="ex-tfoot-txt">Total · <strong style={{ color: '#F0A500' }}>{fmt(total)}</strong></span>
          </div>
        )}
      </main>

      {/* ══ ADD / EDIT MODAL ══ */}
      {isModalOpen && (
        <div className="ex-overlay">
          <div className="ex-modal">
            <div className="ex-mhead">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="ex-mhead-ico">{editingExpense ? <Edit2 size={15} color="#fff" strokeWidth={2.5} /> : <Plus size={15} color="#fff" strokeWidth={2.5} />}</div>
                <div>
                  <div className="ex-mtitle">{editingExpense ? 'Edit Expense' : 'New Expense'}</div>
                  <div className="ex-msub">{editingExpense ? 'Update existing record' : 'Fill in the details to add'}</div>
                </div>
              </div>
              <button style={{
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#FEF3E2',
                border: '1px solid #E8C07A',
                borderRadius: 8,
                cursor: 'pointer',
                flexShrink: 0,
                padding: 0,
              }} onClick={closeModal}><X size={14} /></button>
            </div>

            <form onSubmit={handleSubmit} className="ex-form">
              {/* Section: Details */}
              <div className="ex-sec-lbl">
                <div className="ex-sec-lbl-ico"><FileText size={11} color="#F0A500" /></div>
                Expense Details
              </div>

              <div className="ex-grid">
                <F label="Expense Title" req span>
                  <input required type="text" className="ex-field" placeholder="e.g., Monthly Electricity Bill" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </F>
                <F label="Expense Type" req>
                  <select required className="ex-field" value={form.expenseType} onChange={e => setForm(p => ({ ...p, expenseType: e.target.value }))}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </F>
                <F label="Category" req>
                  <select required className="ex-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </F>
                <F label="Amount (₹)" req>
                  <input required type="number" min="0" step="0.01" className="ex-field" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} />
                </F>
                <F label="Date" req>
                  <input required type="date" className="ex-field" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </F>
                <F label="Payment Method" req>
                  <select required className="ex-field" value={form.paymentMethod} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                    {PAYMENTS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </F>
                <F label="Status" req>
                  <select required className="ex-field" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </F>
                <F label="Vendor / Supplier" span>
                  <input type="text" className="ex-field" placeholder="e.g., State Electricity Board" value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} />
                </F>
                <F label="Notes / Description" span>
                  <textarea className="ex-field" rows={2} placeholder="Any additional details…" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
                </F>
              </div>

              {/* Section: Bill */}
              <div className="ex-sec-lbl" style={{ marginTop: 20 }}>
                <div className="ex-sec-lbl-ico"><Paperclip size={11} color="#F0A500" /></div>
                Bill / Receipt <span style={{ color: '#484F58', textTransform: 'none', fontSize: 9, fontWeight: 500, letterSpacing: 0 }}>(Optional)</span>
              </div>

              <div className="ex-upload">
                {form.billFileName ? (
                  <div className="ex-file-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="ex-file-ico"><FileText size={17} color="#58A6FF" /></div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1612' }}>{form.billFileName}</div>
                        <div style={{ fontSize: 10, color: '#A09A94', marginTop: 2 }}>{form.billFile ? `${(form.billFile.size / 1024).toFixed(1)} KB` : 'Previously uploaded'}</div>
                      </div>
                    </div>
                    <button type="button" className="ex-file-rm" onClick={() => setForm(p => ({ ...p, billFile: null, billFileName: '', billUrl: '' }))}>
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <label style={{ cursor: 'pointer', display: 'block' }}>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} style={{ display: 'none' }} />
                    <div className="ex-upload-inner">
                      <div className="ex-upload-ico"><Upload size={19} color="#F0A500" /></div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#2A2520' }}>Click to upload bill or receipt</div>
                        <div style={{ fontSize: 10, color: '#A09A94', marginTop: 3 }}>PDF · JPG · PNG &nbsp;·&nbsp; Max 5 MB</div>
                      </div>
                    </div>
                  </label>
                )}
              </div>

              <div className="ex-form-foot">
                <button type="button" className="ex-btn ex-btn-ghost" style={{ flex: 1 }} onClick={closeModal}>Cancel</button>
                <button type="submit" className="ex-btn ex-btn-gold" style={{ flex: 2, justifyContent: 'center' }}>
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ DELETE MODAL ══ */}
      {isDeleteModalOpen && deletingExpense && (
        <div className="ex-overlay">
          <div className="ex-modal" style={{ maxWidth: 380 }}>
            <div className="ex-del-body">
              <div className="ex-del-ico"><Trash2 size={22} color="#F85149" /></div>
              <div className="ex-del-title">Delete Expense?</div>
              <div className="ex-del-desc">
                You're about to permanently delete<br />
                <strong style={{ color: '#1A1612' }}>{deletingExpense.title}</strong>.<br />
                This action cannot be undone.
              </div>
              <div className="ex-del-btns">
                <button className="ex-btn ex-btn-ghost" style={{ flex: 1 }} onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                <button className="ex-btn ex-btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={confirmDelete}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;