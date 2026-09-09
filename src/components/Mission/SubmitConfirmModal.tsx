import React from 'react';
import { X, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface SubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  missionTitle: string;
  totalSteps: number;
  completedSteps: number;
  rewardAmount: number;
  participantName: string;
  participantPhoneMasked: string;
}

export const SubmitConfirmModal: React.FC<SubmitConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  missionTitle,
  totalSteps,
  completedSteps,
  rewardAmount,
  participantName,
  participantPhoneMasked,
}) => {
  if (!isOpen) return null;

  const isAllComplete = completedSteps >= totalSteps;

  return (
    <div
      id="submit-mission-confirm-sheet"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-0 sm:p-4"
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-xl border border-zinc-200 animate-in fade-in slide-in-from-bottom-4 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-submit-title"
      >
        <div className="w-10 h-1 rounded-full bg-zinc-300 mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="confirm-submit-title" className="text-base font-bold text-zinc-900">
                Kirim Misi Sekarang?
              </h2>
              <p className="text-xs text-zinc-600">
                Pastikan semua bukti yang kamu kirim sudah benar.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-zinc-50 border border-zinc-200/90 rounded-xl p-4 mb-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-600">Misi</span>
            <span className="font-semibold text-zinc-900 text-right max-w-[200px] truncate">
              {missionTitle}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-600">Progres Langkah</span>
            <span className="font-semibold text-emerald-700">
              {completedSteps} dari {totalSteps} selesai
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-600">Penerima Reward</span>
            <span className="font-medium text-zinc-800">
              {participantName} ({participantPhoneMasked})
            </span>
          </div>

          <div className="pt-2 border-t border-zinc-200/80 flex items-baseline justify-between">
            <span className="text-xs font-semibold text-zinc-900">Estimasi Reward</span>
            <span className="text-base font-bold text-emerald-600">
              {formatRupiah(rewardAmount)}
            </span>
          </div>
        </div>

        {!isAllComplete && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              Ada langkah yang belum dilengkapi. Selesaikan semua langkah agar bukti kamu dapat
              disetujui admin.
            </span>
          </div>
        )}

        <div className="space-y-2 pt-1">
          <button
            id="btn-confirm-final-submit"
            onClick={onConfirm}
            disabled={isSubmitting || !isAllComplete}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Mengirim Bukti...</span>
            ) : (
              <span>Kirim Sekarang</span>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 font-medium text-xs transition-colors"
          >
            Periksa Kembali
          </button>
        </div>
      </div>
    </div>
  );
};
