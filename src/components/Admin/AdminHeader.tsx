import React from 'react';
import { Menu, LogOut, ExternalLink, Shield } from 'lucide-react';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  onLogout: () => void;
  adminEmail?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  onLogout,
  adminEmail = 'admin@misiku.id',
}) => {
  return (
    <header
      id="admin-top-header"
      className="sticky top-0 z-30 bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          aria-label="Buka Menu Admin"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
            M
          </div>
          <span className="font-bold text-zinc-900 text-sm tracking-tight">
            MisiKu <span className="font-normal text-zinc-600">Admin</span>
          </span>
          <span className="hidden sm:inline-flex text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
            Internal Panel
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <span>Buka Web User</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 text-xs text-zinc-700">
          <Shield className="w-3.5 h-3.5 text-zinc-600" />
          <span className="max-w-[140px] truncate">{adminEmail}</span>
        </div>

        <button
          onClick={onLogout}
          className="h-8 px-2.5 rounded-lg border border-zinc-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-zinc-600 text-xs font-medium flex items-center gap-1.5 transition-colors"
          title="Keluar dari Admin"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};
