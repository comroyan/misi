import React, { useState } from 'react';
import { Sparkles, ChevronRight, Zap, Flame, Clock } from 'lucide-react';
import { Mission, MissionCategory, Banner } from '../../types';
import { MissionCard } from '../../components/Mission/MissionCard';

interface HomePageProps {
  missions: Mission[];
  categories: MissionCategory[];
  banners: Banner[];
  onSelectMission: (mission: Mission) => void;
  onExploreMore: () => void;
  onFilterCategory: (categoryId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  missions,
  categories,
  banners,
  onSelectMission,
  onExploreMore,
  onFilterCategory,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('all');

  // Filter missions
  const activeMissions = missions.filter((m) => m.status === 'PUBLISHED');

  // Categorized sections
  const featuredMissions = activeMissions.slice(0, 3);
  const newMissions = [...activeMissions].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)).slice(0, 4);
  const highRewardMissions = [...activeMissions].sort((a, b) => b.rewardAmount - a.rewardAmount).slice(0, 3);
  const urgentMissions = activeMissions.filter((m) => m.badge === 'Terbatas').slice(0, 3);

  const displayedBanners = banners.filter((b) => b.active);

  return (
    <div id="user-home-page" className="pb-24 pt-1">
      {/* Intro Section - Clean & functional, not an oversized hero */}
      <section className="px-4 pt-3 pb-4">
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
          Temukan Misi
        </h1>
        <p className="text-xs text-zinc-600 mt-1 leading-relaxed max-w-md">
          Selesaikan tugas sederhana dan dapatkan reward setelah bukti diverifikasi. Tanpa biaya & tanpa perlu registrasi rumit.
        </p>
      </section>

      {/* Banner Section */}
      {displayedBanners.length > 0 && (
        <section className="px-4 mb-5">
          {displayedBanners.slice(0, 1).map((banner) => (
            <div
              key={banner.id}
              className="bg-zinc-900 text-white rounded-2xl p-4 sm:p-5 relative overflow-hidden"
            >
              <div className="relative z-10 max-w-sm">
                {banner.badge && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-md mb-2">
                    {banner.badge}
                  </span>
                )}
                <h2 className="text-base font-bold text-white leading-snug">
                  {banner.title}
                </h2>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  {banner.subtitle}
                </p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Category Pills Slider */}
      <section className="px-4 mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Kategori Tugas
          </h2>
          <button
            onClick={onExploreMore}
            className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCat('all');
              onFilterCategory('all');
            }}
            className={`h-9 px-3.5 rounded-xl text-xs font-semibold shrink-0 transition-colors border ${
              selectedCat === 'all'
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            Semua Kategori
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCat(cat.id);
                onFilterCategory(cat.id);
              }}
              className={`h-9 px-3.5 rounded-xl text-xs font-semibold shrink-0 transition-colors border ${
                selectedCat === cat.id
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Section: Misi Pilihan */}
      <section className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-zinc-900">
              Misi Pilihan
            </h2>
          </div>
          <button
            onClick={onExploreMore}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
          >
            Lihat Lainnya
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {featuredMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onSelect={onSelectMission}
            />
          ))}
        </div>
      </section>

      {/* Section: Misi Baru */}
      <section className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-zinc-900">
              Misi Baru Rilis
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {newMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onSelect={onSelectMission}
            />
          ))}
        </div>
      </section>

      {/* Section: Reward Menarik */}
      {highRewardMissions.length > 0 && (
        <section className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-zinc-900">
                Reward Menarik
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {highRewardMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onSelect={onSelectMission}
              />
            ))}
          </div>
        </section>
      )}

      {/* Section: Hampir Berakhir (Terbatas) */}
      {urgentMissions.length > 0 && (
        <section className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-bold text-zinc-900">
                Slot Terbatas
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {urgentMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onSelect={onSelectMission}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
