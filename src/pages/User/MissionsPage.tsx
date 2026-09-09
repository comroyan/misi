import React, { useState } from 'react';
import { Search, SlidersHorizontal, Inbox } from 'lucide-react';
import { Mission, MissionCategory } from '../../types';
import { MissionCard } from '../../components/Mission/MissionCard';

interface MissionsPageProps {
  missions: Mission[];
  categories: MissionCategory[];
  onSelectMission: (mission: Mission) => void;
  initialCategory?: string;
}

export const MissionsPage: React.FC<MissionsPageProps> = ({
  missions,
  categories,
  onSelectMission,
  initialCategory = 'all',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<'newest' | 'reward' | 'fastest'>('newest');

  // Filter & sort logic
  const filtered = missions
    .filter((m) => m.status === 'PUBLISHED')
    .filter((m) => {
      if (activeCategory !== 'all' && m.categoryId !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.brandName.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'reward') return b.rewardAmount - a.rewardAmount;
      if (sortBy === 'fastest') return a.estimatedMinutes - b.estimatedMinutes;
      return b.createdAt > a.createdAt ? 1 : -1;
    });

  return (
    <div id="user-missions-explore-page" className="pb-24 pt-2">
      {/* Search Bar & Header */}
      <div className="px-4 mb-4">
        <h1 className="text-lg font-bold text-zinc-900 mb-2">
          Jelajah Semua Misi
        </h1>

        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari misi, brand, atau tugas..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`h-8 px-3 rounded-xl text-xs font-semibold shrink-0 transition-colors border ${
              activeCategory === 'all'
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            Semua
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`h-8 px-3 rounded-xl text-xs font-semibold shrink-0 transition-colors border ${
                activeCategory === cat.id
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sort & Count Header */}
      <div className="px-4 mb-3 flex items-center justify-between text-xs text-zinc-500">
        <span>Menampilkan {filtered.length} misi</span>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-zinc-400 font-medium">Urut:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-xs font-semibold text-zinc-800 focus:outline-none cursor-pointer"
          >
            <option value="newest">Terbaru</option>
            <option value="reward">Reward Tertinggi</option>
            <option value="fastest">Estimasi Tercepat</option>
          </select>
        </div>
      </div>

      {/* Mission Grid */}
      <div className="px-4">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filtered.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onSelect={onSelectMission}
              />
            ))}
          </div>
        ) : (
          /* Natural Empty State */
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center my-6">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-800">
              Belum ada misi baru
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              Coba ganti kata kunci pencarian atau cek lagi nanti untuk misi yang baru dibuka.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
