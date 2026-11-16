import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  FileCheck,
  History,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            PL
          </div>
          <span className="font-bold text-slate-900">Admin Control</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-600 hover:text-slate-900"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-950 text-slate-300 flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                PL
              </div>
              <div>
                <span className="font-extrabold text-lg text-white">Project<span className="text-emerald-400">Link</span></span>
                <span className="block text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                  Admin Authority
                </span>
              </div>
            </Link>
          </div>

          <div className="px-6 py-4 border-b border-slate-900 bg-slate-900/50 flex items-center gap-3">
            <Avatar src={user?.avatar} alt={user?.name} size="sm" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-amber-400">Super Administrator</p>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            <Link
              to="/admin/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white shadow-xs"
            >
              <LayoutDashboard className="h-4 w-4 text-white" />
              <span>Admin Dashboard</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-900 space-y-2">
          <Link
            to="/projects"
            className="flex items-center justify-between px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
          >
            <span>Public Marketplace</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 transition-colors text-left cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
