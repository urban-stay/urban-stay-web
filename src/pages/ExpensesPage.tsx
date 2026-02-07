import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, DollarSign, Calendar, Tag, TrendingUp, TrendingDown, Receipt, FileText, Download, Upload, Paperclip } from 'lucide-react';

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
}

const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState<Expense>({
    title: '',
    amount: 0,
    expenseType: 'Operating',
    category: 'Utilities',
    date: '',
    year: new Date().getFullYear(),
    month: '',
    description: '',
    paymentMethod: 'Cash',
    vendor: '',
    status: 'Pending',
    billFile: null,
    billFileName: '',
    billUrl: '',
  });

  // Expense Types
  const expenseTypes = [
    'Operating',
    'Utilities',
    'Maintenance',
    'Salaries',
    'Supplies',
    'Food & Catering',
    'Transportation',
    'Administrative',
    'Marketing',
    'Miscellaneous'
  ];


  // Categories
  const categories = [
    // Food & Supplies
    'Grocery',
    'Provision',

    // Utilities
    'Electricity Charges',
    'Cylinder Expenses',
    'Water',
    'Gas',
    'Internet',

    // Salaries
    'Salary & Wages',

    // Maintenance
    'Repair & Maintenance',
    'Vehicle Maintenance',

    // Office & Admin
    'Printing And Stationery',
    'Office Supplies',
    'Furniture',

    // Transport & Logistics
    'Petrol Expenses',
    'Freight Charges',
    'Transportation',

    // Others
    'Cleaning Supplies',
    'Insurance',
    'Taxes',
    'Other'
  ];


  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Mock data
  useEffect(() => {
    const mockData: Expense[] = [
      {
        id: 1,
        title: 'Electricity Bill',
        amount: 12500,
        expenseType: 'Utilities',
        category: 'Electricity',
        date: '2024-01-15',
        year: 2024,
        month: 'January',
        paymentMethod: 'Bank Transfer',
        vendor: 'State Electricity Board',
        status: 'Paid',
        billFileName: 'electricity_bill_jan_2024.pdf',
        billUrl: '#'
      },
      {
        id: 2,
        title: 'Water Bill',
        amount: 3500,
        expenseType: 'Utilities',
        category: 'Water',
        date: '2024-01-20',
        year: 2024,
        month: 'January',
        paymentMethod: 'Cash',
        vendor: 'Municipal Corporation',
        status: 'Paid',
        billFileName: 'water_bill_jan_2024.pdf',
        billUrl: '#'
      },
      {
        id: 3,
        title: 'Cleaning Supplies',
        amount: 4200,
        expenseType: 'Supplies',
        category: 'Cleaning Supplies',
        date: '2024-02-05',
        year: 2024,
        month: 'February',
        paymentMethod: 'Cash',
        vendor: 'Local Store',
        status: 'Paid',
      },
      {
        id: 4,
        title: 'AC Repair',
        amount: 8500,
        expenseType: 'Maintenance',
        category: 'Repairs',
        date: '2024-02-12',
        year: 2024,
        month: 'February',
        paymentMethod: 'UPI',
        vendor: 'Cool Air Services',
        status: 'Pending',
        billFileName: 'ac_repair_invoice.pdf',
        billUrl: '#'
      },
    ];
    setExpenses(mockData);
    setFilteredExpenses(mockData);
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = expenses;

    if (searchTerm) {
      filtered = filtered.filter(
        (exp) =>
          exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exp.expenseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exp.vendor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterYear) {
      filtered = filtered.filter((exp) => exp.year === filterYear);
    }

    if (filterMonth) {
      filtered = filtered.filter((exp) => exp.month === filterMonth);
    }

    if (filterType) {
      filtered = filtered.filter((exp) => exp.expenseType === filterType);
    }

    if (filterCategory) {
      filtered = filtered.filter((exp) => exp.category === filterCategory);
    }

    setFilteredExpenses(filtered);
  }, [searchTerm, filterYear, filterMonth, filterType, filterCategory, expenses]);

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData(expense);
    } else {
      setEditingExpense(null);
      const today = new Date();
      setFormData({
        title: '',
        amount: 0,
        expenseType: 'Operating',
        category: 'Utilities',
        date: today.toISOString().split('T')[0],
        year: today.getFullYear(),
        month: months[today.getMonth()],
        description: '',
        paymentMethod: 'Cash',
        vendor: '',
        status: 'Pending',
        billFile: null,
        billFileName: '',
        billUrl: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF and image files (JPG, PNG) are allowed');
        return;
      }

      setFormData({
        ...formData,
        billFile: file,
        billFileName: file.name,
        billUrl: URL.createObjectURL(file)
      });
    }
  };

  const handleRemoveBill = () => {
    setFormData({
      ...formData,
      billFile: null,
      billFileName: '',
      billUrl: ''
    });
  };

  const handleDownloadBill = (expense: Expense) => {
    if (expense.billUrl) {
      // In production, this would download from server
      const link = document.createElement('a');
      link.href = expense.billUrl;
      link.download = expense.billFileName || `bill_${expense.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Extract year and month from date
    const selectedDate = new Date(formData.date);
    const updatedFormData = {
      ...formData,
      year: selectedDate.getFullYear(),
      month: months[selectedDate.getMonth()],
    };

    if (editingExpense) {
      setExpenses(
        expenses.map((exp) => (exp.id === editingExpense.id ? { ...updatedFormData, id: editingExpense.id } : exp))
      );
    } else {
      const newExpense = { ...updatedFormData, id: Date.now() };
      setExpenses([...expenses, newExpense]);
    }

    handleCloseModal();
  };

  const handleDelete = (expense: Expense) => {
    setDeletingExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingExpense) {
      setExpenses(expenses.filter((exp) => exp.id !== deletingExpense.id));
      setIsDeleteModalOpen(false);
      setDeletingExpense(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const paidExpenses = filteredExpenses.filter(exp => exp.status === 'Paid').reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = filteredExpenses.filter(exp => exp.status === 'Pending').reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-rose-50 via-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-rose-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-rose-900 via-orange-800 to-amber-900 bg-clip-text text-transparent">
                Expense Management
              </h1>
              <p className="text-slate-600 mt-1">Track and manage hostel expenses</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="group flex items-center gap-2 px-6 py-3 bg-linear-to-r from-rose-600 to-orange-600 text-white rounded-xl hover:from-rose-700 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-105"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Total Expenses</span>
              <Receipt className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">₹{totalExpenses.toLocaleString()}</div>
            <p className="text-sm text-slate-500 mt-1">{filteredExpenses.length} transactions</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-200/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Paid</span>
              <TrendingDown className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-emerald-700">₹{paidExpenses.toLocaleString()}</div>
            <p className="text-sm text-slate-500 mt-1">Completed payments</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Pending</span>
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-amber-700">₹{pendingExpenses.toLocaleString()}</div>
            <p className="text-sm text-slate-500 mt-1">Awaiting payment</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-200/50 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              />
            </div>

            {/* Year Filter */}
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* Month Filter */}
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            >
              <option value="">All Months</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            >
              <option value="">All Types</option>
              {expenseTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-rose-100 to-orange-50 border-b border-rose-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Expense</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Bill</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-linear-to-r hover:from-rose-50/50 hover:to-orange-50/50 transition-all duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">{new Date(expense.date).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500">{expense.month} {expense.year}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-slate-900">{expense.title}</div>
                        {expense.vendor && <div className="text-sm text-slate-500">{expense.vendor}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-800">
                        <Tag className="w-3 h-3" />
                        {expense.expenseType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{expense.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-bold text-slate-900">
                        <DollarSign className="w-4 h-4" />
                        ₹{expense.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{expense.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(expense.status)}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {expense.billFileName ? (
                        <button
                          onClick={() => handleDownloadBill(expense)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          title={expense.billFileName}
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden xl:inline">Download</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">No bill</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(expense)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200/50 p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-1">{expense.title}</h3>
                  {expense.vendor && <p className="text-sm text-slate-500">{expense.vendor}</p>}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(expense.status)}`}>
                  {expense.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{new Date(expense.date).toLocaleDateString()}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">{expense.month} {expense.year}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-medium">
                    <Tag className="w-3 h-3" />
                    {expense.expenseType}
                  </span>
                  <span className="text-xs text-slate-600">{expense.category}</span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <DollarSign className="w-5 h-5 text-slate-700" />
                  <span className="font-bold text-slate-900 text-lg">₹{expense.amount.toLocaleString()}</span>
                  <span className="ml-auto text-xs text-slate-500">{expense.paymentMethod}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(expense)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(expense)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                {expense.billFileName && (
                  <button
                    onClick={() => handleDownloadBill(expense)}
                    className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Download Bill"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredExpenses.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-200/50 p-12 text-center">
            <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No expenses found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your filters or add a new expense</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterYear(new Date().getFullYear());
                setFilterMonth('');
                setFilterType('');
                setFilterCategory('');
              }}
              className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-linear-to-r from-rose-600 to-orange-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Expense Details */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Expense Details
                  </h3>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Expense Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    placeholder="e.g., Electricity Bill"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Expense Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.expenseType}
                    onChange={(e) => setFormData({ ...formData, expenseType: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  >
                    {expenseTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Paid' | 'Pending' | 'Overdue' })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Vendor/Supplier</label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    placeholder="e.g., State Electricity Board"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>

                {/* Bill Upload Section */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 mt-4">
                    <Paperclip className="w-5 h-5" />
                    Bill / Receipt (Optional)
                  </h3>

                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/50">
                    {formData.billFileName ? (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">{formData.billFileName}</p>
                            <p className="text-sm text-slate-500">
                              {formData.billFile ? `${(formData.billFile.size / 1024).toFixed(2)} KB` : 'Uploaded'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveBill}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="Remove file"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center gap-3 py-4">
                          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-rose-600" />
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-slate-900 mb-1">
                              Click to upload bill or receipt
                            </p>
                            <p className="text-sm text-slate-500">
                              PDF, JPG, PNG (Max 5MB)
                            </p>
                          </div>
                        </div>
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Upload invoices, receipts, or bills for record keeping
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-linear-to-r from-rose-600 to-orange-600 text-white rounded-xl hover:from-rose-700 hover:to-orange-700 transition-all shadow-lg shadow-rose-500/30 font-semibold"
                >
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingExpense && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 text-center mb-2">Delete Expense?</h3>
            <p className="text-slate-600 text-center mb-6">
              Are you sure you want to delete <strong>{deletingExpense.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;