import React, { useState } from 'react';
import { Plus, Image, Trash2, Eye, EyeOff, Save } from 'lucide-react';
import { Banner } from '../../types';
import { generateUUID } from '../../utils/tokens';

interface AdminBannersPageProps {
  banners: Banner[];
  onSaveBanners: (banners: Banner[]) => Promise<void>;
}

export const AdminBannersPage: React.FC<AdminBannersPageProps> = ({
  banners,
  onSaveBanners,
}) => {
  const [bannerList, setBannerList] = useState<Banner[]>(banners);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newBadge, setNewBadge] = useState('PROMO HARI INI');
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleActive = async (id: string) => {
    const updated = bannerList.map((b) =>
      b.id === id ? { ...b, active: !b.active } : b
    );
    setBannerList(updated);
    await onSaveBanners(updated);
  };

  const handleDelete = async (id: string) => {
    const updated = bannerList.filter((b) => b.id !== id);
    setBannerList(updated);
    await onSaveBanners(updated);
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSaving(true);
    try {
      const newBanner: Banner = {
        id: 'b_' + generateUUID().substring(0, 8),
        title: newTitle.trim(),
        subtitle: newSubtitle.trim(),
        badge: newBadge.trim(),
        active: true,
        order: bannerList.length + 1,
        createdAt: new Date().toISOString(),
      };

      const updated = [...bannerList, newBanner];
      setBannerList(updated);
      await onSaveBanners(updated);

      setNewTitle('');
      setNewSubtitle('');
      setIsAdding(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="admin-banners-page" className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">
            Banner Promosi Beranda
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Atur pesan selamat datang dan pengumuman yang muncul di halaman beranda pengguna.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Banner</span>
        </button>
      </div>

      {/* Add Banner Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateBanner}
          className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3"
        >
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Buat Banner Baru
          </h3>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Badge Teks
            </label>
            <input
              type="text"
              value={newBadge}
              onChange={(e) => setNewBadge(e.target.value)}
              placeholder="Contoh: BONUS SPECIAL"
              className="w-full h-10 px-3 rounded-xl border border-zinc-300 text-xs text-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Judul Banner
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Contoh: Kerjakan Misi, Dapatkan E-Wallet Instan!"
              className="w-full h-10 px-3 rounded-xl border border-zinc-300 text-xs text-zinc-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Sub-judul / Penjelasan Singkat
            </label>
            <input
              type="text"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              placeholder="Contoh: Verifikasi cepat tanpa login ribet langsung dicairkan ke DANA & GoPay."
              className="w-full h-10 px-3 rounded-xl border border-zinc-300 text-xs text-zinc-900"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Menyimpan...' : 'Publikasikan Banner'}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="h-10 px-4 rounded-xl border border-zinc-300 text-xs text-zinc-700 font-medium"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-3">
        {bannerList.map((banner) => (
          <div
            key={banner.id}
            className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {banner.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {banner.badge}
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    banner.active
                      ? 'bg-zinc-100 text-zinc-800'
                      : 'bg-zinc-100 text-zinc-400 line-through'
                  }`}
                >
                  {banner.active ? 'Aktif Tayang' : 'Nonaktif'}
                </span>
              </div>

              <h3 className="text-sm font-bold text-zinc-900 truncate">
                {banner.title}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5 truncate">
                {banner.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleToggleActive(banner.id)}
                className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700"
                title={banner.active ? 'Nonaktifkan' : 'Aktifkan'}
              >
                {banner.active ? (
                  <EyeOff className="w-4 h-4 text-zinc-500" />
                ) : (
                  <Eye className="w-4 h-4 text-emerald-600" />
                )}
              </button>
              <button
                onClick={() => handleDelete(banner.id)}
                className="p-2 rounded-lg border border-zinc-200 hover:bg-rose-50 text-rose-600"
                title="Hapus Banner"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
