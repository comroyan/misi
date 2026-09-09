import React from 'react';
import { Clock, CheckSquare, Users } from 'lucide-react';
import { Mission } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface MissionCardProps {
  mission: Mission;
  onSelect: (mission: Mission) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({ mission, onSelect }) => {
  const isAvailable = mission.takenSlots < mission.maxSlots;
  const remainingSlots = Math.max(0, mission.maxSlots - mission.takenSlots);

  return (
    <div
      id={`mission-card-${mission.id}`}
      className="bg-white border border-zinc-200/90 rounded-2xl p-4 transition-all duration-150 hover:border-zinc-300 hover:shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Header row: Brand & Single Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {mission.brandLogoUrl ? (
              <img
                src={mission.brandLogoUrl}
                alt={mission.brandName}
                className="w-5 h-5 rounded-full object-cover shrink-0 border border-zinc-100"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-semibold flex items-center justify-center shrink-0">
                {mission.brandName.charAt(0)}
              </div>
            )}
            <span className="text-xs font-medium text-zinc-600 truncate">
              {mission.brandName}
            </span>
          </div>

          {mission.badge && (
            <span
              className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                mission.badge === 'Terbatas'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200/70'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
              }`}
            >
              {mission.badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-zinc-900 text-[15px] leading-snug line-clamp-2 mb-2">
          {mission.title}
        </h3>

        {/* Reward */}
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-xs text-zinc-600 font-normal">Reward</span>
          <span className="text-lg font-bold text-emerald-600 tracking-tight">
            {formatRupiah(mission.rewardAmount)}
          </span>
        </div>
      </div>

      {/* Meta info & Action */}
      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-zinc-600">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-600" />
            {mission.estimatedMinutes} mnt
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5 text-zinc-600" />
            {mission.steps.length} langkah
          </span>
        </div>

        <button
          id={`btn-view-mission-${mission.id}`}
          onClick={() => onSelect(mission)}
          className="h-9 px-3.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold transition-colors flex items-center justify-center shrink-0"
        >
          Lihat Misi
        </button>
      </div>
    </div>
  );
};
