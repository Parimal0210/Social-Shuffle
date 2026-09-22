import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Users,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Dices,
  Plus,
  RefreshCw,
  WifiOff,
  UserCheck,
  ChevronRight,
  X,
  CreditCard,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus, PaymentStatus, Registration } from '../../types';

interface AdminAttendanceProps {
  initialEventId?: string;
}

export const AdminAttendance: React.FC<AdminAttendanceProps> = ({ initialEventId }) => {
  const {
    events,
    registrations,
    participants,
    games,
    markAttendance,
    updatePaymentStatus,
    toggleGamePlayedForAttendee,
    addWalkInRegistration,
    isOfflineMode,
    toggleOfflineMode,
    offlineSyncQueue,
    syncOfflineData
  } = useApp();

  // Active event selection
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    if (initialEventId && events.some(e => e.id === initialEventId)) {
      return initialEventId;
    }
    const upcoming = events.find(e => e.status === 'upcoming');
    return upcoming ? upcoming.id : events[0]?.id || '';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Drawer & Modals state
  const [selectedAttendeeDrawer, setSelectedAttendeeDrawer] = useState<Registration | null>(null);
  const [gameTaggingReg, setGameTaggingReg] = useState<Registration | null>(null);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  // Walk-in form state
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInEmail, setWalkInEmail] = useState('');
  const [walkInArea, setWalkInArea] = useState('Koregaon Park');
  const [walkInPax, setWalkInPax] = useState(1);
  const [walkInPayment, setWalkInPayment] = useState<PaymentStatus>('Confirmed');

  const currentEvent = events.find(e => e.id === selectedEventId) || events[0];

  // Registrations for the current selected event
  const currentEventRegistrations = registrations.filter(r => r.eventId === selectedEventId);

  // Counters
  const totalRegisteredPax = currentEventRegistrations.reduce((acc, curr) => acc + curr.paxCount, 0);
  const checkedInRegs = currentEventRegistrations.filter(r => r.attendanceStatus === 'Checked In');
  const checkedInPax = checkedInRegs.reduce((acc, curr) => acc + curr.paxCount, 0);
  const pendingRegs = currentEventRegistrations.filter(r => r.attendanceStatus === 'Pending');
  const cancelledRegs = currentEventRegistrations.filter(r => r.attendanceStatus === 'Cancelled');

  const capacityUtilization = currentEvent
    ? Math.min(100, Math.round((totalRegisteredPax / (currentEvent.capacity || 1)) * 100))
    : 0;

  // Filtered registrations
  const filteredRegistrations = currentEventRegistrations.filter(reg => {
    const matchesSearch =
      reg.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.participantPhone.includes(searchQuery) ||
      reg.participantEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.guests.some(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAtt = attendanceFilter === 'all' || reg.attendanceStatus === attendanceFilter;
    const matchesPay = paymentFilter === 'all' || reg.paymentStatus === paymentFilter;

    return matchesSearch && matchesAtt && matchesPay;
  });

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !walkInName || !walkInPhone) return;

    addWalkInRegistration(selectedEventId, {
      name: walkInName,
      phone: walkInPhone,
      email: walkInEmail || `${walkInName.toLowerCase().replace(/\s+/g, '')}@pune.shuffle`,
      area: walkInArea,
      paxCount: walkInPax,
      paymentStatus: walkInPayment
    });

    setIsWalkInModalOpen(false);
    setWalkInName('');
    setWalkInPhone('');
    setWalkInEmail('');
    setWalkInPax(1);
  };

  return (
    <div className="space-y-6">
      {/* Event Selection & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#161822] p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              iPad Event-Day Station
            </span>
            {isOfflineMode && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                Offline Mode Active ({offlineSyncQueue.length} queued)
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Live Attendance & Check-In
          </h2>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>📅 {currentEvent?.time}</span>
            <span>•</span>
            <span>📍 {currentEvent?.venue} ({currentEvent?.area})</span>
          </div>
        </div>

        {/* Event selector dropdown & Walk-in button */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            id="select-event-attendance"
            value={selectedEventId}
            onChange={e => setSelectedEventId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500 max-w-xs"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                #{ev.number} — {ev.title} ({ev.status.toUpperCase()})
              </option>
            ))}
          </select>

          <button
            id="btn-add-walk-in"
            onClick={() => setIsWalkInModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Walk-In</span>
          </button>

          {isOfflineMode && offlineSyncQueue.length > 0 && (
            <button
              onClick={syncOfflineData}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync ({offlineSyncQueue.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Attendance KPI Strip (iPad touch glanceable) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-[#161822] border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Total Expected Pax
          </span>
          <span className="text-xl sm:text-2xl font-black text-white mt-0.5 block">
            {totalRegisteredPax}
          </span>
          <span className="text-[10px] text-slate-500">{currentEventRegistrations.length} bookings</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161822] border border-emerald-500/20 text-center">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
            Checked-In Pax
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 block">
            {checkedInPax}
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">{checkedInRegs.length} shufflers</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161822] border border-amber-500/20 text-center">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
            Pending Arrival
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5 block">
            {pendingRegs.reduce((acc, curr) => acc + curr.paxCount, 0)}
          </span>
          <span className="text-[10px] text-amber-400 font-semibold">{pendingRegs.length} shufflers</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161822] border border-rose-500/20 text-center">
          <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">
            Cancelled
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-400 mt-0.5 block">
            {cancelledRegs.length}
          </span>
          <span className="text-[10px] text-slate-500">Seats freed</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161822] border border-purple-500/20 text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
            Capacity
          </span>
          <span className="text-xl sm:text-2xl font-black text-purple-300 mt-0.5 block">
            {capacityUtilization}%
          </span>
          <span className="text-[10px] text-slate-400">{currentEvent?.capacity} max venue</span>
        </div>
      </div>

      {/* Fast Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            id="input-attendance-search"
            type="text"
            placeholder="Search by attendee name, phone, email, guest name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={attendanceFilter}
            onChange={e => setAttendanceFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Attendance</option>
            <option value="Checked In">Checked In</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No Show">No Show</option>
          </select>

          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Payments</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Waived">Waived</option>
          </select>
        </div>
      </div>

      {/* Main Attendance Table / Cards (Optimized for iPad 1-tap operation) */}
      <div className="space-y-3">
        {filteredRegistrations.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#161822] border border-slate-800 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No registrations match current filters</h4>
            <p className="text-xs text-slate-400">
              Try adjusting the search query or use "+ Walk-In" to register an attendee on the spot.
            </p>
          </div>
        ) : (
          filteredRegistrations.map(reg => {
            const isCheckedIn = reg.attendanceStatus === 'Checked In';
            const participantRecord = participants.find(p => p.id === reg.participantId);

            return (
              <div
                key={reg.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg ${
                  isCheckedIn
                    ? 'bg-[#141d1a] border-emerald-500/40'
                    : reg.attendanceStatus === 'Cancelled'
                    ? 'bg-[#1d1416] border-rose-500/20 opacity-60'
                    : 'bg-[#161822] border-slate-800 hover:border-purple-500/40'
                }`}
              >
                {/* Attendee Info & Quick Details */}
                <div
                  onClick={() => setSelectedAttendeeDrawer(reg)}
                  className="flex-1 cursor-pointer group"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">
                      {reg.participantName}
                    </span>

                    <span className="text-xs px-2 py-0.5 rounded-md bg-purple-950/40 text-purple-300 font-bold border border-purple-800/30">
                      {reg.paxCount} {reg.paxCount > 1 ? 'Pax' : 'Solo'}
                    </span>

                    <span className="text-xs text-slate-400 font-medium">
                      {reg.participantPhone}
                    </span>

                    {/* Payment badge & selector */}
                    <span
                      onClick={e => {
                        e.stopPropagation();
                        const nextPay: PaymentStatus =
                          reg.paymentStatus === 'Confirmed'
                            ? 'Pending'
                            : reg.paymentStatus === 'Pending'
                            ? 'Waived'
                            : 'Confirmed';
                        updatePaymentStatus(reg.id, nextPay);
                      }}
                      title="Tap to toggle payment status"
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                        reg.paymentStatus === 'Confirmed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          : reg.paymentStatus === 'Pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      💳 {reg.paymentStatus}
                    </span>

                    {reg.checkInTime && (
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        Checked in @ {reg.checkInTime}
                      </span>
                    )}
                  </div>

                  {/* Accompanying guests preview */}
                  {reg.guests.length > 0 && (
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>Guests:</span>
                      {reg.guests.map((g, idx) => (
                        <span key={idx} className="font-semibold text-slate-300">
                          {g.name || `Guest #${idx + 1}`}{idx < reg.guests.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Games played tagged for this attendee */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Dices className="w-3 h-3 text-purple-400" />
                      Games at table:
                    </span>
                    {reg.gamesPlayed.length === 0 ? (
                      <span className="text-[10px] text-slate-500 italic">None tagged yet</span>
                    ) : (
                      reg.gamesPlayed.map(gid => {
                        const gObj = games.find(g => g.id === gid);
                        return (
                          <span
                            key={gid}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-900/40 text-purple-200 border border-purple-700/40"
                          >
                            {gObj ? gObj.name : gid}
                          </span>
                        );
                      })
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setGameTaggingReg(reg);
                      }}
                      className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 underline ml-1"
                    >
                      + Tag Games
                    </button>
                  </div>
                </div>

                {/* 1-TAP CHECK-IN ACTION & STATUS DROPDOWN (Huge iPad Touch Target) */}
                <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                  {/* Status Dropdown */}
                  <select
                    value={reg.attendanceStatus}
                    onChange={e => markAttendance(reg.id, e.target.value as AttendanceStatus)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Checked In">Checked In</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="No Show">No Show</option>
                  </select>

                  {/* 1-Tap Check-In / Undo Button */}
                  {isCheckedIn ? (
                    <button
                      id={`btn-undo-checkin-${reg.id}`}
                      onClick={() => markAttendance(reg.id, 'Pending')}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Undo</span>
                    </button>
                  ) : (
                    <button
                      id={`btn-1tap-checkin-${reg.id}`}
                      onClick={() => markAttendance(reg.id, 'Checked In')}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 transform active:scale-95"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Check In</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedAttendeeDrawer(reg)}
                    title="View Profile Drawer"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* GAME TAGGING MODAL (Record games played by attendee at this event) */}
      {gameTaggingReg && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161822] border border-purple-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">Record Games Played</h3>
                <p className="text-xs text-purple-400 font-semibold">{gameTaggingReg.participantName}</p>
              </div>
              <button onClick={() => setGameTaggingReg(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select which games this attendee played at this meetup. These will automatically save to their permanent Social Shuffle profile & stats!
            </p>

            {/* Quick Game Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {games.map(game => {
                const isSelected = gameTaggingReg.gamesPlayed.includes(game.id);
                return (
                  <button
                    key={game.id}
                    onClick={() => {
                      toggleGamePlayedForAttendee(gameTaggingReg.id, game.id);
                      // Update local modal state to reflect instantly
                      const updatedPlayed = isSelected
                        ? gameTaggingReg.gamesPlayed.filter(g => g !== game.id)
                        : [...gameTaggingReg.gamesPlayed, game.id];
                      setGameTaggingReg({ ...gameTaggingReg, gamesPlayed: updatedPlayed });
                    }}
                    className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{game.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 ml-1 text-white" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setGameTaggingReg(null)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow"
              >
                Done Tagging
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WALK-IN REGISTRATION MODAL */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161822] border border-purple-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">Event-Day Walk-In Registration</h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentEvent?.title}</p>
              </div>
              <button onClick={() => setIsWalkInModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Attendee Full Name</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={e => setWalkInName(e.target.value)}
                  placeholder="e.g. Vikram Seth"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={walkInPhone}
                    onChange={e => setWalkInPhone(e.target.value)}
                    placeholder="+91 98220 12345"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Pune Area</label>
                  <select
                    value={walkInArea}
                    onChange={e => setWalkInArea(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Koregaon Park">Koregaon Park</option>
                    <option value="Baner">Baner</option>
                    <option value="Viman Nagar">Viman Nagar</option>
                    <option value="Kothrud">Kothrud</option>
                    <option value="Aundh">Aundh</option>
                    <option value="Kalyani Nagar">Kalyani Nagar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Pax Count</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={walkInPax}
                    onChange={e => setWalkInPax(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Payment Status</label>
                  <select
                    value={walkInPayment}
                    onChange={e => setWalkInPayment(e.target.value as PaymentStatus)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Confirmed">Confirmed (Cash / UPI)</option>
                    <option value="Pending">Pending</option>
                    <option value="Waived">Waived</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-800/30 flex justify-between items-center text-xs">
                <span className="text-slate-300">Total Due ({walkInPax} tickets)</span>
                <span className="text-amber-400 font-bold text-sm">
                  ₹{walkInPax * (currentEvent?.ticketPrice || 250)}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30"
                >
                  Complete Walk-In & Check In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SLIDE-OUT RIGHT DRAWER FOR IPAD / TABLET (Section 10 Customer Profile) */}
      {selectedAttendeeDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-[#161822] border-l border-slate-800 w-full max-w-md h-full p-6 shadow-2xl space-y-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400">
                Participant CRM Profile
              </span>
              <button
                onClick={() => setSelectedAttendeeDrawer(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Header */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black">
                {selectedAttendeeDrawer.participantName[0]}
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {selectedAttendeeDrawer.participantName}
                </h3>
                <span className="text-xs text-purple-300 font-semibold">
                  {selectedAttendeeDrawer.participantPhone}
                </span>
                <span className="text-xs text-slate-400 block">
                  {selectedAttendeeDrawer.participantEmail}
                </span>
              </div>
            </div>

            {/* Current Event Booking Details */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Today's Booking
              </span>
              <div className="flex justify-between">
                <span className="text-slate-400">Attendance Status:</span>
                <span className="font-bold text-white">{selectedAttendeeDrawer.attendanceStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pax Count:</span>
                <span className="font-bold text-white">{selectedAttendeeDrawer.paxCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment:</span>
                <span className="font-bold text-amber-400">{selectedAttendeeDrawer.paymentStatus}</span>
              </div>
              {selectedAttendeeDrawer.notes && (
                <div className="pt-1 text-slate-300 italic">
                  Note: "{selectedAttendeeDrawer.notes}"
                </div>
              )}
            </div>

            {/* Lifetime Stats */}
            {(() => {
              const part = participants.find(p => p.id === selectedAttendeeDrawer.participantId);
              if (!part) return null;

              return (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 block">Lifetime Shuffle History</span>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Events Attended</span>
                      <span className="text-lg font-black text-purple-400">{part.totalEventsAttended}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Games Mastered</span>
                      <span className="text-lg font-black text-cyan-400">{part.gamesPlayedIds.length}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Friends Brought</span>
                      <span className="text-lg font-black text-emerald-400">{part.totalPaxBrought}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Locality</span>
                      <span className="text-xs font-bold text-white mt-1 block">{part.area}</span>
                    </div>
                  </div>

                  {/* Games Played List */}
                  {part.gamesPlayedIds.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                        Games Played In Total:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {part.gamesPlayedIds.map(gid => {
                          const g = games.find(item => item.id === gid);
                          return (
                            <span
                              key={gid}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/40 text-purple-200 border border-purple-800/40"
                            >
                              {g ? g.name : gid}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedAttendeeDrawer(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-slate-700"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
