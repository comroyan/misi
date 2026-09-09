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
              {filtered.map((mission) => (
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
                        onClick={() => onDeleteMission(mission.id)}
                        className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-rose-50 text-rose-600"
                        title="Hapus Misi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
