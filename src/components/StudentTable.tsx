import React, { useEffect, useState, useCallback } from 'react';
import {
    Search, Plus, X, Upload, Eye, Download, FileText,
    Trash2, ChevronDown, Users, CheckCircle,
    Clock, XCircle, Building2, Bed, IndianRupee, Pencil
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

// Room interface matching API response
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

// ─── helpers ────────────────────────────────────────────────────────────────

const isPdfDataUrl = (url: string) =>
    url.startsWith('data:application/pdf') || url.includes('application/pdf');

const isPdfUrl = (url: string) =>
    url.toLowerCase().split('?')[0].endsWith('.pdf') || isPdfDataUrl(url);

const safeFilename = (label: string, url: string) => {
    const ext = isPdfUrl(url) ? 'pdf' : url.startsWith('data:image/png') ? 'png' : 'jpg';
    return `${label.replace(/\s+/g, '_')}.${ext}`;
};

// Convert API sharingType to display format
const formatSharingType = (apiType: string): 'Single' | 'Double' | 'Triple' | 'Four Sharing' => {
    const map: Record<string, 'Single' | 'Double' | 'Triple' | 'Four Sharing'> = {
        SINGLE: 'Single',
        DOUBLE: 'Double',
        TRIPLE: 'Triple',
        FOUR_SHARING: 'Four Sharing',
    };
    return map[apiType] ?? 'Double';
};

// Convert API roomType to display format
const formatRoomType = (apiType: string): 'AC' | 'Non-AC' => {
    return apiType === 'AC' ? 'AC' : 'Non-AC';
};

// Generate bed options based on bedNumbers
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
    Active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
    Pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
    Inactive: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-200' },
};

