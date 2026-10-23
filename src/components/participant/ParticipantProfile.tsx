import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Dices,
  Award,
  Users,
  CheckCircle2,
  Edit2,
  Save,
  Sparkles,
  LogIn,
  LogOut,
  UserPlus,
  ShieldCheck,
  Search,
  Plus,
  QrCode,
  Trophy,
  Star,
  ArrowRight,
  Shield,
  Lock,
  Flame,
  Zap,
  X,
  IdCard,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GameCategory, ShuffleEvent, Registration } from '../../types';
import { openGoogleCalendar } from '../../utils/calendarUtils';
import { LogAttendedGamesModal } from './LogAttendedGamesModal';
import { calculateParticipantBadges } from '../../utils/badgeSystem';
import { calculateBadgeLevel, BADGE_LEVELS } from '../../services/badgeBackendService';

export const ParticipantProfile: React.FC = () => {
  const {
    currentParticipant,
    updateParticipant,
    events,
    games,
    registrations,
    currentUser,
    isAuthenticated,
    logout,
    openAuthModal
  } = useApp();

  // Expandable Section States (Expandable and fixed size scrollable)
  const [isExpeditionLogExpanded, setIsExpeditionLogExpanded] = useState<boolean>(true);
  const [isConquestIndexExpanded, setIsConquestIndexExpanded] = useState<boolean>(true);

  // Game Library Exploration State
  const [filterType, setFilterType] = useState<'played' | 'unplayed'>('played');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLoggingReg, setActiveLoggingReg] = useState<{
    registration: Registration;
    event: ShuffleEvent;
  } | null>(null);

  // GUEST / OUTSIDE USER PROFILE GATEWAY (CONCISE ON-PAGE VIP PASS WITH FOMO):
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto space-y-5 pb-20 md:pb-12 animate-in fade-in duration-200">
        {/* =========================================================================
            EXCLUSIVE MEMBER PASS • 6 PERKS LOCKED (DISPLAYED ON THE SAME PAGE)
           ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#111C3B] via-[#0E1733] to-[#0A1128] border-2 border-[#FF6036]/40 shadow-[0_0_50px_rgba(255,96,54,0.18)] p-5 sm:p-7">
          {/* Ambient Glow Accents */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#FF6036]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#35C8A8]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Strip */}
          <div className="text-center space-y-2.5 relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6036]/15 border border-[#FF6036]/30 text-[#FF6036] text-xs font-black uppercase tracking-wider hover:bg-[#FF6036]/25 hover:border-[#FF6036]/50 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,96,54,0.25)] transition-all duration-300 cursor-default select-none">
              <IdCard className="w-4 h-4 text-[#FF6036]" />
              <span>Personal Board Gaming Passport • 6 Perks Locked</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <span>Claim Your Personal Board Gaming Passport</span>
              <span className="text-[#FFC226]">🎲</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              While browsing as a guest, your stats are paused and seats aren't held. Registered members receive an official Pune Gaming Passport to skip waitlists, earn rare achievement stamps, and keep a permanent game record.
            </p>
          </div>

          {/* 6 Concise FOMO Perks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-5 relative z-10">
            {/* 1. Guaranteed VIP Seating */}
            <div className="p-3.5 rounded-2xl bg-[#0A1128]/85 border border-[#1F305E] hover:border-[#FF6036]/60 hover:bg-[#0D1635] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#FF6036]/15 transition-all duration-300 ease-out flex flex-col justify-between group cursor-default">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-xl bg-[#FF6036]/15 text-[#FF6036] group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-[#FF6036]/25 transition-all duration-300">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FF6036]/20 text-[#FF6036] border border-[#FF6036]/30 group-hover:scale-105 group-hover:border-[#FF6036]/60 group-hover:bg-[#FF6036]/30 group-hover:shadow-[0_0_12px_rgba(255,96,54,0.35)] transition-all duration-300">
                    LOCKED 🔒
                  </span>
                </div>
                <h3 className="text-xs font-black text-white group-hover:text-amber-100 transition-colors duration-200">1. Guaranteed VIP Seating</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Weekend tables fill up fast. Members lock guaranteed seats while drop-ins wait outside.
                </p>
              </div>
            </div>

            {/* 2. Personal Game Legacy */}
            <div className="p-3.5 rounded-2xl bg-[#0A1128]/85 border border-[#1F305E] hover:border-[#8F43EE]/60 hover:bg-[#0D1635] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#8F43EE]/15 transition-all duration-300 ease-out flex flex-col justify-between group cursor-default">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-xl bg-[#8F43EE]/15 text-[#8F43EE] group-hover:scale-110 group-hover:rotate-3 group-hover:bg-[#8F43EE]/25 transition-all duration-300">
                    <Dices className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FF6036]/20 text-[#FF6036] border border-[#FF6036]/30 group-hover:scale-105 group-hover:border-[#FF6036]/60 group-hover:bg-[#FF6036]/30 group-hover:shadow-[0_0_12px_rgba(255,96,54,0.35)] transition-all duration-300">
                    LOCKED 🔒
                  </span>
                </div>
                <h3 className="text-xs font-black text-white group-hover:text-purple-100 transition-colors duration-200">2. Personal Game Legacy</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Games played and victories vanish without a profile. Members keep a permanent lifetime game vault.
                </p>
              </div>
            </div>

            {/* 3. 10-Tier XP & Badges */}
            <div className="p-3.5 rounded-2xl bg-[#0A1128]/85 border border-[#1F305E] hover:border-[#FFC226]/60 hover:bg-[#0D1635] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#FFC226]/15 transition-all duration-300 ease-out flex flex-col justify-between group cursor-default">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-xl bg-[#FFC226]/15 text-[#FFC226] group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-[#FFC226]/25 transition-all duration-300">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FF6036]/20 text-[#FF6036] border border-[#FF6036]/30 group-hover:scale-105 group-hover:border-[#FF6036]/60 group-hover:bg-[#FF6036]/30 group-hover:shadow-[0_0_12px_rgba(255,96,54,0.35)] transition-all duration-300">
                    LOCKED 🔒
                  </span>
                </div>
                <h3 className="text-xs font-black text-white group-hover:text-amber-200 transition-colors duration-200">3. 10-Tier XP & Badges</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Your rank is stuck at Level 0. Members earn XP, unlock rare badges, and get priority early-bird RSVP.
                </p>
              </div>
            </div>

            {/* 4. Local Table Circles */}
            <div className="p-3.5 rounded-2xl bg-[#0A1128]/85 border border-[#1F305E] hover:border-[#35C8A8]/60 hover:bg-[#0D1635] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#35C8A8]/15 transition-all duration-300 ease-out flex flex-col justify-between group cursor-default">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-xl bg-[#35C8A8]/15 text-[#35C8A8] group-hover:scale-110 group-hover:rotate-3 group-hover:bg-[#35C8A8]/25 transition-all duration-300">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FF6036]/20 text-[#FF6036] border border-[#FF6036]/30 group-hover:scale-105 group-hover:border-[#FF6036]/60 group-hover:bg-[#FF6036]/30 group-hover:shadow-[0_0_12px_rgba(255,96,54,0.35)] transition-all duration-300">
                    LOCKED 🔒
                  </span>
                </div>
                <h3 className="text-xs font-black text-white group-hover:text-teal-100 transition-colors duration-200">4. Local Table Circles</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  The best tables in your area fill up before public posts. Members get priority neighborhood invites.
                </p>
              </div>
            </div>

            {/* 5. 1-Tap QR Fast Pass */}
            <div className="p-3.5 rounded-2xl bg-[#0A1128]/85 border border-[#1F305E] hover:border-cyan-400/60 hover:bg-[#0D1635] hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-400/15 transition-all duration-300 ease-out flex flex-col justify-between group cursor-default">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-xl bg-cyan-500/15 text-cyan-400 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-cyan-500/25 transition-all duration-300">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FF6036]/20 text-[#FF6036] border border-[#FF6036]/30 group-hover:scale-105 group-hover:border-[#FF6036]/60 group-hover:bg-[#FF6036]/30 group-hover:shadow-[0_0_12px_rgba(255,96,54,0.35)] transition-all duration-300">
                    LOCKED 🔒
                  </span>
                </div>
                <h3 className="text-xs font-black text-white group-hover:text-cyan-100 transition-colors duration-200">5. 1-Tap QR Fast Pass</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Skip door clipboards. Dynamic paperless QR pass on your phone with assigned tables & calendar sync.
                </p>
              </div>
            </div>

            {/* 6. Host Clout & Voting */}
            <div className="p-3.5 rounded-2xl bg-[#0A1128]/85 border border-[#1F305E] hover:border-pink-500/60 hover:bg-[#0D1635] hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/15 transition-all duration-300 ease-out flex flex-col justify-between group cursor-default">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-xl bg-pink-500/15 text-pink-400 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-pink-500/25 transition-all duration-300">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FF6036]/20 text-[#FF6036] border border-[#FF6036]/30 group-hover:scale-105 group-hover:border-[#FF6036]/60 group-hover:bg-[#FF6036]/30 group-hover:shadow-[0_0_12px_rgba(255,96,54,0.35)] transition-all duration-300">
                    LOCKED 🔒
                  </span>
                </div>
                <h3 className="text-xs font-black text-white group-hover:text-pink-100 transition-colors duration-200">6. Host Clout & Voting</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Lead tables as an official Table Host, teach your favorite games, and vote on library acquisitions.
                </p>
              </div>
            </div>
          </div>

          {/* FOMO Urgency Bar */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FF6036]/20 via-[#FFC226]/15 to-[#35C8A8]/15 border border-[#FF6036]/40 flex flex-col sm:flex-row items-center justify-between gap-2.5 relative z-10 mb-5">
            <div className="flex items-center gap-2 text-xs font-bold text-white text-center sm:text-left">
              <Flame className="w-4 h-4 text-[#FF6036] animate-pulse shrink-0" />
              <span>Weekend tables fill fast! Join 850+ tabletop players — don't get stuck on the waitlist.</span>
            </div>
            <span className="text-[11px] font-extrabold text-[#35C8A8] whitespace-nowrap px-2.5 py-1 rounded-full bg-[#35C8A8]/10 border border-[#35C8A8]/30">
              ⚡ Free in 30 Seconds
            </span>
          </div>

          {/* Call-To-Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10 max-w-lg mx-auto">
            <button
              id="btn-guest-unlock-profile"
              onClick={() => openAuthModal('register')}
              className="w-full sm:flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-[#FF6036] via-[#ff6e46] to-[#ff845e] hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-xl shadow-[#FF6036]/30 hover:shadow-[#FF6036]/45 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <IdCard className="w-4 h-4" />
              <span>Claim My Personal Gaming Passport & Join</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-guest-signin"
              onClick={() => openAuthModal('login')}
              className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-[#090F22] hover:bg-[#162349] border border-[#1F305E] text-slate-200 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#FF6036]" />
              <span>Sign In</span>
            </button>
          </div>

          {/* Footnote Assurance */}
          <div className="mt-3.5 text-center text-[10px] text-slate-400 flex items-center justify-center gap-3 relative z-10">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#35C8A8]" />
              100% Free Forever
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#35C8A8]" />
              No Spam or Ads
            </span>
            <span>•</span>
            <span>Confidential Data Guarantee</span>
          </div>
        </div>

        {/* Quick Community Highlights Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#111C3B]/60 border border-[#1F305E] hover:border-[#FF6036]/40 hover:bg-[#111C3B]/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FF6036]/10 transition-all duration-300 text-center space-y-0.5 cursor-default">
            <div className="text-base font-black text-[#FF6036]">850+ Active Players</div>
            <p className="text-[10px] text-slate-400">Biggest tabletop community in the city</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#111C3B]/60 border border-[#1F305E] hover:border-[#FFC226]/40 hover:bg-[#111C3B]/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FFC226]/10 transition-all duration-300 text-center space-y-0.5 cursor-default">
            <div className="text-base font-black text-[#FFC226]">10 Achievement Tiers</div>
            <p className="text-[10px] text-slate-400">Earn XP and climb from Rookie to Veteran</p>
          </div>
        </div>

        {/* Strict Data Privacy Guarantee */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#090F22] border border-[#1F305E] flex flex-col sm:flex-row items-center gap-3 text-xs text-slate-400">
          <div className="p-2 rounded-xl bg-[#35C8A8]/10 text-[#35C8A8] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 text-center sm:text-left">
            <h4 className="text-xs font-bold text-white">Strict Privacy Guarantee</h4>
            <p className="text-[11px] leading-relaxed">
              Your profile data is strictly confidential to you. Social Shuffle never sells or shares your personal details with third parties. Records are used solely to coordinate offline meetups and your tabletop play history.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED PARTICIPANT PROFILE & PROGRESS MERGED VIEW
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

  const myRegs = registrations.filter(r => r.participantId === currentParticipant.id);

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

  // Compute backend badge status based on games played & events attended
  const badgeLevelData = calculateBadgeLevel({
    gamesPlayedCount: playedGames.length,
    totalGamesCount: games.length || 24,
    eventsAttendedCount
  });

  // Shuffler Tier
  const { shufflerTier } = calculateParticipantBadges(currentParticipant, games, registrations);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* 1. Personal Board Gaming Passport Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#111C3B] via-[#0D152F] to-[#0A1128] border-2 border-amber-400/30 shadow-[0_0_50px_rgba(255,194,38,0.12)] space-y-5 relative overflow-hidden">
        {/* Passport Identity Top Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F305E] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400/25 via-[#FF6036]/20 to-purple-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-lg shadow-amber-400/10 shrink-0">
              <IdCard className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  Official Tabletop Passport
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Personal Board Gaming Passport
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Verified Active</span>
            </span>
          </div>
        </div>

        <div className="space-y-4 pt-1 text-xs">
          {/* Passport Holder Dossier Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#090F22]/90 border border-[#1F305E]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-[#FF6036] to-[#8F43EE] p-0.5 shadow-lg shadow-amber-400/20 shrink-0 relative">
                <div className="w-full h-full bg-[#0A1128] rounded-[14px] flex items-center justify-center text-2xl font-black text-white">
                  {currentParticipant.name[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-amber-400 text-[#0A1128] text-[8px] font-black uppercase tracking-wider shadow">
                  SEAL
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {currentParticipant.name}
                  </h2>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FF6036]/15 text-[#FF8566] border border-[#FF6036]/30">
                    📍 {currentParticipant.area}, Pune
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <span>{shufflerTier.icon}</span>
                    <span>{shufflerTier.name}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Passport Issued: {currentParticipant.joinedDate} • Verified Shuffler • Station: Pune Tabletop District
                </p>
              </div>
            </div>
          </div>

          {currentParticipant.bio && (
            <p className="text-slate-300 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              "{currentParticipant.bio}"
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-300">
              <Mail className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="truncate">{currentParticipant.email}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-300">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{currentParticipant.phone}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-300">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{currentParticipant.area}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tabletop Mastery & Earned Badges */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#16182C] via-[#121424] to-[#0D101D] border border-purple-500/40 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-white tracking-tight">
              Tabletop Mastery & Earned Badges
            </h3>
          </div>

          <span className="text-xs font-bold text-purple-300 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 self-start sm:self-auto">
            {badgeLevelData.gamePercentage}% Library Mastery
          </span>
        </div>

        {/* Visual Mastery Bar */}
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

        {/* Earned Badge Card (Shows ONLY the badge earned by the participant) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-slate-900/90 border border-purple-500/40 hover:border-purple-500/70 hover:shadow-xl hover:shadow-purple-500/15 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4 shadow-lg group cursor-default">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl border-2 ${badgeLevelData.currentBadge.borderColor} bg-slate-950 ${badgeLevelData.currentBadge.glowEffect} shrink-0 group-hover:scale-105 transition-transform duration-300`}
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
            <h4 className="text-base sm:text-lg font-black text-white tracking-tight">
              {badgeLevelData.currentBadge.fancyName}
            </h4>
            <p className="text-xs text-slate-300">
              {badgeLevelData.currentBadge.shortTitle} • {badgeLevelData.currentBadge.subtitle}
            </p>
          </div>
        </div>

        {/* Unified Key Stats Grid (Eliminates Duplicate Counts) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Games Played
            </span>
            <span className="text-xl sm:text-2xl font-black text-cyan-400 mt-0.5 block">
              {playedGames.length} / {games.length}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Events Attended
            </span>
            <span className="text-xl sm:text-2xl font-black text-purple-400 mt-0.5 block">
              {eventsAttendedCount}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Total Registrations
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5 block">
              {currentParticipant.totalRegistrations}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Friends Brought
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 block">
              +{currentParticipant.totalPaxBrought} Guests
            </span>
          </div>
        </div>
      </div>

      {/* 3. Passport Expedition Log & Meetup Stamps */}
      <div className="p-6 rounded-3xl bg-[#111C3B] border border-[#1F305E] shadow-xl space-y-4">
        <div
          onClick={() => setIsExpeditionLogExpanded(!isExpeditionLogExpanded)}
          className="flex items-center justify-between gap-3 cursor-pointer select-none group"
        >
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center gap-2 group-hover:text-[#35C8A8] transition-colors">
              <Calendar className="w-4 h-4 text-[#35C8A8]" />
              <span>Passport Expedition Log & Meetup Stamps</span>
            </h3>
            <p className="text-xs text-slate-400">
              Verified meetup check-ins & board games logged into your official tabletop passport
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#35C8A8]/10 text-[#35C8A8] border border-[#35C8A8]/20 hidden sm:inline-block">
              {myRegs.length} Expeditions Total
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:border-[#35C8A8]/40 transition-all">
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpeditionLogExpanded ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {isExpeditionLogExpanded && (
          <div>
            {myRegs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No registration history yet.</p>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1.5 scrollbar-thin">
                {myRegs.map(reg => {
                  const event = events.find(e => e.id === reg.eventId);
                  const playedList = reg.gamesPlayed || [];
                  const isAttended =
                    reg.attendanceStatus === 'Checked In' ||
                    (event?.status === 'completed' && reg.attendanceStatus !== 'Cancelled');

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
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                reg.attendanceStatus === 'Checked In'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : reg.attendanceStatus === 'Cancelled'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {reg.attendanceStatus}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            <span>📅 {event?.time}</span>
                            <span>📍 {event?.venue}, {event?.area}</span>
                            <span>🏷️ Reg #{reg.id} • Pax: {reg.paxCount}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          {event && reg.attendanceStatus !== 'Cancelled' && (
                            <button
                              onClick={() => openGoogleCalendar(event, reg)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                              title="Add to Google Calendar"
                            >
                              <Calendar className="w-3.5 h-3.5 text-blue-400" />
                              <span>Calendar</span>
                            </button>
                          )}

                          {/* Tag / Log Games Button for Attended Events */}
                          {isAttended && (
                            <button
                              id={`btn-log-games-${reg.id}`}
                              onClick={() => event && setActiveLoggingReg({ registration: reg, event })}
                              className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/40 text-[11px] font-bold flex items-center gap-1 transition-all"
                            >
                              <Dices className="w-3.5 h-3.5 text-purple-400" />
                              <span>{playedList.length > 0 ? 'Edit Games' : '+ Log Games'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Games Played at this event */}
                      {isAttended && (
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
                                <span>No games recorded yet — click to log what you played!</span>
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
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Passport Board Game Conquest Index */}
      <div className="p-6 rounded-3xl bg-[#111C3B] border border-[#1F305E] shadow-xl space-y-4">
        <div
          onClick={() => setIsConquestIndexExpanded(!isConquestIndexExpanded)}
          className="flex items-center justify-between gap-3 cursor-pointer select-none group"
        >
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center gap-2 group-hover:text-[#FFC226] transition-colors">
              <Dices className="w-4 h-4 text-[#FFC226]" />
              <span>Passport Board Game Conquest Index</span>
            </h3>
            <p className="text-xs text-slate-400">
              Track board games conquered in your passport and discover uncharted tabletop titles across Pune
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FFC226]/10 text-[#FFC226] border border-[#FFC226]/20 hidden sm:inline-block">
              {playedGames.length} Conquered
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:border-[#FFC226]/40 transition-all">
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isConquestIndexExpanded ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {isConquestIndexExpanded && (
          <div className="space-y-4">
            {/* Subnav & Search Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1">
              <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  onClick={() => setFilterType('played')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    filterType === 'played'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Conquered Games ({playedGames.length})
                </button>
                <button
                  onClick={() => setFilterType('unplayed')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    filterType === 'unplayed'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Uncharted Games ({unplayedGames.length})
                </button>
              </div>

              {/* Search Input */}
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

            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
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

            {/* Games Grid in fixed-size scrollable container */}
            <div className="max-h-[460px] overflow-y-auto pr-1.5 scrollbar-thin">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
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
                        className="p-3.5 rounded-2xl bg-gradient-to-br from-[#161824] to-[#12131A] border border-slate-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between group shadow-lg"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 truncate">
                            {game.category}
                          </span>
                          {isPlayed ? (
                            <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Played</span>
                            </span>
                          ) : (
                            <span className="shrink-0 text-[11px] font-medium text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-md">
                              Unplayed
                            </span>
                          )}
                        </div>

                        <div className="mt-3">
                          <h4 className="text-sm sm:text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">
                            {game.name}
                          </h4>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Shuffler Account & Authentication Card */}
      <div className="p-6 rounded-3xl bg-[#111C3B] border border-[#1F305E] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#35C8A8]" />
              <span>Participant Account & Authentication</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as <span className="text-white font-semibold">{currentUser?.name || currentParticipant.name}</span> ({currentUser?.email || currentParticipant.email})
            </p>
          </div>

          <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-[#35C8A8]/15 border border-[#35C8A8]/40 text-[#35C8A8]">
            Verified Participant
          </span>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => openAuthModal('register')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#162349] hover:bg-[#1f305e] border border-[#1F305E] text-xs font-bold text-slate-200 transition-colors"
          >
            <UserPlus className="w-4 h-4 text-[#35C8A8]" />
            <span>Register Another Participant</span>
          </button>

          <button
            onClick={() => openAuthModal('login')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#162349] hover:bg-[#1f305e] border border-[#1F305E] text-xs font-bold text-slate-200 transition-colors"
          >
            <LogIn className="w-4 h-4 text-[#FF6036]" />
            <span>Switch / Sign In</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

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
