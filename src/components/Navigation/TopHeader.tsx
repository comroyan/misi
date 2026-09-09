import React from 'react';
import { ShieldCheck, HelpCircle } from 'lucide-react';

interface TopHeaderProps {
  platformName?: string;
  onHelpClick?: () => void;
  showHelpIcon?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  platformName = 'MisiKu',
  onHelpClick,
  showHelpIcon = true,
}) => {
  return (
    <header
      id="app-top-header"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-zinc-200 px-4 py-3"
    >
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <a
          id="header-brand-link"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = '';
          }}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-xs group-hover:bg-emerald-700 transition-colors">
            M
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-900 text-base leading-tight tracking-tight">
                {platformName}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/60">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Resmi
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-none mt-0.5 font-normal">
              Misi Berhadiah Harian
            </p>
          </div>
        </a>

        {showHelpIcon && (
          <button
            id="header-help-button"
            onClick={onHelpClick}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Pusat Bantuan"
            aria-label="Pusat Bantuan"
          >
            <HelpCircle className="w-5 h-5 text-zinc-700" />
          </button>
        )}
      </div>
    </header>
  );
};

