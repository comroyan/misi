import React, { useState } from 'react';
import { X, CheckCircle, CreditCard } from 'lucide-react';
import { PaymentRecord, PaymentStatus } from '../../types';
import { formatRupiah, formatDateIndonesian } from '../../utils/formatters';

interface PaymentModalProps {
  payment: PaymentRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentId: string, updates: Partial<PaymentRecord>) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  payment,
  isOpen,
  onClose,
  onSave,
}) => {
  const [status, setStatus] = useState<PaymentStatus>(payment.status);
  const [method, setMethod] = useState(payment.method || 'DANA');
  const [accountNumber, setAccountNumber] = useState(payment.accountNumber || '');
  const [referenceNote, setReferenceNote] = useState(payment.referenceNote || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(payment.id, {
        status,
        method: method as any,
        accountNumber,
        referenceNote,
        paidAt: status === 'PAID' ? new Date().toISOString() : undefined,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="payment-modal-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-xs p-4"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-zinc-200 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Pencairan Reward
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                {payment.submissionCode}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info card */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 mb-4 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-zinc-500">Nama Penerima</span>
            <span className="font-semibold text-zinc-900">{payment.participantName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">WhatsApp</span>
            <span className="font-medium text-zinc-800">{payment.participantPhoneMasked}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-zinc-200">
            <span className="text-zinc-500 font-medium">Nominal Reward</span>
            <span className="font-bold text-emerald-600 text-sm">
              {formatRupiah(payment.rewardAmount)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Status Pembayaran
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PaymentStatus)}
              className="w-full h-10 px-3 rounded-xl border border-zinc-300 bg-white text-xs font-semibold text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              <option value="UNPAID">UNPAID (Belum Ditransfer)</option>
              <option value="PROCESSING">PROCESSING (Sedang Diproses)</option>
              <option value="PAID">PAID (Sudah Berhasil Ditransfer)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Metode E-Wallet
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900"
              >
                <option value="DANA">DANA</option>
                <option value="GOPAY">GoPay</option>
                <option value="SHOPEEPAY">ShopeePay</option>
                <option value="OVO">OVO</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Nomor Akun / HP
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="0812..."
                className="w-full h-10 px-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Catatan / ID Referensi Transfer
            </label>
            <input
              type="text"
              value={referenceNote}
              onChange={(e) => setReferenceNote(e.target.value)}
              placeholder="Contoh: Trx DANA #829104812"
              className="w-full h-10 px-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pembayaran'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-medium hover:bg-zinc-50"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
