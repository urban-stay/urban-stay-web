import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { Bed, Plus, Edit, Trash2, Search, SlidersHorizontal, Snowflake, Wind, X, CheckCircle, AlertCircle, Users, ChevronDown } from 'lucide-react';

const API_BASE_URL = 'http://localhost:2001/urbanStay/rooms';

type SharingType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR' | 'FIVE';
type RoomType = 'AC' | 'NON_AC';

interface Room {
    id: number;
    roomNo: string;
    bedNumbers: number;
    sharingType: SharingType;
    roomType: RoomType;
    isAvailable: boolean;
    pricePerMonth?: number;
}

interface RoomFormData {
    roomNo: string;
    bedNumbers: number;
    sharingType: SharingType;
    roomType: RoomType;
    isAvailable: boolean;
    pricePerMonth: string;
    id?: number;
}

interface RoomFilters {
    sharingType: string;
    roomType: string;
    isAvailable: string;
}

interface ErrorResponse {
    message?: string;
}

const SHARING_BED_MAP: Record<SharingType, number> = {
    SINGLE: 1,
    DOUBLE: 2,
    TRIPLE: 3,
    FOUR: 4,
    FIVE: 5,
};

const RoomPage: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [currentRoom, setCurrentRoom] = useState<RoomFormData>({
        roomNo: '',
        bedNumbers: 1,
        sharingType: 'SINGLE',
        roomType: 'AC',
        isAvailable: true,
        pricePerMonth: ''
    });
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filters, setFilters] = useState<RoomFilters>({ sharingType: '', roomType: '', isAvailable: '' });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    useEffect(() => { fetchRooms(); }, []);

    // Bed numbers are set directly in handleSharingChange and openModal — no useEffect needed

    useEffect(() => {
        let result = rooms;
        if (searchTerm) result = result.filter(r => r.roomNo.toLowerCase().includes(searchTerm.toLowerCase()));
        if (filters.sharingType) result = result.filter(r => r.sharingType === filters.sharingType);
        if (filters.roomType) result = result.filter(r => r.roomType === filters.roomType);
        if (filters.isAvailable !== '') result = result.filter(r => r.isAvailable === (filters.isAvailable === 'true'));
        setFilteredRooms(result);
    }, [searchTerm, filters, rooms]);

    const fetchRooms = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await axios.get<Room[]>(API_BASE_URL);
            setRooms(response.data);
            setFilteredRooms(response.data);
            setError('');
        } catch {
            setError('Failed to fetch rooms. Please check if the server is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setCurrentRoom(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'bedNumbers' ? Number(value) : value)
        }));
    };

    const handleSharingChange = (type: SharingType) => {
        setCurrentRoom(prev => ({ ...prev, sharingType: type, bedNumbers: SHARING_BED_MAP[type] }));
    };

    const handleRoomTypeChange = (type: RoomType) => {
        setCurrentRoom(prev => ({ ...prev, roomType: type }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const roomData = { ...currentRoom, pricePerMonth: currentRoom.pricePerMonth ? parseFloat(currentRoom.pricePerMonth) : undefined };
            if (editMode && currentRoom.id) {
                await axios.put(`${API_BASE_URL}/${currentRoom.id}`, roomData);
                setSuccess('Room updated successfully!');
            } else {
                await axios.post(API_BASE_URL, roomData);
                setSuccess('Room created successfully!');
            }
            fetchRooms();
            closeModal();
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            setError(axiosError.response?.data?.message || 'Operation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (room: Room): void => {
        setCurrentRoom({
            id: room.id,
            roomNo: room.roomNo,
            bedNumbers: SHARING_BED_MAP[room.sharingType] ?? room.bedNumbers,
            sharingType: room.sharingType,
            roomType: room.roomType,
            isAvailable: room.isAvailable,
            pricePerMonth: room.pricePerMonth?.toString() || ''
        });
        setEditMode(true);
        setError('');
        setShowEditModal(true);
    };

    const handleDelete = async (id: number): Promise<void> => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            setLoading(true);
            try {
                await axios.delete(`${API_BASE_URL}/${id}`);
                setSuccess('Room deleted successfully!');
                fetchRooms();
                setTimeout(() => setSuccess(''), 4000);
            } catch {
                setError('Failed to delete room.');
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleAvailability = async (room: Room): Promise<void> => {
        setLoading(true);
        try {
            await axios.patch(`${API_BASE_URL}/${room.id}/availability?isAvailable=${!room.isAvailable}`);
            setSuccess('Availability updated!');
            fetchRooms();
            setTimeout(() => setSuccess(''), 4000);
        } catch {
            setError('Failed to update availability.');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (): void => {
        setCurrentRoom({ roomNo: '', bedNumbers: 1, sharingType: 'SINGLE', roomType: 'AC', isAvailable: true, pricePerMonth: '' });
        setEditMode(false);
        setShowModal(true);
        setError('');
    };

    const closeModal = (): void => { setShowModal(false); setShowEditModal(false); setError(''); };
    const resetFilters = (): void => { setFilters({ sharingType: '', roomType: '', isAvailable: '' }); setSearchTerm(''); };

    const activeFilterCount = [filters.sharingType, filters.roomType, filters.isAvailable].filter(Boolean).length;

    const sharingOptions: { value: SharingType; label: string; beds: number; icon: string }[] = [
        { value: 'SINGLE', label: 'Single', beds: 1, icon: '🛏' },
        { value: 'DOUBLE', label: 'Double', beds: 2, icon: '🛏🛏' },
        { value: 'TRIPLE', label: 'Triple', beds: 3, icon: '🛏🛏🛏' },
        { value: 'FOUR', label: 'Four', beds: 4, icon: '🛏' },
        { value: 'FIVE', label: 'Five', beds: 5, icon: '🛏' },
    ];

    return (
        <div className="min-h-screen" style={{ background: '#f5f6fa', fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

                * { box-sizing: border-box; }

                .page-bg {
                    background: #f5f6fa;
                    background-image:
                        radial-gradient(ellipse 80% 50% at 20% -10%, rgba(99,102,241,0.07) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 40% at 80% 110%, rgba(16,185,129,0.05) 0%, transparent 60%);
                }

                .room-card {
                    background: #ffffff;
                    border: 1px solid #e8eaf0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .room-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    background: linear-gradient(135deg, rgba(99,102,241,0.03) 0%, transparent 60%);
                    pointer-events: none;
                }

                .room-card:hover {
                    border-color: rgba(99,102,241,0.25);
                    transform: translateY(-3px);
                    box-shadow: 0 12px 40px rgba(99,102,241,0.1), 0 2px 8px rgba(0,0,0,0.06);
                }

                .room-card:hover::before { opacity: 1; }

                .room-card.occupied {
                    border-color: rgba(239,68,68,0.15);
                }

                .room-card.occupied:hover {
                    border-color: rgba(239,68,68,0.3);
                    box-shadow: 0 12px 40px rgba(239,68,68,0.08), 0 2px 8px rgba(0,0,0,0.06);
                }

                .btn-primary {
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: 'DM Sans', sans-serif;
                    font-weight: 600;
                }

                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 25px rgba(99,102,241,0.3);
                    background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
                }

                .btn-primary:active { transform: translateY(0); }

                .btn-ghost {
                    background: #ffffff;
                    color: #6b7280;
                    border: 1px solid #e5e7eb;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: 'DM Sans', sans-serif;
                    position: relative;
                    z-index: 1;
                }

                .btn-ghost:hover {
                    background: #f9fafb;
                    color: #374151;
                    border-color: #d1d5db;
                }

                .btn-danger {
                    background: #fef2f2;
                    color: #dc2626;
                    border: 1px solid #fecaca;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: 'DM Sans', sans-serif;
                    position: relative;
                    z-index: 1;
                }

                .btn-danger:hover {
                    background: #fee2e2;
                    border-color: #fca5a5;
                }

                .btn-success {
                    background: #f0fdf4;
                    color: #16a34a;
                    border: 1px solid #bbf7d0;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: 'DM Sans', sans-serif;
                }

                .btn-success:hover {
                    background: #dcfce7;
                    border-color: #86efac;
                }

                .search-input {
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    color: #111827;
                    font-family: 'DM Sans', sans-serif;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                }

                .search-input:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
                }

                .search-input::placeholder { color: #9ca3af; }

                .form-input {
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    color: #111827;
                    font-family: 'DM Sans', sans-serif;
                    transition: all 0.2s ease;
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 10px;
                    font-size: 14px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
                }

                .form-input:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
                }

                .form-input::placeholder { color: #9ca3af; }

                .form-select {
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    color: #111827;
                    appearance: none;
                    -webkit-appearance: none;
                }

                .form-select option { background: #ffffff; color: #111827; }

                .sharing-btn {
                    border: 1.5px solid #e5e7eb;
                    background: #f9fafb;
                    color: #9ca3af;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: 'DM Sans', sans-serif;
                    font-weight: 600;
                    padding: 14px 12px;
                    border-radius: 12px;
                    flex: 1;
                    text-align: center;
                }

                .sharing-btn:hover {
                    border-color: #a5b4fc;
                    color: #6366f1;
                    background: #f5f3ff;
                }

                .sharing-btn.active {
                    border-color: #6366f1;
                    background: #eef2ff;
                    color: #4338ca;
                    box-shadow: 0 0 0 1px rgba(99,102,241,0.2);
                }

                .room-type-btn {
                    border: 1.5px solid #e5e7eb;
                    background: #f9fafb;
                    color: #9ca3af;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: 'DM Sans', sans-serif;
                    font-weight: 600;
                    padding: 14px 20px;
                    border-radius: 12px;
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .room-type-btn:hover {
                    background: #f0f9ff;
                    border-color: #bae6fd;
                    color: #0369a1;
                }

                .room-type-btn.active-ac {
                    border-color: #0891b2;
                    background: #ecfeff;
                    color: #0e7490;
                }

                .room-type-btn.active-nonac {
                    border-color: #d97706;
                    background: #fffbeb;
                    color: #b45309;
                }

                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15,17,23,0.45);
                    backdrop-filter: blur(6px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 50;
                    padding: 16px;
                    animation: fadeIn 0.2s ease;
                }

                .modal-box {
                    background: #ffffff;
                    border: 1px solid #e8eaf0;
                    border-radius: 20px;
                    box-shadow: 0 24px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06);
                    animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-box::-webkit-scrollbar { width: 4px; }
                .modal-box::-webkit-scrollbar-track { background: #f3f4f6; }
                .modal-box::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 10px;
                    border-radius: 999px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                }

                .badge-single { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; }
                .badge-double { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
                .badge-triple { background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; }
                .badge-four { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
                .badge-five { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }
                .badge-ac { background: #ecfeff; color: #0e7490; border: 1px solid #a5f3fc; }
                .badge-nonac { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
                .badge-available { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
                .badge-occupied { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

                .stat-pill {
                    background: #ffffff;
                    border: 1px solid #e8eaf0;
                    border-radius: 12px;
                    padding: 14px 18px;
                    flex: 1;
                    text-align: center;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
                }

                .form-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    color: #6b7280;
                    margin-bottom: 8px;
                }

                .toggle-switch {
                    position: relative;
                    width: 44px;
                    height: 24px;
                }

                .toggle-switch input { opacity: 0; width: 0; height: 0; }

                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: #e5e7eb;
                    border-radius: 24px;
                    transition: 0.2s;
                    border: 1px solid #d1d5db;
                }

                .toggle-slider:before {
                    position: absolute;
                    content: '';
                    height: 16px;
                    width: 16px;
                    left: 3px;
                    bottom: 3px;
                    background: white;
                    border-radius: 50%;
                    transition: 0.2s;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                }

                input:checked + .toggle-slider { background: #6366f1; border-color: #6366f1; }
                input:checked + .toggle-slider:before { transform: translateX(20px); }

                .availability-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    display: inline-block;
                }

                .dot-available { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.5); animation: pulse-green 2s infinite; }
                .dot-occupied { background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,0.4); }

                .beds-display {
                    background: #eef2ff;
                    border: 1px solid #c7d2fe;
                    border-radius: 10px;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .filter-badge {
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    background: #6366f1;
                    color: white;
                    border-radius: 50%;
                    width: 18px;
                    height: 18px;
                    font-size: 11px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .alert-bar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 18px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 500;
                    animation: slideDown 0.3s ease;
                }

                .alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
                .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes slideDown { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes pulse-green {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }

                .price-tag {  font-weight: 700; }
                .room-number {  font-weight: 800; }
                .page-title {  font-weight: 800; }
                .section-title {  font-weight: 700; }

                .divider {
                    height: 1px;
                    background: #f3f4f6;
                    margin: 0;
                }
            `}</style>

            <div className="page-bg" style={{ minHeight: '100vh' }}>
                {/* Header */}
                <header style={{ borderBottom: '1px solid #e8eaf0', background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
                                <Bed size={22} color="white" />
                            </div>
                            <div>
                                <h1 className="page-title" style={{ color: '#111827', fontSize: 22, margin: 0, lineHeight: 1.2 }}>UrbanStay</h1>
                                <p style={{ color: '#6b7280', fontSize: 12, margin: 0, fontWeight: 500 }}>Room Management Dashboard</p>
                            </div>
                        </div>
                        <button onClick={openModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, fontSize: 14 }}>
                            <Plus size={18} />
                            Add Room
                        </button>
                    </div>
                </header>

                <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
                    {/* Stats Row */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                        {[
                            { label: 'Total Rooms', value: rooms.length, color: '#6366f1' },
                            { label: 'Available', value: rooms.filter(r => r.isAvailable).length, color: '#16a34a' },
                            { label: 'Occupied', value: rooms.filter(r => !r.isAvailable).length, color: '#dc2626' },
                            { label: 'AC Rooms', value: rooms.filter(r => r.roomType === 'AC').length, color: '#0e7490' },
                        ].map(stat => (
                            <div key={stat.label} className="stat-pill" style={{ minWidth: 120 }}>
                                <div className="price-tag" style={{ fontSize: 26, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, fontWeight: 500 }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="alert-bar alert-error" style={{ marginBottom: 16 }}>
                            <AlertCircle size={16} />
                            <span style={{ flex: 1 }}>{error}</span>
                            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, display: 'flex' }}><X size={16} /></button>
                        </div>
                    )}
                    {success && (
                        <div className="alert-bar alert-success" style={{ marginBottom: 16 }}>
                            <CheckCircle size={16} />
                            <span style={{ flex: 1 }}>{success}</span>
                            <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, display: 'flex' }}><X size={16} /></button>
                        </div>
                    )}

                    {/* Search & Filter */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                            <input
                                type="text"
                                placeholder="Search by room number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                                style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12, fontSize: 14 }}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilterModal(true)}
                            className="btn-ghost"
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, fontSize: 14, position: 'relative', fontWeight: 600 }}
                        >
                            <SlidersHorizontal size={16} />
                            Filters
                            {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
                        </button>
                    </div>

                    {/* Active Filters */}
                    {activeFilterCount > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 20, padding: '12px 16px', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 12 }}>
                            <span style={{ fontSize: 12, color: '#4338ca', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active:</span>
                            {filters.sharingType && <span className="badge badge-single">{filters.sharingType === 'FOUR' ? '4 Share' : filters.sharingType === 'FIVE' ? '5 Share' : filters.sharingType}</span>}
                            {filters.roomType && <span className="badge badge-ac">{filters.roomType}</span>}
                            {filters.isAvailable && <span className={`badge ${filters.isAvailable === 'true' ? 'badge-available' : 'badge-occupied'}`}>{filters.isAvailable === 'true' ? 'Available' : 'Occupied'}</span>}
                            <button onClick={resetFilters} style={{ marginLeft: 4, background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Clear all</button>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <div style={{ width: 48, height: 48, border: '3px solid #e5e7eb', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}></div>
                            <p style={{ color: '#6b7280', marginTop: 16, fontSize: 14 }}>Loading rooms...</p>
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && filteredRooms.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#ffffff', border: '1px solid #e8eaf0', borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            <Bed size={56} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
                            <h3 className="section-title" style={{ color: '#374151', fontSize: 20, margin: '0 0 8px' }}>No rooms found</h3>
                            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 24 }}>Adjust your filters or add a new room to get started.</p>
                            <button onClick={openModal} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 12, fontSize: 14 }}>
                                <Plus size={18} /> Add First Room
                            </button>
                        </div>
                    )}

                    {/* Rooms Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {filteredRooms.map((room) => (
                            <div key={room.id} className={`room-card ${!room.isAvailable ? 'occupied' : ''}`} style={{ borderRadius: 16 }}>
                                {/* Card Top */}
                                <div style={{ padding: '20px 20px 16px', position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                        <div>
                                            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Room</div>
                                            <div className="room-number" style={{ fontSize: 28, color: '#111827', lineHeight: 1 }}>{room.roomNo}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span className={`availability-dot ${room.isAvailable ? 'dot-available' : 'dot-occupied'}`}></span>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: room.isAvailable ? '#16a34a' : '#dc2626' }}>
                                                {room.isAvailable ? 'Available' : 'Occupied'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                                        <span className={`badge badge-${room.sharingType.toLowerCase()}`}>{room.sharingType === 'FOUR' ? '4 Share' : room.sharingType === 'FIVE' ? '5 Share' : room.sharingType}</span>
                                        <span className={`badge ${room.roomType === 'AC' ? 'badge-ac' : 'badge-nonac'}`}>
                                            {room.roomType === 'AC' ? <Snowflake size={10} /> : <Wind size={10} />}
                                            {room.roomType === 'AC' ? 'AC' : 'Non-AC'}
                                        </span>
                                    </div>

                                    {/* Info Row */}
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <div style={{ flex: 1, background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 10, padding: '10px 12px' }}>
                                            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>BEDS</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Users size={14} color="#9ca3af" />
                                                <span className="price-tag" style={{ color: '#111827', fontSize: 18 }}>{room.bedNumbers}</span>
                                            </div>
                                        </div>
                                        {room.pricePerMonth && (
                                            <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 12px' }}>
                                                <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600, marginBottom: 4 }}>PRICE/MO</div>
                                                <div className="price-tag" style={{ color: '#16a34a', fontSize: 18 }}>₹{room.pricePerMonth.toLocaleString()}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="divider" style={{ margin: 0 }}></div>

                                {/* Card Actions */}
                                <div style={{ padding: '14px 20px 18px', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1 }}>
                                    <button
                                        onClick={() => toggleAvailability(room)}
                                        style={{ width: '100%', padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, transition: 'all 0.2s', cursor: 'pointer', ...(room.isAvailable ? { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' } : { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }) }}
                                    >
                                        {room.isAvailable ? 'Mark as Occupied' : 'Mark as Available'}
                                    </button>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        <button onClick={() => handleEdit(room)} className="btn-ghost" style={{ padding: '9px', borderRadius: 10, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(room.id)} className="btn-danger" style={{ padding: '9px', borderRadius: 10, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ width: '100%', maxWidth: 540 }}>
                        {/* Modal Header */}
                        <div style={{ padding: '24px 28px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6' }}>
                            <div>
                                <h2 className="section-title" style={{ color: '#111827', fontSize: 20, margin: '0 0 4px' }}>
                                    {editMode ? 'Edit Room' : 'Add New Room'}
                                </h2>
                                <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>
                                    {editMode ? 'Update room details below' : 'Fill in the details to add a new room'}
                                </p>
                            </div>
                            <button onClick={closeModal} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#6b7280', display: 'flex', transition: 'all 0.2s' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {error && (
                            <div style={{ margin: '16px 28px 0' }}>
                                <div className="alert-bar alert-error">
                                    <AlertCircle size={15} />
                                    <span style={{ fontSize: 13 }}>{error}</span>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ padding: '24px 28px 28px' }}>
                            {/* Room Number */}
                            <div style={{ marginBottom: 20 }}>
                                <label className="form-label">Room Number <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="text"
                                    name="roomNo"
                                    value={currentRoom.roomNo}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., 101, A-205"
                                    className="form-input"
                                />
                            </div>

                            {/* Sharing Type - Button Group */}
                            <div style={{ marginBottom: 20 }}>
                                <label className="form-label">Sharing Type <span style={{ color: '#ef4444' }}>*</span></label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {sharingOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            className={`sharing-btn ${currentRoom.sharingType === opt.value ? 'active' : ''}`}
                                            onClick={() => handleSharingChange(opt.value)}
                                            style={{ minWidth: 0 }}
                                        >
                                            <div style={{ fontSize: 16, marginBottom: 4 }}>🛏</div>
                                            <div style={{ fontSize: 13 }}>{opt.label}</div>
                                            <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{opt.beds} bed{opt.beds > 1 ? 's' : ''}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Beds Display (auto-determined, no input needed) */}
                            <div style={{ marginBottom: 20 }}>
                                <label className="form-label">Beds Assigned</label>
                                <div className="beds-display">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <Users size={16} color="#6366f1" />
                                        <span style={{ color: '#6b7280', fontSize: 13 }}>
                                            Auto-assigned based on sharing type
                                        </span>
                                    </div>
                                    <span className="price-tag" style={{ color: '#4338ca', fontSize: 22 }}>{currentRoom.bedNumbers}</span>
                                </div>
                            </div>

                            {/* Room Type - Button Group */}
                            <div style={{ marginBottom: 20 }}>
                                <label className="form-label">Room Type <span style={{ color: '#ef4444' }}>*</span></label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        type="button"
                                        className={`room-type-btn ${currentRoom.roomType === 'AC' ? 'active-ac' : ''}`}
                                        onClick={() => handleRoomTypeChange('AC')}
                                    >
                                        <Snowflake size={16} />
                                        AC Room
                                    </button>
                                    <button
                                        type="button"
                                        className={`room-type-btn ${currentRoom.roomType === 'NON_AC' ? 'active-nonac' : ''}`}
                                        onClick={() => handleRoomTypeChange('NON_AC')}
                                    >
                                        <Wind size={16} />
                                        Non-AC Room
                                    </button>
                                </div>
                            </div>

                            {/* Price */}
                            <div style={{ marginBottom: 20 }}>
                                <label className="form-label">Price per Month (₹)</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontWeight: 600, fontSize: 14 }}>₹</span>
                                    <input
                                        type="number"
                                        name="pricePerMonth"
                                        value={currentRoom.pricePerMonth}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="form-input"
                                        style={{ paddingLeft: 30 }}
                                    />
                                </div>
                            </div>

                            {/* Availability Toggle */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, marginBottom: 24 }}>
                                <div>
                                    <div style={{ color: '#111827', fontSize: 14, fontWeight: 600 }}>Room Availability</div>
                                    <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
                                        {currentRoom.isAvailable ? 'Room is currently available for booking' : 'Room is currently occupied'}
                                    </div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        name="isAvailable"
                                        checked={currentRoom.isAvailable}
                                        onChange={handleInputChange}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" onClick={closeModal} className="btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 600 }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, padding: '12px', borderRadius: 12, fontSize: 14, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                                    {loading ? 'Saving...' : editMode ? 'Update Room' : 'Add Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Room Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ width: '100%', maxWidth: 540 }}>
                        {/* Edit Modal Header */}
                        <div style={{ padding: '0 28px', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', borderRadius: '20px 20px 0 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.18)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Edit size={18} color="white" />
                                    </div>
                                    <div>
                                        <h2 className="section-title" style={{ color: 'white', fontSize: 19, margin: 0 }}>Edit Room</h2>
                                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0, marginTop: 2 }}>
                                            Room <span style={{ fontWeight: 700 }}>{currentRoom.roomNo}</span> — update details below
                                        </p>
                                    </div>
                                </div>
                                <button onClick={closeModal} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, padding: 8, cursor: 'pointer', color: 'white', display: 'flex', transition: 'all 0.2s' }}>
                                    <X size={18} />
                                </button>
                            </div>
                            {/* Room info strip */}
                            <div style={{ display: 'flex', gap: 16, paddingBottom: 20 }}>
                                {[
                                    { label: 'Room No', value: currentRoom.roomNo || '—' },
                                    { label: 'Sharing', value: currentRoom.sharingType },
                                    { label: 'Beds', value: currentRoom.bedNumbers },
                                    { label: 'Status', value: currentRoom.isAvailable ? 'Available' : 'Occupied' },
                                ].map(info => (
                                    <div key={info.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 14px', flex: 1, textAlign: 'center' }}>
                                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{info.label}</div>
                                        <div style={{ fontSize: 14, color: 'white', fontWeight: 700, marginTop: 2 }}>{info.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div style={{ margin: '16px 28px 0' }}>
                                <div className="alert-bar alert-error">
                                    <AlertCircle size={15} />
                                    <span style={{ fontSize: 13 }}>{error}</span>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ padding: '24px 28px 28px' }}>
                            {/* Room Number */}
                            <div style={{ marginBottom: 20 }}>
                                <label className="form-label">Room Number <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="text"
                                    name="roomNo"
                                    value={currentRoom.roomNo}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., 101, A-205"
                                    className="form-input"
                                />
                            </div>

                            {/* Sharing Type */}
                            <div style={{ marginBottom: 20 }}>
                                <label className="form-label">Sharing Type <span style={{ color: '#ef4444' }}>*</span></label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {sharingOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            className={`sharing-btn ${currentRoom.sharingType === opt.value ? 'active' : ''}`}
                                            onClick={() => handleSharingChange(opt.value)}
                                            style={{ minWidth: 0 }}
                                        >
                                            <div style={{ fontSize: 16, marginBottom: 4 }}>🛏</div>
                                            <div style={{ fontSize: 13 }}>{opt.label}</div>
                                            <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{opt.beds} bed{opt.beds > 1 ? 's' : ''}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Beds Display */}
                            <div style={{ marginBottom: 20 }}>
                                <label className="form-label">Beds Assigned</label>
                                <div className="beds-display">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <Users size={16} color="#6366f1" />
                                        <span style={{ color: '#6b7280', fontSize: 13 }}>Auto-assigned based on sharing type</span>
                                    </div>
                                    <span className="price-tag" style={{ color: '#4338ca', fontSize: 22 }}>{currentRoom.bedNumbers}</span>
                                </div>
                            </div>

                            {/* Room Type */}
                            <div style={{ marginBottom: 20 }}>
                                <label className="form-label">Room Type <span style={{ color: '#ef4444' }}>*</span></label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button type="button" className={`room-type-btn ${currentRoom.roomType === 'AC' ? 'active-ac' : ''}`} onClick={() => handleRoomTypeChange('AC')}>
                                        <Snowflake size={16} /> AC Room
                                    </button>
                                    <button type="button" className={`room-type-btn ${currentRoom.roomType === 'NON_AC' ? 'active-nonac' : ''}`} onClick={() => handleRoomTypeChange('NON_AC')}>
                                        <Wind size={16} /> Non-AC Room
                                    </button>
                                </div>
                            </div>

                            {/* Price */}
                            <div style={{ marginBottom: 20 }}>
                                <label className="form-label">Price per Month (₹)</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontWeight: 600, fontSize: 14 }}>₹</span>
                                    <input
                                        type="number"
                                        name="pricePerMonth"
                                        value={currentRoom.pricePerMonth}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="form-input"
                                        style={{ paddingLeft: 30 }}
                                    />
                                </div>
                            </div>

                            {/* Availability Toggle */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, marginBottom: 24 }}>
                                <div>
                                    <div style={{ color: '#111827', fontSize: 14, fontWeight: 600 }}>Room Availability</div>
                                    <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
                                        {currentRoom.isAvailable ? 'Room is currently available for booking' : 'Room is currently occupied'}
                                    </div>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" name="isAvailable" checked={currentRoom.isAvailable} onChange={handleInputChange} />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" onClick={closeModal} className="btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 600 }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, padding: '12px', borderRadius: 12, fontSize: 14, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                                    {loading ? 'Updating...' : '✓ Update Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ width: '100%', maxWidth: 400 }}>
                        <div style={{ padding: '24px 28px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6' }}>
                            <h2 className="section-title" style={{ color: '#111827', fontSize: 20, margin: 0 }}>Filter Rooms</h2>
                            <button onClick={() => setShowFilterModal(false)} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#6b7280', display: 'flex' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ padding: '24px 28px 28px' }}>
                            {[
                                { label: 'Sharing Type', key: 'sharingType', options: [{ v: '', l: 'All Types' }, { v: 'SINGLE', l: 'Single' }, { v: 'DOUBLE', l: 'Double' }, { v: 'TRIPLE', l: 'Triple' }, { v: 'FOUR', l: 'Four Share' }, { v: 'FIVE', l: 'Five Share' }] },
                                { label: 'Room Type', key: 'roomType', options: [{ v: '', l: 'All Types' }, { v: 'AC', l: 'AC' }, { v: 'NON_AC', l: 'Non-AC' }] },
                                { label: 'Availability', key: 'isAvailable', options: [{ v: '', l: 'All' }, { v: 'true', l: 'Available' }, { v: 'false', l: 'Occupied' }] },
                            ].map(field => (
                                <div key={field.key} style={{ marginBottom: 16 }}>
                                    <label className="form-label">{field.label}</label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={(filters as any)[field.key]}
                                            onChange={e => setFilters({ ...filters, [field.key]: e.target.value })}
                                            className="form-input form-select"
                                            style={{ cursor: 'pointer', paddingRight: 40 }}
                                        >
                                            {field.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                                        </select>
                                        <ChevronDown size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                                    </div>
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                                <button onClick={resetFilters} className="btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 600 }}>Reset</button>
                                <button onClick={() => setShowFilterModal(false)} className="btn-primary" style={{ flex: 2, padding: '12px', borderRadius: 12, fontSize: 14 }}>Apply Filters</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomPage;