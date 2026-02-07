import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  color 
}) => {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden group">
      <div 
        className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 rounded-full opacity-5 -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 transition-all duration-300 group-hover:scale-110" 
        style={{ backgroundColor: color }} 
      />
      
      <div className="flex items-start justify-between relative z-10 gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1 truncate">{title}</p>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 truncate">{value}</h3>
          <div className="flex items-center gap-1">
            {trend === 'up' ? (
              <TrendingUp size={14} className="text-green-500 flex-shrink-0 sm:w-4 sm:h-4" />
            ) : (
              <TrendingDown size={14} className="text-red-500 flex-shrink-0 sm:w-4 sm:h-4" />
            )}
            <span className={`text-xs sm:text-sm font-semibold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {change}
            </span>
          </div>
        </div>
        <div 
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-md flex-shrink-0"
          style={{ backgroundColor: color + '15' }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};