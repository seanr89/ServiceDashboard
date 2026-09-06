import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, Cpu, HardDriveDownload, Send, LayoutDashboard, Activity, Server, FileText } from 'lucide-react';

interface NavbarProps {
  filesCount?: number;
  accountsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ filesCount = 0, accountsCount = 7 }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20 text-slate-950 transition-transform group-hover:scale-105">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-100 text-lg tracking-tight">Service Account</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  Local Files v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Account Records Portal</p>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-800/90 text-cyan-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/accounts"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-800/90 text-cyan-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <Cpu className="w-4 h-4" />
              <span>Accounts & Clusters</span>
              <span className="px-1.5 py-0.2 text-[10px] font-mono rounded bg-slate-900 text-slate-400 border border-slate-800">
                {accountsCount}
              </span>
            </NavLink>

            <NavLink
              to="/request"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-800/90 text-cyan-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <Send className="w-4 h-4" />
              <span>Request Service Info</span>
            </NavLink>

            <NavLink
              to="/reviews"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-800/90 text-cyan-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <HardDriveDownload className="w-4 h-4" />
              <span>Local File Reviews</span>
              {filesCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  {filesCount}
                </span>
              )}
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};
