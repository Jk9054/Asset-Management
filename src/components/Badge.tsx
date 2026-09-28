import React from 'react';
import { AssetCondition, AssetStatus, AssetType } from '../types';

interface ConditionBadgeProps {
  condition: AssetCondition;
}

export const ConditionBadge: React.FC<ConditionBadgeProps> = ({ condition }) => {
  const styles = {
    Good: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs',
    Fair: 'bg-amber-50 text-amber-700 border-amber-200 shadow-xs',
    Poor: 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs ring-1 ring-rose-300/40',
  };

  const dots = {
    Good: 'bg-emerald-500',
    Fair: 'bg-amber-500',
    Poor: 'bg-rose-500 animate-pulse',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        styles[condition] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[condition]}`} />
      {condition}
    </span>
  );
};

interface StatusBadgeProps {
  status: AssetStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    Active: 'bg-blue-50 text-blue-700 border-blue-200',
    'Under Maintenance': 'bg-amber-50 text-amber-800 border-amber-300 font-medium',
    Retired: 'bg-slate-100 text-slate-600 border-slate-300 line-through decoration-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
        styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      {status}
    </span>
  );
};

interface TypeBadgeProps {
  type: AssetType;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  const styles: Record<string, string> = {
    Road: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Bridge: 'bg-teal-50 text-teal-700 border-teal-200',
    Building: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    Culvert: 'bg-orange-50 text-orange-700 border-orange-200',
    Flyover: 'bg-purple-50 text-purple-700 border-purple-200',
    Other: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
        styles[type] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      {type}
    </span>
  );
};
