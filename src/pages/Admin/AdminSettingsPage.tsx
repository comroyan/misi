import React, { useState } from 'react';
import { Save, Settings, MessageSquare, Shield, CheckCircle, Lock, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { PlatformSettings } from '../../types';
import { updateAdminPassword } from '../../lib/firebase';

interface AdminSettingsPageProps {
  settings: PlatformSettings;
  onSaveSettings: (settings: PlatformSettings) => Promise<void>;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [platformName, setPlatformName] = useState(settings.platformName || 'MisiKu');
  const [whatsappNotificationNumber, setWhatsappNotificationNumber] = useState(
    settings.whatsappNotificationNumber || '6281234567890'
  );
  const [whatsappSupportNumber, setWhatsappSupportNumber] = useState(
    settings.whatsappSupportNumber || '6281234567890'
  );
  const [maintenanceMode, setMaintenanceMode] = useState(
    settings.maintenanceMode || false
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [isUpdatingPw, setIsUpdatingPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSettings({
        platformName,
        whatsappNotificationNumber,
        whatsappSupportNumber,
        maintenanceMode,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (newPassword.length < 6) {
      setPwError('Password baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setIsUpdatingPw(true);
    try {
      const res = await updateAdminPassword(currentPassword, newPassword);
      if (res.success) {
        setPwSuccess(res.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => setPwSuccess(null), 5000);
      } else {
        setPwError(res.message);
      }
    } catch (err: any) {
      setPwError(err.message || 'Gagal mengubah password.');
    } finally {
      setIsUpdatingPw(false);
    }
  };

  return (
    <div id="admin-settings-page" className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto">
      <div className="pb-3 border-b border-zinc-200">
        <h1 className="text-xl font-bold text-zinc-900">
          Pengaturan Platform & Keamanan
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Konfigurasi nama sistem, integrasi notifikasi WhatsApp, dan ubah kata sandi admin.
        </p>
      </div>

      {isSaved && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan berhasil disimpan.</span>
        </div>
      )}

      {/* General Platform Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-100">
            Identitas Platform
          </h2>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Nama Platform
            </label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              required
            />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Integrasi Notifikasi WhatsApp Admin
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Nomor WhatsApp Penerima Notifikasi Submission Baru (Admin)
            </label>
            <input
              type="text"
              value={whatsappNotificationNumber}
              onChange={(e) => setWhatsappNotificationNumber(e.target.value)}
              placeholder="6281234567890"
              className="w-full h-10 px-3 rounded-xl border border-zinc-300 text-xs font-mono text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              required
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Setiap kali pengunjung mengirim bukti tugas baru, server akan mengirim notifikasi WhatsApp ringkas ke nomor ini.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Nomor WhatsApp Official Support (Untuk Pengunjung)
            </label>
            <input
              type="text"
              value={whatsappSupportNumber}
              onChange={(e) => setWhatsappSupportNumber(e.target.value)}
              placeholder="6281234567890"
              className="w-full h-10 px-3 rounded-xl border border-zinc-300 text-xs font-mono text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              required
            />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-100">
            Mode Pemeliharaan
          </h2>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 border-zinc-300 focus:ring-emerald-500"
            />
            <div>
              <span className="text-xs font-semibold text-zinc-800">
                Aktifkan Mode Maintenance
              </span>
              <p className="text-[11px] text-zinc-400">
                Jika diaktifkan, halaman pengguna akan menampilkan pengumuman pemeliharaan sistem.
              </p>
            </div>
          </label>
        </div>

        <div className="pt-1 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </form>

      {/* Security & Password Change Section */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
          <Lock className="w-4 h-4 text-zinc-700" />
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Keamanan Akun & Ganti Password Admin
          </h2>
        </div>

        <p className="text-xs text-zinc-500">
          Ubah kata sandi untuk login admin via tautan rahasia URL <code className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-zinc-700">#admin</code>.
        </p>

        {pwError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{pwError}</span>
          </div>
        )}

        {pwSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{pwSuccess}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Password Saat Ini (Lama)
            </label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password saat ini"
                className="w-full h-10 px-3 pr-10 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                tabIndex={-1}
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[11px] text-zinc-400 mt-1 block">
              Default awal akun baru: <code className="font-mono text-zinc-600">admin123456</code>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full h-10 px-3 pr-10 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Konfirmasi Password Baru
              </label>
              <input
                type={showNewPw ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full h-10 px-3 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingPw}
              className="h-10 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isUpdatingPw ? 'Mengubah...' : 'Perbarui Password Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
