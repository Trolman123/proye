import React from 'react';

const StatCard = ({ icon: Icon, label, value, subtext, color = 'primary' }) => {
  const colorMap = {
    primary: 'bg-primary-600/10 text-primary-400 border-primary-600/20',
    emerald: 'bg-emerald-600/10 text-emerald-400 border-emerald-600/20',
    amber: 'bg-amber-600/10 text-amber-400 border-amber-600/20',
    red: 'bg-red-600/10 text-red-400 border-red-600/20',
    blue: 'bg-blue-600/10 text-blue-400 border-blue-600/20'
  };

  return (
    <div className="card hover:border-dark-600 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-dark-400 text-sm mb-1">{label}</p>
          <p className="text-2xl font-display font-bold text-dark-50 group-hover:text-primary-300 transition-colors">
            {value}
          </p>
          {subtext && <p className="text-xs text-dark-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
