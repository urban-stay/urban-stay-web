import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsDataPoint {
  month: string;
  income: number;
  outcome: number;
}

interface AnalyticsChartProps {
  data: AnalyticsDataPoint[];
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Analytics</h2>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#5B4FE9]"></div>
            <span className="text-xs sm:text-sm text-gray-600">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#00C896]"></div>
            <span className="text-xs sm:text-sm text-gray-600">Outcome</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280} className="sm:h-75">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#9CA3AF" 
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            stroke="#9CA3AF" 
            tick={{ fontSize: 8 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '12px'
            }}
            cursor={{ fill: 'rgba(91, 79, 233, 0.05)' }}
          />
          <Bar dataKey="income" fill="#5B4FE9" radius={[8, 8, 0, 0]} />
          <Bar dataKey="outcome" fill="#00C896" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};