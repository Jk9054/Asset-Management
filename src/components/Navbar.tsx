import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { switchDemoRole, logoutUser } from '../services/authService';
import { Shield, LogOut, User as UserIcon, Building2, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onUserChange }) => {
  const navigate = useNavigate();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const handleRoleSwitch = (role: UserRole) => {
    const updatedUser = switchDemoRole(role);
    onUserChange(updatedUser);
    setShowRoleDropdown(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    onUserChange(null);
    navigate('/login');
  };

  const roleColors: Record<UserRole, string> = {
    ADMIN: 'bg-rose-100 text-rose-800 border-rose-300',
    OFFICER: 'bg-blue-100 text-blue-800 border-blue-300',
    VIEWER: 'bg-amber-100 text-amber-800 border-amber-300',
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="px-4 lg:px-8 py-3 flex items-center justify-between">
        {/* Left: Department Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md ring-2 ring-amber-300/30">
            <Building2 className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-bold text-slate-100 tracking-tight leading-none">
                Government Infrastructure Asset Management
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded">
                R&B Dept Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              State Public Works & Infrastructure Lifecycle System
            </p>
          </div>
        </div>

        {/* Right: User Profile & Role Switcher */}
        {currentUser ? (
          <div className="flex items-center gap-3">
            {/* Quick Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition-colors"
                title="Switch role for demo purposes"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">{currentUser.role}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase text-slate-400 border-b border-slate-700/60">
                    Switch Active Role (Demo)
                  </div>
                  {(['ADMIN', 'OFFICER', 'VIEWER'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleSwitch(r)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-700/60 flex items-center justify-between text-slate-200"
                    >
                      <span className="font-medium">{r}</span>
                      {currentUser.role === r && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Info Card */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700/60">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-200">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                  {currentUser.department}
                </div>
              </div>
              <span
                className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  roleColors[currentUser.role]
                }`}
              >
                {currentUser.role}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Logout from portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            Officer Login
          </button>
        )}
      </div>
    </header>
  );
};
