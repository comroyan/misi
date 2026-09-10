import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import { verifyAdminCredentials } from '../../lib/firebase';

interface AdminLoginPageProps {
  onLoginSuccess: (email: string) => void;
  onBackToApp: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToApp,
}) => {
  const [email, setEmail] = useState('admin@misiku.id');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await verifyAdminCredentials(email.trim(), password.trim());
      if (res.success) {
        sessionStorage.setItem('misiku_admin_auth', email.trim());
        onLoginSuccess(email.trim());
      } else {
        setError(res.message || 'Email atau password salah.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memverifikasi login admin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="admin-login-screen"
      className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-4"
    >
      <div className="w-full max-w-sm">
        {/* Back Link */}
        <button
          onClick={onBackToApp}
          className="mb-6 text-xs font-semibold text-zinc-500 hover:text-zinc-800 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Halaman Misi</span>
        </button>

        {/* Login Card */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white font-bold text-sm flex items-center justify-center">
              M
            </div>
            <div>
              <h1 className="text-base font-bold text-zinc-900 leading-none">
                MisiKu Admin
              </h1>
              <p className="text-[11px] text-zinc-500 mt-1">
                Portal Internal Pengelola Platform
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Email Admin
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@misiku.id"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin"
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

