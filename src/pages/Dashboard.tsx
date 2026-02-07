import React, { useEffect, useState } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { StudentTable } from '../components/StudentTable';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { RevenueTrendChart } from '../components/RevenueTrendChart';
import { statsData, analyticsData, revenueData, studentsData } from '../data/mockData';
import { getStudentsAPI } from '../service';

const Dashboard: React.FC = () => {
  // const [dateRange] = useState<string>('10 May - 20 May');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [students, setStudents] = useState<any[]>(studentsData);

  const toggleSearch = (): void => {
    setSearchOpen(!searchOpen);
  };
  const fetchStudents = async () => {
    try {
      const response = await getStudentsAPI();
      console.log('Students data:', response.data);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-gray-50 to-gray-100">
      {/* Dashboard Content */}
      <main className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 pb-20 lg:pb-8">
        {/* Stats Grid - Fully Responsive */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {statsData.map((stat) => (
            <StatsCard key={stat.id} {...stat} />
          ))}
        </div>

        {/* Bookings Table - Responsive Container */}
        <div className="w-full overflow-visible">
          <StudentTable students={students} fetchStudents={fetchStudents} />
        </div>

        {/* Charts Section - Responsive Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <div className="w-full min-h-87.5">
            <AnalyticsChart data={analyticsData} />
          </div>
          <div className="w-full min-h-87.5">
            <RevenueTrendChart data={revenueData} />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2.5">
          <button
            onClick={toggleSearch}
            className="flex flex-col items-center gap-0.5 p-2 text-gray-500 hover:text-gray-700 active:scale-95 transition-all min-w-16"
          >
            <Search size={22} />
            <span className="text-[10px] font-medium">Search</span>
          </button>
          <button className="relative flex flex-col items-center gap-0.5 p-2 text-gray-500 hover:text-gray-700 active:scale-95 transition-all min-w-16">
            <Bell size={22} />
            <span className="text-[10px] font-medium">Alerts</span>
            <span className="absolute top-1.5 right-1/2 translate-x-3 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white"></span>
          </button>
          <button className="flex flex-col items-center gap-0.5 p-2 text-gray-500 hover:text-gray-700 active:scale-95 transition-all min-w-16">
            <User size={22} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;