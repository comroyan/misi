import React, { useState } from 'react';
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react';
import { Mission, MissionCategory, MissionStep, ParticipationLimitType } from '../../types';
import { MissionBuilder } from '../../components/Admin/MissionBuilder';
import { generateUUID } from '../../utils/tokens';

interface AdminMissionEditPageProps {
  initialMission?: Mission | null;
  categories: MissionCategory[];
  onSave: (mission: Mission) => Promise<void>;
  onCancel: () => void;
}

export const AdminMissionEditPage: React.FC<AdminMissionEditPageProps> = ({
  initialMission,
  categories,
  onSave,
  onCancel,
}) => {
  const isEditing = !!initialMission;

  const [title, setTitle] = useState(initialMission?.title || '');
  const [slug, setSlug] = useState(initialMission?.slug || '');
  const [brandName, setBrandName] = useState(initialMission?.brandName || '');
  const [brandLogoUrl, setBrandLogoUrl] = useState(initialMission?.brandLogoUrl || '');
  const [categoryId, setCategoryId] = useState(initialMission?.categoryId || categories[0]?.id || 'sosial-media');
  const [description, setDescription] = useState(initialMission?.description || '');
  const [rewardAmount, setRewardAmount] = useState(initialMission?.rewardAmount || 3000);
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialMission?.estimatedMinutes || 5);
  const [maxSlots, setMaxSlots] = useState(initialMission?.maxSlots || 100);
  const [coverUrl, setCoverUrl] = useState(
    initialMission?.coverUrl ||
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
  );
  const [badge, setBadge] = useState<Mission['badge']>(initialMission?.badge || 'Baru');
  const [participationLimitType, setParticipationLimitType] = useState<ParticipationLimitType>(
    initialMission?.participationLimitType || 'ONCE_PER_PHONE'
  );
  const [termsText, setTermsText] = useState(
    initialMission?.termsAndConditions?.join('\n') ||
      'Gunakan akun asli yang aktif.\nUpload screenshot yang jelas sesuai instruksi.\nJangan batalkan pengerjaan tugas setelah reward cair.'
  );

  // Steps
  const [steps, setSteps] = useState<MissionStep[]>(
    initialMission?.steps || [
      {
        id: 'step_1',
        order: 1,
        type: 'EXTERNAL_LINK',
        title: 'Buka Akun / Tautan Resmi',
        description: 'Kunjungi akun atau link target melalui tombol yang disediakan.',
        required: true,
        externalUrl: 'https://instagram.com',
        ctaText: 'Buka Tautan',
      },
      {
        id: 'step_2',
        order: 2,
        type: 'IMAGE_UPLOAD',
        title: 'Upload Bukti Screenshot',
        description: 'Ambil screenshot yang membuktikan kamu sudah menyelesaikan tugas.',
        required: true,
        maxFileSizeMb: 5,
      },
    ]
  );

  const [isSaving, setIsSaving] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !brandName.trim()) {
      alert('Nama misi dan nama brand wajib diisi.');
      return;
    }

    if (steps.length === 0) {
      alert('Minimal buat 1 langkah pengerjaan untuk misi ini.');
      return;
    }

    setIsSaving(true);
    try {
      const missionId = initialMission?.id || 'm_' + generateUUID().substring(0, 10);
      const terms = termsText
        .split('\n')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const missionData: Mission = {
        id: missionId,
        title: title.trim(),
        slug: slug.trim() || 'misi-' + missionId,
        brandName: brandName.trim(),
        brandLogoUrl: brandLogoUrl.trim() || undefined,
        categoryId,
        description: description.trim(),
        termsAndConditions: terms,
        rewardAmount: Number(rewardAmount),
        estimatedMinutes: Number(estimatedMinutes),
        coverUrl: coverUrl.trim(),
        status: initialMission?.status || 'PUBLISHED',
        maxSlots: Number(maxSlots),
        takenSlots: initialMission?.takenSlots || 0,
        completedSlots: initialMission?.completedSlots || 0,
        reserveSlotOnStart: true,
        reservationMinutes: 30,
        participationLimitType,
        badge,
        steps,
        createdAt: initialMission?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(missionData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="admin-mission-editor-page" className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <button
          onClick={onCancel}
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Misi</span>
        </button>

        <h1 className="text-base font-bold text-zinc-900">
          {isEditing ? 'Edit Misi' : 'Buat Misi Baru'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Data Pokok Misi */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-100">
            Informasi Pokok
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Nama Misi
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Contoh: Follow & Like Instagram @brand.id"
                className="w-full h-10 px-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="follow-like-instagram-brand"
                className="w-full h-10 px-3 rounded-xl border border-zinc-300 bg-white text-xs font-mono text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Nama Brand / Klien
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Contoh: Kopi Senja Nusantara"
                className="w-full h-10 px-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Kategori Misi
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Besar Reward (Rupiah)
              </label>
              <input
                type="number"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(Number(e.target.value))}
                min={500}
                step={500}
                className="w-full h-10 px-3 rounded-xl border border-zinc-300 bg-white text-xs font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Estimasi Waktu (Menit)
              </label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                min={1}
                className="w-full h-10 px-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Jumlah Slot Kuota
              </label>
              <input
                type="number"
                value={maxSlots}
                onChange={(e) => setMaxSlots(Number(e.target.value))}
                min={1}
                className="w-full h-10 px-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Label Badge
              </label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900"
              >
                <option value="">Tanpa Badge</option>
                <option value="Baru">Baru</option>
                <option value="Terbatas">Terbatas</option>
                <option value="Populer">Populer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Deskripsi Misi
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tulis ringkasan mengenai tujuan misi ini..."
              className="w-full p-2.5 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Yang Perlu Diperhatikan (1 baris per poin)
            </label>
            <textarea
              rows={3}
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              placeholder="Satu baris untuk setiap aturan atau ketentuan..."
              className="w-full p-2.5 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 resize-none"
            />
          </div>
        </div>

        {/* Section 2: Visual Mission Builder */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
          <MissionBuilder steps={steps} onChangeSteps={setSteps} />
        </div>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 px-5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan Misi...' : 'Simpan Misi'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
