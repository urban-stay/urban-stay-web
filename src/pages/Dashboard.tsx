// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
//   ResponsiveContainer, AreaChart, Area
// } from 'recharts';
// import {
//   TrendingUp, TrendingDown, Wallet, Bell, Search,
//   Calendar, ArrowUpRight, ArrowDownRight,
//   RefreshCw, AlertCircle, Loader2
// } from 'lucide-react';
// import { getDashboardSummary } from '../service';

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface MonthlyDataDTO {
//   month: string;       // "Jan"
//   monthNumber: number; // 1–12
//   year: number;
//   income: number;
//   outcome: number;
//   profit: number;
// }

// interface DashboardSummaryDTO {
//   totalIncome: number;
//   totalOutcome: number;
//   netProfit: number;
//   profitMargin: number;
//   collectionRate: number;
//   paidRentCount: number;
//   partialRentCount: number;
//   unpaidRentCount: number;
//   activeStudents: number;
//   totalExpensePaid: number;
//   totalExpensePending: number;
//   totalExpenseOverdue: number;
//   monthlyData: MonthlyDataDTO[];
// }

// // ─── API Config ───────────────────────────────────────────────────────────────


// const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// const monthNum = (m: string) => months.indexOf(m) + 1; // "Jan" → 1

// async function fetchSummary(
//   year: any,
//   startMonth: string,
//   endMonth: string
// ): Promise<DashboardSummaryDTO> {
//   const params = new URLSearchParams({
//     year,
//     startMonth: String(monthNum(startMonth)),
//     endMonth: String(monthNum(endMonth)),
//   });
//   const res = await getDashboardSummary(params);
//   // if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
//   return res?.data;
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const fmt = (n: number) =>
//   n >= 1000000 ? `₹${(n / 1000000).toFixed(1)}M`
//     : n >= 1000 ? `₹${(n / 1000).toFixed(1)}k`
//       : `₹${n}`;

// // ─── Tooltip ──────────────────────────────────────────────────────────────────

// const CustomTooltip = ({ active, payload, label }: any) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div style={{
//       background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
//       padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
//     }}>
//       <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>{label}</p>
//       {payload.map((p: any) => (
//         <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
//           <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>
//             <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
//             {p.dataKey}
//           </span>
//           <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{fmt(p.value)}</span>
//         </div>
//       ))}
//     </div>
//   );
// };

// // ─── Skeleton loader ──────────────────────────────────────────────────────────

// const Skeleton = ({ w = '100%', h = 16, r = 6 }: { w?: string | number; h?: number; r?: number }) => (
//   <div style={{
//     width: w, height: h, borderRadius: r,
//     background: 'linear-gradient(90deg,#f1f5f9 25%,#e8edf5 50%,#f1f5f9 75%)',
//     backgroundSize: '200% 100%',
//     animation: 'shimmer 1.4s infinite'
//   }} />
// );

// // ─── Error banner ─────────────────────────────────────────────────────────────

// const ErrorBanner = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
//   <div style={{
//     display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//     background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: 12,
//     padding: '12px 16px', marginBottom: 20
//   }}>
//     <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#be123c', fontWeight: 600 }}>
//       <AlertCircle size={15} /> {message}
//     </span>
//     <button onClick={onRetry} style={{
//       display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700,
//       color: '#be123c', background: '#fecdd3', border: 'none', borderRadius: 7,
//       padding: '5px 10px', cursor: 'pointer'
//     }}>
//       <RefreshCw size={12} /> Retry
//     </button>
//   </div>
// );

// // ─── Dashboard ────────────────────────────────────────────────────────────────
// const currentYear = new Date().getFullYear();

// const Dashboard: React.FC = () => {
//   const [year, setYear] = useState(currentYear);
//   const [startMonth, setStartMonth] = useState('Jan');
//   const [endMonth, setEndMonth] = useState('Dec');

//   const [data, setData] = useState<DashboardSummaryDTO | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await fetchSummary(year, startMonth, endMonth);
//       setData(result);
//     } catch (e: any) {
//       setError(e.message ?? 'Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   }, [year, startMonth, endMonth]);

//   useEffect(() => { load(); }, [load]);

//   // Derived values (safe fallbacks while loading)
//   const monthly = data?.monthlyData ?? [];
//   const trendData = monthly.map(d => ({ ...d })); // already has profit from API
//   const totalIncome = data?.totalIncome ?? 0;
//   const totalOutcome = data?.totalOutcome ?? 0;
//   const netProfit = data?.netProfit ?? 0;
//   const profitRate = data ? Math.round(data.profitMargin) : 0;
//   const outcomeRate = totalIncome > 0 ? Math.round((totalOutcome / totalIncome) * 100) : 0;
//   const avgIncome = monthly.length > 0 ? Math.round(totalIncome / monthly.length) : 0;
//   return (
//     <div style={{ minHeight: '100vh', background: '#F0F4FF', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1e293b' }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
//         ::-webkit-scrollbar { width: 4px; }
//         ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
//         select { appearance: none; -webkit-appearance: none; cursor: pointer; border: none; outline: none; }
//         select option { background: #fff; color: #1e293b; }
//         .card { transition: box-shadow 0.2s, transform 0.2s; }
//         .card:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(99,102,241,0.1); }
//         .trow:hover td { background: #f8faff !important; }
//         .s1 { animation: up 0.4s ease 0.05s both; }
//         .s2 { animation: up 0.4s ease 0.1s both; }
//         .s3 { animation: up 0.4s ease 0.15s both; }
//         .s4 { animation: up 0.4s ease 0.2s both; }
//         .s5 { animation: up 0.4s ease 0.25s both; }
//         .s6 { animation: up 0.4s ease 0.3s both; }
//         .s7 { animation: up 0.4s ease 0.35s both; }
//         @keyframes up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
//         @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
//         @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
//         .spin { animation: spin 1s linear infinite; }
//       `}</style>

//       {/* ── Topbar ── */}
//       <header style={{
//         background: '#fff', borderBottom: '1px solid #e8edf5',
//         padding: '0 32px', height: 62,
//         display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//         position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 0 #e8edf5'
//       }}>
//         {/* Logo + Title */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
//           {/* <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//             <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//               <Zap size={13} color="white" fill="white" />
//             </div>
//             <span style={{ fontWeight: 800, fontSize: 15, color: '#1e293b', letterSpacing: '-0.3px' }}>Vaultix</span>
//           </div>
//           <div style={{ width: 1, height: 22, background: '#e2e8f0' }} /> */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//             <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Financial Overview</span>
//             <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
//               {startMonth} – {endMonth} {year}
//             </span>
//             {loading && <Loader2 size={14} color="#6366f1" className="spin" />}
//           </div>
//         </div>

//         {/* Controls */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           {/* Date filter pill */}
//           <div style={{
//             display: 'flex', alignItems: 'center', gap: 6,
//             background: '#f8faff', border: '1.5px solid #e0e7ff',
//             borderRadius: 10, padding: '6px 12px'
//           }}>
//             <Calendar size={13} color="#6366f1" />
//             <select
//               value={year}
//               onChange={e => setYear(parseInt(e.target.value))}
//               style={{
//                 background: 'transparent',
//                 color: '#4f46e5',
//                 fontSize: 12,
//                 fontWeight: 700,
//                 fontFamily: 'inherit'
//               }}
//             >
//               {Array.from({ length: 11 }, (_, i) => {
//                 const y = currentYear - i;
//                 return (
//                   <option key={y} value={y}>
//                     {y}
//                   </option>
//                 );
//               })}
//             </select>
//             <span style={{ color: '#c7d2fe', fontSize: 12 }}>|</span>
//             <select value={startMonth} onChange={e => setStartMonth(e.target.value)}
//               style={{ background: 'transparent', color: '#64748b', fontSize: 12, fontFamily: 'inherit', fontWeight: 500 }}>
//               {months.map(m => <option key={m}>{m}</option>)}
//             </select>
//             <span style={{ color: '#94a3b8', fontSize: 11 }}>→</span>
//             <select value={endMonth} onChange={e => setEndMonth(e.target.value)}
//               style={{ background: 'transparent', color: '#64748b', fontSize: 12, fontFamily: 'inherit', fontWeight: 500 }}>
//               {months.map(m => <option key={m}>{m}</option>)}
//             </select>
//           </div>

//           {/* Refresh */}
//           <button onClick={load} title="Refresh" style={{
//             background: '#f8fafc',
//             border: '1.5px solid #e2e8f0', cursor: 'pointer', color: '#94a3b8'
//           }}>
//             <RefreshCw size={14} className={loading ? 'spin' : ''} />
//           </button>

//           {/* <button style={{ borderRadius: 9, background: '#f8fafc', border: '1.5px solid #e2e8f0', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}>
//             <Search size={14} />
//           </button>
//           <button style={{ borderRadius: 9, background: '#f8fafc', border: '1.5px solid #e2e8f0', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', position: 'relative' }}>
//             <Bell size={14} />
//             {(data?.unpaidRentCount ?? 0) > 0 && (
//               <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, background: '#f43f5e', borderRadius: '50%', border: '1.5px solid #fff' }} />
//             )}
//           </button> */}
//           {/* <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a5b4fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', cursor: 'pointer' }}>
//             JD
//           </div> */}
//         </div>
//       </header>

//       {/* ── Body ── */}
//       <main style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

//         {/* Error */}
//         {error && <ErrorBanner message={error} onRetry={load} />}

//         {/* ── API Stats Banner (rent collection info) ── */}
//         {data && (
//           <div className="s1" style={{
//             display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1,
//             background: '#e8edf5', borderRadius: 12, overflow: 'hidden'
//           }}>
//             {[
//               { label: 'Paid Rents', value: data.paidRentCount, color: '#059669', bg: '#ecfdf5' },
//               { label: 'Partial Rents', value: data.partialRentCount, color: '#d97706', bg: '#fffbeb' },
//               { label: 'Unpaid Rents', value: data.unpaidRentCount, color: '#f43f5e', bg: '#fff1f2' },
//               { label: 'Active Students', value: data.activeStudents, color: '#6366f1', bg: '#eef2ff' },
//             ].map(item => (
//               <div key={item.label} style={{ background: item.bg, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
//                 <span style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</span>
//                 <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{item.label}</span>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* ── Stat Cards ── */}
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
//           {[
//             {
//               label: 'Total Income', value: totalIncome, Icon: TrendingUp,
//               accent: '#6366f1', lightBg: '#eef2ff', up: true,
//               trend: `${data?.collectionRate?.toFixed(1) ?? 0}% collected`,
//               sub: loading ? '—' : `${monthly.length} months · Avg ${fmt(avgIncome)}/mo`
//             },
//             {
//               label: 'Total Outcome', value: totalOutcome, Icon: TrendingDown,
//               accent: '#f43f5e', lightBg: '#fff1f2', up: false,
//               trend: `${outcomeRate}% of income`,
//               sub: loading ? '—' : `Pending ${fmt(data?.totalExpensePending ?? 0)} · Overdue ${fmt(data?.totalExpenseOverdue ?? 0)}`
//             },
//             {
//               label: 'Net Profit', value: netProfit, Icon: Wallet,
//               accent: '#059669', lightBg: '#ecfdf5', up: true,
//               trend: `+${profitRate}% margin`,
//               sub: loading ? '—' : `Income – Outcome = ${fmt(netProfit)}`
//             },
//           ].map(({ label, value, Icon, accent, lightBg, trend, up, sub }, i) => (
//             <div key={label} className={`card s${i + 2}`} style={{
//               background: '#fff', border: '1.5px solid #e8edf5', borderRadius: 16,
//               padding: '20px 22px', position: 'relative', overflow: 'hidden'
//             }}>
//               <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: '16px 16px 0 0' }} />

//               <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, marginTop: 4 }}>
//                 <div style={{ width: 40, height: 40, borderRadius: 12, background: lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                   <Icon size={18} color={accent} />
//                 </div>
//                 <span style={{
//                   display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700,
//                   color: up ? '#059669' : '#f43f5e',
//                   background: up ? '#ecfdf5' : '#fff1f2',
//                   padding: '3px 8px', borderRadius: 99
//                 }}>
//                   {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
//                   {trend}
//                 </span>
//               </div>

//               {loading ? (
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                   <Skeleton h={28} w="60%" />
//                   <Skeleton h={12} w="40%" />
//                   <Skeleton h={10} w="55%" />
//                 </div>
//               ) : (
//                 <>
//                   <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0f172a', marginBottom: 4 }}>{fmt(value)}</div>
//                   <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 2 }}>{label}</div>
//                   <div style={{ fontSize: 11, color: accent, fontWeight: 600, opacity: 0.7 }}>{sub}</div>
//                 </>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* ── Charts Row ── */}
//         <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>

//           {/* Bar Chart */}
//           <div className="s4" style={{ background: '#fff', border: '1.5px solid #e8edf5', borderRadius: 16, padding: '20px 22px' }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
//               <div>
//                 <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Income vs Outcome</div>
//                 <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Monthly comparison · {year}</div>
//               </div>
//               <div style={{ display: 'flex', gap: 14 }}>
//                 {([['#6366f1', 'Income'], ['#f43f5e', 'Outcome']] as [string, string][]).map(([c, l]) => (
//                   <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b', fontWeight: 500 }}>
//                     <span style={{ width: 8, height: 8, borderRadius: 3, background: c, display: 'inline-block' }} />{l}
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {loading ? (
//               <div style={{ height: 230, display: 'flex', alignItems: 'flex-end', gap: 6, padding: '0 4px' }}>
//                 {Array.from({ length: 12 }).map((_, i) => (
//                   <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
//                     <Skeleton h={Math.random() * 120 + 60} w="48%" r={4} />
//                     <Skeleton h={Math.random() * 80 + 40} w="48%" r={4} />
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <ResponsiveContainer width="100%" height={230}>
//                 <BarChart data={monthly} margin={{ top: 0, right: 0, left: -18, bottom: 0 }} barGap={4}>
//                   <CartesianGrid strokeDasharray="3 6" stroke="#f1f5f9" vertical={false} />
//                   <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
//                   <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v / 1000}k`} />
//                   <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
//                   <Bar dataKey="income" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={20} />
//                   <Bar dataKey="outcome" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={20} />
//                 </BarChart>
//               </ResponsiveContainer>
//             )}
//           </div>

//           {/* Summary Panel */}
//           <div className="s4" style={{ background: '#fff', border: '1.5px solid #e8edf5', borderRadius: 16, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
//             <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Period Summary</div>

//             {/* SVG ring */}
//             <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
//               <svg width="130" height="130" viewBox="0 0 130 130">
//                 <circle cx="65" cy="65" r="50" fill="none" stroke="#f1f5f9" strokeWidth="14" />
//                 {!loading && <>
//                   <circle cx="65" cy="65" r="50" fill="none" stroke="#fecdd3" strokeWidth="14"
//                     strokeDasharray={`${outcomeRate * 3.14} 314`}
//                     strokeLinecap="round" transform="rotate(-90 65 65)" />
//                   <circle cx="65" cy="65" r="50" fill="none" stroke="#c7d2fe" strokeWidth="14"
//                     strokeDasharray={`314 314`}
//                     strokeDashoffset={outcomeRate * 3.14}
//                     strokeLinecap="round" transform="rotate(-90 65 65)" opacity={0.5} />
//                   <circle cx="65" cy="65" r="50" fill="none" stroke="#6ee7b7" strokeWidth="14"
//                     strokeDasharray={`${profitRate * 3.14} 314`}
//                     strokeDashoffset={-(314 - outcomeRate * 3.14)}
//                     strokeLinecap="round" transform="rotate(-90 65 65)" />
//                 </>}
//               </svg>
//               <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
//                 {loading
//                   ? <Loader2 size={20} color="#6366f1" className="spin" />
//                   : <>
//                     <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>{profitRate}%</div>
//                     <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Profit Rate</div>
//                   </>
//                 }
//               </div>
//             </div>

//             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//               {[
//                 { label: 'Income', value: totalIncome, c: '#6366f1', bg: '#eef2ff', pct: 100 },
//                 { label: 'Outcome', value: totalOutcome, c: '#f43f5e', bg: '#fff1f2', pct: outcomeRate },
//                 { label: 'Net Profit', value: netProfit, c: '#059669', bg: '#ecfdf5', pct: profitRate },
//               ].map(item => (
//                 <div key={item.label}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
//                     <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{item.label}</span>
//                     {loading
//                       ? <Skeleton h={12} w={50} />
//                       : <span style={{ fontSize: 12, fontWeight: 700, color: item.c }}>{fmt(item.value)}</span>
//                     }
//                   </div>
//                   <div style={{ height: 6, background: item.bg, borderRadius: 99, overflow: 'hidden' }}>
//                     <div style={{
//                       height: '100%',
//                       width: loading ? '0%' : `${item.pct}%`,
//                       background: item.c, borderRadius: 99,
//                       transition: 'width 0.7s ease', opacity: 0.75
//                     }} />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* ── Bottom Row: Area + Table ── */}
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

//           {/* Area Trend */}
//           <div className="s6" style={{ background: '#fff', border: '1.5px solid #e8edf5', borderRadius: 16, padding: '20px 22px' }}>
//             <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Net Profit Trend</div>
//             <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
//               {([['#6366f1', 'Income'], ['#f43f5e', 'Outcome'], ['#059669', 'Profit']] as [string, string][]).map(([c, l]) => (
//                 <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
//                   <span style={{ width: 6, height: 6, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
//                 </span>
//               ))}
//             </div>

//             {loading ? (
//               <div style={{ height: 205, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                 <Loader2 size={24} color="#6366f1" className="spin" />
//               </div>
//             ) : (
//               <ResponsiveContainer width="100%" height={205}>
//                 <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
//                   <defs>
//                     <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
//                       <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
//                     </linearGradient>
//                     <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#059669" stopOpacity={0.12} />
//                       <stop offset="95%" stopColor="#059669" stopOpacity={0} />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 6" stroke="#f1f5f9" vertical={false} />
//                   <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
//                   <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v / 1000}k`} />
//                   <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
//                   <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={2} fill="url(#gi)" dot={false} />
//                   <Area type="monotone" dataKey="outcome" stroke="#f43f5e" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 4" />
//                   <Area type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2} fill="url(#gp)" dot={false} />
//                 </AreaChart>
//               </ResponsiveContainer>
//             )}
//           </div>

//           {/* Table */}
//           <div className="s7" style={{ background: '#fff', border: '1.5px solid #e8edf5', borderRadius: 16, overflow: 'hidden' }}>
//             <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//               <div>
//                 <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Monthly Breakdown</div>
//                 <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{startMonth} – {endMonth} {year}</div>
//               </div>
//               {data && (
//                 <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, background: '#eef2ff', padding: '3px 8px', borderRadius: 99 }}>
//                   {monthly.length} months
//                 </span>
//               )}
//             </div>

//             <div style={{ overflowY: 'auto', maxHeight: 264 }}>
//               {loading ? (
//                 <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
//                   {Array.from({ length: 6 }).map((_, i) => (
//                     <div key={i} style={{ display: 'flex', gap: 16 }}>
//                       <Skeleton h={14} w="20%" />
//                       <Skeleton h={14} w="20%" />
//                       <Skeleton h={14} w="20%" />
//                       <Skeleton h={14} w="20%" />
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                   <thead>
//                     <tr style={{ background: '#fafbff' }}>
//                       {['Month', 'Income', 'Outcome', 'Profit'].map(h => (
//                         <th key={h} style={{ padding: '9px 18px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textAlign: h === 'Month' ? 'left' : 'right', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {monthly.map(row => (
//                       <tr key={`${row.month}-${row.year}`} className="trow" style={{ borderTop: '1px solid #f8fafc' }}>
//                         <td style={{ padding: '9px 18px', fontSize: 12, fontWeight: 600, color: '#475569' }}>{row.month} {year}</td>
//                         <td style={{ padding: '9px 18px', fontSize: 12, fontWeight: 700, color: '#6366f1', textAlign: 'right' }}>{fmt(row.income)}</td>
//                         <td style={{ padding: '9px 18px', fontSize: 12, fontWeight: 700, color: '#f43f5e', textAlign: 'right' }}>{fmt(row.outcome)}</td>
//                         <td style={{ padding: '9px 18px', textAlign: 'right' }}>
//                           <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
//                             <ArrowUpRight size={11} />{fmt(row.profit)}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot>
//                     <tr style={{ borderTop: '2px solid #e8edf5', background: '#fafbff' }}>
//                       <td style={{ padding: '10px 18px', fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</td>
//                       <td style={{ padding: '10px 18px', fontSize: 13, fontWeight: 800, color: '#6366f1', textAlign: 'right' }}>{fmt(totalIncome)}</td>
//                       <td style={{ padding: '10px 18px', fontSize: 13, fontWeight: 800, color: '#f43f5e', textAlign: 'right' }}>{fmt(totalOutcome)}</td>
//                       <td style={{ padding: '10px 18px', fontSize: 13, fontWeight: 800, color: '#059669', textAlign: 'right' }}>{fmt(netProfit)}</td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;



import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, Wallet,
  Calendar, ArrowUpRight, ArrowDownRight,
  RefreshCw, AlertCircle, Loader2, Menu, X
} from 'lucide-react';
import { getDashboardSummary } from '../service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthlyDataDTO {
  month: string;
  monthNumber: number;
  year: number;
  income: number;
  outcome: number;
  profit: number;
}

interface DashboardSummaryDTO {
  totalIncome: number;
  totalOutcome: number;
  netProfit: number;
  profitMargin: number;
  collectionRate: number;
  paidRentCount: number;
  partialRentCount: number;
  unpaidRentCount: number;
  activeStudents: number;
  totalExpensePaid: number;
  totalExpensePending: number;
  totalExpenseOverdue: number;
  monthlyData: MonthlyDataDTO[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthNum = (m: string) => months.indexOf(m) + 1;

async function fetchSummary(year: any, startMonth: string, endMonth: string): Promise<DashboardSummaryDTO> {
  const params = new URLSearchParams({
    year,
    startMonth: String(monthNum(startMonth)),
    endMonth: String(monthNum(endMonth)),
  });
  const res = await getDashboardSummary(params);
  return res?.data;
}

const fmt = (n: number) =>
  n >= 1000000 ? `₹${(n / 1000000).toFixed(1)}M`
    : n >= 1000 ? `₹${(n / 1000).toFixed(1)}k`
      : `₹${n}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
      padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
    }}>
      <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            {p.dataKey}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const Skeleton = ({ w = '100%', h = 16, r = 6 }: { w?: string | number; h?: number; r?: number }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg,#f1f5f9 25%,#e8edf5 50%,#f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite'
  }} />
);

const ErrorBanner = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 8,
    background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: 12,
    padding: '12px 16px', marginBottom: 20
  }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#be123c', fontWeight: 600 }}>
      <AlertCircle size={15} /> {message}
    </span>
    <button onClick={onRetry} style={{
      display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700,
      color: '#be123c', background: '#fecdd3', border: 'none', borderRadius: 7,
      padding: '5px 10px', cursor: 'pointer'
    }}>
      <RefreshCw size={12} /> Retry
    </button>
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────

const currentYear = new Date().getFullYear();

const Dashboard: React.FC = () => {
  const [year, setYear] = useState(currentYear);
  const [startMonth, setStartMonth] = useState('Jan');
  const [endMonth, setEndMonth] = useState('Dec');
  const [data, setData] = useState<DashboardSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSummary(year, startMonth, endMonth);
      setData(result);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [year, startMonth, endMonth]);

  useEffect(() => { load(); }, [load]);

  const monthly = data?.monthlyData ?? [];
  const trendData = monthly.map(d => ({ ...d }));
  const totalIncome = data?.totalIncome ?? 0;
  const totalOutcome = data?.totalOutcome ?? 0;
  const netProfit = data?.netProfit ?? 0;
  const profitRate = data ? Math.round(data.profitMargin) : 0;
  const outcomeRate = totalIncome > 0 ? Math.round((totalOutcome / totalIncome) * 100) : 0;
  const avgIncome = monthly.length > 0 ? Math.round(totalIncome / monthly.length) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#F0F4FF', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1e293b' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        select { appearance: none; -webkit-appearance: none; cursor: pointer; border: none; outline: none; }
        select option { background: #fff; color: #1e293b; }
        .card { transition: box-shadow 0.2s, transform 0.2s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(99,102,241,0.1); }
        .trow:hover td { background: #f8faff !important; }
        .s1 { animation: up 0.4s ease 0.05s both; }
        .s2 { animation: up 0.4s ease 0.1s both; }
        .s3 { animation: up 0.4s ease 0.15s both; }
        .s4 { animation: up 0.4s ease 0.2s both; }
        .s5 { animation: up 0.4s ease 0.25s both; }
        .s6 { animation: up 0.4s ease 0.3s both; }
        .s7 { animation: up 0.4s ease 0.35s both; }
        @keyframes up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        /* ── Responsive grid helpers ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .charts-row {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 16px;
        }
        .bottom-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .banner-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: #e8edf5;
          border-radius: 12px;
          overflow: hidden;
        }
        .filter-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f8faff;
          border: 1.5px solid #e0e7ff;
          border-radius: 10px;
          padding: 6px 12px;
          flex-wrap: nowrap;
        }

        /* Tablet: ≤ 900px */
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .charts-row { grid-template-columns: 1fr; }
          .bottom-row { grid-template-columns: 1fr; }
          .banner-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* Mobile: ≤ 600px */
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr; }
          .banner-grid { grid-template-columns: repeat(2, 1fr); }
          .dash-header {
            flex-direction: row !important;
            align-items: center !important;
            height: 56px !important;
            padding: 0 16px !important;
            gap: 0;
          }
          .dash-controls {
            display: none !important;
          }
          .hamburger-btn {
            display: flex !important;
          }
          .mobile-drawer {
            display: block !important;
          }
          .dash-main {
            padding: 16px !important;
          }
          .summary-ring {
            display: none;
          }
        }

        /* Extra small: ≤ 400px */
        @media (max-width: 400px) {
          .banner-grid { grid-template-columns: 1fr 1fr; }
          .filter-pill { padding: 5px 8px; }
        }

        /* Hamburger always hidden on desktop */
        .hamburger-btn { display: none; }
        .mobile-drawer { display: none; }

        /* Drawer slide-down animation */
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .drawer-open { animation: slideDown 0.22s ease both; }
      `}</style>

      {/* ── Topbar ── */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid #e8edf5',
        padding: '0 32px',
        height: 62,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 0 #e8edf5',
        flexWrap: 'wrap',
        gap: 8,
      }}
        className="dash-header"
      >
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>Financial Overview</span>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {startMonth} – {endMonth} {year}
          </span>
          {loading && <Loader2 size={14} color="#6366f1" className="spin" style={{ flexShrink: 0 }} />}
        </div>

        {/* Desktop Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }} className="dash-controls">
          <div className="filter-pill">
            <Calendar size={13} color="#6366f1" style={{ flexShrink: 0 }} />
            <select
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}
              style={{ background: 'transparent', color: '#4f46e5', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', minWidth: 44 }}
            >
              {Array.from({ length: 11 }, (_, i) => {
                const y = currentYear - i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
            <span style={{ color: '#c7d2fe', fontSize: 12, flexShrink: 0 }}>|</span>
            <select value={startMonth} onChange={e => setStartMonth(e.target.value)}
              style={{ background: 'transparent', color: '#64748b', fontSize: 12, fontFamily: 'inherit', fontWeight: 500 }}>
              {months.map(m => <option key={m}>{m}</option>)}
            </select>
            <span style={{ color: '#94a3b8', fontSize: 11, flexShrink: 0 }}>→</span>
            <select value={endMonth} onChange={e => setEndMonth(e.target.value)}
              style={{ background: 'transparent', color: '#64748b', fontSize: 12, fontFamily: 'inherit', fontWeight: 500 }}>
              {months.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <button
            onClick={load}
            title="Refresh"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: 9,
              background: '#f8fafc', border: '1.5px solid #e2e8f0',
              cursor: 'pointer', color: '#94a3b8', flexShrink: 0,
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>

        {/* Hamburger (mobile only) */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 9,
            background: menuOpen ? '#eef2ff' : '#f8fafc',
            border: `1.5px solid ${menuOpen ? '#c7d2fe' : '#e2e8f0'}`,
            cursor: 'pointer',
            color: menuOpen ? '#6366f1' : '#64748b',

            overflow: 'visible',   // ✅ VERY IMPORTANT
            padding: 0,            // ✅ reset
            lineHeight: 0,         // ✅ fix SVG alignment
          }}
        >
          <span style={{ display: 'flex' }}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </span>
        </button>
      </header>

      {/* ── Mobile Filter Drawer ── */}
      <div
        className="mobile-drawer"
        style={{ position: 'sticky', top: 56, zIndex: 39 }}
      >
        {menuOpen && (
          <div
            className="drawer-open"
            style={{
              background: '#fff',
              borderBottom: '1.5px solid #e0e7ff',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: '0 8px 24px rgba(99,102,241,0.08)',
            }}
          >
            <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Filter by Period
            </p>

            {/* Year */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', width: 60, flexShrink: 0 }}>Year</span>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 6,
                background: '#f8faff', border: '1.5px solid #e0e7ff', borderRadius: 9, padding: '7px 12px',
              }}>
                <Calendar size={12} color="#6366f1" />
                <select
                  value={year}
                  onChange={e => setYear(parseInt(e.target.value))}
                  style={{ background: 'transparent', color: '#4f46e5', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', flex: 1 }}
                >
                  {Array.from({ length: 11 }, (_, i) => {
                    const y = currentYear - i;
                    return <option key={y} value={y}>{y}</option>;
                  })}
                </select>
              </div>
            </div>

            {/* Month range */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', width: 60, flexShrink: 0 }}>From</span>
              <div style={{
                flex: 1, background: '#f8faff', border: '1.5px solid #e0e7ff', borderRadius: 9, padding: '7px 12px',
              }}>
                <select value={startMonth} onChange={e => setStartMonth(e.target.value)}
                  style={{ background: 'transparent', color: '#64748b', fontSize: 13, fontFamily: 'inherit', fontWeight: 500, width: '100%' }}>
                  {months.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', width: 60, flexShrink: 0 }}>To</span>
              <div style={{
                flex: 1, background: '#f8faff', border: '1.5px solid #e0e7ff', borderRadius: 9, padding: '7px 12px',
              }}>
                <select value={endMonth} onChange={e => setEndMonth(e.target.value)}
                  style={{ background: 'transparent', color: '#64748b', fontSize: 13, fontFamily: 'inherit', fontWeight: 500, width: '100%' }}>
                  {months.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Apply + Refresh row */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { load(); setMenuOpen(false); }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 9, border: 'none',
                  background: 'linear-gradient(135deg,#6366f1,#818cf8)',
                  color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <RefreshCw size={13} className={loading ? 'spin' : ''} /> Apply & Refresh
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <main style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }} className="dash-main">

        {error && <ErrorBanner message={error} onRetry={load} />}

        {/* ── Rent / Student Banner ── */}
        {data && (
          <div className="s1 banner-grid">
            {[
              { label: 'Paid Rents', value: data.paidRentCount, color: '#059669', bg: '#ecfdf5' },
              { label: 'Partial Rents', value: data.partialRentCount, color: '#d97706', bg: '#fffbeb' },
              { label: 'Unpaid Rents', value: data.unpaidRentCount, color: '#f43f5e', bg: '#fff1f2' },
              { label: 'Active Students', value: data.activeStudents, color: '#6366f1', bg: '#eef2ff' },
            ].map(item => (
              <div key={item.label} style={{ background: item.bg, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</span>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="stats-grid">
          {[
            {
              label: 'Total Income', value: totalIncome, Icon: TrendingUp,
              accent: '#6366f1', lightBg: '#eef2ff', up: true,
              trend: `${data?.collectionRate?.toFixed(1) ?? 0}% collected`,
              sub: loading ? '—' : `${monthly.length} months · Avg ${fmt(avgIncome)}/mo`,
              cls: 's2',
            },
            {
              label: 'Total Outcome', value: totalOutcome, Icon: TrendingDown,
              accent: '#f43f5e', lightBg: '#fff1f2', up: false,
              trend: `${outcomeRate}% of income`,
              sub: loading ? '—' : `Pending ${fmt(data?.totalExpensePending ?? 0)} · Overdue ${fmt(data?.totalExpenseOverdue ?? 0)}`,
              cls: 's3',
            },
            {
              label: 'Net Profit', value: netProfit, Icon: Wallet,
              accent: '#059669', lightBg: '#ecfdf5', up: true,
              trend: `+${profitRate}% margin`,
              sub: loading ? '—' : `Income – Outcome = ${fmt(netProfit)}`,
              cls: 's4',
            },
          ].map(({ label, value, Icon, accent, lightBg, trend, up, sub, cls }) => (
            <div key={label} className={`card ${cls}`} style={{
              background: '#fff', border: '1.5px solid #e8edf5', borderRadius: 16,
              padding: '20px 22px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: '16px 16px 0 0' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, marginTop: 4, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={accent} />
                </div>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700,
                  color: up ? '#059669' : '#f43f5e',
                  background: up ? '#ecfdf5' : '#fff1f2',
                  padding: '3px 8px', borderRadius: 99, whiteSpace: 'nowrap',
                }}>
                  {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                  {trend}
                </span>
              </div>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Skeleton h={28} w="60%" />
                  <Skeleton h={12} w="40%" />
                  <Skeleton h={10} w="55%" />
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0f172a', marginBottom: 4 }}>{fmt(value)}</div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: accent, fontWeight: 600, opacity: 0.7 }}>{sub}</div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* ── Charts Row ── */}
        <div className="charts-row">

          {/* Bar Chart */}
          <div className="s4" style={{ background: '#fff', border: '1.5px solid #e8edf5', borderRadius: 16, padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Income vs Outcome</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Monthly comparison · {year}</div>
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {([['#6366f1', 'Income'], ['#f43f5e', 'Outcome']] as [string, string][]).map(([c, l]) => (
                  <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 3, background: c, display: 'inline-block' }} />{l}
                  </span>
                ))}
              </div>
            </div>
            {loading ? (
              <div style={{ height: 230, display: 'flex', alignItems: 'flex-end', gap: 6, padding: '0 4px' }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                    <Skeleton h={Math.random() * 120 + 60} w="48%" r={4} />
                    <Skeleton h={Math.random() * 80 + 40} w="48%" r={4} />
                  </div>
                ))}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={monthly} margin={{ top: 0, right: 0, left: -18, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 6" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                  <Bar dataKey="income" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="outcome" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Summary Panel */}
          <div className="s4" style={{ background: '#fff', border: '1.5px solid #e8edf5', borderRadius: 16, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Period Summary</div>

            <div className="summary-ring" style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="50" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                {!loading && <>
                  <circle cx="65" cy="65" r="50" fill="none" stroke="#fecdd3" strokeWidth="14"
                    strokeDasharray={`${outcomeRate * 3.14} 314`}
                    strokeLinecap="round" transform="rotate(-90 65 65)" />
                  <circle cx="65" cy="65" r="50" fill="none" stroke="#c7d2fe" strokeWidth="14"
                    strokeDasharray={`314 314`}
                    strokeDashoffset={outcomeRate * 3.14}
                    strokeLinecap="round" transform="rotate(-90 65 65)" opacity={0.5} />
                  <circle cx="65" cy="65" r="50" fill="none" stroke="#6ee7b7" strokeWidth="14"
                    strokeDasharray={`${profitRate * 3.14} 314`}
                    strokeDashoffset={-(314 - outcomeRate * 3.14)}
                    strokeLinecap="round" transform="rotate(-90 65 65)" />
                </>}
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                {loading
                  ? <Loader2 size={20} color="#6366f1" className="spin" />
                  : <>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>{profitRate}%</div>
                    <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Profit Rate</div>
                  </>
                }
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Income', value: totalIncome, c: '#6366f1', bg: '#eef2ff', pct: 100 },
                { label: 'Outcome', value: totalOutcome, c: '#f43f5e', bg: '#fff1f2', pct: outcomeRate },
                { label: 'Net Profit', value: netProfit, c: '#059669', bg: '#ecfdf5', pct: profitRate },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{item.label}</span>
                    {loading ? <Skeleton h={12} w={50} /> : <span style={{ fontSize: 12, fontWeight: 700, color: item.c }}>{fmt(item.value)}</span>}
                  </div>
                  <div style={{ height: 6, background: item.bg, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: loading ? '0%' : `${item.pct}%`,
                      background: item.c, borderRadius: 99,
                      transition: 'width 0.7s ease', opacity: 0.75
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Row: Area + Table ── */}
        <div className="bottom-row">

          {/* Area Trend */}
          <div className="s6" style={{ background: '#fff', border: '1.5px solid #e8edf5', borderRadius: 16, padding: '20px 22px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Net Profit Trend</div>
            <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
              {([['#6366f1', 'Income'], ['#f43f5e', 'Outcome'], ['#059669', 'Profit']] as [string, string][]).map(([c, l]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
                </span>
              ))}
            </div>
            {loading ? (
              <div style={{ height: 205, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={24} color="#6366f1" className="spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={205}>
                <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={2} fill="url(#gi)" dot={false} />
                  <Area type="monotone" dataKey="outcome" stroke="#f43f5e" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2} fill="url(#gp)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Table */}
          <div className="s7" style={{ background: '#fff', border: '1.5px solid #e8edf5', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Monthly Breakdown</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{startMonth} – {endMonth} {year}</div>
              </div>
              {data && (
                <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, background: '#eef2ff', padding: '3px 8px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                  {monthly.length} months
                </span>
              )}
            </div>

            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 264 }}>
              {loading ? (
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16 }}>
                      <Skeleton h={14} w="20%" />
                      <Skeleton h={14} w="20%" />
                      <Skeleton h={14} w="20%" />
                      <Skeleton h={14} w="20%" />
                    </div>
                  ))}
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 280 }}>
                  <thead>
                    <tr style={{ background: '#fafbff' }}>
                      {['Month', 'Income', 'Outcome', 'Profit'].map(h => (
                        <th key={h} style={{
                          padding: '9px 14px', fontSize: 10, fontWeight: 700, color: '#94a3b8',
                          textAlign: h === 'Month' ? 'left' : 'right',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthly.map(row => (
                      <tr key={`${row.month}-${row.year}`} className="trow" style={{ borderTop: '1px solid #f8fafc' }}>
                        <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>{row.month} {year}</td>
                        <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 700, color: '#6366f1', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(row.income)}</td>
                        <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 700, color: '#f43f5e', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(row.outcome)}</td>
                        <td style={{ padding: '9px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                            <ArrowUpRight size={11} />{fmt(row.profit)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #e8edf5', background: '#fafbff' }}>
                      <td style={{ padding: '10px 14px', fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 800, color: '#6366f1', textAlign: 'right' }}>{fmt(totalIncome)}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 800, color: '#f43f5e', textAlign: 'right' }}>{fmt(totalOutcome)}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 800, color: '#059669', textAlign: 'right' }}>{fmt(netProfit)}</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;