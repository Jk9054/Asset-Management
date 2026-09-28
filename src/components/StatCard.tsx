import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorTheme?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'indigo';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorTheme = 'blue',
  onClick,
}) => {
  const themeStyles = {
    blue: {
      bg: 'bg-blue-50/70 hover:bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-500 text-white',
      text: 'text-blue-900',
    },
    emerald: {
      bg: 'bg-emerald-50/70 hover:bg-emerald-50',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-600 text-white',
      text: 'text-emerald-900',
    },
    amber: {
      bg: 'bg-amber-50/70 hover:bg-amber-50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-500 text-white',
      text: 'text-amber-900',
    },
    rose: {
      bg: 'bg-rose-50/70 hover:bg-rose-50',
      border: 'border-rose-200',
      iconBg: 'bg-rose-500 text-white',
      text: 'text-rose-900',
    },
    purple: {
      bg: 'bg-purple-50/70 hover:bg-purple-50',
      border: 'border-purple-200',
      iconBg: 'bg-purple-600 text-white',
      text: 'text-purple-900',
    },
    indigo: {
      bg: 'bg-indigo-50/70 hover:bg-indigo-50',
      border: 'border-indigo-200',
      iconBg: 'bg-indigo-600 text-white',
      text: 'text-indigo-900',
    },
  };

  const currentTheme = themeStyles[colorTheme];

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${
        currentTheme.bg
      } ${currentTheme.border} ${onClick ? 'cursor-pointer transform hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className={`text-2xl lg:text-3xl font-bold mt-1 tracking-tight ${currentTheme.text}`}>
            {value}
          </h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3.5 rounded-xl shadow-sm ${currentTheme.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
