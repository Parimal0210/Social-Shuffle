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
        {/* EXCLUSIVE MEMBER PASS • 6 PERKS LOCKED */}
        <div className="relative overflow-hidden rounded-2xl bg-[#1C1B18] border border-[#36332D] p-5 sm:p-7 shadow-sm">
          {/* Header Strip */}
          <div className="text-center space-y-2 relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FF7A59] font-heading uppercase tracking-wider">
              <IdCard className="w-4 h-4 text-[#FF6036]" />
              <span>Personal Board Gaming Passport · 6 Member Perks</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center justify-center gap-2 font-heading">
              <span>Claim Your Personal Board Gaming Passport</span>
              <span className="text-[#FFC226]">🎲</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#A8A29E] leading-relaxed">
              While browsing as a guest, your stats are paused and seats aren't held. Registered members receive an official Pune Gaming Passport to skip waitlists, earn rare achievement stamps, and keep a permanent game record.
            </p>
          </div>

          {/* 6 Concise FOMO Perks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-5 relative z-10">
            {/* 1. Guaranteed VIP Seating */}
            <div className="p-4 rounded-xl bg-[#24221E] border border-[#36332D] hover:border-[#FF6036]/50 transition-all flex flex-col justify-between group cursor-default">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-[#FF6036]/15 text-[#FF6036]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#FF7A59]">
                    LOCKED 🔒
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white font-heading">1. Guaranteed VIP Seating</h3>
                <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                  Weekend tables fill up fast. Members lock guaranteed seats while drop-ins wait outside.
                </p>
              </div>
            </div>

            {/* 2. Personal Game Legacy */}
            <div className="p-4 rounded-xl bg-[#24221E] border border-[#36332D] hover:border-[#8F43EE]/50 transition-all flex flex-col justify-between group cursor-default">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-[#8F43EE]/15 text-[#8F43EE]">
                    <Dices className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#FF7A59]">
                    LOCKED 🔒
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white font-heading">2. Personal Game Legacy</h3>
                <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                  Games played and victories vanish without a profile. Members keep a permanent lifetime game vault.
                </p>
              </div>
            </div>

            {/* 3. 10-Tier XP & Badges */}
            <div className="p-4 rounded-xl bg-[#24221E] border border-[#36332D] hover:border-[#FFC226]/50 transition-all flex flex-col justify-between group cursor-default">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-[#FFC226]/15 text-[#FFC226]">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#FF7A59]">
                    LOCKED 🔒
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white font-heading">3. 10-Tier XP & Badges</h3>
                <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                  Your rank is stuck at Level 0. Members earn XP, unlock rare badges, and get priority early-bird RSVP.
                </p>
              </div>
            </div>

            {/* 4. Local Table Circles */}
            <div className="p-4 rounded-xl bg-[#24221E] border border-[#36332D] hover:border-[#35C8A8]/50 transition-all flex flex-col justify-between group cursor-default">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-[#35C8A8]/15 text-[#35C8A8]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#FF7A59]">
                    LOCKED 🔒
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white font-heading">4. Local Table Circles</h3>
                <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                  The best tables in your area fill up before public posts. Members get priority neighborhood invites.
                </p>
              </div>
            </div>

            {/* 5. 1-Tap QR Fast Pass */}
            <div className="p-4 rounded-xl bg-[#24221E] border border-[#36332D] hover:border-[#35C8A8]/50 transition-all flex flex-col justify-between group cursor-default">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-[#35C8A8]/15 text-[#35C8A8]">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#FF7A59]">
                    LOCKED 🔒
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white font-heading">5. 1-Tap QR Fast Pass</h3>
                <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                  Show your door ticket in 2 seconds at cafe entry. Zero paper lists, zero waiting in line.
                </p>
              </div>
            </div>

            {/* 6. Heavy Strategy & Secret Meetups */}
            <div className="p-4 rounded-xl bg-[#24221E] border border-[#36332D] hover:border-[#8F43EE]/50 transition-all flex flex-col justify-between group cursor-default">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-[#8F43EE]/15 text-[#8F43EE]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#FF7A59]">
                    LOCKED 🔒
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white font-heading">6. Secret Strategy Nights</h3>
                <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                  Curated tables for heavy campaigns, deduction games, and tournaments reserved strictly for members.
                </p>
              </div>
            </div>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 relative z-10">
            <button
              id="passport-gate-btn-register"
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#FF6036] hover:bg-[#E85127] text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Unlock Your Gaming Passport (Free)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="passport-gate-btn-signin"
              onClick={() => openAuthModal('login')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#24221E] hover:bg-[#2C2A25] border border-[#36332D] text-[#F5F2EB] font-semibold text-xs sm:text-sm transition-colors text-center flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-[#FF6036]" />
              <span>Already a Member? Sign In</span>
            </button>
          </div>

          {/* Footnote Assurance */}
          <div className="mt-3.5 text-center text-[10px] text-[#A8A29E] flex items-center justify-center gap-3 relative z-10">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#35C8A8]" />
              100% Free Forever
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#35C8A8]" />
              No Spam or Ads
            </span>
            <span>·</span>
            <span>Confidential Data Guarantee</span>
          </div>
        </div>

        {/* Quick Community Highlights Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-[#1C1B18] border border-[#36332D] text-center space-y-0.5 cursor-default">
            <div className="text-base font-bold text-[#FF6036] font-heading">850+ Active Players</div>
            <p className="text-[11px] text-[#A8A29E]">Biggest tabletop community in the city</p>
          </div>
          <div className="p-4 rounded-xl bg-[#1C1B18] border border-[#36332D] text-center space-y-0.5 cursor-default">
            <div className="text-base font-bold text-[#FFC226] font-heading">10 Achievement Tiers</div>
            <p className="text-[11px] text-[#A8A29E]">Earn XP and climb from Rookie to Veteran</p>
          </div>
        </div>

        {/* Strict Data Privacy Guarantee */}
        <div className="p-4 rounded-xl bg-[#1C1B18] border border-[#36332D] flex flex-col sm:flex-row items-center gap-3 text-xs text-[#A8A29E]">
          <div className="p-2 rounded-xl bg-[#35C8A8]/10 text-[#35C8A8] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 text-center sm:text-left">
            <h4 className="text-xs font-bold text-white font-heading">Strict Privacy Guarantee</h4>
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
      <div className="p-6 rounded-2xl bg-[#1C1B18] border border-[#36332D] shadow-sm space-y-5 relative overflow-hidden">
        {/* Passport Identity Top Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C2924] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6036] text-white flex items-center justify-center shrink-0 shadow-sm font-heading font-bold">
              <IdCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFC226] font-heading">
                  Official Tabletop Passport
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5 font-heading">
                Personal Board Gaming Passport
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="inline-flex items-center gap-1.5 text-[#35C8A8] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#35C8A8]" />
              <span>Verified Active</span>
            </span>
          </div>
        </div>

        <div className="space-y-4 pt-1 text-xs">
          {/* Passport Holder Dossier Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#24221E] border border-[#36332D]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#FF6036] flex items-center justify-center text-2xl font-black text-white shrink-0 font-heading">
                {currentParticipant.name[0]}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-heading">
                    {currentParticipant.name}
                  </h2>
                  <span className="text-xs font-semibold text-[#FF7A59]">
                    · {currentParticipant.area}, Pune
                  </span>
                  <span className="text-xs font-bold text-[#8F43EE] flex items-center gap-1">
                    <span>{shufflerTier.icon}</span>
                    <span>{shufflerTier.name}</span>
                  </span>
                </div>
                <p className="text-xs text-[#A8A29E]">
                  Passport Issued: {currentParticipant.joinedDate} · Verified Shuffler · Station: Pune Tabletop District
                </p>
              </div>
            </div>
          </div>

          {currentParticipant.bio && (
            <p className="text-[#D6D3D1] italic bg-[#24221E] p-3 rounded-xl border border-[#36332D]">
              "{currentParticipant.bio}"
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#24221E] border border-[#36332D] text-[#D6D3D1]">
              <Mail className="w-4 h-4 text-[#8F43EE] shrink-0" />
              <span className="truncate">{currentParticipant.email}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#24221E] border border-[#36332D] text-[#D6D3D1]">
              <Phone className="w-4 h-4 text-[#35C8A8] shrink-0" />
              <span>{currentParticipant.phone}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#24221E] border border-[#36332D] text-[#D6D3D1]">
              <MapPin className="w-4 h-4 text-[#FF6036] shrink-0" />
              <span>{currentParticipant.area}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tabletop Mastery & Earned Badges */}
      <div className="p-6 rounded-2xl bg-[#1C1B18] border border-[#36332D] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFC226]" />
            <h3 className="text-lg font-bold text-white tracking-tight font-heading">
              Tabletop Mastery & Earned Badges
            </h3>
          </div>

          <span className="text-xs font-bold text-[#8F43EE] self-start sm:self-auto font-heading">
            {badgeLevelData.gamePercentage}% Library Mastery
          </span>
        </div>

        {/* Visual Mastery Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-[#24221E] rounded-full overflow-hidden p-0.5 border border-[#36332D]">
            <div
              className="h-full bg-[#FF6036] rounded-full transition-all duration-700"
              style={{ width: `${badgeLevelData.gamePercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#A8A29E]">
            <span>🎲 {playedGames.length} Games Explored ({badgeLevelData.gamePercentage}%)</span>
            <span>🏆 {Math.max(0, games.length - playedGames.length)} Left to Master</span>
          </div>
        </div>

        {/* Earned Badge Card (Shows ONLY the badge earned by the participant) */}
        <div className="p-4 rounded-xl bg-[#24221E] border border-[#36332D] flex items-center gap-4 transition-all group cursor-default">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-[#1C1B18] border border-[#36332D] shrink-0">
            {badgeLevelData.currentBadge.icon}
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-[#FFC226] font-heading uppercase tracking-wider text-[10px]">
                Earned Badge
              </span>
              <span className="text-[#57534E]" aria-hidden="true">·</span>
              <span className="text-[#8F43EE] font-semibold text-[11px]">
                {badgeLevelData.currentBadge.rarity}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight font-heading">
              {badgeLevelData.currentBadge.fancyName}
            </h4>
            <p className="text-xs text-[#A8A29E]">
              {badgeLevelData.currentBadge.shortTitle} · {badgeLevelData.currentBadge.subtitle}
            </p>
          </div>
        </div>

        {/* Unified Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-[#24221E] border border-[#36332D] text-center">
            <span className="text-[10px] text-[#A8A29E] uppercase tracking-wider block font-bold font-heading">
              Games Played
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#35C8A8] mt-0.5 block font-heading tabular-nums">
              {playedGames.length} / {games.length}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#24221E] border border-[#36332D] text-center">
            <span className="text-[10px] text-[#A8A29E] uppercase tracking-wider block font-bold font-heading">
              Events Attended
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#8F43EE] mt-0.5 block font-heading tabular-nums">
              {eventsAttendedCount}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#24221E] border border-[#36332D] text-center">
            <span className="text-[10px] text-[#A8A29E] uppercase tracking-wider block font-bold font-heading">
              Total Registrations
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#FFC226] mt-0.5 block font-heading tabular-nums">
              {currentParticipant.totalRegistrations}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#24221E] border border-[#36332D] text-center">
            <span className="text-[10px] text-[#A8A29E] uppercase tracking-wider block font-bold font-heading">
              Friends Brought
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#FF7A59] mt-0.5 block font-heading tabular-nums">
              +{currentParticipant.totalPaxBrought} Guests
            </span>
          </div>
        </div>
      </div>

      {/* 3. Passport Expedition Log & Meetup Stamps */}
      <div className="p-6 rounded-2xl bg-[#1C1B18] border border-[#36332D] shadow-sm space-y-4">
        <div
          onClick={() => setIsExpeditionLogExpanded(!isExpeditionLogExpanded)}
          className="flex items-center justify-between gap-3 cursor-pointer select-none group"
        >
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center gap-2 group-hover:text-[#35C8A8] transition-colors font-heading">
              <Calendar className="w-4 h-4 text-[#35C8A8]" />
              <span>Passport Expedition Log & Meetup Stamps</span>
            </h3>
            <p className="text-xs text-[#A8A29E]">
              Verified meetup check-ins & board games logged into your official tabletop passport
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-[#35C8A8] hidden sm:inline-block">
              {myRegs.length} Expeditions Total
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#24221E] border border-[#36332D] flex items-center justify-center text-[#A8A29E] group-hover:text-white transition-all">
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
              <p className="text-xs text-[#A8A29E] py-4 text-center">No registration history yet.</p>
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
                      className="p-4 rounded-xl bg-[#24221E] border border-[#36332D] space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm font-heading">
                              {event?.title || `Event #${reg.eventId}`}
                            </span>
                            <span
                              className={`text-[11px] font-semibold ${
                                reg.attendanceStatus === 'Checked In'
                                  ? 'text-[#35C8A8]'
                                  : reg.attendanceStatus === 'Cancelled'
                                  ? 'text-rose-400'
                                  : 'text-[#FFC226]'
                              }`}
                            >
                              · {reg.attendanceStatus}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#A8A29E] flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            <span>📅 {event?.time}</span>
                            <span>📍 {event?.venue}, {event?.area}</span>
                            <span>🏷️ Reg #{reg.id} · Pax: {reg.paxCount}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          {event && reg.attendanceStatus !== 'Cancelled' && (
                            <button
                              onClick={() => openGoogleCalendar(event, reg)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#2A2722] hover:bg-[#34302A] text-[#D6D3D1] border border-[#36332D] text-[11px] font-semibold flex items-center gap-1 transition-colors"
                              title="Add to Google Calendar"
                            >
                              <Calendar className="w-3.5 h-3.5 text-[#35C8A8]" />
                              <span>Calendar</span>
                            </button>
                          )}

                          {/* Tag / Log Games Button for Attended Events */}
                          {isAttended && (
                            <button
                              id={`btn-log-games-${reg.id}`}
                              onClick={() => event && setActiveLoggingReg({ registration: reg, event })}
                              className="px-3 py-1.5 rounded-lg bg-[#8F43EE]/15 hover:bg-[#8F43EE]/25 text-[#a870f7] border border-[#8F43EE]/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                            >
                              <Dices className="w-3.5 h-3.5 text-[#8F43EE]" />
                              <span>{playedList.length > 0 ? 'Edit Games' : '+ Log Games'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Games Played at this event */}
                      {isAttended && (
                        <div className="pt-2 border-t border-[#36332D]">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-[#A8A29E] flex items-center gap-1 mr-1">
                              <Award className="w-3.5 h-3.5 text-[#FFC226]" />
                              Games Played ({playedList.length}):
                            </span>

                            {playedList.length === 0 ? (
                              <button
                                onClick={() => event && setActiveLoggingReg({ registration: reg, event })}
                                className="text-[11px] text-[#8F43EE] hover:underline flex items-center gap-1 italic"
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
                                    className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#1C1B18] text-[#D6D3D1] border border-[#36332D] font-medium flex items-center gap-1"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8F43EE]" />
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
      <div className="p-6 rounded-2xl bg-[#1C1B18] border border-[#36332D] shadow-sm space-y-4">
        <div
          onClick={() => setIsConquestIndexExpanded(!isConquestIndexExpanded)}
          className="flex items-center justify-between gap-3 cursor-pointer select-none group"
        >
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center gap-2 group-hover:text-[#FFC226] transition-colors font-heading">
              <Dices className="w-4 h-4 text-[#FFC226]" />
              <span>Passport Board Game Conquest Index</span>
            </h3>
            <p className="text-xs text-[#A8A29E]">
              Track board games conquered in your passport and discover uncharted tabletop titles across Pune
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-[#FFC226] hidden sm:inline-block">
              {playedGames.length} Conquered
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#24221E] border border-[#36332D] flex items-center justify-center text-[#A8A29E] group-hover:text-white transition-all">
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
              <div className="flex p-1 bg-[#24221E] border border-[#36332D] rounded-xl">
                <button
                  onClick={() => setFilterType('played')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    filterType === 'played'
                      ? 'bg-[#FF6036] text-white shadow-sm'
                      : 'text-[#A8A29E] hover:text-white'
                  }`}
                >
                  Conquered Games ({playedGames.length})
                </button>
                <button
                  onClick={() => setFilterType('unplayed')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    filterType === 'unplayed'
                      ? 'bg-[#FF6036] text-white shadow-sm'
                      : 'text-[#A8A29E] hover:text-white'
                  }`}
                >
                  Uncharted Games ({unplayedGames.length})
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search board games..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-4 py-2 bg-[#24221E] border border-[#36332D] rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6036] transition-colors"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#FF6036] text-white shadow-sm font-bold'
                      : 'bg-[#24221E] text-[#A8A29E] hover:text-white border border-[#36332D]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Games Grid in fixed-size scrollable container */}
            <div className="max-h-[460px] overflow-y-auto pr-1.5 scrollbar-thin">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {filteredGames.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-[#24221E] rounded-xl border border-[#36332D] space-y-2">
                    <Dices className="w-8 h-8 text-[#57534E] mx-auto" />
                    <p className="text-sm font-semibold text-[#A8A29E]">No board games match your criteria</p>
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setSearchQuery('');
                      }}
                      className="text-xs text-[#FF7A59] hover:underline"
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
                        className="p-3.5 rounded-xl bg-[#24221E] border border-[#36332D] hover:border-[#FF6036]/40 transition-all flex flex-col justify-between group shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-[#8F43EE] truncate">
                            {game.category}
                          </span>
                          {isPlayed ? (
                            <span className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-[#35C8A8]">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Played</span>
                            </span>
                          ) : (
                            <span className="shrink-0 text-[11px] font-medium text-[#78716C]">
                              Unplayed
                            </span>
                          )}
                        </div>

                        <div className="mt-3">
                          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-[#FF7A59] transition-colors font-heading">
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
      <div className="p-6 rounded-2xl bg-[#1C1B18] border border-[#36332D] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-heading">
              <ShieldCheck className="w-5 h-5 text-[#35C8A8]" />
              <span>Participant Account & Authentication</span>
            </h3>
            <p className="text-xs text-[#A8A29E] mt-0.5">
              Logged in as <span className="text-white font-semibold">{currentUser?.name || currentParticipant.name}</span> ({currentUser?.email || currentParticipant.email})
            </p>
          </div>

          <span className="self-start sm:self-center text-xs font-semibold text-[#35C8A8]">
            Verified Participant
          </span>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => openAuthModal('register')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#24221E] hover:bg-[#2C2A25] border border-[#36332D] text-xs font-semibold text-[#F5F2EB] transition-colors"
          >
            <UserPlus className="w-4 h-4 text-[#35C8A8]" />
            <span>Register Another Participant</span>
          </button>

          <button
            onClick={() => openAuthModal('login')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#24221E] hover:bg-[#2C2A25] border border-[#36332D] text-xs font-semibold text-[#F5F2EB] transition-colors"
          >
            <LogIn className="w-4 h-4 text-[#FF6036]" />
            <span>Switch / Sign In</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-xs font-semibold text-rose-400 transition-colors"
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
