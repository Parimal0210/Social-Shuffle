import React, { useState } from 'react';
import {
  Dices,
  CheckCircle2,
  Clock,
  Users,
  Award,
  Calendar,
  MapPin,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GameCategory } from '../../types';

export const ParticipantProgress: React.FC = () => {
  const { currentParticipant, games, events, registrations } = useApp();

  const [filterType, setFilterType] = useState<'played' | 'unplayed'>('played');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const playedIds = new Set(currentParticipant.gamesPlayedIds);

  const playedGames = games.filter(g => playedIds.has(g.id));
  const unplayedGames = games.filter(g => !playedIds.has(g.id));

  const activeGamesList = filterType === 'played' ? playedGames : unplayedGames;

  const filteredGames = activeGamesList.filter(g => {
    const matchesCategory = selectedCategory === 'All' || g.category === selectedCategory;
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories: (string | GameCategory)[] = [
    'All',
    'Party',
    'Strategy',
    'Bluffing',
    'Social Deduction',
    'Card Games',
    'Family',
    'Tournament'
  ];

  // Attended event timeline for current participant
  const attendedRegistrations = registrations.filter(
    r => r.participantId === currentParticipant.id && r.attendanceStatus === 'Checked In'
  );

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Hero: Progress & Badges */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1A1829] via-[#141522] to-[#12131D] border border-purple-500/30 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-xs uppercase tracking-wider font-extrabold text-purple-400">
                Personal Game Journey
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              {currentParticipant.name}'s Shuffle Legacy
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automatically synchronized with your event attendance & game table records
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Mastery</span>
              <span className="text-lg font-black text-purple-400">
                {Math.round((playedGames.length / (games.length || 1)) * 100)}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Games Played</span>
              <span className="text-lg font-black text-cyan-400">
                {playedGames.length} / {games.length}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-700 shadow-md shadow-purple-500/40"
              style={{ width: `${Math.round((playedGames.length / (games.length || 1)) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>🎲 {playedGames.length} Explored</span>
            <span>🏆 {unplayedGames.length} Left to Master</span>
          </div>
        </div>

        {/* Milestones / Badges */}
        <div>
          <span className="text-xs font-bold text-slate-300 block mb-2">Unlocked Community Badges</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-800/30 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                🎲
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">First Shuffle</span>
                <span className="text-[10px] text-slate-400">Attended first meetup</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
              playedGames.length >= 10
                ? 'bg-cyan-950/20 border-cyan-800/30 text-white'
                : 'bg-slate-900/40 border-slate-800/60 opacity-50'
            }`}>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                ⚔️
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block">Table Veteran</span>
                <span className="text-[10px] text-slate-400">Played 10+ games</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
              currentParticipant.venuesVisited.length >= 3
                ? 'bg-amber-950/20 border-amber-800/30 text-white'
                : 'bg-slate-900/40 border-slate-800/60 opacity-50'
            }`}>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                📍
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block">Venue Hopper</span>
                <span className="text-[10px] text-slate-400">Visited 3+ Pune venues</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
              currentParticipant.totalPaxBrought >= 2
                ? 'bg-emerald-950/20 border-emerald-800/30 text-white'
                : 'bg-slate-900/40 border-slate-800/60 opacity-50'
            }`}>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                👥
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block">Friend Bringer</span>
                <span className="text-[10px] text-slate-400">Brought guests along</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Switcher: Games Played vs Games Yet to Play */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              id="btn-filter-games-played"
              onClick={() => setFilterType('played')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                filterType === 'played'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Games I've Played ({playedGames.length})</span>
            </button>

            <button
              id="btn-filter-games-unplayed"
              onClick={() => setFilterType('unplayed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                filterType === 'unplayed'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Dices className="w-4 h-4 text-amber-400" />
              <span>Games Yet to Play ({unplayedGames.length})</span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search game..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 w-full sm:w-48"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredGames.map(game => (
            <div
              key={game.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                filterType === 'played'
                  ? 'bg-[#161822] border-emerald-500/20 hover:border-emerald-500/40'
                  : 'bg-[#141620] border-slate-800 hover:border-purple-500/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                    {game.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      game.difficulty === 'Beginner'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : game.difficulty === 'Medium'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {game.difficulty}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight">{game.name}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {game.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{game.players}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{game.duration}</span>
                </div>
                {filterType === 'played' ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Played
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">Yet to play</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chronological Event Attendance History */}
      <div className="p-6 rounded-2xl bg-[#161822] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span>Attended Events Timeline</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {attendedRegistrations.length} verified check-ins
          </span>
        </div>

        {attendedRegistrations.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No attended events recorded yet. When you check in at a meetup, your journey timeline will blossom here!
          </p>
        ) : (
          <div className="relative pl-6 border-l-2 border-purple-500/30 space-y-6">
            {attendedRegistrations.map(reg => {
              const event = events.find(e => e.id === reg.eventId);
              const playedHere = games.filter(g => reg.gamesPlayed.includes(g.id));

              return (
                <div key={reg.id} className="relative group">
                  {/* Dot on timeline */}
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-purple-500 border-2 border-[#161822] shadow shadow-purple-500/50" />

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">
                        {event?.title || `Social Shuffle Event`}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold">
                        Checked In
                      </span>
                      {reg.checkInTime && (
                        <span className="text-[11px] text-slate-500">
                          @ {reg.checkInTime}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {event?.venue} ({event?.area})
                      </span>
                      <span>Pax: {reg.paxCount}</span>
                    </div>

                    {/* Games played recorded at this event */}
                    {playedHere.length > 0 && (
                      <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-slate-400">Games played:</span>
                        {playedHere.map(g => (
                          <span
                            key={g.id}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-purple-950/40 border border-purple-800/40 text-purple-300 font-medium"
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
