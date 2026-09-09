import React from 'react';
import { Check, Clock, AlertCircle, XCircle, DollarSign } from 'lucide-react';
import { ParticipationStatus } from '../../types';

interface StatusTimelineProps {
  status: ParticipationStatus;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ status }) => {
  // Steps in timeline:
  // 1. Misi Dimulai
  // 2. Bukti Dikirim
  // 3. Sedang Diperiksa
  // 4. Reward / Selesai

  const getStepState = (stepIndex: number) => {
    // 0: Started, 1: Submitted, 2: Under Review, 3: Paid/Approved
    if (status === 'REJECTED') {
      if (stepIndex === 0 || stepIndex === 1) return 'completed';
      if (stepIndex === 2) return 'rejected';
      return 'pending';
    }

    if (status === 'REVISION_REQUIRED') {
      if (stepIndex === 0 || stepIndex === 1) return 'completed';
      if (stepIndex === 2) return 'warning';
      return 'pending';
    }

    if (status === 'PAID') {
      return 'completed';
    }

    if (status === 'APPROVED') {
      if (stepIndex <= 2) return 'completed';
      return 'active'; // waiting for payment transfer
    }

    if (status === 'UNDER_REVIEW' || status === 'SUBMITTED') {
      if (stepIndex <= 1) return 'completed';
      if (stepIndex === 2) return 'active';
      return 'pending';
    }

    if (status === 'IN_PROGRESS' || status === 'STARTED') {
      if (stepIndex === 0) return 'completed';
      if (stepIndex === 1) return 'active';
      return 'pending';
    }

    return 'pending';
  };

  const timelineSteps = [
    { label: 'Misi Dimulai', desc: 'Langkah pengerjaan aktif' },
    { label: 'Bukti Dikirim', desc: 'Semua screenshot tersimpan' },
    {
      label:
        status === 'REVISION_REQUIRED'
          ? 'Perlu Perbaikan'
          : status === 'REJECTED'
          ? 'Verifikasi Ditolak'
          : 'Sedang Diperiksa',
      desc:
        status === 'REVISION_REQUIRED'
          ? 'Admin meminta bukti diunggah ulang'
          : status === 'REJECTED'
          ? 'Bukti belum memenuhi syarat'
          : 'Admin meninjau keaslian bukti',
    },
    {
      label: status === 'PAID' ? 'Reward Terkirim' : 'Pencairan Hadiah',
      desc: status === 'PAID' ? 'Saldo berhasil ditransfer' : 'E-wallet / Saldo DANA',
    },
  ];

  return (
    <div id="submission-status-timeline" className="space-y-4 py-2">
      {timelineSteps.map((step, idx) => {
        const state = getStepState(idx);
        const isLast = idx === timelineSteps.length - 1;

        return (
          <div key={idx} className="flex items-start gap-3 relative">
            {/* Connecting line */}
            {!isLast && (
              <div
                className={`absolute left-3.5 top-7 bottom-0 w-0.5 -mb-2 ${
                  state === 'completed' ? 'bg-emerald-600' : 'bg-zinc-200'
                }`}
              />
            )}

            {/* Icon Node */}
            <div
              className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                state === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : state === 'active'
                  ? 'bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50'
                  : state === 'warning'
                  ? 'bg-amber-100 text-amber-800 ring-4 ring-amber-50'
                  : state === 'rejected'
                  ? 'bg-rose-100 text-rose-700 ring-4 ring-rose-50'
                  : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              {state === 'completed' && <Check className="w-4 h-4 stroke-[2.5]" />}
              {state === 'active' && <Clock className="w-4 h-4 animate-pulse" />}
              {state === 'warning' && <AlertCircle className="w-4 h-4" />}
              {state === 'rejected' && <XCircle className="w-4 h-4" />}
              {state === 'pending' && <span className="w-2 h-2 rounded-full bg-zinc-300" />}
            </div>

            {/* Text details */}
            <div className="pt-0.5 pb-2">
              <p
                className={`text-xs font-semibold leading-tight ${
                  state === 'completed' || state === 'active'
                    ? 'text-zinc-900'
                    : state === 'warning'
                    ? 'text-amber-800'
                    : state === 'rejected'
                    ? 'text-rose-700'
                    : 'text-zinc-600'
                }`}
              >
                {step.label}
              </p>
              <p className="text-[11px] text-zinc-600 leading-snug mt-0.5">
                {step.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
