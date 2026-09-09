import React from 'react';
import {
  FileCheck,
  Target,
  CheckCircle,
  CreditCard,
  ChevronRight,
  Clock,
  Plus,
} from 'lucide-react';
import { Mission, Submission, PaymentRecord, AuditLog } from '../../types';
import { formatRupiah, formatDateIndonesian } from '../../utils/formatters';

interface AdminOverviewPageProps {
  missions: Mission[];
  submissions: Submission[];
  payments: PaymentRecord[];
  auditLogs: AuditLog[];
  onOpenSubmissions: () => void;
  onOpenMissions: () => void;
  onOpenPayments: () => void;
  onCreateMission: () => void;
  onReviewSubmission: (submission: Submission) => void;
}

export const AdminOverviewPage: React.FC<AdminOverviewPageProps> = ({
  missions,
  submissions,
  payments,
  auditLogs,
  onOpenSubmissions,
  onOpenMissions,
  onOpenPayments,
  onCreateMission,
  onReviewSubmission,
}) => {
  // Metrics calculation
  const pendingReviews = submissions.filter(
    (s) => s.status === 'UNDER_REVIEW' || s.status === 'SUBMITTED'
  );
  const activeMissions = missions.filter((m) => m.status === 'PUBLISHED');
  const approvedToday = submissions.filter(
    (s) => s.status === 'APPROVED' || s.status === 'PAID'
  );
  const unpaidPayments = payments.filter((p) => p.status === 'UNPAID');
  const totalUnpaidAmount = unpaidPayments.reduce((acc, curr) => acc + curr.rewardAmount, 0);

  return (
    <div id="admin-overview-page" className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
            Dashboard Pengelola
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Pantau submission bukti tugas, status pembayaran e-wallet, dan katalog misi aktif.
          </p>
        </div>

        <button
          onClick={onCreateMission}
          className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Misi Baru</span>
        </button>
      </div>

      {/* 4 Critical Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Menunggu Review */}
        <div
          onClick={onOpenSubmissions}
          className="bg-white border border-zinc-200 rounded-2xl p-4 cursor-pointer hover:border-zinc-300 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">Menunggu Review</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900">
            {pendingReviews.length}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Submission perlu diperiksa</p>
        </div>

        {/* Card 2: Misi Aktif */}
        <div
          onClick={onOpenMissions}
          className="bg-white border border-zinc-200 rounded-2xl p-4 cursor-pointer hover:border-zinc-300 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">Misi Terbit</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900">
            {activeMissions.length}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Dapat dikerjakan user</p>
        </div>

        {/* Card 3: Disetujui */}
        <div
          onClick={onOpenSubmissions}
          className="bg-white border border-zinc-200 rounded-2xl p-4 cursor-pointer hover:border-zinc-300 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">Disetujui</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900">
            {approvedToday.length}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Total tugas terverifikasi</p>
        </div>

        {/* Card 4: Reward Belum Dibayar */}
        <div
          onClick={onOpenPayments}
          className="bg-white border border-zinc-200 rounded-2xl p-4 cursor-pointer hover:border-zinc-300 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">Belum Ditransfer</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {formatRupiah(totalUnpaidAmount)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {unpaidPayments.length} antrean e-wallet
          </p>
        </div>
      </div>

      {/* Two Column Layout: Recent Submissions & Active Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Submissions needing review */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-zinc-900">
                Submission Terbaru Masuk
              </h2>
            </div>
            <button
              onClick={onOpenSubmissions}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
            >
              <span>Semua ({submissions.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.slice(0, 5).map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => onReviewSubmission(sub)}
                  className="p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200/80 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[10px] font-bold text-zinc-800 bg-white px-1.5 py-0.5 rounded border border-zinc-200">
                        {sub.submissionCode}
                      </span>
                      <span className="text-xs font-semibold text-zinc-900 truncate">
                        {sub.participantName}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate">
                      {sub.missionTitle}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-600 block">
                      {formatRupiah(sub.rewardAmount)}
                    </span>
                    <span
                      className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        sub.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : sub.status === 'REVISION_REQUIRED'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {sub.status === 'UNDER_REVIEW' ? 'Menunggu' : sub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 py-6 text-center">
              Belum ada submission yang masuk.
            </p>
          )}
        </div>

        {/* Right Column: Active Missions */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-zinc-900">
                Misi Aktif di Website
              </h2>
            </div>
            <button
              onClick={onOpenMissions}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
            >
              <span>Kelola Misi ({missions.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeMissions.slice(0, 5).map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-medium text-zinc-500">
                      {m.brandName}
                    </span>
                    {m.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-zinc-900 truncate">
                    {m.title}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-600 block">
                    {formatRupiah(m.rewardAmount)}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {m.takenSlots}/{m.maxSlots} Slot
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
