import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Dices,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ShuffleEvent, GuestInfo } from '../../types';

interface ParticipantEventsProps {
  preselectedEventId?: string;
}

export const ParticipantEvents: React.FC<ParticipantEventsProps> = ({ preselectedEventId }) => {
  const { events, games, registrations, currentParticipant, registerForEvent, cancelRegistration } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'upcoming' | 'my-events'>('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<ShuffleEvent | null>(() => {
    if (preselectedEventId) {
      return events.find(e => e.id === preselectedEventId) || null;
    }
    return null;
  });

  // Registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [registeringEvent, setRegisteringEvent] = useState<ShuffleEvent | null>(null);
  const [paxCount, setPaxCount] = useState<number>(1);
  const [guests, setGuests] = useState<GuestInfo[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [regFeedback, setRegFeedback] = useState<{ message: string; success: boolean } | null>(null);

  // My registered events
  const myRegistrations = registrations.filter(
    r => r.participantId === currentParticipant.id && r.attendanceStatus !== 'Cancelled'
  );

  const openRegistration = (event: ShuffleEvent) => {
    setRegisteringEvent(event);
    setPaxCount(1);
    setGuests([]);
    setNotes('');
    setRegFeedback(null);
    setShowRegisterModal(true);
  };

  const handlePaxChange = (count: number) => {
    setPaxCount(count);
    const guestDiff = count - 1;
    if (guestDiff > guests.length) {
      const added: GuestInfo[] = [];
      for (let i = guests.length; i < guestDiff; i++) {
        added.push({
          id: `guest-${Date.now()}-${i}`,
          name: '',
          phone: '',
          area: currentParticipant.area
        });
      }
      setGuests([...guests, ...added]);
    } else if (guestDiff < guests.length) {
      setGuests(guests.slice(0, Math.max(0, guestDiff)));
    }
  };

  const handleGuestNameChange = (index: number, name: string) => {
    const updated = [...guests];
    updated[index] = { ...updated[index], name };
    setGuests(updated);
  };

  const handleConfirmRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringEvent) return;

    const result = registerForEvent(registeringEvent.id, paxCount, guests, notes);
    setRegFeedback(result);

    if (result.success) {
      setTimeout(() => {
        setShowRegisterModal(false);
        setActiveSubTab('my-events');
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Sub Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            id="tab-sub-upcoming"
            onClick={() => setActiveSubTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'upcoming'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Upcoming Meetups ({events.filter(e => e.status === 'upcoming').length})
          </button>
          <button
            id="tab-sub-my-events"
            onClick={() => setActiveSubTab('my-events')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'my-events'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            My Registrations ({myRegistrations.length})
          </button>
        </div>

        <div className="text-xs text-slate-400 hidden sm:block">
          📍 Pune Meetup Hub
        </div>
      </div>

      {/* View: Upcoming Events */}
      {activeSubTab === 'upcoming' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {events
            .filter(e => e.status !== 'archived')
            .map(event => {
              const isRegistered = registrations.some(
                r => r.eventId === event.id && r.participantId === currentParticipant.id && r.attendanceStatus !== 'Cancelled'
              );

              // Calculate registered seats
              const totalRegisteredPax = registrations
                .filter(r => r.eventId === event.id && r.attendanceStatus !== 'Cancelled')
                .reduce((acc, curr) => acc + curr.paxCount, 0);

              const availableSeats = Math.max(0, event.capacity - totalRegisteredPax);

              return (
                <div
                  key={event.id}
                  className="rounded-2xl bg-[#161822] border border-slate-800/80 hover:border-purple-500/30 transition-all p-5 flex flex-col justify-between gap-4 shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {event.category}
                      </span>
                      <span className="text-xs font-bold text-amber-400">
                        ₹{event.ticketPrice} per ticket
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{event.venue}, {event.area}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          {availableSeats} seats left of {event.capacity} total
                        </span>
                      </div>
                    </div>

                    {/* Planned Games chips */}
                    {event.plannedGames.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1.5">
                          <Dices className="w-3.5 h-3.5 text-purple-400" />
                          Featured Tables
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {event.plannedGames.map(gameId => {
                            const game = games.find(g => g.id === gameId);
                            return (
                              <span
                                key={gameId}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 font-medium"
                              >
                                {game ? game.name : gameId}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                      View Full Details
                    </button>

                    {isRegistered ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Registered</span>
                      </div>
                    ) : (
                      <button
                        id={`btn-register-ev-${event.id}`}
                        onClick={() => openRegistration(event)}
                        disabled={event.status !== 'upcoming' || availableSeats <= 0}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          event.status === 'upcoming' && availableSeats > 0
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {event.status !== 'upcoming'
                          ? 'Event Completed'
                          : availableSeats <= 0
                          ? 'Sold Out'
                          : 'Register Now'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* View: My Registrations */}
      {activeSubTab === 'my-events' && (
        <div className="space-y-4">
          {myRegistrations.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#161822] border border-slate-800 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-base font-bold text-white">No active registrations</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven't registered for any upcoming Social Shuffle meetups yet. Browse upcoming events to reserve your spot!
              </p>
              <button
                onClick={() => setActiveSubTab('upcoming')}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow hover:bg-purple-500 transition-colors"
              >
                Browse Upcoming Meetups
              </button>
            </div>
          ) : (
            myRegistrations.map(reg => {
              const event = events.find(e => e.id === reg.eventId);
              return (
                <div
                  key={reg.id}
                  className="p-5 rounded-2xl bg-[#161822] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-purple-400">
                        Registration #{reg.id}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {reg.attendanceStatus === 'Checked In' ? '✓ Checked In' : 'Confirmed Booking'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {reg.paxCount} {reg.paxCount > 1 ? 'Shufflers (You + Guests)' : 'Shuffler'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {event?.title || `Event #${reg.eventId}`}
                    </h3>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>📅 {event?.time}</span>
                      <span>📍 {event?.venue}, {event?.area}</span>
                      <span>💳 Payment: {reg.paymentStatus}</span>
                    </div>

                    {reg.guests.length > 0 && (
                      <div className="text-xs text-slate-400 pt-1">
                        <span className="font-semibold text-slate-300">Accompanying Guests: </span>
                        {reg.guests.map(g => g.name || 'Friend').join(', ')}
                      </div>
                    )}

                    {reg.notes && (
                      <div className="text-xs text-slate-400 italic">
                        Notes: "{reg.notes}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                    {reg.attendanceStatus !== 'Checked In' && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this registration?')) {
                            cancelRegistration(reg.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Registration Modal (Interactive Flow with Pax count & guest names) */}
      {showRegisterModal && registeringEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161822] border border-purple-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white">Register for Social Shuffle</h3>
                <p className="text-xs text-slate-400 mt-0.5">{registeringEvent.title}</p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {regFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  regFeedback.success
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}
              >
                {regFeedback.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{regFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleConfirmRegistration} className="space-y-4 text-xs">
              {/* Event snapshot */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex justify-between font-medium text-slate-300">
                  <span>Venue & Locality:</span>
                  <span className="text-white font-bold">{registeringEvent.venue}, {registeringEvent.area}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-300">
                  <span>Date & Time:</span>
                  <span className="text-white">{registeringEvent.time}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-300">
                  <span>Ticket Price:</span>
                  <span className="text-amber-400 font-bold">₹{registeringEvent.ticketPrice} per person</span>
                </div>
              </div>

              {/* Shuffler Profile */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Lead Shuffler</label>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 flex justify-between">
                  <span className="font-bold">{currentParticipant.name}</span>
                  <span className="text-slate-400">{currentParticipant.phone} • {currentParticipant.area}</span>
                </div>
              </div>

              {/* Pax Count Selector */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">
                  How many people are coming with you?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handlePaxChange(num)}
                      className={`py-2 rounded-xl font-bold border transition-all text-center ${
                        paxCount === num
                          ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-700/60'
                      }`}
                    >
                      {num} {num === 1 ? 'Solo' : `${num} Pax`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Information fields if Pax > 1 */}
              {paxCount > 1 && (
                <div className="space-y-2 pt-1">
                  <label className="block text-slate-400 font-semibold">
                    Guest Information (helps us balance board game tables)
                  </label>
                  {guests.map((guest, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder={`Guest #${idx + 1} Name`}
                        value={guest.name}
                        onChange={e => handleGuestNameChange(idx, e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Special Game Requests or Seating Notes */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Board Game Wishlist / Seating Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Please seat me at Catan or Coup table! First time playing modern board games."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Total Calculation */}
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-300 block">Total Due at Door / Registration</span>
                  <span className="text-[10px] text-slate-400">{paxCount} ticket(s) × ₹{registeringEvent.ticketPrice}</span>
                </div>
                <div className="text-base font-black text-amber-400">
                  ₹{paxCount * registeringEvent.ticketPrice}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-registration"
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161822] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Event #{selectedEvent.number}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-black text-white">{selectedEvent.title}</h3>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedEvent.description}</p>

            <div className="space-y-2 text-xs text-slate-300 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>📍 <strong>Venue:</strong> {selectedEvent.venue} ({selectedEvent.address})</div>
              <div>📅 <strong>Schedule:</strong> {selectedEvent.time}</div>
              <div>🏷️ <strong>Category:</strong> {selectedEvent.category}</div>
              <div>👥 <strong>Capacity:</strong> {selectedEvent.capacity} Shufflers</div>
              <div>🎫 <strong>Ticket:</strong> ₹{selectedEvent.ticketPrice}</div>
              <div>💡 <strong>Host Notes:</strong> {selectedEvent.notes}</div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-300 font-semibold"
              >
                Close
              </button>
              {selectedEvent.status === 'upcoming' && (
                <button
                  onClick={() => {
                    const ev = selectedEvent;
                    setSelectedEvent(null);
                    openRegistration(ev);
                  }}
                  className="flex-1 py-2 rounded-xl bg-purple-600 text-white font-bold shadow hover:bg-purple-500"
                >
                  Register Spot
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
