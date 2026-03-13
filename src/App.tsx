import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import { useUser } from './context/UserContext';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EmployeePage = lazy(() => import('./pages/EmployeePage'));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const Roompage = lazy(() => import('./pages/RoomPage'));
const RentPaymentPage = lazy(() => import('./pages/RentPaymentPage'));
const StudentTable = lazy(() => import('./components/StudentTable'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));


const App = () => {
  const { user } = useUser();
  console.log(user?.role);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
            </Route>

            {/* Login Route - Public (but redirect if already authenticated) */}
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Admin Routes - Requires Authentication */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/students" element={<StudentTable />} />
                <Route path="/employees" element={<EmployeePage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/rooms" element={<Roompage />} />
                <Route path="/rent" element={<RentPaymentPage />} />
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <Route path="/user" element={<UserManagement />} />
                )}
              </Route>
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;