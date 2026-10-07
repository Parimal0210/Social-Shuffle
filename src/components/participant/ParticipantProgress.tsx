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
  LogIn,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GameCategory, ShuffleEvent, Registration } from '../../types';
import { LogAttendedGamesModal } from './LogAttendedGamesModal';
import { calculateParticipantBadges } from '../../utils/badgeSystem';
import { calculateBadgeLevel } from '../../services/badgeBackendService';

export const ParticipantProgress: React.FC = () => {
  const { currentParticipant, games, events, registrations, isAuthenticated, openAuthModal } = useApp();

  const [filterType, setFilterType] = useState<'played' | 'unplayed'>('played');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLoggingReg, setActiveLoggingReg] = useState<{
    registration: Registration;
    event: ShuffleEvent;
  } | null>(null);

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
                  <span>Shuffler Rank Progression</span>
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

  // Attended event timeline for current participant (checked in or completed meetup)
  const attendedRegistrations = registrations.filter(
    r =>
      r.participantId === currentParticipant.id &&
      (r.attendanceStatus === 'Checked In' ||
        (events.find(e => e.id === r.eventId)?.status === 'completed' && r.attendanceStatus !== 'Cancelled'))
  );

  const eventsAttendedCount = Math.max(
    currentParticipant.totalEventsAttended || 0,
    attendedRegistrations.length
  );

  // Compute backend 10-level badge status based on games played & events attended
  const badgeLevelData = calculateBadgeLevel({
    gamesPlayedCount: playedGames.length,
    totalGamesCount: games.length || 24,
    eventsAttendedCount
  });

  // Shuffler Tier
  const { shufflerTier } = calculateParticipantBadges(currentParticipant, games, registrations);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Hero: Progress & Earned Badge */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1A1829] via-[#141522] to-[#12131D] border border-purple-500/30 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-extrabold text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Personal Game Journey
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <span>{shufflerTier.icon}</span>
                <span>{shufflerTier.name}</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {currentParticipant.name}'s Shuffle Legacy
            </h2>
            <p className="text-xs text-slate-400">
              Synchronized in real-time with your verified meetups, table sessions, and game tags
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center min-w-[90px]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Mastery</span>
              <span className="text-lg font-black text-purple-400">
                {badgeLevelData.gamePercentage}%
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center min-w-[90px]">
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
              style={{ width: `${badgeLevelData.gamePercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>🎲 {playedGames.length} Games Explored ({badgeLevelData.gamePercentage}%)</span>
            <span>🏆 {Math.max(0, games.length - playedGames.length)} Left to Master</span>
          </div>
        </div>

        {/* Earned Badge (Shows ONLY the badge earned by the participant) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-slate-900/90 border border-purple-500/40 flex items-center gap-4 shadow-lg">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl border-2 ${badgeLevelData.currentBadge.borderColor} bg-slate-950 ${badgeLevelData.currentBadge.glowEffect} shrink-0`}
          >
            {badgeLevelData.currentBadge.icon}
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Earned Badge
              </span>
              <span
                className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeLevelData.currentBadge.badgeTagColor}`}
              >
                {badgeLevelData.currentBadge.rarity}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              {badgeLevelData.currentBadge.fancyName}
            </h3>
            <p className="text-xs text-slate-300">
              {badgeLevelData.currentBadge.shortTitle} • {badgeLevelData.currentBadge.subtitle}
            </p>
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

      {/* Attended Events Timeline & Games Played Tracking */}
      {attendedRegistrations.length > 0 && (
        <div id="attended-meetups-section" className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#161828] to-[#11131F] border border-purple-500/30 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Your Attended Meetups & Played Games</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tag the board games you played at each meetup to boost your Tabletop Mastery and unlock community badges
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 self-start sm:self-auto">
              {attendedRegistrations.length} Attended Events
            </span>
          </div>

          <div className="space-y-3">
            {attendedRegistrations.map(reg => {
              const event = events.find(e => e.id === reg.eventId);
              const playedList = reg.gamesPlayed || [];

              return (
                <div
                  key={reg.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">
                          {event?.title || `Event #${reg.eventId}`}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                          ✓ Verified Attendance
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span>📅 {event?.time}</span>
                        <span>📍 {event?.venue}, {event?.area}</span>
                        <span>🏷️ Reg #{reg.id}</span>
                      </div>
                    </div>

                    <button
                      id={`btn-log-games-${reg.id}`}
                      onClick={() => event && setActiveLoggingReg({ registration: reg, event })}
                      className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 self-start sm:self-center"
                    >
                      <Dices className="w-3.5 h-3.5 text-purple-400" />
                      <span>{playedList.length > 0 ? 'Edit Games Played' : '+ Add Games Played'}</span>
                    </button>
                  </div>

                  {/* List of games played at this event */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        Games Played ({playedList.length}):
                      </span>

                      {playedList.length === 0 ? (
                        <button
                          onClick={() => event && setActiveLoggingReg({ registration: reg, event })}
                          className="text-[11px] text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 italic"
                        >
                          <Plus className="w-3 h-3" />
                          <span>No games recorded yet — click to add what you played!</span>
                        </button>
                      ) : (
                        playedList.map(gid => {
                          const g = games.find(game => game.id === gid);
                          return (
                            <span
                              key={gid}
                              className="text-[11px] px-2.5 py-0.5 rounded-lg bg-purple-950/40 text-purple-200 border border-purple-800/40 font-medium flex items-center gap-1 shadow-sm"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                              <span>{g ? g.name : gid}</span>
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Log Attended Games Modal */}
      {activeLoggingReg && (
        <LogAttendedGamesModal
          isOpen={!!activeLoggingReg}
          onClose={() => setActiveLoggingReg(null)}
          registration={activeLoggingReg.registration}
          event={activeLoggingReg.event}
        />
      )}
    </div>
  );
};
