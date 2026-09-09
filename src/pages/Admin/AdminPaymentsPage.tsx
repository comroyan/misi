import React, { useState } from 'react';
import { Search, CreditCard, CheckCircle, Clock, Check } from 'lucide-react';
import { PaymentRecord, PaymentStatus } from '../../types';
import { formatRupiah, formatDateIndonesian } from '../../utils/formatters';

interface AdminPaymentsPageProps {
  payments: PaymentRecord[];
  onOpenPaymentModal: (payment: PaymentRecord) => void;
  onQuickMarkPaid: (paymentId: string) => Promise<void>;
}

export const AdminPaymentsPage: React.FC<AdminPaymentsPageProps> = ({
  payments,
  onOpenPaymentModal,
  onQuickMarkPaid,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');

  const filtered = payments.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.submissionCode.toLowerCase().includes(q) ||
        p.participantName.toLowerCase().includes(q) ||
        p.participantPhone.includes(q) ||
        p.missionTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalUnpaid = payments
    .filter((p) => p.status === 'UNPAID')
    .reduce((acc, c) => acc + c.rewardAmount, 0);

  return (
    <div id="admin-payments-page" className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">
            Pencairan & Pembayaran Reward
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Daftar tugas terverifikasi yang siap dicairkan ke e-wallet peserta.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-right">
          <span className="text-[11px] font-medium text-amber-800 block">
            Antrean Belum Ditransfer
          </span>
          <span className="text-base font-extrabold text-amber-700">
            {formatRupiah(totalUnpaid)}
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode atau penerima..."
            className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(['ALL', 'UNPAID', 'PROCESSING', 'PAID'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {st === 'ALL'
                ? 'Semua'
                : st === 'UNPAID'
                ? 'Belum Ditransfer'
                : st === 'PROCESSING'
                ? 'Proses'
                : 'Sudah Ditransfer'}
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
                <th className="px-4 py-3">Penerima & WhatsApp</th>
                <th className="px-4 py-3">Misi</th>
                <th className="px-4 py-3">Nominal Reward</th>
                <th className="px-4 py-3">Metode & Akun</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-700">
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-zinc-900">
                      {p.submissionCode}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-zinc-900">
                        {p.participantName}
                      </div>
                      <div className="text-zinc-500 text-[11px]">
                        {p.participantPhoneMasked}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-[180px]">
                      <div className="truncate font-medium text-zinc-800">
                        {p.missionTitle}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600">
                      {formatRupiah(p.rewardAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      <span className="font-medium text-zinc-800">
                        {p.method || 'DANA'}
                      </span>
                      {p.accountNumber && (
                        <div className="text-[11px] text-zinc-500 font-mono">
                          {p.accountNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : p.status === 'PROCESSING'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {p.status === 'PAID'
                          ? 'SUDAH DITRANSFER'
                          : p.status === 'PROCESSING'
                          ? 'DIPROSES'
                          : 'BELUM DITRANSFER'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status !== 'PAID' && (
                          <button
                            onClick={() => onQuickMarkPaid(p.id)}
                            className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
                            title="Tandai Sudah Ditransfer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Tandai Lunas</span>
                          </button>
                        )}
                        <button
                          onClick={() => onOpenPaymentModal(p)}
                          className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 font-semibold text-xs transition-colors"
                        >
                          Kelola
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                    Tidak ada pembayaran ditemukan.
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
