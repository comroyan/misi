import React from 'react';
import {
  ArrowLeft,
  Clock,
  CheckSquare,
  Users,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Mission } from '../../types';
import { formatRupiah, formatDateIndonesian } from '../../utils/formatters';

interface MissionDetailPageProps {
  mission: Mission;
  onBack: () => void;
  onStartMission: (mission: Mission) => void;
}

export const MissionDetailPage: React.FC<MissionDetailPageProps> = ({
  mission,
  onBack,
  onStartMission,
}) => {
  const remainingSlots = Math.max(0, mission.maxSlots - mission.takenSlots);
  const isAvailable = remainingSlots > 0;

  return (
    <div id="mission-detail-view" className="pb-28 pt-2">
      {/* Top back button row */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="h-9 px-2.5 -ml-1 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        {mission.badge && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            {mission.badge}
          </span>
        )}
      </div>

      {/* Main Content Card */}
      <div className="px-4">
        {/* Visual Cover Banner if available */}
        {mission.coverUrl && (
          <div className="w-full h-40 sm:h-48 rounded-2xl overflow-hidden mb-4 border border-zinc-200 relative">
            <img
              src={mission.coverUrl}
              alt={mission.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Title, Brand, Reward Header */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-xs mb-4">
          <div className="flex items-center gap-2 mb-2">
            {mission.brandLogoUrl && (
              <img
                src={mission.brandLogoUrl}
                alt={mission.brandName}
                className="w-5 h-5 rounded-full object-cover border border-zinc-100"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="text-xs font-semibold text-zinc-500">
              {mission.brandName}
            </span>
          </div>

          <h1 className="text-lg sm:text-xl font-bold text-zinc-900 leading-snug mb-3">
            {mission.title}
          </h1>

          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-medium text-emerald-800">
                Reward Kamu
              </span>
              <div className="text-xl font-extrabold text-emerald-600 tracking-tight">
                {formatRupiah(mission.rewardAmount)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-zinc-500 block">Sisa Kuota</span>
              <span className="text-xs font-bold text-zinc-800">
                {remainingSlots} / {mission.maxSlots} slot
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-zinc-100 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>Estimasi: <strong>{mission.estimatedMinutes} Menit</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-zinc-400" />
              <span>Langkah: <strong>{mission.steps.length} Tahap</strong></span>
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-xs mb-4">
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
            Tentang Misi Ini
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
            {mission.description}
          </p>
        </div>

        {/* Section: Cara Mengerjakan (Preview Step) */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-xs mb-4">
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">
            Cara Mengerjakan ({mission.steps.length} Langkah)
          </h2>

          <div className="space-y-3">
            {mission.steps.map((step, idx) => (
              <div
                key={step.id}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100"
              >
                <div className="w-6 h-6 rounded-lg bg-zinc-200 text-zinc-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-zinc-900">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Yang Perlu Diperhatikan */}
        {mission.termsAndConditions && mission.termsAndConditions.length > 0 && (
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-xs mb-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Yang Perlu Diperhatikan
              </h2>
            </div>

            <ul className="space-y-2 text-xs text-zinc-600">
              {mission.termsAndConditions.map((term, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* In-content CTA button directly below steps */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 sm:p-5 mb-8 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-emerald-800">Total Hadiah Misi</p>
              <p className="text-xl font-extrabold text-emerald-600">{formatRupiah(mission.rewardAmount)}</p>
            </div>
            <div className="text-right text-xs">
              <span className="text-zinc-500 block">Sisa Kuota</span>
              <span className="font-bold text-zinc-800">{remainingSlots} / {mission.maxSlots}</span>
            </div>
          </div>
          <button
            id="btn-content-start-mission"
            onClick={() => onStartMission(mission)}
            disabled={!isAvailable}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isAvailable ? 'Mulai Kerjakan Misi Sekarang' : 'Kuota Misi Penuh'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sticky Bottom CTA for Mobile */}
      <div
        id="sticky-mission-cta"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-zinc-500 block">Total Hadiah</span>
            <span className="text-base font-extrabold text-emerald-600">
              {formatRupiah(mission.rewardAmount)}
            </span>
          </div>

          <button
            id="btn-sticky-start-mission"
            onClick={() => onStartMission(mission)}
            disabled={!isAvailable}
            className="flex-1 max-w-xs h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Mulai Misi</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
