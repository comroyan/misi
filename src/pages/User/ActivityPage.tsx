import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, XCircle, ChevronRight, Inbox } from 'lucide-react';
import { Participation } from '../../types';
import { formatRupiah, formatDateIndonesian } from '../../utils/formatters';

interface ActivityPageProps {
  participations: Participation[];
  onSelectParticipation: (participation: Participation) => void;
  onExploreMissions: () => void;
}

export const ActivityPage: React.FC<ActivityPageProps> = ({
  participations,
  onSelectParticipation,
  onExploreMissions,
}) => {
  const getStatusBadge = (status: Participation['status']) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
            DIBAYAR
          </span>
        );
      case 'APPROVED':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
            DISETUJUI
          </span>
        );
      case 'REVISION_REQUIRED':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
            PERLU PERBAIKAN
          </span>
        );
      case 'REJECTED':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
            DITOLAK
          </span>
        );
      case 'UNDER_REVIEW':
      case 'SUBMITTED':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
            DIPERIKSA
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
            BERJALAN
          </span>
        );
    }
  };

  return (
    <div id="user-activity-page" className="pb-24 pt-2">
      <div className="px-4 mb-4">
        <h1 className="text-lg font-bold text-zinc-900">
          Riwayat Aktivitas Kamu
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Semua misi yang dikerjakan pada browser ini tersimpan otomatis tanpa login.
        </p>
      </div>

      <div className="px-4">
        {participations.length > 0 ? (
          <div className="space-y-3">
            {participations.map((part) => (
              <div
                key={part.id}
                id={`activity-card-${part.id}`}
                onClick={() => onSelectParticipation(part)}
                className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-xs hover:border-zinc-300 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-medium text-zinc-500 truncate">
                      {part.brandName}
                    </span>
                    <span className="text-[11px] text-zinc-400">•</span>
                    <span className="text-[11px] text-zinc-500">
                      {formatDateIndonesian(part.submittedAt || part.startedAt)}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-1 mb-2">
                    {part.missionTitle}
                  </h3>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-600">
                      {formatRupiah(part.rewardAmount)}
                    </span>
                    {getStatusBadge(part.status)}
                  </div>
                </div>

                <div className="shrink-0 text-zinc-400">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center my-6">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-800">
              Belum ada riwayat misi
            </h3>
            <p className="text-xs text-zinc-500 mt-1 mb-4 max-w-xs mx-auto">
              Kamu belum mengambil misi apa pun. Mulai misi pertamamu sekarang dan dapatkan reward e-wallet!
            </p>
            <button
              onClick={onExploreMissions}
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              Mulai Misi Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
