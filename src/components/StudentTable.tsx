import React, { useEffect, useState, useCallback } from 'react';
import {
    Search, Plus, X, Upload, Eye, Download, FileText,
    Trash2, ChevronDown, Users, CheckCircle,
    Clock, XCircle, Building2, Bed, IndianRupee, Pencil,
    CreditCard, Camera, IdCard, SlidersHorizontal
} from 'lucide-react';
import { createStudentsAPI, getStudentsAPI, updateStudentsAPI, getRoomsAPI } from '../service';

export interface Student {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    joinDate: string;
    bedNo: string;
    roomNo: string;
    sharingType: 'Single' | 'Double' | 'Triple' | 'Four Sharing';
    roomType: 'AC' | 'Non-AC';
    monthlyFee: string | number;
    advanceAmount: string | number;
    status: 'Active' | 'Pending' | 'Inactive';
    guardianName: string;
    guardianPhone: string;
    address: string;
    isActive: boolean;
    aadhaarDocument?: string;
    photoDocument?: string;
    idProofDocument?: string;
}

interface Room {
    id: number;
    roomNo: string;
    bedNumbers: number;
    sharingType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR_SHARING';
    roomType: 'AC' | 'NON_AC';
    isAvailable: boolean;
    pricePerMonth: number;
}

interface DocumentPreview {
    type: 'aadhaar' | 'photo' | 'idProof';
    url: string;
    name: string;
    isPdf: boolean;
}

type ModalMode = 'add' | 'edit';

// ─── helpers ─────────────────────────────────────────────────────────────────

const isPdfDataUrl = (url: string) =>
    url.startsWith('data:application/pdf') || url.includes('application/pdf');

const isPdfUrl = (url: string) =>
    url.toLowerCase().split('?')[0].endsWith('.pdf') || isPdfDataUrl(url);

const safeFilename = (label: string, url: string) => {
    const ext = isPdfUrl(url) ? 'pdf' : url.startsWith('data:image/png') ? 'png' : 'jpg';
    return `${label.replace(/\s+/g, '_')}.${ext}`;
};

const formatSharingType = (apiType: string): 'Single' | 'Double' | 'Triple' | 'Four Sharing' => {
    const map: Record<string, 'Single' | 'Double' | 'Triple' | 'Four Sharing'> = {
        SINGLE: 'Single', DOUBLE: 'Double', TRIPLE: 'Triple', FOUR_SHARING: 'Four Sharing',
    };
    return map[apiType] ?? 'Double';
};

const formatRoomType = (apiType: string): 'AC' | 'Non-AC' =>
    apiType === 'AC' ? 'AC' : 'Non-AC';

const generateBedOptions = (bedNumbers: number): string[] => {
    const labels = ['A', 'B', 'C', 'D'];
    return Array.from({ length: bedNumbers }, (_, i) => `Bed ${labels[i] ?? i + 1}`);
};

const EMPTY_FORM = {
    name: '', joinDate: '', bedNo: '', roomNo: '',
    sharingType: 'Double' as 'Single' | 'Double' | 'Triple' | 'Four Sharing',
    roomType: 'Non-AC' as 'AC' | 'Non-AC',
    monthlyFee: '', advanceAmount: '',
    status: 'Active' as 'Active' | 'Pending' | 'Inactive',
    guardianName: '', guardianPhone: '', address: '', phoneNumber: '', email: ''
};

const STATUS_CONFIG = {
    Active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', border: 'border-emerald-100', glow: 'shadow-emerald-100' },
    Pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-100', glow: 'shadow-amber-100' },
    Inactive: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-400', border: 'border-rose-100', glow: 'shadow-rose-100' },
};

