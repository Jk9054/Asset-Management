import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  Wrench,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  role?: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ role = 'OFFICER' }) => {
  const canModify = role === 'ADMIN' || role === 'OFFICER';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Asset Inventory', path: '/assets', icon: Layers },
    ...(canModify
      ? [{ label: 'Register New Asset', path: '/assets/new', icon: PlusCircle }]
      : []),
    { label: 'Maintenance Audit', path: '/assets/maintenance', icon: Wrench },
    { label: 'Reports & Export', path: '/reports', icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 flex-shrink-0 border-r border-slate-800 lg:min-h-[calc(100vh-61px)] flex flex-col justify-between">
      <div className="p-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-3">
          Main Navigation
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Role capability info card */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-semibold mb-1">
            <Info className="w-4 h-4 text-amber-400" />
            <span>Role: {role}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {role === 'ADMIN' && 'Full permissions: Add, Edit, Delete assets & register maintenance.'}
            {role === 'OFFICER' && 'Standard permissions: Add, Edit assets & register maintenance records.'}
            {role === 'VIEWER' && 'Read-only access: View assets, map, and export reports.'}
          </p>
        </div>
      </div>
    </aside>
  );
};
