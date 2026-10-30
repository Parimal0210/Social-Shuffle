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
  Sparkles,
  QrCode,
  Camera,
  Bell,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus, PaymentStatus, Registration } from '../../types';
import { AdminEventNotificationModal } from './AdminEventNotificationModal';

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
    verifyAttendeeQrCode,
    isOfflineMode,
    toggleOfflineMode,
    offlineSyncQueue,
    syncOfflineData,
    sendEventBroadcast
  } = useApp();

  // Active event selection
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    if (initialEventId && events.some(e => e.id === initialEventId)) {
      return initialEventId;
    }
    const upcoming = events.find(e => e.status === 'upcoming');
    return upcoming ? upcoming.id : events[0]?.id || '';
  });

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Drawer & Modals state
  const [selectedAttendeeDrawer, setSelectedAttendeeDrawer] = useState<Registration | null>(null);
  const [gameTaggingReg, setGameTaggingReg] = useState<Registration | null>(null);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  // QR Scanner Modal state
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [qrScanMessage, setQrScanMessage] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
    reg?: Registration;
  } | null>(null);

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

  const handleVerifyQr = (overrideCode?: string) => {
    const code = (overrideCode !== undefined ? overrideCode : qrCodeInput).trim();
    if (!code) {
      setQrScanMessage({
        type: 'error',
        text: 'Please enter or scan a QR code token (e.g. SS-REG-xxxx).'
      });
      return;
    }

    const res = verifyAttendeeQrCode(code, selectedEventId);
    if (res.success) {
      if (res.alreadyCheckedIn) {
        setQrScanMessage({
          type: 'warning',
          text: res.message,
          reg: res.registration
        });
      } else {
        setQrScanMessage({
          type: 'success',
          text: res.message,
          reg: res.registration
        });
        setQrCodeInput('');
      }
    } else {
      setQrScanMessage({
        type: 'error',
        text: res.message,
        reg: res.registration
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Selection & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#151E4D] p-4 sm:p-5 rounded-2xl border border-[#283677] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#4AB4A4]/15 text-[#4AB4A4] border border-[#4AB4A4]/30">
              Live Event-Day Station
            </span>
            {isOfflineMode && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFD230]/15 text-[#FFD230] border border-[#FFD230]/30 flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                Offline Mode Active ({offlineSyncQueue.length} queued)
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#F8FAFC] tracking-tight">
            Live Attendance & Check-In
          </h2>

          <div className="text-xs text-[#94A3B8] flex items-center gap-2">
            <span>📅 {currentEvent?.time}</span>
            <span>•</span>
            <span>📍 {currentEvent?.venue} ({currentEvent?.area})</span>
          </div>
        </div>

        {/* Event selector dropdown & Walk-in & QR Scan buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            id="select-event-attendance"
            value={selectedEventId}
            onChange={e => setSelectedEventId(e.target.value)}
            className="bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-xs font-bold text-[#F8FAFC] focus:outline-none focus:border-[#FF751F] max-w-xs"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                #{ev.number} — {ev.title} ({ev.status.toUpperCase()})
              </option>
            ))}
          </select>

          {/* QR Code Scanner Button */}
          <button
            id="btn-open-qr-scanner"
            onClick={() => {
              setQrScanMessage(null);
              setQrCodeInput('');
              setIsQrScannerOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#FF751F] hover:bg-[#E66310] text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#FF751F]/20 transition-all active:scale-95"
            title="Open QR scanner for attendee check-in"
          >
            <QrCode className="w-4 h-4 text-white" />
            <span>Scan QR Pass</span>
          </button>

          <button
            id="btn-add-walk-in"
            onClick={() => setIsWalkInModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1A255C] hover:bg-[#202B61] border border-[#283677] text-[#F8FAFC] font-heading font-bold text-xs flex items-center gap-1.5 shadow transition-all"
          >
            <Plus className="w-4 h-4 text-[#FF751F]" />
            <span>+ Walk-In</span>
          </button>

          {/* Push Email & WhatsApp Notification Button */}
          <button
            id="btn-attendance-push-notif"
            onClick={() => setIsNotificationModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1A255C] hover:bg-[#202B61] border border-[#FF751F]/50 hover:border-[#FF751F] text-[#FF751F] hover:text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            title="Push notification to all attendees on Email as well as WhatsApp (if WhatsApp unavailable, email is sent anyway)"
          >
            <div className="flex items-center gap-0.5">
              <Bell className="w-3.5 h-3.5 text-[#FF751F] animate-pulse" />
              <MessageSquare className="w-3 h-3 text-[#25D366]" />
            </div>
            <span className="hidden sm:inline">Push Notification</span>
            <span className="sm:hidden">Notify</span>
          </button>

          {isOfflineMode && offlineSyncQueue.length > 0 && (
            <button
              onClick={syncOfflineData}
              className="px-3 py-2 rounded-xl bg-[#4AB4A4] hover:bg-[#2bb496] text-[#10173E] font-bold text-xs flex items-center gap-1.5 shadow transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync ({offlineSyncQueue.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Attendance KPI Strip (Touch glanceable) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-[#151E4D] border border-[#283677] text-center">
          <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider block">
            Total Expected Pax
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#F8FAFC] mt-0.5 block">
            {totalRegisteredPax}
          </span>
          <span className="text-[10px] text-[#64748B]">{currentEventRegistrations.length} bookings</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#151E4D] border border-[#4AB4A4]/30 text-center">
          <span className="text-[10px] text-[#4AB4A4] font-bold uppercase tracking-wider block">
            Checked-In Pax
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#4AB4A4] mt-0.5 block">
            {checkedInPax}
          </span>
          <span className="text-[10px] text-[#4AB4A4]/90 font-semibold">{checkedInRegs.length} shufflers</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#151E4D] border border-[#FFD230]/30 text-center">
          <span className="text-[10px] text-[#FFD230] font-bold uppercase tracking-wider block">
            Pending Arrival
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#FFD230] mt-0.5 block">
            {pendingRegs.reduce((acc, curr) => acc + curr.paxCount, 0)}
          </span>
          <span className="text-[10px] text-[#FFD230]/90 font-semibold">{pendingRegs.length} shufflers</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#151E4D] border border-rose-500/20 text-center">
          <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">
            Cancelled
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-400 mt-0.5 block">
            {cancelledRegs.length}
          </span>
          <span className="text-[10px] text-[#64748B]">Seats freed</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#151E4D] border border-[#9440DD]/30 text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] text-[#9440DD] font-bold uppercase tracking-wider block">
            Capacity
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#9440DD] mt-0.5 block">
            {capacityUtilization}%
          </span>
          <span className="text-[10px] text-[#94A3B8]">{currentEvent?.capacity} max venue</span>
        </div>
      </div>

      {/* Fast Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#64748B]" />
          <input
            id="input-attendance-search"
            type="text"
            placeholder="Search by attendee name, phone, email, guest name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#151E4D] border border-[#283677] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FF751F] placeholder:text-[#64748B]"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={attendanceFilter}
            onChange={e => setAttendanceFilter(e.target.value)}
            className="bg-[#151E4D] border border-[#283677] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FF751F]"
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
            className="bg-[#151E4D] border border-[#283677] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FF751F]"
          >
            <option value="all">All Payments</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Waived">Waived</option>
          </select>
        </div>
      </div>

      {/* Main Attendance Table / Cards (Optimized for 1-tap operation) */}
      <div className="space-y-3">
        {filteredRegistrations.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#151E4D] border border-[#283677] text-center space-y-2">
            <Users className="w-8 h-8 text-[#64748B] mx-auto" />
            <h4 className="text-sm font-heading font-bold text-[#F8FAFC]">No registrations match current filters</h4>
            <p className="text-xs text-[#94A3B8]">
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
                    ? 'bg-[#4AB4A4]/10 border-[#4AB4A4]/40'
                    : reg.attendanceStatus === 'Cancelled'
                    ? 'bg-[#151E4D]/50 border-rose-500/20 opacity-60'
                    : 'bg-[#151E4D] border-[#283677] hover:border-[#FF751F]/40'
                }`}
              >
                {/* Attendee Info & Quick Details */}
                <div
                  onClick={() => setSelectedAttendeeDrawer(reg)}
                  className="flex-1 cursor-pointer group"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-heading font-bold text-[#F8FAFC] group-hover:text-[#FF751F] transition-colors">
                      {reg.participantName}
                    </span>

                    <span className="text-xs px-2 py-0.5 rounded-md bg-[#1A255C] text-[#FFD230] font-bold border border-[#283677]">
                      {reg.paxCount} {reg.paxCount > 1 ? 'Pax' : 'Solo'}
                    </span>

                    <span className="text-xs text-[#94A3B8] font-medium">
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
                          ? 'bg-[#4AB4A4]/15 text-[#4AB4A4] border border-[#4AB4A4]/30 hover:bg-[#4AB4A4]/25'
                          : reg.paymentStatus === 'Pending'
                          ? 'bg-[#FFD230]/15 text-[#FFD230] border border-[#FFD230]/30 hover:bg-[#FFD230]/25'
                          : 'bg-[#1A255C] text-[#94A3B8] border border-[#283677]'
                      }`}
                    >
                      💳 {reg.paymentStatus}
                    </span>

                    {reg.checkInTime && (
                      <span className="text-[10px] text-[#4AB4A4] font-semibold">
                        Checked in @ {reg.checkInTime}
                      </span>
                    )}
                  </div>

                  {/* Accompanying guests preview */}
                  {reg.guests.length > 0 && (
                    <div className="text-xs text-[#94A3B8] mt-1 flex items-center gap-1.5 flex-wrap">
                      <Users className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Guests:</span>
                      {reg.guests.map((g, idx) => (
                        <span key={idx} className="font-semibold text-[#F8FAFC]">
                          {g.name || `Guest #${idx + 1}`}{idx < reg.guests.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Games played tagged for this attendee */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                      <Dices className="w-3 h-3 text-[#FF751F]" />
                      Games at table:
                    </span>
                    {reg.gamesPlayed.length === 0 ? (
                      <span className="text-[10px] text-[#64748B] italic">None tagged yet</span>
                    ) : (
                      reg.gamesPlayed.map(gid => {
                        const gObj = games.find(g => g.id === gid);
                        return (
                          <span
                            key={gid}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#1A255C] text-[#FFD230] border border-[#283677]"
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
                      className="text-[10px] font-bold text-[#4AB4A4] hover:underline ml-1"
                    >
                      + Tag Games
                    </button>
                  </div>
                </div>

                {/* 1-TAP CHECK-IN ACTION & STATUS DROPDOWN (1-Tap Touch Target) */}
                <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                  {/* Status Dropdown */}
                  <select
                    value={reg.attendanceStatus}
                    onChange={e => markAttendance(reg.id, e.target.value as AttendanceStatus)}
                    className="bg-[#10173E] border border-[#283677] rounded-xl px-2.5 py-2 text-xs font-semibold text-[#F8FAFC] focus:outline-none focus:border-[#FF751F]"
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
                      className="px-4 py-2.5 rounded-xl bg-[#1A255C] hover:bg-[#202B61] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-bold border border-[#283677] transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#4AB4A4]" />
                      <span>Undo</span>
                    </button>
                  ) : (
                    <button
                      id={`btn-1tap-checkin-${reg.id}`}
                      onClick={() => markAttendance(reg.id, 'Checked In')}
                      className="px-5 py-2.5 rounded-xl bg-[#4AB4A4] hover:bg-[#2bb496] text-[#10173E] text-xs font-heading font-extrabold shadow-lg shadow-[#4AB4A4]/20 transition-all flex items-center gap-1.5 transform active:scale-95"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Check In</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedAttendeeDrawer(reg)}
                    title="View Profile Drawer"
                    className="p-2 rounded-xl bg-[#1A255C] hover:bg-[#202B61] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#283677] transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151E4D] border border-[#283677] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#202B61]">
              <div>
                <h3 className="text-base font-heading font-bold text-[#F8FAFC]">Record Games Played</h3>
                <p className="text-xs text-[#FF751F] font-semibold">{gameTaggingReg.participantName}</p>
              </div>
              <button onClick={() => setGameTaggingReg(null)} className="text-[#94A3B8] hover:text-[#F8FAFC]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#94A3B8]">
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
                    className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#FF751F] border-[#FF751F] text-white shadow-md'
                        : 'bg-[#1A255C] border-[#283677] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#202B61]'
                    }`}
                  >
                    <span className="truncate">{game.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 ml-1 text-white" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#202B61] flex justify-end">
              <button
                onClick={() => setGameTaggingReg(null)}
                className="px-5 py-2 rounded-xl bg-[#FF751F] hover:bg-[#E66310] text-white font-heading font-bold text-xs shadow-md shadow-[#FF751F]/20"
              >
                Done Tagging
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WALK-IN REGISTRATION MODAL */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151E4D] border border-[#283677] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#202B61]">
              <div>
                <h3 className="text-base font-heading font-bold text-[#F8FAFC]">Event-Day Walk-In Registration</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">{currentEvent?.title}</p>
              </div>
              <button onClick={() => setIsWalkInModalOpen(false)} className="text-[#94A3B8] hover:text-[#F8FAFC]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#94A3B8] font-semibold mb-1">Attendee Full Name</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={e => setWalkInName(e.target.value)}
                  placeholder="e.g. Vikram Seth"
                  className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#FF751F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#94A3B8] font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={walkInPhone}
                    onChange={e => setWalkInPhone(e.target.value)}
                    placeholder="+91 98220 12345"
                    className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#FF751F]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-semibold mb-1">Pune Area</label>
                  <select
                    value={walkInArea}
                    onChange={e => setWalkInArea(e.target.value)}
                    className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#FF751F]"
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
                  <label className="block text-[#94A3B8] font-semibold mb-1">Pax Count</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={walkInPax}
                    onChange={e => setWalkInPax(Number(e.target.value))}
                    className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#FF751F]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-semibold mb-1">Payment Status</label>
                  <select
                    value={walkInPayment}
                    onChange={e => setWalkInPayment(e.target.value as PaymentStatus)}
                    className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#FF751F]"
                  >
                    <option value="Confirmed">Confirmed (Cash / UPI)</option>
                    <option value="Pending">Pending</option>
                    <option value="Waived">Waived</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1A255C] border border-[#283677] flex justify-between items-center text-xs">
                <span className="text-[#94A3B8]">Total Due ({walkInPax} tickets)</span>
                <span className="text-[#FFD230] font-bold text-sm">
                  ₹{walkInPax * (currentEvent?.ticketPrice || 250)}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#283677] text-[#94A3B8] font-semibold hover:bg-[#1A255C] hover:text-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#FF751F] hover:bg-[#E66310] text-white font-heading font-bold shadow-lg shadow-[#FF751F]/20"
                >
                  Complete Walk-In & Check In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SLIDE-OUT RIGHT DRAWER FOR TABLET / DESKTOP (Section 10 Customer Profile) */}
      {selectedAttendeeDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="bg-[#151E4D] border-l border-[#283677] w-full max-w-md h-full p-6 shadow-2xl space-y-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#202B61]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF751F]">
                Participant CRM Profile
              </span>
              <button
                onClick={() => setSelectedAttendeeDrawer(null)}
                className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Header */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FF751F] flex items-center justify-center text-white text-xl font-heading font-black shadow-md">
                {selectedAttendeeDrawer.participantName[0]}
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-[#F8FAFC]">
                  {selectedAttendeeDrawer.participantName}
                </h3>
                <span className="text-xs text-[#FFD230] font-semibold">
                  {selectedAttendeeDrawer.participantPhone}
                </span>
                <span className="text-xs text-[#94A3B8] block">
                  {selectedAttendeeDrawer.participantEmail}
                </span>
              </div>
            </div>

            {/* Current Event Booking Details */}
            <div className="p-4 rounded-xl bg-[#1A255C] border border-[#283677] space-y-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                Today's Booking
              </span>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Attendance Status:</span>
                <span className="font-bold text-[#F8FAFC]">{selectedAttendeeDrawer.attendanceStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Pax Count:</span>
                <span className="font-bold text-[#F8FAFC]">{selectedAttendeeDrawer.paxCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Payment:</span>
                <span className="font-bold text-[#FFD230]">{selectedAttendeeDrawer.paymentStatus}</span>
              </div>
              {selectedAttendeeDrawer.notes && (
                <div className="pt-1 text-[#94A3B8] italic">
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
                  <span className="text-xs font-bold text-[#F8FAFC] block">Lifetime Shuffle History</span>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-[#1A255C] border border-[#283677]">
                      <span className="text-[#94A3B8] text-[10px] block">Events Attended</span>
                      <span className="text-lg font-heading font-bold text-[#FF751F]">{part.totalEventsAttended}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1A255C] border border-[#283677]">
                      <span className="text-[#94A3B8] text-[10px] block">Games Mastered</span>
                      <span className="text-lg font-heading font-bold text-[#4AB4A4]">{part.gamesPlayedIds.length}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1A255C] border border-[#283677]">
                      <span className="text-[#94A3B8] text-[10px] block">Friends Brought</span>
                      <span className="text-lg font-heading font-bold text-[#FFD230]">{part.totalPaxBrought}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1A255C] border border-[#283677]">
                      <span className="text-[#94A3B8] text-[10px] block">Locality</span>
                      <span className="text-xs font-bold text-[#F8FAFC] mt-1 block">{part.area}</span>
                    </div>
                  </div>

                  {/* Games Played List */}
                  {part.gamesPlayedIds.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-[#94A3B8] block mb-1.5">
                        Games Played In Total:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {part.gamesPlayedIds.map(gid => {
                          const g = games.find(item => item.id === gid);
                          return (
                            <span
                              key={gid}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-[#1A255C] text-[#FFD230] border border-[#283677]"
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

            <div className="pt-4 border-t border-[#202B61]">
              <button
                onClick={() => setSelectedAttendeeDrawer(null)}
                className="w-full py-2.5 rounded-xl bg-[#1A255C] text-[#F8FAFC] font-heading font-bold text-xs hover:bg-[#202B61] border border-[#283677]"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Door QR & Ticket Scanner Modal */}
      {isQrScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151E4D] border border-[#283677] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#202B61]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#FF751F] text-white shadow-md">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-bold text-[#F8FAFC]">Door QR Scanner & Check-In</h3>
                  <p className="text-[11px] text-[#94A3B8]">
                    {currentEvent?.title} (#{currentEvent?.number})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsQrScannerOpen(false)}
                className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 rounded-lg hover:bg-[#1A255C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewfinder Graphic with Laser Scan line */}
            <div className="relative rounded-2xl bg-[#10173E] border-2 border-dashed border-[#FF751F]/40 p-6 flex flex-col items-center justify-center overflow-hidden">
              {/* Laser animation bar */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FF751F] to-transparent shadow-[0_0_12px_#FF751F] animate-pulse" />

              <div className="w-40 h-40 border-2 border-[#4AB4A4]/40 rounded-2xl flex flex-col items-center justify-center relative bg-[#1A255C]/60">
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#4AB4A4]" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#4AB4A4]" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#4AB4A4]" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#4AB4A4]" />

                <Camera className="w-10 h-10 text-[#4AB4A4] animate-pulse mb-2" />
                <span className="text-[10px] font-bold text-[#4AB4A4] uppercase tracking-widest text-center px-2">
                  Scanner Active
                </span>
              </div>

              <span className="text-[11px] text-[#94A3B8] mt-3 text-center">
                Point device camera at attendee pass or use scanner gun below.
              </span>
            </div>

            {/* Scanner Input / Barcode Gun Form */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleVerifyQr();
              }}
              className="space-y-3"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={qrCodeInput}
                  onChange={e => setQrCodeInput(e.target.value)}
                  placeholder="Paste or scan QR code token (e.g., SS-REG-...)..."
                  className="flex-1 bg-[#10173E] border border-[#283677] rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#FF751F] font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#FF751F] hover:bg-[#E66310] text-white font-heading font-bold text-xs shadow-md shadow-[#FF751F]/20 transition-all"
                >
                  Verify
                </button>
              </div>
            </form>

            {/* Quick 1-Tap Demo Test Attendees for Testing */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                Quick Test with Event Attendees (1-Click Sim):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {currentEventRegistrations.slice(0, 6).map(reg => {
                  const token = reg.qrCodeToken || `SS-REG-${reg.id}`;
                  const isChecked = reg.attendanceStatus === 'Checked In';
                  return (
                    <button
                      key={reg.id}
                      type="button"
                      onClick={() => handleVerifyQr(token)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1 ${
                        isChecked
                          ? 'bg-[#4AB4A4]/20 border-[#4AB4A4]/40 text-[#4AB4A4]'
                          : 'bg-[#1A255C] border-[#283677] text-[#94A3B8] hover:bg-[#202B61] hover:text-[#F8FAFC]'
                      }`}
                    >
                      <span>{isChecked ? '✓' : '🎲'}</span>
                      <span>{reg.participantName}</span>
                      <span className="text-[9px] text-[#64748B] font-mono">({token.slice(-6)})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scan Feedback Message */}
            {qrScanMessage && (
              <div
                className={`p-3.5 rounded-2xl text-xs space-y-1.5 border animate-in fade-in zoom-in-95 duration-150 ${
                  qrScanMessage.type === 'success'
                    ? 'bg-[#4AB4A4]/15 border-[#4AB4A4]/40 text-[#4AB4A4]'
                    : qrScanMessage.type === 'warning'
                    ? 'bg-[#FFD230]/15 border-[#FFD230]/40 text-[#FFD230]'
                    : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {qrScanMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-[#4AB4A4] shrink-0" />
                  ) : qrScanMessage.type === 'warning' ? (
                    <Clock className="w-5 h-5 text-[#FFD230] shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <span>{qrScanMessage.text}</span>
                </div>

                {qrScanMessage.reg && (
                  <div className="pt-2 mt-1 border-t border-white/10 text-[11px] grid grid-cols-2 gap-2 text-[#94A3B8]">
                    <div><strong className="text-[#F8FAFC]">Participant:</strong> {qrScanMessage.reg.participantName}</div>
                    <div><strong className="text-[#F8FAFC]">Pax:</strong> {qrScanMessage.reg.paxCount} Shuffler(s)</div>
                    <div><strong className="text-[#F8FAFC]">Phone:</strong> {qrScanMessage.reg.participantPhone}</div>
                    <div><strong className="text-[#F8FAFC]">Payment:</strong> {qrScanMessage.reg.paymentStatus}</div>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsQrScannerOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1A255C] hover:bg-[#202B61] text-[#F8FAFC] border border-[#283677] text-xs font-bold transition-colors"
              >
                Done Scanning
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Push Email Notification Modal */}
      {isNotificationModalOpen && currentEvent && (
        <AdminEventNotificationModal
          event={currentEvent}
          registrations={registrations}
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          onBroadcast={sendEventBroadcast}
        />
      )}
    </div>
  );
};
