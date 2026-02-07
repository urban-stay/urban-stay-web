import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { createStudentsAPI } from '../service';

export interface Student {
    id: number;
    name: string;
    joinDate: string;
    bedNo: string;
    roomNo: string;
    sharingType: 'Single' | 'Double' | 'Triple' | 'Four Sharing';
    roomType: 'AC' | 'Non-AC';
    monthlyFee: string;
    advanceAmount: string;
    status: 'Active' | 'Pending' | 'Inactive';
    year: number;
    month: string;
}

interface StudentTableProps {
    students: Student[];
    fetchStudents: () => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({ students, fetchStudents }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        joinDate: '',
        bedNo: '',
        roomNo: '',
        sharingType: 'Double' as 'Single' | 'Double' | 'Triple' | 'Four Sharing',
        roomType: 'Non-AC' as 'AC' | 'Non-AC',
        monthlyFee: '',
        advanceAmount: '',
        status: 'Active' as 'Active' | 'Pending' | 'Inactive',
        guardianName: '',
        guardianPhone: '',
        address: '',
        phoneNumber: '',
        email: ''
    });

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            console.log('Form submitted:', formData);
            setIsLoading(true);

            const result = await createStudentsAPI(formData);
            console.log('Student created:', result);

            // ✅ Close modal on success
            setIsModalOpen(false);

            // ✅ Refresh student list
            fetchStudents();
            // ✅ Reset form
            setFormData({
                name: '',
                joinDate: '',
                bedNo: '',
                roomNo: '',
                sharingType: 'Double',
                roomType: 'Non-AC',
                monthlyFee: '',
                advanceAmount: '',
                status: 'Active',
                guardianName: '',
                guardianPhone: '',
                address: '',
                phoneNumber: '',
                email: ''
            });

        } catch (error: any) {
            console.error('Create student failed:', error);

            // Optional: show API error message
            setError(
                error?.response?.data?.message ||
                'Failed to create student. Please try again.'
            );

        } finally {
            setIsLoading(false);
        }
    };

    const filteredStudents = students.filter(student => {
        const search = searchTerm.toLowerCase();

        const matchesSearch =
            student.name.toLowerCase().includes(search) ||
            student.bedNo.toLowerCase().includes(search) ||
            student.roomNo.toLowerCase().includes(search) ||
            student.sharingType.toLowerCase().includes(search) ||
            student.roomType.toLowerCase().includes(search);

        // 🔹 Parse joinDate
        const joinDate = new Date(student.joinDate);
        const joinYear = joinDate.getFullYear(); // 2024
        const joinMonth = (joinDate.getMonth() + 1).toString().padStart(2, '0'); // "01"

        const matchesYear = !selectedYear || joinYear === selectedYear;
        const matchesMonth = !selectedMonth || joinMonth === selectedMonth;

        return matchesSearch && matchesYear && matchesMonth;
    });


    return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Student Records</h2>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="relative flex-1 sm:flex-initial">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-48 pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] text-sm"
                            />
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#5B4FE9] text-white rounded-lg hover:bg-[#4A3FD8] transition-colors shrink-0"
                        >
                            <Plus size={16} />
                            <span className="text-sm font-medium">Add Student</span>
                        </button>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="mt-4 flex flex-wrap gap-3">
                    <div className="flex-1 min-w-37.5">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] text-sm"
                        >
                            <option value="">All Years</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 min-w-37.5">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Month</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] text-sm"
                        >
                            <option value="">All Months</option>
                            {months.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Join Date</th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Room Details</th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sharing</th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Room Type</th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Monthly Fee</th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Advance</th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredStudents.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="px-6 py-10 text-center text-sm text-gray-500"
                                >
                                    No students available
                                </td>
                            </tr>
                        ) : (filteredStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900 text-sm">{student.name}</div>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-600">{student.joinDate}</td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-600">
                                    <div>{student.roomNo}</div>
                                    <div className="text-xs text-gray-500">{student.bedNo}</div>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-600">{student.sharingType}</td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${student.roomType === 'AC'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {student.roomType}
                                    </span>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                                    <span className="font-semibold text-gray-900 text-sm">{student.monthlyFee}</span>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                                    <span className="font-medium text-gray-700 text-sm">{student.advanceAmount}</span>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                                    <span className={`
                                        inline-flex px-2.5 py-1 text-xs font-semibold rounded-full
                                        ${student.status === 'Active'
                                            ? 'bg-green-100 text-green-800'
                                            : student.status === 'Pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                        }
                                    `}>
                                        {student.status}
                                    </span>
                                </td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                    <tr>
                        <td
                            colSpan={8}
                            className="px-6 py-10 text-center text-sm text-gray-500"
                        >
                            No students available
                        </td>
                    </tr>
                ) : (filteredStudents.map((student) => (
                    <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{student.name}</h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-xs text-gray-500">{student.roomNo} - {student.bedNo}</p>
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${student.roomType === 'AC'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {student.roomType}
                                    </span>
                                    <span className="text-xs text-gray-600">{student.sharingType}</span>
                                </div>
                            </div>
                            <span className={`
                                inline-flex px-2.5 py-1 text-xs font-semibold rounded-full shrink-0 ml-2
                                ${student.status === 'Active'
                                    ? 'bg-green-100 text-green-800'
                                    : student.status === 'Pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                }
                            `}>
                                {student.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="text-gray-500">Join Date:</span>
                                <p className="text-gray-900 font-medium mt-0.5">{student.joinDate}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Monthly Fee:</span>
                                <p className="text-gray-900 font-bold mt-0.5">{student.monthlyFee}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Advance Paid:</span>
                                <p className="text-gray-900 font-medium mt-0.5">{student.advanceAmount}</p>
                            </div>
                        </div>
                    </div>
                )))}
            </div>

            {/* Add Student Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Add New Student</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Student Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                                    placeholder="Enter student name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Join Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.joinDate}
                                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                                    placeholder="Enter student email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                                    placeholder="Enter student phone number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Guardian Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.guardianName}
                                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                                    placeholder="Enter guardian name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Guardian Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.guardianPhone}
                                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                                    placeholder="Enter guardian phone number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                                    placeholder="Enter student address"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Room No <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.roomNo}
                                        onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                                        placeholder="e.g., 101"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bed No <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.bedNo}
                                        onChange={(e) => setFormData({ ...formData, bedNo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                                        placeholder="e.g., Bed 1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sharing Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.sharingType}
                                        onChange={(e) => setFormData({ ...formData, sharingType: e.target.value as 'Single' | 'Double' | 'Triple' | 'Four Sharing' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                                    >
                                        <option value="Single">Single</option>
                                        <option value="Double">Double</option>
                                        <option value="Triple">Triple</option>
                                        <option value="Four Sharing">Four Sharing</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Room Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.roomType}
                                        onChange={(e) => setFormData({ ...formData, roomType: e.target.value as 'AC' | 'Non-AC' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                                    >
                                        <option value="AC">AC</option>
                                        <option value="Non-AC">Non-AC</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Monthly Fee <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.monthlyFee}
                                        onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                                        placeholder="e.g., ₹5000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Advance Amount <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.advanceAmount}
                                        onChange={(e) => setFormData({ ...formData, advanceAmount: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                                        placeholder="e.g., ₹10000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Pending' | 'Inactive' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-[#5B4FE9] text-white rounded-lg hover:bg-[#4A3FD8] transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {/* {isLoading ? "Adding..." : "Add Student"} */}
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Adding...
                                        </span>
                                    ) : (
                                        "Add Student"
                                    )}
                                </button>
                            </div>
                            {error && (
                                <p className="mt-3 text-sm text-red-600 font-medium">
                                    {error}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};