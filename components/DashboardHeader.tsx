import React from 'react';
import { ChurchSettings } from '../types';

interface DashboardHeaderProps {
  userRole: string;
  churchSettings: ChurchSettings;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userRole, churchSettings }) => {
  return (
    <div className="bg-church-dark-teal text-white p-4 rounded-lg shadow-md flex justify-between items-center mb-6">
      <div>
        <h2 className="text-xl font-bold tracking-wide uppercase">{churchSettings.name}</h2>
        <p className="text-sm text-gray-300">{churchSettings.slogan}</p>
      </div>
      <div>
        <p className="text-sm text-gray-300 text-right font-semibold">Session de</p>
        <p className="text-lg font-bold">{userRole}</p>
      </div>
    </div>
  );
};

export default DashboardHeader;