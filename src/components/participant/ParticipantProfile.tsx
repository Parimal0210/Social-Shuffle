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
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { openGoogleCalendar } from '../../utils/calendarUtils';

export const ParticipantProfile: React.FC = () => {
  const {
    currentParticipant,
    updateParticipant,
    events,
    games,
    registrations,
    currentUser,
    logout,
    openAuthModal
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentParticipant.name);
  const [email, setEmail] = useState(currentParticipant.email);
  const [phone, setPhone] = useState(currentParticipant.phone);
  const [area, setArea] = useState(currentParticipant.area);
  const [bio, setBio] = useState(currentParticipant.bio || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const myRegs = registrations.filter(r => r.participantId === currentParticipant.id);

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
      {/* Profile Header Card */}
      <div className="p-6 rounded-2xl bg-[#111C3B] border border-[#1F305E] shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6036] via-[#8F43EE] to-[#35C8A8] p-0.5 shadow-lg shadow-[#FF6036]/30">
              <div className="w-full h-full bg-[#0A1128] rounded-[14px] flex items-center justify-center text-2xl font-black text-white">
                {currentParticipant.name[0]}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  {currentParticipant.name}
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FF6036]/15 text-[#FF8566] border border-[#FF6036]/30">
                  {currentParticipant.area}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Member since {currentParticipant.joinedDate} • Verified Shuffler
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#162349] hover:bg-[#1f305e] text-slate-200 text-xs font-semibold border border-[#1F305E] transition-colors"
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
          <div className="space-y-4 pt-1 text-xs">
            {currentParticipant.bio && (
              <p className="text-slate-300 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                "{currentParticipant.bio}"
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-300">
                <Mail className="w-4 h-4 text-purple-400" />
                <span className="truncate">{currentParticipant.email}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-300">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{currentParticipant.phone}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-300">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>{currentParticipant.area}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Social Shuffle Stats Grid */}
      <div>
        <h3 className="text-base font-bold text-white mb-3">Social Shuffle Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-[#161822] border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Events Attended
            </span>
            <span className="text-2xl font-black text-purple-400 mt-1 block">
              {currentParticipant.totalEventsAttended}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#161822] border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Total Registrations
            </span>
            <span className="text-2xl font-black text-cyan-400 mt-1 block">
              {currentParticipant.totalRegistrations}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#161822] border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Games Played
            </span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">
              {currentParticipant.gamesPlayedIds.length}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#161822] border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Friends Brought
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {currentParticipant.totalPaxBrought}
            </span>
          </div>
        </div>
      </div>

      {/* Chronological Event History */}
      <div className="p-6 rounded-2xl bg-[#161822] border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white">Event Registration & Attendance History</h3>

        {myRegs.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">No registration history yet.</p>
        ) : (
          <div className="space-y-3">
            {myRegs.map(reg => {
              const event = events.find(e => e.id === reg.eventId);
              return (
                <div
                  key={reg.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
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

                    <div className="text-slate-400">
                      📍 {event?.venue} ({event?.area}) • Pax: {reg.paxCount} • Registered on {reg.registeredAt}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {event && reg.attendanceStatus !== 'Cancelled' && (
                      <button
                        onClick={() => openGoogleCalendar(event, reg)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                        title="Add to Google Calendar for reminder"
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>Add to Calendar</span>
                      </button>
                    )}
                    {reg.checkInTime && (
                      <div className="text-[11px] text-emerald-400 font-semibold">
                        Checked in at {reg.checkInTime}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shuffler Account & Authentication Card */}
      <div className="p-6 rounded-2xl bg-[#111C3B] border border-[#1F305E] shadow-xl space-y-4">
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
    </div>
  );
};
