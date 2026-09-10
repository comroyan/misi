import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Pause,
  Play,
  Copy,
  Trash2,
  ExternalLink,
  Target,
} from 'lucide-react';
import { Mission } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface AdminMissionsPageProps {
  missions: Mission[];
  onCreateMission: () => void;
  onEditMission: (mission: Mission) => void;
  onToggleStatus: (mission: Mission) => void;
  onDuplicateMission: (mission: Mission) => void;
  onDeleteMission: (missionId: string) => void;
}

export const AdminMissionsPage: React.FC<AdminMissionsPageProps> = ({
  missions,
  onCreateMission,
  onEditMission,
  onToggleStatus,
  onDuplicateMission,
  onDeleteMission,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'PAUSED'>('ALL');
  const [missionToDelete, setMissionToDelete] = useState<Mission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = missions.filter((m) => {
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.brandName.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div id="admin-missions-page" className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">
            Katalog Misi & Tugas
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Kelola misi aktif, buat instruksi langkah pengerjaan, dan atur kuota slot.
          </p>
        </div>

        <button
          onClick={onCreateMission}
          className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Misi Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul misi atau brand..."
            className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(['ALL', 'PUBLISHED', 'PAUSED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {st === 'ALL' ? 'Semua Status' : st === 'PUBLISHED' ? 'Aktif' : 'Dijeda'}
            </button>
          ))}
        </div>
      </div>

      {/* Missions Table / List */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Misi & Brand</th>
                <th className="px-4 py-3">Reward</th>
                <th className="px-4 py-3">Langkah</th>
                <th className="px-4 py-3">Slot Terisi</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                    <Target className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                    <p className="font-semibold text-zinc-700 text-sm">Belum ada misi</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {search
                        ? 'Tidak ada misi yang cocok dengan kata kunci pencarian.'
                        : 'Misi bawaan default telah dihapus. Klik tombol "Tambah Misi Baru" di atas untuk mulai membuat misi Anda sendiri.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((mission) => (
                  <tr key={mission.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-zinc-900 text-xs sm:text-sm">
                        {mission.title}
                      </div>
                      <div className="text-zinc-500 text-[11px] mt-0.5">
                        {mission.brandName} • {mission.estimatedMinutes} menit
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600">
                      {formatRupiah(mission.rewardAmount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-zinc-800">
                        {mission.steps.length} langkah
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {mission.takenSlots} / {mission.maxSlots}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          mission.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {mission.status === 'PUBLISHED' ? 'Aktif' : 'Dijeda'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditMission(mission)}
                          className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700"
                          title="Edit Misi & Langkah"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleStatus(mission)}
                          className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700"
                          title={mission.status === 'PUBLISHED' ? 'Jeda Misi' : 'Aktifkan Misi'}
                        >
                          {mission.status === 'PUBLISHED' ? (
                            <Pause className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </button>
                        <button
                          onClick={() => onDuplicateMission(mission)}
                          className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700"
                          title="Duplikat Misi"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setMissionToDelete(mission)}
                          className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-rose-50 text-rose-600"
                          title="Hapus Misi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {missionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">
              Hapus Misi Secara Permanen?
            </h3>
            <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus misi <span className="font-semibold text-zinc-900">"{missionToDelete.title}"</span>? Tindakan ini akan menghapus dokumen misi secara permanen dari Cloud Firestore dan tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setMissionToDelete(null)}
                className="h-10 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await onDeleteMission(missionToDelete.id);
                  } finally {
                    setIsDeleting(false);
                    setMissionToDelete(null);
                  }
                }}
                className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
              >
                {isDeleting ? (
                  <span>Menghapus...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Permanen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