// ─── Avatar Gradient ──────────────────────────────────────────────────────────
const getAvatarGradient = (name: string) => {
    const gradients = [
        'from-violet-500 to-purple-600',
        'from-blue-500 to-indigo-600',
        'from-teal-500 to-emerald-600',
        'from-orange-500 to-rose-600',
        'from-pink-500 to-violet-600',
        'from-sky-500 to-blue-600',
    ];
    const idx = (name?.charCodeAt(0) ?? 0) % gradients.length;
    return gradients[idx];
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StudentTable() {
    const [students, setStudents] = useState<Student[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [modalMode, setModalMode] = useState<ModalMode>('add');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewDocument, setPreviewDocument] = useState<DocumentPreview | null>(null);

    const [formData, setFormData] = useState({ ...EMPTY_FORM });
    const [documents, setDocuments] = useState<{ aadhaar: File | null; photo: File | null; idProof: File | null }>({ aadhaar: null, photo: null, idProof: null });
    const [documentPreviews, setDocumentPreviews] = useState<{ aadhaar: string | null; photo: string | null; idProof: string | null }>({ aadhaar: null, photo: null, idProof: null });
    const [existingDocs, setExistingDocs] = useState<{ aadhaar: string | null; photo: string | null; idProof: string | null }>({ aadhaar: null, photo: null, idProof: null });

    const selectedRoom = rooms.find(r => r.roomNo === formData.roomNo) ?? null;
    const bedOptions = selectedRoom ? generateBedOptions(selectedRoom.bedNumbers) : [];

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const fetchStudents = async () => {
        try { const r = await getStudentsAPI(); setStudents(r.data); }
        catch (err) { console.error('Error fetching students:', err); }
    };
    const fetchRooms = async () => {
        try { const r = await getRoomsAPI(); setRooms(r.data); }
        catch (err) { console.error('Error fetching rooms:', err); }
    };

    useEffect(() => { fetchStudents(); fetchRooms(); }, []);

    const handleRoomChange = (roomNo: string) => {
        const room = rooms.find(r => r.roomNo === roomNo);
        if (room) {
            setFormData(prev => ({
                ...prev, roomNo: room.roomNo, bedNo: '',
                sharingType: formatSharingType(room.sharingType),
                roomType: formatRoomType(room.roomType),
                monthlyFee: String(room.pricePerMonth),
            }));
        } else {
            setFormData(prev => ({ ...prev, roomNo: '', bedNo: '', sharingType: 'Double', roomType: 'Non-AC', monthlyFee: '' }));
        }
    };

    const openAddModal = () => {
        setModalMode('add'); setEditingId(null);
        setFormData({ ...EMPTY_FORM });
        setDocuments({ aadhaar: null, photo: null, idProof: null });
        setDocumentPreviews({ aadhaar: null, photo: null, idProof: null });
        setExistingDocs({ aadhaar: null, photo: null, idProof: null });
        setError(null); setIsModalOpen(true);
    };

    const openEditModal = (student: Student) => {
        setModalMode('edit'); setEditingId(student.id);
        setFormData({
            name: student.name ?? '', joinDate: student.joinDate ? student.joinDate.split('T')[0] : '',
            bedNo: student.bedNo ?? '', roomNo: student.roomNo ?? '',
            sharingType: student.sharingType ?? 'Double', roomType: student.roomType ?? 'Non-AC',
            monthlyFee: String(student.monthlyFee ?? ''), advanceAmount: String(student.advanceAmount ?? ''),
            status: student.status ?? 'Active', guardianName: student.guardianName ?? '',
            guardianPhone: student.guardianPhone ?? '', address: student.address ?? '',
            phoneNumber: student.phoneNumber ?? '', email: student.email ?? '',
        });
        setExistingDocs({ aadhaar: student.aadhaarDocument ?? null, photo: student.photoDocument ?? null, idProof: student.idProofDocument ?? null });
        setDocuments({ aadhaar: null, photo: null, idProof: null });
        setDocumentPreviews({ aadhaar: null, photo: null, idProof: null });
        setError(null); setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setError(null); };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'aadhaar' | 'photo' | 'idProof') => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setError('File size should not exceed 5 MB'); return; }
        if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)) { setError('Only JPG, PNG, and PDF files are allowed'); return; }
        setDocuments(prev => ({ ...prev, [type]: file }));
        setExistingDocs(prev => ({ ...prev, [type]: null }));
        const reader = new FileReader();
        reader.onloadend = () => setDocumentPreviews(prev => ({ ...prev, [type]: reader.result as string }));
        reader.readAsDataURL(file);
        setError(null);
    };

    const handleRemoveNewDocument = (type: 'aadhaar' | 'photo' | 'idProof') => {
        setDocuments(prev => ({ ...prev, [type]: null }));
        setDocumentPreviews(prev => ({ ...prev, [type]: null }));
    };

    const handleRemoveExistingDocument = (type: 'aadhaar' | 'photo' | 'idProof') =>
        setExistingDocs(prev => ({ ...prev, [type]: null }));

    const handlePreviewDocument = (type: 'aadhaar' | 'photo' | 'idProof', url: string, name: string) =>
        setPreviewDocument({ type, url, name, isPdf: isPdfUrl(url) });

    const handleDownloadDocument = useCallback((url: string, label: string) => {
        const filename = safeFilename(label, url);
        const link = document.createElement('a');
        link.href = url; link.download = filename; link.target = '_blank'; link.rel = 'noopener noreferrer';
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!formData.name || !formData.joinDate || !formData.roomNo || !formData.bedNo || !formData.guardianName || !formData.guardianPhone || !formData.address || !formData.phoneNumber || !formData.email) {
                setError('Please fill in all required fields.'); return;
            };
            if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
                setError('Phone number must be 10 digits.'); return;
            }
            if (formData.guardianPhone && !/^\d{10}$/.test(formData.guardianPhone)) {
                setError('Guardian phone number must be 10 digits.'); return;
            }
            if (!documents.aadhaar) {
                if (modalMode === 'add') {
                    setError('Aadhaar card is required for new students.'); return;
                } else if (modalMode === 'edit' && !existingDocs.aadhaar) {
                    setError('Aadhaar card is required. Please upload or keep the existing document.'); return;
                }
            }
            if (!documents.idProof) {
                if (modalMode === 'add') {
                    setError('ID proof is required for new students.'); return;
                } else if (modalMode === 'edit' && !existingDocs.idProof) {
                    setError('ID proof is required. Please upload or keep the existing document.'); return;
                }
            }
            if (!documents.photo) {
                if (modalMode === 'add') {
                    setError('Photo is required for new students.'); return;
                } else if (modalMode === 'edit' && !existingDocs.photo) {
                    setError('Photo is required. Please upload or keep the existing document.'); return;
                }
            }

            setIsLoading(true); setError(null);
            const submitData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'monthlyFee' || key === 'advanceAmount') {
                    submitData.append(key, String(value).replace(/[₹,\s]/g, ''));
                } else { submitData.append(key, value); }
            });
            if (documents.aadhaar) submitData.append('aadhaar', documents.aadhaar);
            if (documents.photo) submitData.append('photo', documents.photo);
            if (documents.idProof) submitData.append('idProof', documents.idProof);
            if (modalMode === 'edit') {
                if (!existingDocs.aadhaar && !documents.aadhaar) submitData.append('removeAadhaar', 'true');
                if (!existingDocs.photo && !documents.photo) submitData.append('removePhoto', 'true');
                if (!existingDocs.idProof && !documents.idProof) submitData.append('removeIdProof', 'true');
                await updateStudentsAPI(editingId!, submitData);
            } else { await createStudentsAPI(submitData); }
            closeModal(); fetchStudents();
        } catch (err: any) {
            console.error('Error submitting student data:', err);
            setError(err || `Failed to ${modalMode === 'edit' ? 'update' : 'create'} student.`);
        } finally { setIsLoading(false); }
    };

    const filteredStudents = students.filter(student => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
            student.name?.toLowerCase().includes(search) ||
            student.bedNo?.toLowerCase().includes(search) ||
            student.roomNo?.toLowerCase().includes(search) ||
            student.sharingType?.toLowerCase().includes(search) ||
            student.roomType?.toLowerCase().includes(search);
        const joinDate = new Date(student.joinDate);
        const matchesYear = !selectedYear || joinDate.getFullYear() === selectedYear;
        const matchesMonth = !selectedMonth || joinDate.getMonth() === months.indexOf(selectedMonth);
        return matchesSearch && matchesYear && matchesMonth;
    });

    const stats = {
        total: students.length,
        active: students.filter(s => s.status === 'Active').length,
        pending: students.filter(s => s.status === 'Pending').length,
    };

    const inputCls = "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition-all shadow-sm hover:border-slate-300";
    const readOnlyCls = "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed select-none";

    return (
        <div className="min-h-screen bg-[#f6f7fb]">
            {/* ── Subtle top accent bar ── */}
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />

            <div className="max-w mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-5 sm:space-y-6">

                {/* ── Page Header ── */}
                <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                            Student Records
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-medium truncate">
                            Manage hostel residents and documents
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-200 hover:bg-violet-700 active:scale-95 transition-all whitespace-nowrap"
                    >
                        <Plus size={15} strokeWidth={2.5} />
                        <span className="xs:inline">Add Student</span>
                    </button>
                </div>
                {/* ── Stats ── */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[
                        { label: 'Total Students', value: stats.total, icon: Users, color: 'text-violet-600', bg: 'bg-violet-100', ring: 'ring-violet-200' },
                        { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', ring: 'ring-emerald-200' },
                        { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', ring: 'ring-amber-200' },
                    ].map(({ label, value, icon: Icon, color, bg, ring }) => (
                        <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-5 flex items-center gap-2.5 sm:gap-4 min-w-0 hover:shadow-md transition-shadow">
                            <div className={`${bg} ring-4 ${ring} rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shrink-0`}>
                                <Icon size={15} className={color} strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xl sm:text-3xl font-bold text-slate-800 leading-none tracking-tight">{value}</p>
                                <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wide truncate">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Table Card ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                    {/* Toolbar */}
                    <div className="p-3 sm:p-5 border-b border-slate-100 flex flex-col gap-3 bg-white">
                        <div className="flex flex-col sm:flex-row gap-2.5">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} strokeWidth={2.5} />
                                <input
                                    type="text"
                                    placeholder="Search by name, room, bed…"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 focus:bg-white transition-all"
                                />
                            </div>
                            {/* Filters */}
                            <div className="flex gap-2 items-center">
                                <SlidersHorizontal size={14} className="text-slate-400 shrink-0" />
                                <SelectFilter value={String(selectedYear)} onChange={v => setSelectedYear(Number(v))}>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </SelectFilter>
                                <SelectFilter value={selectedMonth} onChange={setSelectedMonth}>
                                    <option value="">All Months</option>
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </SelectFilter>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['Student', 'Join Date', 'Room / Bed', 'Sharing', 'Room Type', 'Monthly Fee', 'Advance', 'Status', 'Docs', 'Actions'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-300">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                    <Users size={24} className="text-slate-300" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-500">No students found</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search or filters</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredStudents.map(student => {
                                    const sc = STATUS_CONFIG[student.status] ?? STATUS_CONFIG.Inactive;
                                    const grad = getAvatarGradient(student.name);
                                    return (
                                        <tr key={student.id} className="hover:bg-violet-50/30 transition-colors group">
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}>
                                                        {student.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-sm leading-snug">{student.name}</p>
                                                        <p className="text-xs text-slate-400 font-medium">{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-sm text-slate-500 font-medium">
                                                {new Date(student.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Building2 size={12} className="text-slate-400" />
                                                    <span className="text-sm font-bold text-slate-700">{student.roomNo}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Bed size={12} className="text-slate-300" />
                                                    <span className="text-xs text-slate-400 font-medium">{student.bedNo}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">{student.sharingType}</span>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${student.roomType === 'AC' ? 'bg-sky-50 text-sky-600 ring-1 ring-sky-100' : 'bg-slate-100 text-slate-500'}`}>{student.roomType}</span>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-0.5">
                                                    <IndianRupee size={13} className="text-slate-400" strokeWidth={2} />
                                                    <span className="font-bold text-slate-800 text-sm">{student.monthlyFee}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-0.5">
                                                    <IndianRupee size={13} className="text-slate-400" strokeWidth={2} />
                                                    <span className="font-bold text-slate-800 text-sm">{student.advanceAmount}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border shadow-sm ${sc.bg} ${sc.text} ${sc.border} ${sc.glow}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} animate-pulse`} />{student.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                {(student.aadhaarDocument || student.photoDocument || student.idProofDocument) ? (
                                                    <div className="flex items-center gap-1">
                                                        {student.aadhaarDocument && (
                                                            <DocIconButton icon={CreditCard} color="blue" tooltip="Aadhaar" onClick={() => handlePreviewDocument('aadhaar', student.aadhaarDocument!, 'Aadhaar')} />
                                                        )}
                                                        {student.photoDocument && (
                                                            <DocIconButton icon={Camera} color="green" tooltip="Photo" onClick={() => handlePreviewDocument('photo', student.photoDocument!, 'Photo')} />
                                                        )}
                                                        {student.idProofDocument && (
                                                            <DocIconButton icon={IdCard} color="purple" tooltip="ID Proof" onClick={() => handlePreviewDocument('idProof', student.idProofDocument!, 'ID Proof')} />
                                                        )}
                                                    </div>
                                                ) : <span className="text-slate-300 text-sm">—</span>}
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <button onClick={() => openEditModal(student)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-100 hover:border-violet-200 rounded-xl transition-all shadow-sm hover:shadow active:scale-95">
                                                    <Pencil size={12} strokeWidth={2.5} />Edit
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {filteredStudents.length === 0 ? (
                            <div className="py-20 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                                        <Users size={24} className="text-slate-300" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-500">No students found</p>
                                </div>
                            </div>
                        ) : filteredStudents.map(student => {
                            const sc = STATUS_CONFIG[student.status] ?? STATUS_CONFIG.Inactive;
                            const grad = getAvatarGradient(student.name);
                            return (
                                <div key={student.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                                    {/* Top row */}
                                    <div className="flex items-start justify-between mb-3 gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
                                                {student.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 text-sm truncate">{student.name}</p>
                                                <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">{student.roomNo} · {student.bedNo}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-xl border ${sc.bg} ${sc.text} ${sc.border}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{student.status}
                                            </span>
                                            <button onClick={() => openEditModal(student)} className="p-1.5 text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-xl border border-violet-100 transition-colors active:scale-95">
                                                <Pencil size={13} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info grid */}
                                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                        <InfoBox label="Join Date" value={new Date(student.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
                                        <InfoBox label="Monthly Fee" value={`₹${student.monthlyFee}`} bold />
                                        <InfoBox label="Sharing" value={student.sharingType} />
                                        <InfoBox label="Room Type" value={student.roomType} accent={student.roomType === 'AC'} />
                                    </div>

                                    {/* Docs row - icon only */}
                                    {(student.aadhaarDocument || student.photoDocument || student.idProofDocument) && (
                                        <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Docs</span>
                                            <div className="flex gap-1">
                                                {student.aadhaarDocument && (
                                                    <DocIconButton icon={CreditCard} color="blue" tooltip="Aadhaar" onClick={() => handlePreviewDocument('aadhaar', student.aadhaarDocument!, 'Aadhaar')} />
                                                )}
                                                {student.photoDocument && (
                                                    <DocIconButton icon={Camera} color="green" tooltip="Photo" onClick={() => handlePreviewDocument('photo', student.photoDocument!, 'Photo')} />
                                                )}
                                                {student.idProofDocument && (
                                                    <DocIconButton icon={IdCard} color="purple" tooltip="ID Proof" onClick={() => handlePreviewDocument('idProof', student.idProofDocument!, 'ID Proof')} />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <p className="text-xs text-slate-400 font-medium">
                            Showing <span className="font-bold text-slate-600">{filteredStudents.length}</span> of <span className="font-bold text-slate-600">{students.length}</span> students
                        </p>
                        {filteredStudents.length > 0 && (
                            <p className="text-xs text-slate-400 font-medium">
                                <span className="font-bold text-emerald-600">{stats.active}</span> active
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/*  Add / Edit Modal                                                 */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div className="bg-white w-full sm:rounded-2xl sm:max-w-2xl sm:max-h-[92vh] max-h-[96vh] flex flex-col rounded-t-2xl shadow-2xl">

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-2 rounded-xl shrink-0 ${modalMode === 'edit' ? 'bg-violet-50 ring-2 ring-violet-100' : 'bg-violet-600'}`}>
                                    {modalMode === 'edit'
                                        ? <Pencil size={16} className="text-violet-600" strokeWidth={2.5} />
                                        : <Plus size={16} className="text-white" strokeWidth={2.5} />
                                    }
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                                        {modalMode === 'edit' ? 'Edit Student' : 'Add New Student'}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5 hidden xs:block">
                                        {modalMode === 'edit' ? `Updating details for ${formData.name}` : 'Fill in the details to register a new resident'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600 shrink-0">
                                <X size={18} strokeWidth={2.5} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
                            <div className="p-4 sm:p-6 space-y-6">

                                {/* Basic Information */}
                                <Section title="Basic Information">
                                    <Field label="Student Name" required>
                                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputCls} placeholder="Enter student name" />
                                    </Field>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <Field label="Join Date" required>
                                            <input type="date" required value={formData.joinDate} max={new Date().toISOString().split('T')[0]} onChange={e => setFormData({ ...formData, joinDate: e.target.value })} className={inputCls} />
                                        </Field>
                                        <Field label="Email" required>
                                            <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputCls} placeholder="student@email.com" />
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <Field label="Phone Number" required>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.phoneNumber}
                                                onChange={e => {
                                                    let value = e.target.value;

                                                    // Allow only digits + limit to 10
                                                    value = value.replace(/\D/g, '').slice(0, 10);

                                                    setFormData({ ...formData, phoneNumber: value });
                                                }}
                                                className={inputCls}
                                                placeholder="9876543210"
                                                maxLength={10}
                                            />                                        </Field>
                                        <Field label="Guardian Name" required>
                                            <input type="text" required value={formData.guardianName} onChange={e => setFormData({ ...formData, guardianName: e.target.value })} className={inputCls} placeholder="Guardian name" />
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <Field label="Guardian Phone" required>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.guardianPhone}
                                                onChange={e => {
                                                    let value = e.target.value;

                                                    // Allow only digits + limit to 10
                                                    value = value.replace(/\D/g, '').slice(0, 10);

                                                    setFormData({ ...formData, guardianPhone: value });
                                                }}
                                                className={inputCls}
                                                placeholder="9876543210"
                                                maxLength={10}
                                            />
                                        </Field>
                                        <Field label="Address" required>
                                            <input type="text" required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className={inputCls} placeholder="Full address" />
                                        </Field>
                                    </div>
                                </Section>

                                {/* Room Details */}
                                <Section title="Room Details">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <Field label="Room No" required>
                                            <div className="relative">
                                                <select required value={formData.roomNo} onChange={e => handleRoomChange(e.target.value)}
                                                    className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition-all cursor-pointer pr-9 shadow-sm hover:border-slate-300">
                                                    <option value="">Select room</option>
                                                    {rooms.map(room => (
                                                        <option key={room.id} value={room.roomNo}>Room {room.roomNo} {room.isAvailable ? '' : '(Full)'}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </Field>
                                        <Field label="Bed No" required>
                                            <div className="relative">
                                                <select required value={formData.bedNo} onChange={e => setFormData({ ...formData, bedNo: e.target.value })} disabled={!formData.roomNo}
                                                    className={`w-full appearance-none px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition-all pr-9 shadow-sm ${formData.roomNo ? 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 cursor-pointer' : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'}`}>
                                                    <option value="">{formData.roomNo ? 'Select bed' : 'Select room first'}</option>
                                                    {bedOptions.map(bed => <option key={bed} value={bed}>{bed}</option>)}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <Field label="Sharing Type">
                                            <div className="relative">
                                                <input type="text" readOnly value={formData.roomNo ? formData.sharingType : '—'} className={readOnlyCls} />
                                                {formData.roomNo && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded-md border border-violet-100">Auto</span>}
                                            </div>
                                        </Field>
                                        <Field label="Room Type">
                                            <div className="relative">
                                                <input type="text" readOnly value={formData.roomNo ? formData.roomType : '—'} className={readOnlyCls} />
                                                {formData.roomNo && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded-md border border-violet-100">Auto</span>}
                                            </div>
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <Field label="Monthly Fee (₹)" required>
                                            <input type="text" required value={formData.monthlyFee} onChange={e => setFormData({ ...formData, monthlyFee: e.target.value.replace(/[₹,\s]/g, '') })} className={inputCls} placeholder="e.g., 5000" />
                                        </Field>
                                        <Field label="Advance Amount (₹)" required>
                                            <input type="text" required value={formData.advanceAmount} onChange={e => setFormData({ ...formData, advanceAmount: e.target.value })} className={inputCls} placeholder="e.g., 10000" />
                                        </Field>
                                    </div>
                                    {selectedRoom && (
                                        <div className="flex items-start gap-2.5 p-3.5 bg-violet-50 border border-violet-100 rounded-xl">
                                            <Building2 size={14} className="text-violet-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-violet-700 leading-relaxed">
                                                Room <span className="font-bold">{selectedRoom.roomNo}</span> · {formatSharingType(selectedRoom.sharingType)} · {formatRoomType(selectedRoom.roomType)} · {selectedRoom.bedNumbers} beds · ₹{selectedRoom.pricePerMonth.toLocaleString('en-IN')}/mo
                                            </p>
                                        </div>
                                    )}
                                    <Field label="Status" required>
                                        <SelectField value={formData.status} onChange={v => setFormData({ ...formData, status: v as any })}>
                                            <option>Active</option><option>Pending</option><option>Inactive</option>
                                        </SelectField>
                                    </Field>
                                </Section>

                                {/* Documents */}
                                <Section title="Documents">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                        {(['aadhaar', 'photo', 'idProof'] as const).map(docType => {
                                            const labels = { aadhaar: 'Aadhaar Card', photo: 'Student Photo', idProof: 'ID Proof' };
                                            const colors = { aadhaar: 'blue' as const, photo: 'green' as const, idProof: 'purple' as const };
                                            const previewNames = { aadhaar: 'Aadhaar Preview', photo: 'Photo Preview', idProof: 'ID Proof Preview' };
                                            const accepts = { aadhaar: 'image/jpeg,image/jpg,image/png,application/pdf', photo: 'image/jpeg,image/jpg,image/png', idProof: 'image/jpeg,image/jpg,image/png,application/pdf' };
                                            return (
                                                <DocUploadField
                                                    key={docType}
                                                    label={labels[docType]}
                                                    docType={docType}
                                                    file={documents[docType]}
                                                    preview={documentPreviews[docType]}
                                                    existingUrl={existingDocs[docType]}
                                                    accentColor={colors[docType]}
                                                    onFileChange={handleFileChange}
                                                    onRemoveNew={handleRemoveNewDocument}
                                                    onRemoveExisting={handleRemoveExistingDocument}
                                                    onPreview={(url) => handlePreviewDocument(docType, url, previewNames[docType])}
                                                    accept={accepts[docType]}
                                                    isImage={docType === 'photo'}
                                                />
                                            );
                                        })}
                                    </div>
                                </Section>

                                {error && (
                                    <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5">
                                        <XCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                                        <p className="text-sm text-rose-600 font-medium">{error}</p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 sm:px-6 py-4 flex gap-3">
                                <button type="button" onClick={closeModal} disabled={isLoading}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 shadow-sm">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isLoading}
                                    className="flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-bold active:scale-95 transition-all disabled:opacity-60 shadow-lg bg-violet-600 hover:bg-violet-700 shadow-violet-200">
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            {modalMode === 'edit' ? 'Saving…' : 'Adding…'}
                                        </span>
                                    ) : modalMode === 'edit' ? 'Save Changes' : 'Add Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Document Preview Modal ── */}
            {previewDocument && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4">
                    <div className="bg-white w-full sm:rounded-2xl sm:max-w-4xl sm:max-h-[92vh] max-h-[95vh] flex flex-col overflow-hidden rounded-t-2xl shadow-2xl">
                        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-violet-50 ring-2 ring-violet-100 rounded-xl shrink-0">
                                    <FileText size={16} className="text-violet-600" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{previewDocument.name}</h3>
                                    <p className="text-xs text-slate-400 font-medium">{previewDocument.isPdf ? 'PDF Document' : 'Image File'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => handleDownloadDocument(previewDocument.url, previewDocument.name)}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200">
                                    <Download size={14} strokeWidth={2.5} /><span className="hidden xs:inline">Download</span>
                                </button>
                                <button onClick={() => setPreviewDocument(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                                    <X size={18} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto bg-slate-50 p-4 sm:p-6 flex items-start justify-center">
                            {previewDocument.isPdf ? (
                                <iframe src={previewDocument.url} title={previewDocument.name} className="w-full rounded-xl border border-slate-200 shadow-sm bg-white" style={{ minHeight: '60vh' }} />
                            ) : (
                                <img src={previewDocument.url} alt={previewDocument.name} className="max-w-full h-auto rounded-xl shadow-lg border border-slate-200" style={{ maxHeight: '65vh', objectFit: 'contain' }} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{title}</h4>
                <div className="flex-1 h-px bg-slate-100" />
            </div>
            {children}
        </div>
    );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
                {label}{required && <span className="text-rose-400 normal-case tracking-normal ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}

function SelectFilter({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
    return (
        <div className="relative">
            <select value={value} onChange={e => onChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition-all cursor-pointer shadow-sm font-medium hover:border-slate-300">
                {children}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
    );
}

function SelectField({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
    return (
        <div className="relative">
            <select value={value} onChange={e => onChange(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition-all cursor-pointer pr-9 shadow-sm hover:border-slate-300 font-medium">
                {children}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
    );
}

// ── Icon-only Doc Button ──────────────────────────────────────────────────────

interface DocIconButtonProps {
    icon: React.ElementType;
    color: 'blue' | 'green' | 'purple';
    tooltip: string;
    onClick: () => void;
}

function DocIconButton({ icon: Icon, color, tooltip, onClick }: DocIconButtonProps) {
    const styles = {
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100 hover:border-blue-200',
        green: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100 hover:border-emerald-200',
        purple: 'bg-violet-50 text-violet-600 hover:bg-violet-100 border-violet-100 hover:border-violet-200',
    };
    return (
        <button
            onClick={onClick}
            title={tooltip}
            className={`relative group p-1.5 rounded-lg border transition-all active:scale-90 shadow-sm ${styles[color]}`}
        >
            <Icon size={14} strokeWidth={2} />
            {/* Tooltip */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 text-[10px] font-semibold text-white bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                {tooltip}
            </span>
        </button>
    );
}

function InfoBox({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
    return (
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-xs ${bold ? 'font-bold text-slate-800' : 'font-semibold'} ${accent ? 'text-sky-600' : 'text-slate-700'}`}>{value}</p>
        </div>
    );
}

// ── Document Upload Field ─────────────────────────────────────────────────────

interface DocUploadFieldProps {
    label: string;
    docType: 'aadhaar' | 'photo' | 'idProof';
    file: File | null;
    preview: string | null;
    existingUrl: string | null;
    accentColor: 'blue' | 'green' | 'purple';
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'aadhaar' | 'photo' | 'idProof') => void;
    onRemoveNew: (type: 'aadhaar' | 'photo' | 'idProof') => void;
    onRemoveExisting: (type: 'aadhaar' | 'photo' | 'idProof') => void;
    onPreview: (url: string) => void;
    accept: string;
    isImage?: boolean;
}

function DocUploadField({ label, docType, file, preview, existingUrl, accentColor, onFileChange, onRemoveNew, onRemoveExisting, onPreview, accept, isImage }: DocUploadFieldProps) {
    const accentRing = { blue: 'focus-within:ring-blue-300', green: 'focus-within:ring-emerald-300', purple: 'focus-within:ring-violet-300' }[accentColor];
    const accentText = { blue: 'text-blue-600', green: 'text-emerald-600', purple: 'text-violet-600' }[accentColor];
    const accentIconBg = { blue: 'bg-blue-50', green: 'bg-emerald-50', purple: 'bg-violet-50' }[accentColor];
    const accentBg = { blue: 'border-blue-100 bg-blue-50/40', green: 'border-emerald-100 bg-emerald-50/40', purple: 'border-violet-100 bg-violet-50/40' }[accentColor];

    const hasNew = !!preview;
    const hasExisting = !!existingUrl && !hasNew;
    const hasAny = hasNew || hasExisting;
    const activeUrl = preview ?? existingUrl ?? '';

    return (
        <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">{label} <span className="text-red-500">*</span></label>
            {!hasAny ? (
                <label className={`flex flex-col items-center justify-center w-full h-24 sm:h-28 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-violet-300 hover:bg-violet-50/30 transition-all group focus-within:ring-2 ${accentRing}`}>
                    <div className={`p-2 ${accentIconBg} rounded-xl mb-1.5 group-hover:scale-110 transition-transform`}>
                        <Upload size={15} className={accentText} strokeWidth={2.5} />
                    </div>
                    <p className="text-xs text-slate-500 font-semibold text-center px-2">
                        <span className={`${accentText}`}>Upload</span>
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-medium">{isImage ? 'PNG, JPG' : 'PNG, JPG, PDF'}</p>
                    <input type="file" className="hidden" accept={accept} onChange={e => onFileChange(e, docType)} />
                </label>
            ) : (
                <div className={`border rounded-xl p-3 space-y-2.5 ${accentBg}`}>
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            {isImage && !isPdfDataUrl(activeUrl) ? (
                                <img src={activeUrl} alt="" className="w-10 h-10 object-cover rounded-lg border-2 border-white shadow-sm shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                                <div className={`p-2 ${accentIconBg} rounded-lg shrink-0 border border-white shadow-sm`}>
                                    <FileText size={16} className={accentText} />
                                </div>
                            )}
                            <div className="min-w-0">
                                {hasNew ? (
                                    <>
                                        <p className="text-xs font-bold text-slate-800 truncate">{file?.name}</p>
                                        <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md mt-0.5 border border-emerald-100">✓ New</span>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xs font-bold text-slate-700">Saved</p>
                                        <span className="inline-flex text-[9px] text-slate-400 font-semibold bg-white px-1.5 py-0.5 rounded-md mt-0.5 border border-slate-200">Existing</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                            <button type="button" onClick={() => onPreview(activeUrl)} className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors bg-white border border-slate-200 shadow-sm" title="Preview">
                                <Eye size={13} strokeWidth={2} />
                            </button>
                            <button type="button" onClick={() => hasNew ? onRemoveNew(docType) : onRemoveExisting(docType)} className="p-1.5 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors bg-white border border-slate-200 shadow-sm" title="Remove">
                                <Trash2 size={13} strokeWidth={2} />
                            </button>
                        </div>
                    </div>
                    <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer hover:text-slate-700 transition-colors group w-fit">
                        <span className={`p-1 ${accentIconBg} rounded-md group-hover:scale-110 transition-transform`}>
                            <Upload size={10} className={accentText} strokeWidth={2.5} />
                        </span>
                        <span className="font-medium text-[11px]">Replace</span>
                        <input type="file" className="hidden" accept={accept} onChange={e => onFileChange(e, docType)} />
                    </label>
                </div>
            )}
        </div>
    );
}