// ─── Main Component ──────────────────────────────────────────────────────────

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

    // Derived: selected room object based on formData.roomNo
    const selectedRoom = rooms.find(r => r.roomNo === formData.roomNo) ?? null;
    const bedOptions = selectedRoom ? generateBedOptions(selectedRoom.bedNumbers) : [];

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const fetchStudents = async () => {
        try {
            const response = await getStudentsAPI();
            setStudents(response.data);
        } catch (err) {
            console.error('Error fetching students:', err);
        }
    };

    const fetchRooms = async () => {
        try {
            const response = await getRoomsAPI();
            setRooms(response.data);
        } catch (err) {
            console.error('Error fetching rooms:', err);
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchRooms();
    }, []);

    // ── Handle Room Selection ────────────────────────────────────────────────
    const handleRoomChange = (roomNo: string) => {
        const room = rooms.find(r => r.roomNo === roomNo);
        if (room) {
            setFormData(prev => ({
                ...prev,
                roomNo: room.roomNo,
                bedNo: '', // Reset bed selection when room changes
                sharingType: formatSharingType(room.sharingType),
                roomType: formatRoomType(room.roomType),
                monthlyFee: String(room.pricePerMonth),
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                roomNo: '',
                bedNo: '',
                sharingType: 'Double',
                roomType: 'Non-AC',
                monthlyFee: '',
            }));
        }
    };

    // ── Open Add modal ───────────────────────────────────────────────────────
    const openAddModal = () => {
        setModalMode('add');
        setEditingId(null);
        setFormData({ ...EMPTY_FORM });
        setDocuments({ aadhaar: null, photo: null, idProof: null });
        setDocumentPreviews({ aadhaar: null, photo: null, idProof: null });
        setExistingDocs({ aadhaar: null, photo: null, idProof: null });
        setError(null);
        setIsModalOpen(true);
    };

    // ── Open Edit modal ──────────────────────────────────────────────────────
    const openEditModal = (student: Student) => {
        setModalMode('edit');
        setEditingId(student.id);
        setFormData({
            name: student.name ?? '',
            joinDate: student.joinDate ? student.joinDate.split('T')[0] : '',
            bedNo: student.bedNo ?? '',
            roomNo: student.roomNo ?? '',
            sharingType: student.sharingType ?? 'Double',
            roomType: student.roomType ?? 'Non-AC',
            monthlyFee: String(student.monthlyFee ?? ''),
            advanceAmount: String(student.advanceAmount ?? ''),
            status: student.status ?? 'Active',
            guardianName: student.guardianName ?? '',
            guardianPhone: student.guardianPhone ?? '',
            address: student.address ?? '',
            phoneNumber: student.phoneNumber ?? '',
            email: student.email ?? '',
        });
        setExistingDocs({
            aadhaar: student.aadhaarDocument ?? null,
            photo: student.photoDocument ?? null,
            idProof: student.idProofDocument ?? null,
        });
        setDocuments({ aadhaar: null, photo: null, idProof: null });
        setDocumentPreviews({ aadhaar: null, photo: null, idProof: null });
        setError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setError(null); };

    // ── File handling ────────────────────────────────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'aadhaar' | 'photo' | 'idProof') => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setError('File size should not exceed 5 MB'); return; }
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) { setError('Only JPG, PNG, and PDF files are allowed'); return; }
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

    const handleRemoveExistingDocument = (type: 'aadhaar' | 'photo' | 'idProof') => {
        setExistingDocs(prev => ({ ...prev, [type]: null }));
    };

    const handlePreviewDocument = (type: 'aadhaar' | 'photo' | 'idProof', url: string, name: string) => {
        setPreviewDocument({ type, url, name, isPdf: isPdfUrl(url) });
    };

    const handleDownloadDocument = useCallback((url: string, label: string) => {
        const filename = safeFilename(label, url);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError(null);
            const submitData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                // Strip currency symbol and commas before sending numeric fields
                if (key === 'monthlyFee' || key === 'advanceAmount') {
                    submitData.append(key, String(value).replace(/[₹,\s]/g, ''));
                } else {
                    submitData.append(key, value);
                }
            });
            if (documents.aadhaar) submitData.append('aadhaar', documents.aadhaar);
            if (documents.photo) submitData.append('photo', documents.photo);
            if (documents.idProof) submitData.append('idProof', documents.idProof);
            if (modalMode === 'edit') {
                if (!existingDocs.aadhaar && !documents.aadhaar) submitData.append('removeAadhaar', 'true');
                if (!existingDocs.photo && !documents.photo) submitData.append('removePhoto', 'true');
                if (!existingDocs.idProof && !documents.idProof) submitData.append('removeIdProof', 'true');
                await updateStudentsAPI(editingId!, submitData);
            } else {
                await createStudentsAPI(submitData);
            }
            closeModal();
            fetchStudents();
        } catch (err: any) {
            console.error("Error submitting student data:", err);
            setError(err || `Failed to ${modalMode === 'edit' ? 'update' : 'create'} student.`);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Filter ───────────────────────────────────────────────────────────────
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

    const inputCls = "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 focus:bg-white transition-all";
    const readOnlyCls = "w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed select-none";

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/40">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Records</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Manage hostel residents and their documents</p>
                    </div>
                    <button onClick={openAddModal} className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-violet-200 hover:bg-violet-700 active:scale-95 transition-all">
                        <Plus size={16} />Add Student
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Students', value: stats.total, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
                        { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                            <div className={`${bg} rounded-xl p-2.5`}><Icon size={18} className={color} /></div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <input type="text" placeholder="Search by name, room, bed…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all" />
                        </div>
                        <div className="flex gap-2 ml-auto">
                            <SelectFilter value={String(selectedYear)} onChange={v => setSelectedYear(Number(v))}>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </SelectFilter>
                            <SelectFilter value={selectedMonth} onChange={setSelectedMonth}>
                                <option value="">All Months</option>
                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                            </SelectFilter>
                        </div>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/80">
                                    {['Student', 'Join Date', 'Room / Bed', 'Sharing', 'Room Type', 'Monthly Fee', 'Status', 'Documents', 'Actions'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                                <Users size={32} className="opacity-40" />
                                                <p className="text-sm font-medium">No students found</p>
                                                <p className="text-xs">Try adjusting your search or filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredStudents.map(student => {
                                    const sc = STATUS_CONFIG[student.status] ?? STATUS_CONFIG.Inactive;
                                    return (
                                        <tr key={student.id} className="hover:bg-violet-50/20 transition-colors">
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                        {student.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-sm">{student.name}</p>
                                                        <p className="text-xs text-slate-400">{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-600">
                                                {new Date(student.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5"><Building2 size={13} className="text-slate-400" /><span className="text-sm font-medium text-slate-700">{student.roomNo}</span></div>
                                                <div className="flex items-center gap-1.5 mt-0.5"><Bed size={13} className="text-slate-400" /><span className="text-xs text-slate-500">{student.bedNo}</span></div>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">{student.sharingType}</span>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${student.roomType === 'AC' ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>{student.roomType}</span>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-1"><IndianRupee size={13} className="text-slate-500" /><span className="font-bold text-slate-800 text-sm">{student.monthlyFee}</span></div>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border ${sc.bg} ${sc.text} ${sc.border}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{student.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                {(student.aadhaarDocument || student.photoDocument || student.idProofDocument) ? (
                                                    <div className="flex items-center gap-1.5">
                                                        {student.aadhaarDocument && <DocButton label="Aadhaar" color="blue" onClick={() => handlePreviewDocument('aadhaar', student.aadhaarDocument!, 'Aadhaar')} />}
                                                        {student.photoDocument && <DocButton label="Photo" color="green" onClick={() => handlePreviewDocument('photo', student.photoDocument!, 'Photo')} />}
                                                        {student.idProofDocument && <DocButton label="ID" color="purple" onClick={() => handlePreviewDocument('idProof', student.idProofDocument!, 'ID Proof')} />}
                                                    </div>
                                                ) : <span className="text-xs text-slate-400 italic">No documents</span>}
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <button
                                                    onClick={() => openEditModal(student)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                                                >
                                                    <Pencil size={12} />Edit
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
                            <div className="py-16 text-center"><div className="flex flex-col items-center gap-2 text-slate-400"><Users size={32} className="opacity-40" /><p className="text-sm font-medium">No students found</p></div></div>
                        ) : filteredStudents.map(student => {
                            const sc = STATUS_CONFIG[student.status] ?? STATUS_CONFIG.Inactive;
                            return (
                                <div key={student.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                                                {student.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 text-sm">{student.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{student.roomNo} · {student.bedNo}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border ${sc.bg} ${sc.text} ${sc.border}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{student.status}
                                            </span>
                                            <button onClick={() => openEditModal(student)} className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors" title="Edit student">
                                                <Pencil size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2.5 text-xs mb-3">
                                        <InfoBox label="Join Date" value={new Date(student.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
                                        <InfoBox label="Monthly Fee" value={`₹${student.monthlyFee}`} bold />
                                        <InfoBox label="Sharing" value={student.sharingType} />
                                        <InfoBox label="Room Type" value={student.roomType} accent={student.roomType === 'AC'} />
                                    </div>
                                    {(student.aadhaarDocument || student.photoDocument || student.idProofDocument) && (
                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                            <span className="text-xs text-slate-500 font-medium">Docs:</span>
                                            {student.aadhaarDocument && <DocButton label="Aadhaar" color="blue" small onClick={() => handlePreviewDocument('aadhaar', student.aadhaarDocument!, 'Aadhaar')} />}
                                            {student.photoDocument && <DocButton label="Photo" color="green" small onClick={() => handlePreviewDocument('photo', student.photoDocument!, 'Photo')} />}
                                            {student.idProofDocument && <DocButton label="ID" color="purple" small onClick={() => handlePreviewDocument('idProof', student.idProofDocument!, 'ID Proof')} />}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Table Footer */}
                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                        <p className="text-xs text-slate-500">Showing <span className="font-semibold text-slate-700">{filteredStudents.length}</span> of <span className="font-semibold text-slate-700">{students.length}</span> students</p>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/*  Add / Edit Modal                                                 */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${modalMode === 'edit' ? 'bg-amber-50' : 'bg-violet-50'}`}>
                                    {modalMode === 'edit' ? <Pencil size={18} className="text-amber-600" /> : <Plus size={18} className="text-violet-600" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{modalMode === 'edit' ? 'Edit Student' : 'Add New Student'}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {modalMode === 'edit' ? `Updating details for ${formData.name}` : 'Fill in the details to register a new resident'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"><X size={18} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
                            <div className="p-6 space-y-6">

                                {/* Basic Information */}
                                <Section title="Basic Information">
                                    <Field label="Student Name" required>
                                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputCls} placeholder="Enter student name" />
                                    </Field>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Join Date" required>
                                            <input type="date" required value={formData.joinDate} max={new Date().toISOString().split("T")[0]} onChange={e => setFormData({ ...formData, joinDate: e.target.value })} className={inputCls} />
                                        </Field>
                                        <Field label="Email" required>
                                            <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputCls} placeholder="student@email.com" />
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Phone Number" required>
                                            <input type="tel" required value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} className={inputCls} placeholder="+91 00000 00000" />
                                        </Field>
                                        <Field label="Guardian Name" required>
                                            <input type="text" required value={formData.guardianName} onChange={e => setFormData({ ...formData, guardianName: e.target.value })} className={inputCls} placeholder="Guardian name" />
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Guardian Phone" required>
                                            <input type="tel" required value={formData.guardianPhone} onChange={e => setFormData({ ...formData, guardianPhone: e.target.value })} className={inputCls} placeholder="+91 00000 00000" />
                                        </Field>
                                        <Field label="Address" required>
                                            <input type="text" required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className={inputCls} placeholder="Full address" />
                                        </Field>
                                    </div>
                                </Section>

                                {/* Room Details */}
                                <Section title="Room Details">
                                    {/* Row 1: Room No + Bed No */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* ── Room No Dropdown ── */}
                                        <Field label="Room No" required>
                                            <div className="relative">
                                                <select
                                                    required
                                                    value={formData.roomNo}
                                                    onChange={e => handleRoomChange(e.target.value)}
                                                    className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 focus:bg-white transition-all cursor-pointer pr-9"
                                                >
                                                    <option value="">Select room</option>
                                                    {rooms.map(room => (
                                                        <option key={room.id} value={room.roomNo}>
                                                            Room {room.roomNo} {room.isAvailable ? '' : '(Full)'}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </Field>

                                        {/* ── Bed No Dropdown ── */}
                                        <Field label="Bed No" required>
                                            <div className="relative">
                                                <select
                                                    required
                                                    value={formData.bedNo}
                                                    onChange={e => setFormData({ ...formData, bedNo: e.target.value })}
                                                    disabled={!formData.roomNo}
                                                    className={`w-full appearance-none px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all pr-9 ${
                                                        formData.roomNo
                                                            ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white cursor-pointer'
                                                            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <option value="">{formData.roomNo ? 'Select bed' : 'Select room first'}</option>
                                                    {bedOptions.map(bed => (
                                                        <option key={bed} value={bed}>{bed}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </Field>
                                    </div>

                                    {/* Row 2: Sharing Type + Room Type (auto-filled, read-only) */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Sharing Type">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={formData.roomNo ? formData.sharingType : '—'}
                                                    className={readOnlyCls}
                                                />
                                                {formData.roomNo && (
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded">Auto</span>
                                                )}
                                            </div>
                                        </Field>
                                        <Field label="Room Type">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={formData.roomNo ? formData.roomType : '—'}
                                                    className={readOnlyCls}
                                                />
                                                {formData.roomNo && (
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded">Auto</span>
                                                )}
                                            </div>
                                        </Field>
                                    </div>

                                    {/* Row 3: Monthly Fee (auto-filled) + Advance Amount */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Monthly Fee (₹)" required>
                                            <input
                                                type="text"
                                                required
                                                value={formData.monthlyFee}
                                                onChange={e => setFormData({ ...formData, monthlyFee: e.target.value.replace(/[₹,\s]/g, '') })}
                                                className={inputCls}
                                                placeholder="e.g., 5000"
                                            />
                                        </Field>
                                        <Field label="Advance Amount (₹)" required>
                                            <input type="text" required value={formData.advanceAmount} onChange={e => setFormData({ ...formData, advanceAmount: e.target.value })} className={inputCls} placeholder="e.g., 10000" />
                                        </Field>
                                    </div>

                                    {/* Room info hint */}
                                    {selectedRoom && (
                                        <div className="flex items-center gap-2 p-3 bg-violet-50 border border-violet-100 rounded-xl">
                                            <Building2 size={14} className="text-violet-500 shrink-0" />
                                            <p className="text-xs text-violet-700">
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
                                    {(['aadhaar', 'photo', 'idProof'] as const).map(docType => {
                                        const labels = { aadhaar: 'Aadhaar Card', photo: 'Student Photo', idProof: 'Other ID Proof' };
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
                                </Section>

                                {error && (
                                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5">
                                        <XCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-rose-700 font-medium">{error}</p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-3">
                                <button type="button" onClick={closeModal} disabled={isLoading}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isLoading}
                                    className={`flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-60 shadow-md ${modalMode === 'edit' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-violet-600 hover:bg-violet-700 shadow-violet-200'}`}>
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

            {/* Document Preview Modal */}
            {previewDocument && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-violet-50 rounded-xl"><FileText size={18} className="text-violet-600" /></div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">{previewDocument.name}</h3>
                                    <p className="text-xs text-slate-500">{previewDocument.isPdf ? 'PDF Document' : 'Image'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleDownloadDocument(previewDocument.url, previewDocument.name)}
                                    className="flex items-center gap-2 px-3.5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-sm">
                                    <Download size={15} />Download
                                </button>
                                <button onClick={() => setPreviewDocument(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"><X size={18} /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto bg-slate-50 p-6 flex items-start justify-center">
                            {previewDocument.isPdf ? (
                                <iframe src={previewDocument.url} title={previewDocument.name} className="w-full rounded-xl border border-slate-200 shadow-sm bg-white" style={{ minHeight: '70vh' }} />
                            ) : (
                                <img src={previewDocument.url} alt={previewDocument.name} className="max-w-full h-auto rounded-xl shadow-lg border border-slate-200" style={{ maxHeight: '70vh', objectFit: 'contain' }} />
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
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{title}</h4>
                <div className="flex-1 h-px bg-slate-100" />
            </div>
            {children}
        </div>
    );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                {label}{required && <span className="text-rose-500 normal-case tracking-normal ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}

function SelectFilter({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
    return (
        <div className="relative">
            <select value={value} onChange={e => onChange(e.target.value)} className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all cursor-pointer">
                {children}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
    );
}

function SelectField({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
    return (
        <div className="relative">
            <select value={value} onChange={e => onChange(e.target.value)} className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 focus:bg-white transition-all cursor-pointer pr-9">
                {children}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
    );
}

function DocButton({ label, color, onClick, small }: { label: string; color: 'blue' | 'green' | 'purple'; onClick: () => void; small?: boolean }) {
    const colors = { blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200', green: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200', purple: 'bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200' };
    return (
        <button onClick={onClick} className={`inline-flex items-center gap-1 font-semibold rounded-lg border transition-colors ${colors[color]} ${small ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1.5 text-xs'}`}>
            <Eye size={small ? 10 : 12} />{label}
        </button>
    );
}

function InfoBox({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
    return (
        <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-slate-500 text-xs mb-0.5">{label}</p>
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
    const accentBg = { blue: 'border-blue-100 bg-blue-50/30', green: 'border-emerald-100 bg-emerald-50/30', purple: 'border-violet-100 bg-violet-50/30' }[accentColor];

    const hasNew = !!preview;
    const hasExisting = !!existingUrl && !hasNew;
    const hasAny = hasNew || hasExisting;
    const activeUrl = preview ?? existingUrl ?? '';

    return (
        <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">{label}</label>

            {!hasAny ? (
                <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-all group focus-within:ring-2 ${accentRing}`}>
                    <div className={`p-2.5 ${accentIconBg} rounded-xl mb-2 group-hover:scale-110 transition-transform`}>
                        <Upload size={18} className={accentText} />
                    </div>
                    <p className="text-sm text-slate-600 font-medium"><span className={`${accentText} font-semibold`}>Click to upload</span> {label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{isImage ? 'PNG, JPG' : 'PNG, JPG or PDF'} · Max 5 MB</p>
                    <input type="file" className="hidden" accept={accept} onChange={e => onFileChange(e, docType)} />
                </label>
            ) : (
                <div className={`border rounded-xl p-3.5 space-y-2.5 ${accentBg}`}>
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            {isImage && !isPdfDataUrl(activeUrl) ? (
                                <img src={activeUrl} alt="" className="w-12 h-12 object-cover rounded-lg border border-white shadow-sm shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                                <div className={`p-2.5 ${accentIconBg} rounded-lg shrink-0 border border-white`}>
                                    <FileText size={20} className={accentText} />
                                </div>
                            )}
                            <div className="min-w-0">
                                {hasNew ? (
                                    <>
                                        <p className="text-sm font-semibold text-slate-800 truncate">{file?.name}</p>
                                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-md mt-0.5">
                                            ✓ New file selected
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-semibold text-slate-800">Existing document</p>
                                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium bg-white px-1.5 py-0.5 rounded-md mt-0.5 border border-slate-200">
                                            Saved on server
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                            <button type="button" onClick={() => onPreview(activeUrl)} className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors bg-white border border-slate-200" title="Preview">
                                <Eye size={15} />
                            </button>
                            <button type="button" onClick={() => hasNew ? onRemoveNew(docType) : onRemoveExisting(docType)} className="p-2 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors bg-white border border-slate-200" title="Remove">
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer hover:text-slate-700 transition-colors group w-fit">
                        <span className={`p-1 ${accentIconBg} rounded-md group-hover:scale-110 transition-transform`}>
                            <Upload size={11} className={accentText} />
                        </span>
                        Replace with a different file
                        <input type="file" className="hidden" accept={accept} onChange={e => onFileChange(e, docType)} />
                    </label>
                </div>
            )}
        </div>
    );
}