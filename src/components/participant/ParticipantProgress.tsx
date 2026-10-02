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
  Filter,
  UserPlus,
  LogIn
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GameCategory } from '../../types';

export const ParticipantProgress: React.FC = () => {
  const { currentParticipant, games, events, registrations, isAuthenticated, openAuthModal } = useApp();

  const [filterType, setFilterType] = useState<'played' | 'unplayed'>('played');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // GUEST / OUTSIDE USER PROGRESS GATE:
  // Don't show games list or badges, only show number of games and glimpses of what you can see after registering
  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#111C3B] to-[#0A1128] border-2 border-[#8F43EE]/40 shadow-2xl text-center space-y-6">
          {/* Avatar icon */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#8F43EE] via-[#FF6036] to-[#35C8A8] p-0.5 shadow-xl shadow-[#8F43EE]/25 mx-auto">
            <div className="w-full h-full bg-[#0A1128] rounded-[22px] flex items-center justify-center">
              <Dices className="w-9 h-9 text-[#a870f7]" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2 max-w-lg mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#8F43EE]/15 text-[#a870f7] border border-[#8F43EE]/30">
              Guest Visitor Mode • My Progress Preview
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Track Your Tabletop Journey & Badges
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Register as a participant to unlock your full board game passport, track your games played, and earn Pune community ranks.
            </p>
          </div>

          {/* Prominent Number of Games Metric (ONLY show number of games for guests) */}
          <div className="p-5 rounded-2xl bg-[#090F22] border border-[#1F305E] max-w-xl mx-auto shadow-inner">
            <div className="flex items-center justify-center gap-3.5">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6036] via-[#FFC226] to-[#35C8A8]">
                {games.length}+
              </span>
              <div className="text-left">
                <span className="text-sm font-bold text-white block">Curated Board Games in Library</span>
                <span className="text-xs text-slate-400">Available across all Pune weekend cafe meetups</span>
              </div>
            </div>
          </div>

          {/* Glimpses of what you can see after registering (similar to My Profile) */}
          <div className="space-y-2.5 text-left max-w-xl mx-auto">
            <div className="px-1 text-xs font-bold text-[#FFC226] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Glimpses of what unlocks after registering:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#090F22] border border-[#1F305E] space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#35C8A8]" />
                  <span>Personal Game Passport</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Track every board game you play, log your wins, and build your tabletop history.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090F22] border border-[#1F305E] space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8F43EE]" />
                  <span>Shuffler Level Progression</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Climb 3 community ranks: Rising Shuffler → Table Veteran → Board Game Master.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090F22] border border-[#1F305E] space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FFC226]" />
                  <span>Achievement Badges</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Collect milestone trophies like Catan Conqueror, Bluff Master, and Tactician.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090F22] border border-[#1F305E] space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6036]" />
                  <span>Tabletop Stats & Analytics</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Deep analytics into categories explored (Strategy, Deduction, Party) and venues visited.
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="btn-progress-gate-register"
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#FF6036] to-[#ff7d59] text-white font-extrabold text-sm shadow-xl shadow-[#FF6036]/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Join Community (Register Free)</span>
            </button>

            <button
              id="btn-progress-gate-login"
              onClick={() => openAuthModal('login')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#111C3B] hover:bg-[#162349] border border-[#1F305E] text-slate-200 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-[#FF6036]" />
              <span>Already a member? Sign In</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED PARTICIPANT PROGRESS VIEW:
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
              <div>
                <span className="text-xs font-bold text-white block">Table Rookie</span>
                <span className="text-[10px] text-slate-400 block">First game played</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-800/30 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                ⚔️
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Tactician</span>
                <span className="text-[10px] text-slate-400 block">Strategy unlocked</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-800/30 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                🎭
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Bluff Master</span>
                <span className="text-[10px] text-slate-400 block">Social deduction</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-800/30 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                🌟
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Shuffler Vet</span>
                <span className="text-[10px] text-slate-400 block">5+ Meetups</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subnav & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setFilterType('played')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filterType === 'played'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Played Games ({playedGames.length})
          </button>
          <button
            onClick={() => setFilterType('unplayed')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filterType === 'unplayed'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Unplayed Games ({unplayedGames.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search board games..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Games Grid for Authenticated Users */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGames.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
            <Dices className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-400">No board games match your criteria</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-xs text-purple-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredGames.map(game => {
            const isPlayed = playedIds.has(game.id);

            return (
              <div
                key={game.id}
                className="p-4 rounded-2xl bg-gradient-to-br from-[#161824] to-[#12131A] border border-slate-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {game.category}
                    </span>
                    {isPlayed ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Played</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-md">
                        Unplayed
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">
                      {game.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {game.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-cyan-400" />
                    <span>{game.players}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{game.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-purple-400">
                    <span>{game.difficulty}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Attended Events Timeline */}
      {attendedRegistrations.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Your Attended Meetups History</span>
            </h3>
            <span className="text-xs text-slate-400">{attendedRegistrations.length} Verified Check-ins</span>
          </div>

          <div className="space-y-2">
            {attendedRegistrations.map(reg => {
              const event = events.find(e => e.id === reg.eventId);
              return (
                <div
                  key={reg.id}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">{event?.title || `Event #${reg.eventId}`}</span>
                    <span className="text-[11px] text-slate-400">
                      📍 {event?.venue}, {event?.area} • 📅 {event?.time}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shrink-0">
                    ✓ Checked In
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
