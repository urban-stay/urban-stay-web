import type { Student } from "../components/StudentTable";

export interface StatData {
  id: number;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

export interface AnalyticsData {
  month: string;
  income: number;
  outcome: number;
}

export interface RevenueData {
  month: string;
  value: number;
}

export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  salary: string;
  status: string;
}

export interface Expense {
  id: number;
  category: string;
  amount: string;
  date: string;
  status: string;
}

// Stats Data
export const statsData: StatData[] = [
  { 
    id: 1, 
    title: 'Bookings', 
    value: '$632,000', 
    change: '+1.29%', 
    trend: 'up', 
    icon: '📦', 
    color: '#FF6B35' 
  },
  { 
    id: 2, 
    title: 'Total Outgoing', 
    value: '$632,000', 
    change: '+1.29%', 
    trend: 'up', 
    icon: '📊', 
    color: '#F7931E' 
  },
  { 
    id: 3, 
    title: 'Total Income', 
    value: '$632,000', 
    change: '+1.29%', 
    trend: 'up', 
    icon: '💰', 
    color: '#00A8E8' 
  },
  { 
    id: 4, 
    title: 'Total Saving', 
    value: '$632,000', 
    change: '+1.29%', 
    trend: 'up', 
    icon: '💵', 
    color: '#00C896' 
  }
];

// Bookings Data
export const studentsData: Student[] = [
  { 
    id: 1, 
    name: 'Priya Sharma', 
    joinDate: 'Jan 15, 2024', 
    bedNo: 'Bed 1',
    roomNo: 'Room 101',
    sharingType: 'Double',
    roomType: 'AC',
    monthlyFee: '₹6,000', 
    advanceAmount: '₹12,000',
    status: 'Active',
    year: 2024,
    month: 'January'
  },
  { 
    id: 2, 
    name: 'Anjali Verma', 
    joinDate: 'Feb 10, 2024', 
    bedNo: 'Bed 2',
    roomNo: 'Room 101',
    sharingType: 'Double',
    roomType: 'AC',
    monthlyFee: '₹6,000',
    advanceAmount: '₹12,000',
    status: 'Active',
    year: 2024,
    month: 'February'
  },
  { 
    id: 3, 
    name: 'Sneha Patel', 
    joinDate: 'Mar 5, 2024', 
    bedNo: 'Bed 1',
    roomNo: 'Room 102',
    sharingType: 'Triple',
    roomType: 'Non-AC',
    monthlyFee: '₹4,500',
    advanceAmount: '₹9,000',
    status: 'Active',
    year: 2024,
    month: 'March'
  },
  { 
    id: 4, 
    name: 'Kavya Reddy', 
    joinDate: 'Apr 20, 2024', 
    bedNo: 'Bed 2',
    roomNo: 'Room 102',
    sharingType: 'Triple',
    roomType: 'Non-AC',
    monthlyFee: '₹4,500',
    advanceAmount: '₹9,000',
    status: 'Pending',
    year: 2024,
    month: 'April'
  },
  { 
    id: 5, 
    name: 'Deepika Singh', 
    joinDate: 'May 12, 2024', 
    bedNo: 'Bed 1',
    roomNo: 'Room 103',
    sharingType: 'Single',
    roomType: 'AC',
    monthlyFee: '₹10,000',
    advanceAmount: '₹20,000',
    status: 'Active',
    year: 2024,
    month: 'May'
  },
  { 
    id: 6, 
    name: 'Aarti Gupta', 
    joinDate: 'Jun 8, 2024', 
    bedNo: 'Bed 1',
    roomNo: 'Room 104',
    sharingType: 'Four Sharing',
    roomType: 'Non-AC',
    monthlyFee: '₹3,500',
    advanceAmount: '₹7,000',
    status: 'Active',
    year: 2024,
    month: 'June'
  },
  { 
    id: 7, 
    name: 'Meera Kumar', 
    joinDate: 'Jul 22, 2024', 
    bedNo: 'Bed 2',
    roomNo: 'Room 104',
    sharingType: 'Four Sharing',
    roomType: 'Non-AC',
    monthlyFee: '₹3,500',
    advanceAmount: '₹7,000',
    status: 'Inactive',
    year: 2024,
    month: 'July'
  },
  { 
    id: 8, 
    name: 'Pooja Joshi', 
    joinDate: 'Aug 15, 2024', 
    bedNo: 'Bed 1',
    roomNo: 'Room 105',
    sharingType: 'Double',
    roomType: 'AC',
    monthlyFee: '₹6,000',
    advanceAmount: '₹12,000',
    status: 'Active',
    year: 2024,
    month: 'August'
  },
  { 
    id: 9, 
    name: 'Riya Kapoor', 
    joinDate: 'Sep 3, 2024', 
    bedNo: 'Bed 3',
    roomNo: 'Room 102',
    sharingType: 'Triple',
    roomType: 'Non-AC',
    monthlyFee: '₹4,500',
    advanceAmount: '₹9,000',
    status: 'Active',
    year: 2024,
    month: 'September'
  },
  { 
    id: 10, 
    name: 'Nisha Agarwal', 
    joinDate: 'Oct 18, 2024', 
    bedNo: 'Bed 2',
    roomNo: 'Room 105',
    sharingType: 'Double',
    roomType: 'AC',
    monthlyFee: '₹6,000',
    advanceAmount: '₹12,000',
    status: 'Pending',
    year: 2024,
    month: 'October'
  }
];

