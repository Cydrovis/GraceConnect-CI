

import React from 'react';

interface CardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-theme-card p-6 rounded-lg shadow flex items-center justify-between hover:shadow-lg transition-shadow">
      <div>
        <p className="text-sm font-medium text-theme-text-muted">{title}</p>
        <p className="text-3xl font-bold text-theme-text-base mt-1">{value}</p>
      </div>
      <div className="bg-slate-100 p-4 rounded-full">
        {icon}
      </div>
    </div>
  );
};

export default Card;