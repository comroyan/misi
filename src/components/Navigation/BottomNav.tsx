import React from 'react';
import { Home, Compass, Clock, HelpCircle } from 'lucide-react';

export type NavTab = 'home' | 'missions' | 'activity' | 'help';
export type UserNavTab = NavTab;

interface BottomNavProps {
  currentTab?: NavTab;
  activeTab?: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeActivityCount?: number;
  activityCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  activeTab,
  onSelectTab,
  activeActivityCount = 0,
  activityCount = 0,
}) => {
  const selectedTab = currentTab || activeTab || 'home';
  const badgeCount = activeActivityCount || activityCount || 0;
  const navItems: { key: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'home', label: 'Beranda', icon: Home },
    { key: 'missions', label: 'Misi', icon: Compass },
    { key: 'activity', label: 'Aktivitas', icon: Clock },
    { key: 'help', label: 'Bantuan', icon: HelpCircle },
  ];

  return (
    <nav
      id="app-bottom-navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 py-1.5 px-3 pb-[calc(0.375rem+env(safe-area-inset-bottom))]"
      role="navigation"
      aria-label="Navigasi Utama"
    >
      <div className="max-w-xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = selectedTab === item.key;
          return (
            <button
              key={item.key}
              id={`bottom-nav-${item.key}`}
              onClick={() => onSelectTab(item.key)}
              className={`relative flex flex-col items-center justify-center min-w-[64px] h-12 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-700 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 font-medium'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-emerald-600 stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />
                {item.key === 'activity' && badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-tight mt-1 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
