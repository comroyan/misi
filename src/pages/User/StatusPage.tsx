import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Home,
} from 'lucide-react';
import { Participation } from '../../types';
import { StatusTimeline } from '../../components/Status/StatusTimeline';
import { formatRupiah, formatDateIndonesian } from '../../utils/formatters';

interface StatusPageProps {
  participation: Participation;
  onBackToHome: () => void;
  onStartRevision?: (participation: Participation, stepId: string) => void;
}

export const StatusPage: React.FC<StatusPageProps> = ({
  participation,
  onBackToHome,
  onStartRevision,
}) => {
  const isRevisionRequired = participation.status === 'REVISION_REQUIRED';
  const isApproved = participation.status === 'APPROVED' || participation.status === 'PAID';
  const isRejected = participation.status === 'REJECTED';

  return (
    <div id="status-tracking-view" className="pb-24 pt-2">
      {/* Top Header */}
      <div className="px-4 mb-4 flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="h-9 px-2.5 -ml-1 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ke Beranda</span>
        </button>

        <span className="font-mono text-xs font-bold text-zinc-800 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg">
          {participation.submissionCode || 'MS-XXXXX'}
        </span>
      </div>

      <div className="px-4 space-y-4">
        {/* REVISION ALERT BANNER (If admin requested revision) */}
        {isRevisionRequired && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Ada Bukti yang Perlu Diperbaiki
                </h2>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  Catatan Admin:{' '}
                  <strong>
                    {participation.revisionReason || 'Mohon upload ulang bukti screenshot.'}
                  </strong>
                </p>

                {participation.revisionStepId && onStartRevision && (
                  <button
                    onClick={() =>
                      onStartRevision(participation, participation.revisionStepId!)
                    }
                    className="mt-3 h-9 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Perbaiki Bukti Sekarang</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* REJECTED ALERT BANNER */}
        {isRejected && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Submission Belum Memenuhi Syarat
            </h2>
            <p className="text-xs text-rose-800 mt-1">
              Catatan: {participation.revisionReason || 'Bukti belum sesuai instruksi misi.'}
            </p>
          </div>
        )}

        {/* APPROVED SUCCESS BANNER */}
        {isApproved && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Bukti Disetujui!
              </h2>
            </div>
            <p className="text-xs text-emerald-800">
              Reward sebesar{' '}
              <strong>{formatRupiah(participation.rewardAmount)}</strong> sedang dalam antrean
              transfer e-wallet kamu.
            </p>
          </div>
        )}

        {/* Mission & Participant Summary Card */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>{participation.brandName}</span>
            <span>{formatDateIndonesian(participation.submittedAt || participation.startedAt)}</span>
          </div>

          <h1 className="text-base font-bold text-zinc-900 leading-snug mb-3">
            {participation.missionTitle}
          </h1>

          <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Estimasi Reward</span>
              <span className="font-bold text-emerald-600 text-sm">
                {formatRupiah(participation.rewardAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Penerima</span>
              <span className="font-semibold text-zinc-800">
                {participation.participantName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Nomor WhatsApp</span>
              <span className="font-mono text-zinc-700">
                {participation.participantPhoneMasked}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-zinc-200">
              <span className="text-zinc-500">Kode Bukti</span>
              <span className="font-mono font-bold text-zinc-900">
                {participation.submissionCode || 'MS-XXXXX'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Timeline Card */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
            Status Pelacakan Bukti
          </h2>
          <p className="text-xs text-zinc-500 mb-4">
            {isApproved
              ? 'Pekerjaan kamu telah selesai diverifikasi oleh tim admin.'
              : isRevisionRequired
              ? 'Terdapat bukti yang perlu kamu unggah ulang sebelum dapat disetujui.'
              : 'Biasanya admin akan memeriksa bukti dalam 1x24 jam sebelum reward dikonfirmasi.'}
          </p>

          <StatusTimeline status={participation.status} />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onBackToHome}
            className="w-full h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Jelajah Misi Lainnya</span>
          </button>
        </div>
      </div>
    </div>
  );
};
