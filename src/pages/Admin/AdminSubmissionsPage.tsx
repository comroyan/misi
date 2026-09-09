import React, { useState } from 'react';
import { Search, Eye, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { Submission, SubmissionStatus } from '../../types';
import { formatRupiah, formatDateIndonesian } from '../../utils/formatters';

interface AdminSubmissionsPageProps {
  submissions: Submission[];
  onReviewSubmission: (submission: Submission) => void;
}

export const AdminSubmissionsPage: React.FC<AdminSubmissionsPageProps> = ({
  submissions,
  onReviewSubmission,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SubmissionStatus>('ALL');

  const filtered = submissions.filter((s) => {
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'UNDER_REVIEW') {
        if (s.status !== 'UNDER_REVIEW' && s.status !== 'SUBMITTED') return false;
      } else if (s.status !== statusFilter) {
        return false;
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.submissionCode.toLowerCase().includes(q) ||
        s.participantName.toLowerCase().includes(q) ||
        s.participantPhone.includes(q) ||
        s.missionTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3" />
            <span>Disetujui</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3" />
            <span>Ditolak</span>
          </span>
        );
      case 'REVISION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
            <AlertTriangle className="w-3 h-3" />
            <span>Revisi</span>
          </span>
        );
      case 'UNDER_REVIEW':
      case 'SUBMITTED':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" />
            <span>Menunggu</span>
          </span>
        );
    }
  };

  return (
    <div id="admin-submissions-page" className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-zinc-200">
        <h1 className="text-xl font-bold text-zinc-900">
          Verifikasi Submission Bukti
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Periksa screenshot bukti pengerjaan tugas, setujui, minta perbaikan, atau tolak.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode, nama, atau no WhatsApp..."
            className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full self-start sm:self-auto">
          {[
            { key: 'ALL', label: 'Semua' },
            { key: 'UNDER_REVIEW', label: 'Menunggu' },
            { key: 'REVISION_REQUIRED', label: 'Revisi' },
            { key: 'APPROVED', label: 'Disetujui' },
            { key: 'REJECTED', label: 'Ditolak' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key as any)}
              className={`h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === item.key
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Kode Bukti</th>
                <th className="px-4 py-3">Misi</th>
                <th className="px-4 py-3">Pengirim</th>
                <th className="px-4 py-3">Reward</th>
                <th className="px-4 py-3">Waktu Masuk</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-700">
              {filtered.length > 0 ? (
                filtered.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-zinc-50/60 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-zinc-900">
                      {sub.submissionCode}
                    </td>
                    <td className="px-4 py-3.5 max-w-[200px]">
                      <div className="font-semibold text-zinc-900 truncate">
                        {sub.missionTitle}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-zinc-900">
                        {sub.participantName}
                      </div>
                      <div className="text-zinc-500 text-[11px]">
                        {sub.participantPhoneMasked}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600">
                      {formatRupiah(sub.rewardAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-500 text-[11px]">
                      {formatDateIndonesian(sub.submittedAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => onReviewSubmission(sub)}
                        className="h-8 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review Bukti</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                    Tidak ada data submission yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
