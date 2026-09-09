import React, { useState } from 'react';
import { X, Shield, AlertCircle } from 'lucide-react';
import { isValidIndonesianPhone, normalizeIndonesianPhone } from '../../utils/formatters';

interface StartMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, phone: string) => void;
  initialName?: string;
  initialPhone?: string;
  missionTitle?: string;
  rewardAmount?: number;
}

export const StartMissionModal: React.FC<StartMissionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialName = '',
  initialPhone = '',
  missionTitle,
}) => {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError('Mohon masukkan nama lengkap kamu.');
      return;
    }

    if (!isValidIndonesianPhone(phone)) {
      setError('Nomor WhatsApp tidak valid (contoh: 081234567890 atau 6281234567890).');
      return;
    }

    if (!agreed) {
      setError('Kamu perlu mencentang persetujuan instruksi misi.');
      return;
    }

    onConfirm(name.trim(), phone.trim());
  };

  return (
    <div
      id="start-mission-bottom-sheet"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-0 sm:p-4"
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-xl border border-zinc-200 animate-in fade-in slide-in-from-bottom-4 duration-200 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="start-mission-title"
      >
        {/* Handle for mobile feel */}
        <div className="w-10 h-1 rounded-full bg-zinc-300 mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="start-mission-title" className="text-lg font-bold text-zinc-900">
              Sebelum Mulai
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              Tanpa akun & password. Cukup identitas untuk pengiriman reward.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {missionTitle && (
          <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3 mb-4">
            <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">
              Misi yang Dipilih
            </p>
            <p className="text-xs font-semibold text-zinc-800 line-clamp-1 mt-0.5">
              {missionTitle}
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              Nama Lengkap
            </label>
            <input
              id="input-participant-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Royan Ardiansyah"
              className="w-full h-11 px-3.5 rounded-xl border border-zinc-300 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              Nomor WhatsApp Aktif
            </label>
            <input
              id="input-participant-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="081234567890"
              className="w-full h-11 px-3.5 rounded-xl border border-zinc-300 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              required
            />
            <p className="text-[11px] text-zinc-600 mt-1">
              Digunakan untuk verifikasi & konfirmasi pengiriman e-wallet.
            </p>
          </div>

          <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
            <input
              id="checkbox-terms"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 border-zinc-300 focus:ring-emerald-500"
            />
            <span className="text-xs text-zinc-600 leading-relaxed select-none">
              Saya sudah membaca instruksi misi dan setuju mengirim bukti asli tanpa kecurangan.
            </span>
          </label>

          <div className="pt-2">
            <button
              id="btn-confirm-start-mission"
              type="submit"
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              Mulai Misi Sekarang
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-zinc-600">
          <Shield className="w-3.5 h-3.5 text-zinc-600" />
          <span>Data aman, nomor WhatsApp hanya untuk verifikasi hadiah.</span>
        </div>
      </div>
    </div>
  );
};
