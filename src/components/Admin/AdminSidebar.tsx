import React from 'react';
import {
  LayoutDashboard,
  Target,
  FileCheck,
  CreditCard,
  Image,
  Settings,
  History,
  X,
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'missions'
  | 'submissions'
  | 'payments'
  | 'banners'
  | 'settings'
  | 'audit';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  pendingReviewsCount?: number;
  unpaidPaymentsCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  pendingReviewsCount = 0,
  unpaidPaymentsCount = 0,
}) => {
  const menuItems: {
    key: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeCount?: number;
  }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'missions', label: 'Misi & Tugas', icon: Target },
    {
      key: 'submissions',
      label: 'Submission Bukti',
      icon: FileCheck,
      badgeCount: pendingReviewsCount,
    },
    {
      key: 'payments',
      label: 'Pembayaran Reward',
      icon: CreditCard,
      badgeCount: unpaidPaymentsCount,
    },
    { key: 'banners', label: 'Banner Promosi', icon: Image },
    { key: 'settings', label: 'Pengaturan', icon: Settings },
    { key: 'audit', label: 'Audit Log', icon: History },
  ];

  const handleSelect = (tab: AdminTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="admin-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header in mobile */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
              M
            </div>
            <span className="font-bold text-zinc-900 text-sm">Navigasi Admin</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="p-3 flex-1 overflow-y-auto space-y-1">
          <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
            Menu Utama
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                id={`admin-nav-${item.key}`}
                onClick={() => handleSelect(item.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-600'}`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50/60">
          <p className="text-[11px] font-medium text-zinc-600">
            Platform MisiKu v1.0
          </p>
          <p className="text-[10px] text-zinc-600 mt-0.5">
            Sistem Misi & Reward Indonesia
          </p>
        </div>
      </aside>
    </>
  );
};
