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
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GameCategory, ShuffleEvent, Registration } from '../../types';
import { openGoogleCalendar } from '../../utils/calendarUtils';
import { LogAttendedGamesModal } from './LogAttendedGamesModal';
import { calculateParticipantBadges } from '../../utils/badgeSystem';
import { calculateBadgeLevel } from '../../services/badgeBackendService';

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

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentParticipant?.name || '');
  const [email, setEmail] = useState(currentParticipant?.email || '');
  const [phone, setPhone] = useState(currentParticipant?.phone || '');
  const [area, setArea] = useState(currentParticipant?.area || 'Koregaon Park');
  const [bio, setBio] = useState(currentParticipant?.bio || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Game Library Exploration State
  const [filterType, setFilterType] = useState<'played' | 'unplayed'>('played');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLoggingReg, setActiveLoggingReg] = useState<{
    registration: Registration;
    event: ShuffleEvent;
  } | null>(null);

  // Sync state if currentParticipant changes
  React.useEffect(() => {
    if (currentParticipant) {
      setName(currentParticipant.name);
      setEmail(currentParticipant.email);
      setPhone(currentParticipant.phone);
      setArea(currentParticipant.area);
      setBio(currentParticipant.bio || '');
    }
  }, [currentParticipant]);

  // GUEST / OUTSIDE USER PROFILE GATE:
  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#111C3B] to-[#0A1128] border-2 border-[#FF6036]/40 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#FF6036] via-[#8F43EE] to-[#35C8A8] p-0.5 shadow-xl shadow-[#FF6036]/25 mx-auto">
            <div className="w-full h-full bg-[#0A1128] rounded-[22px] flex items-center justify-center">
              <User className="w-9 h-9 text-[#FF8566]" />
            </div>
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF6036]/15 text-[#FF8566] border border-[#FF6036]/30">
              Guest Visitor Mode • My Profile
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Your Shuffler Profile & Tabletop Passport
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your profile is your digital board gaming passport in Pune. Register as a participant to unlock your full profile, track your played games, and earn community badges.
            </p>
          </div>

          {/* Prominent Curated Games Metric */}
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

          {/* Unified Perks Grid (No Repetitions) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto">
            <div className="p-4 rounded-2xl bg-[#090F22] border border-[#1F305E] space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#35C8A8]" />
                <span>Digital QR Entry Passes</span>
              </div>
              <p className="text-[11px] text-slate-400">
                1-tap table check-in at Sunday Pune cafes with zero waiting lines.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#090F22] border border-[#1F305E] space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8F43EE]" />
                <span>Personal Game Library Tracking</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Record played titles, track table sessions, and build your gaming history.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#090F22] border border-[#1F305E] space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FFC226]" />
                <span>Earned Community Badges</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Unlock exclusive tabletop badges based on games explored and meetups attended.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#090F22] border border-[#1F305E] space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FF6036]" />
                <span>Priority Meetup Bookings</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Reserve seats for high-demand cafe editions before public tickets sell out.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="btn-profile-gate-register"
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#FF6036] to-[#ff7d59] text-white font-extrabold text-sm shadow-xl shadow-[#FF6036]/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Join Community (Register Free)</span>
            </button>

            <button
              id="btn-profile-gate-login"
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateParticipant(currentParticipant.id, {
      name,
      email,
      phone,
      area,
      bio
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const puneLocalities = [
    'Koregaon Park',
    'Baner',
    'Viman Nagar',
    'Kothrud',
    'Aundh',
    'Wakad',
    'Kalyani Nagar',
    'FC Road / Shivajinagar',
    'Magarpatta / Hadapsar',
    'Bavdhan',
    'Senapati Bapat Road',
    'Camp / MG Road'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* 1. Profile Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#111C3B] via-[#0D152F] to-[#0A1128] border border-[#1F305E] shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6036] via-[#8F43EE] to-[#35C8A8] p-0.5 shadow-lg shadow-[#FF6036]/30 shrink-0">
              <div className="w-full h-full bg-[#0A1128] rounded-[14px] flex items-center justify-center text-2xl font-black text-white">
                {currentParticipant.name[0]}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentParticipant.name}
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FF6036]/15 text-[#FF8566] border border-[#FF6036]/30">
                  {currentParticipant.area}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <span>{shufflerTier.icon}</span>
                  <span>{shufflerTier.name}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Member since {currentParticipant.joinedDate} • Verified Shuffler
              </p>
            </div>
          </div>

          <button
            id="btn-edit-profile-toggle"
            onClick={() => setIsEditing(!isEditing)}
            className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#162349] hover:bg-[#1f305e] text-slate-200 text-xs font-semibold border border-[#1F305E] transition-colors shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile information updated successfully!</span>
          </div>
        )}

        {/* Profile Edit Form or Info View */}
        {isEditing ? (
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Pune Area / Locality</label>
              <select
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                {puneLocalities.map(loc => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-semibold mb-1">Shuffler Bio</label>
              <textarea
                rows={2}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="What kinds of games do you enjoy? (e.g. Catan, Coup, casual party games)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 shadow"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 pt-1 text-xs">
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
        )}
      </div>

      {/* 2. Tabletop Journey & Earned Badge Section */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#16182C] via-[#121424] to-[#0D101D] border border-purple-500/40 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-white tracking-tight">
              Tabletop Mastery & Earned Badge
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

      {/* 3. Event Attendance & Played Games History (Unified Timeline) */}
      <div className="p-6 rounded-3xl bg-[#111C3B] border border-[#1F305E] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#35C8A8]" />
              <span>Event Attendance & Games Played History</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tag the board games you played at Sunday meetups to update your library mastery
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#35C8A8]/10 text-[#35C8A8] border border-[#35C8A8]/20 self-start sm:self-auto">
            {myRegs.length} Events Total
          </span>
        </div>

        {myRegs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No registration history yet.</p>
        ) : (
          <div className="space-y-3">
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

      {/* 4. Curated Board Game Library Explorer (Played & Unplayed Games) */}
      <div className="p-6 rounded-3xl bg-[#111C3B] border border-[#1F305E] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Dices className="w-4 h-4 text-[#FFC226]" />
              <span>Curated Game Library Explorer</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Browse board games available at Pune meetups and track titles yet to conquer
            </p>
          </div>
        </div>

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

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
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
                      <h4 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">
                        {game.name}
                      </h4>
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