// Analytics Data
export const analyticsData: AnalyticsData[] = [
  { month: 'Jan', income: 42000, outcome: 28000 },
  { month: 'Feb', income: 31000, outcome: 38000 },
  { month: 'Mar', income: 35000, outcome: 31000 },
  { month: 'Apr', income: 45000, outcome: 32000 },
  { month: 'May', income: 48000, outcome: 36000 },
  { month: 'Jun', income: 38000, outcome: 33000 },
  { month: 'Jul', income: 35000, outcome: 35000 },
  { month: 'Aug', income: 40000, outcome: 29000 }
];

// Revenue Data
export const revenueData: RevenueData[] = [
  { month: 'Jan', value: 45000 },
  { month: 'Feb', value: 52000 },
  { month: 'Mar', value: 48000 },
  { month: 'Apr', value: 61000 },
  { month: 'May', value: 55000 },
  { month: 'Jun', value: 67000 }
];

// Employees Data
export const employeesData: Employee[] = [
  { id: 1, name: 'John Doe', position: 'Manager', department: 'Operations', salary: '$85,000', status: 'Active' },
  { id: 2, name: 'Jane Smith', position: 'Receptionist', department: 'Front Desk', salary: '$45,000', status: 'Active' },
  { id: 3, name: 'Mike Johnson', position: 'Maintenance', department: 'Facilities', salary: '$50,000', status: 'Active' },
  { id: 4, name: 'Sarah Williams', position: 'Accountant', department: 'Finance', salary: '$65,000', status: 'On Leave' },
  { id: 5, name: 'Tom Brown', position: 'Security', department: 'Safety', salary: '$42,000', status: 'Active' }
];

// Expenses Data
export const expensesData: Expense[] = [
  { id: 1, category: 'Utilities', amount: '$12,450', date: '2020-04-25', status: 'Paid' },
  { id: 2, category: 'Maintenance', amount: '$8,200', date: '2020-04-20', status: 'Paid' },
  { id: 3, category: 'Supplies', amount: '$3,150', date: '2020-04-18', status: 'Pending' },
  { id: 4, category: 'Marketing', amount: '$15,000', date: '2020-04-15', status: 'Paid' },
  { id: 5, category: 'Insurance', amount: '$22,000', date: '2020-04-10', status: 'Paid' }
];