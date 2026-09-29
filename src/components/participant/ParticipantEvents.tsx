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
  Minus,
  User,
  UserPlus,
  UserCheck,
  Trash2,
  AlertCircle,
  QrCode,
  Mail,
  Sparkles,
  Ticket,
  Eye,
  Share2,
  ShieldCheck,
  CreditCard,
  Lock,
  Smartphone,
  Building,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ShuffleEvent, GuestInfo, Registration } from '../../types';

interface ParticipantEventsProps {
  preselectedEventId?: string;
}

export const ParticipantEvents: React.FC<ParticipantEventsProps> = ({ preselectedEventId }) => {
  const {
    events,
    games,
    registrations,
    currentParticipant,
    registerForEvent,
    cancelRegistration,
    generateEmailPreviewHtml
  } = useApp();

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
  const [totalParticipants, setTotalParticipants] = useState<number>(1);
  const [additionalParticipants, setAdditionalParticipants] = useState<GuestInfo[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [regFeedback, setRegFeedback] = useState<{ message: string; success: boolean } | null>(null);

  const samplePuneNames = ['Tanvi Joshi', 'Rahul Kulkarni', 'Aditi Patil', 'Rohan Shinde', 'Sneha Deshpande', 'Siddharth More'];

  // Digital Ticket Pass & Email Preview Modals
  const [activeTicketReg, setActiveTicketReg] = useState<Registration | null>(null);
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
  const [emailPreviewRegId, setEmailPreviewRegId] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);

  // Razorpay Payment Gateway State
  const [razorpayGatewayModal, setRazorpayGatewayModal] = useState<{
    event: ShuffleEvent;
    totalParticipants: number;
    additionalParticipants: GuestInfo[];
    notes: string;
    totalAmount: number;
    orderId: string;
  } | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<'checkout' | 'authorizing' | 'success'>('checkout');
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiIdInput, setUpiIdInput] = useState<string>('shuffler@okhdfcbank');
  const [paymentSuccessAlert, setPaymentSuccessAlert] = useState<{
    eventName: string;
    paymentId: string;
    amount: number;
  } | null>(null);

  // My registered events
  const myRegistrations = registrations.filter(
    r => r.participantId === currentParticipant.id && r.attendanceStatus !== 'Cancelled'
  );

  const openRegistration = (event: ShuffleEvent) => {
    setRegisteringEvent(event);
    setTotalParticipants(1);
    setAdditionalParticipants([]);
    setNotes('');
    setValidationError(null);
    setRegFeedback(null);
    setShowRegisterModal(true);
  };

  const handleTotalParticipantsChange = (count: number) => {
    // Default and minimum value is 1
    const validCount = Math.max(1, Math.min(12, Math.floor(count || 1)));
    setTotalParticipants(validCount);
    setValidationError(null);

    const neededAdditional = validCount - 1;

    if (neededAdditional > additionalParticipants.length) {
      const added: GuestInfo[] = [];
      for (let i = additionalParticipants.length; i < neededAdditional; i++) {
        added.push({
          id: `participant-${Date.now()}-${i + 2}`,
          name: '',
          phone: '',
          area: currentParticipant.area || 'Pune'
        });
      }
      setAdditionalParticipants([...additionalParticipants, ...added]);
    } else if (neededAdditional < additionalParticipants.length) {
      setAdditionalParticipants(additionalParticipants.slice(0, neededAdditional));
    }
  };

  const handleAdditionalParticipantNameChange = (index: number, name: string) => {
    setValidationError(null);
    const updated = [...additionalParticipants];
    if (updated[index]) {
      updated[index] = { ...updated[index], name };
      setAdditionalParticipants(updated);
    }
  };

  const handleAdditionalParticipantPhoneChange = (index: number, phone: string) => {
    const updated = [...additionalParticipants];
    if (updated[index]) {
      updated[index] = { ...updated[index], phone };
      setAdditionalParticipants(updated);
    }
  };

  // Step 1: User clicks "Confirm & Pay via Razorpay" -> Validates and Redirects to Razorpay Gateway
  const handleConfirmRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringEvent) return;

    // If totalParticipants > 1, validate that every additional participant has a name
    if (totalParticipants > 1) {
      const neededAdditional = totalParticipants - 1;
      for (let i = 0; i < neededAdditional; i++) {
        const pName = additionalParticipants[i]?.name?.trim();
        if (!pName) {
          setValidationError(`Please enter the full name for Participant #${i + 2} before proceeding to payment.`);
          return;
        }
      }
    }

    const sanitizedAdditional = additionalParticipants.slice(0, totalParticipants - 1).map((p, i) => ({
      ...p,
      name: p.name.trim() || `Participant #${i + 2}`,
      area: p.area || currentParticipant.area || 'Pune'
    }));

    const totalAmount = totalParticipants * registeringEvent.ticketPrice;
    const orderId = `order_SS_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    // Close the intake form modal
    setShowRegisterModal(false);

    // Redirect to Razorpay Payment Gateway
    setRazorpayGatewayModal({
      event: registeringEvent,
      totalParticipants,
      additionalParticipants: sanitizedAdditional,
      notes,
      totalAmount,
      orderId
    });
    setPaymentStep('checkout');
    setPaymentProcessing(false);

    // If native Razorpay checkout.js script loaded, also initiate native popup
    if (typeof (window as any).Razorpay !== 'undefined') {
      try {
        const rzp = new (window as any).Razorpay({
          key: 'rzp_test_SocialShufflePune',
          amount: totalAmount * 100,
          currency: 'INR',
          name: 'Social Shuffle Pune',
          description: `${registeringEvent.title} (${totalParticipants} Pax)`,
          image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=120&auto=format&fit=crop&q=80',
          order_id: orderId,
          handler: function (response: any) {
            handleCompleteRazorpayPayment(response.razorpay_payment_id || `pay_${Date.now().toString(36)}`);
          },
          prefill: {
            name: currentParticipant.name,
            email: currentParticipant.email,
            contact: currentParticipant.phone
          },
          theme: {
            color: '#7c3aed'
          }
        });
        rzp.open();
      } catch (e) {
        // Fallback to embedded Razorpay gateway view
      }
    }
  };

  // Step 2: Razorpay confirms payment was successfully done -> Only then register attendee and redirect to event page
  const handleCompleteRazorpayPayment = (customPaymentId?: string) => {
    if (!razorpayGatewayModal) return;

    const paymentId = customPaymentId || `pay_rzp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    setPaymentProcessing(true);
    setPaymentStep('authorizing');

    setTimeout(() => {
      setPaymentStep('success');

      setTimeout(() => {
        // Only now that Razorpay confirms successful payment, finalize registration!
        const result = registerForEvent(
          razorpayGatewayModal.event.id,
          razorpayGatewayModal.totalParticipants,
          razorpayGatewayModal.additionalParticipants,
          razorpayGatewayModal.notes,
          {
            razorpayPaymentId: paymentId,
            razorpayOrderId: razorpayGatewayModal.orderId,
            amountPaid: razorpayGatewayModal.totalAmount
          }
        );

        setPaymentSuccessAlert({
          eventName: razorpayGatewayModal.event.title,
          paymentId: paymentId,
          amount: razorpayGatewayModal.totalAmount
        });

        // Close Razorpay gateway modal
        setRazorpayGatewayModal(null);
        setPaymentProcessing(false);

        // Redirect back to event page ("My Registrations")
        setActiveSubTab('my-events');

        // Show you are registered! Open digital ticket pass
        if (result.success && result.registration) {
          setActiveTicketReg(result.registration);
          setShowTicketModal(true);
        }
      }, 700);
    }, 1000);
  };

  const handleCancelPayment = () => {
    setRazorpayGatewayModal(null);
    setPaymentProcessing(false);
    setPaymentStep('checkout');
    setRegFeedback({
      message: 'Razorpay payment was cancelled. You are not registered for the meetup.',
      success: false
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Payment Success Alert on Event Page */}
      {paymentSuccessAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-emerald-900/60 to-slate-900 border border-emerald-500/40 shadow-xl flex items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm text-white">Payment Confirmed via Razorpay! 🎉</span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
                  {paymentSuccessAlert.paymentId}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                You are registered for <strong>{paymentSuccessAlert.eventName}</strong> (₹{paymentSuccessAlert.amount} paid). Your digital QR check-in pass has been generated!
              </p>
            </div>
          </div>
          <button
            onClick={() => setPaymentSuccessAlert(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 shrink-0"
          >
            ✕
          </button>
        </div>
      )}

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
                        {reg.paxCount} {reg.paxCount > 1 ? 'Participants' : 'Participant (Solo)'}
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
                        <span className="font-semibold text-slate-300">Additional Participants: </span>
                        {reg.guests.map(g => g.name || 'Participant').join(', ')}
                      </div>
                    )}

                    {reg.notes && (
                      <div className="text-xs text-slate-400 italic">
                        Notes: "{reg.notes}"
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
                    <button
                      onClick={() => {
                        setActiveTicketReg(reg);
                        setShowTicketModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QR Ticket</span>
                    </button>

                    <button
                      onClick={() => {
                        setEmailPreviewRegId(reg.id);
                        setShowEmailModal(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Preview registration email"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email</span>
                    </button>

                    {reg.attendanceStatus !== 'Checked In' && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this registration?')) {
                            cancelRegistration(reg.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
                      >
                        Cancel
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

              {/* Total Number of Participants Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-200 font-bold text-xs flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span>Total Number of Participants</span>
                  </label>
                  <span className="text-[11px] font-bold text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-800/40">
                    {totalParticipants} {totalParticipants === 1 ? 'Participant (Solo)' : 'Participants'}
                  </span>
                </div>

                {/* Stepper with custom counter - Default and Minimum is 1 */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div>
                    <span className="text-xs text-slate-300 font-semibold block">
                      Number of Participants
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Default & minimum: 1 (Includes you as Participant #1)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTotalParticipantsChange(totalParticipants - 1)}
                      disabled={totalParticipants <= 1}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors border border-slate-700"
                      title="Decrease participants (minimum 1)"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={totalParticipants}
                      onChange={e => handleTotalParticipantsChange(parseInt(e.target.value, 10) || 1)}
                      className="w-12 text-center bg-slate-950 border border-slate-700 rounded-lg py-1.5 text-xs text-white font-bold focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleTotalParticipantsChange(totalParticipants + 1)}
                      disabled={totalParticipants >= 12}
                      className="w-8 h-8 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-sm"
                      title="Increase participants"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Validation error alert */}
              {validationError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Participant #1 (You / Lead) Profile */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-purple-600/30 border border-purple-400/40 text-[9px] flex items-center justify-center text-purple-200 font-bold">
                      1
                    </span>
                    Participant #1 (Lead / You)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1 text-[11px] text-slate-300 pl-5">
                  <span className="font-bold text-white">{currentParticipant.name}</span>
                  <span className="text-slate-400">{currentParticipant.phone} • {currentParticipant.area}</span>
                </div>
              </div>

              {/* If value is 1 (Solo) */}
              {totalParticipants === 1 ? (
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-white">Attending Solo:</strong> 1 seat reserved for <strong>{currentParticipant.name}</strong>. No additional names required. Aman and Parimal will welcome you and seat you at a fun table with friendly people!
                  </div>
                </div>
              ) : (
                /* If they added in that value (totalParticipants > 1), ask for additional names only (no mobile) */
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="block text-slate-200 font-bold text-xs flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-purple-400" />
                      <span>Names for Additional Participants ({totalParticipants - 1})</span>
                      <span className="text-rose-400 font-normal">*Required</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Please enter the full name for each additional participant joining with you.
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {additionalParticipants.slice(0, totalParticipants - 1).map((p, idx) => {
                      const participantNumber = idx + 2;
                      return (
                        <div
                          key={p.id || idx}
                          className={`p-2.5 rounded-xl border transition-all ${
                            p.name.trim()
                              ? 'bg-slate-900/90 border-slate-700/80'
                              : validationError
                              ? 'bg-slate-900/80 border-rose-500/60 ring-1 ring-rose-500/40'
                              : 'bg-slate-900/60 border-purple-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-purple-600/30 border border-purple-400/40 text-[9px] flex items-center justify-center text-purple-200 font-bold">
                                {participantNumber}
                              </span>
                              Participant #{participantNumber}
                            </span>
                            {p.name.trim() ? (
                              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                                <CheckCircle2 className="w-3 h-3" /> Name entered
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-400 font-medium">
                                Name required *
                              </span>
                            )}
                          </div>

                          <div>
                            <input
                              type="text"
                              required
                              placeholder={`Participant #${participantNumber} Full Name * (e.g. ${samplePuneNames[idx % samplePuneNames.length]})`}
                              value={p.name}
                              onChange={e => handleAdditionalParticipantNameChange(idx, e.target.value)}
                              className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none transition-colors ${
                                validationError && !p.name.trim()
                                  ? 'border-rose-500 focus:border-rose-400'
                                  : 'border-slate-700 focus:border-purple-500'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
                  placeholder="e.g. Please seat us at Catan, Coup, or Secret Hitler! First time playing modern board games."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Total Calculation */}
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Total Participants:</span>
                  <span className="font-bold text-white">{totalParticipants} {totalParticipants === 1 ? 'Participant' : 'Participants'} (PAX)</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-purple-900/30">
                  <div>
                    <span className="text-slate-300 block font-medium">Total Amount Due</span>
                    <span className="text-[10px] text-slate-400">{totalParticipants} ticket(s) × ₹{registeringEvent.ticketPrice}</span>
                  </div>
                  <div className="text-base font-black text-amber-400">
                    ₹{totalParticipants * registeringEvent.ticketPrice}
                  </div>
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
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Proceed to Pay ₹{totalParticipants * registeringEvent.ticketPrice} via Razorpay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Razorpay Payment Gateway Modal */}
      {razorpayGatewayModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#0b1329] border border-blue-500/30 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative text-slate-100 flex flex-col max-h-[92vh]">
            {/* Razorpay Brand Header */}
            <div className="bg-gradient-to-r from-[#002970] via-[#022c6b] to-[#0b2447] p-4 text-white border-b border-blue-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500 text-white font-black flex items-center justify-center text-base shadow-lg shadow-blue-500/40">
                    R
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-sm tracking-wider text-white">RAZORPAY</span>
                      <span className="text-[9px] bg-blue-400/20 text-blue-200 font-bold px-1.5 py-0.5 rounded border border-blue-400/30 flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                        TRUSTED
                      </span>
                    </div>
                    <span className="text-[11px] text-blue-200 block font-medium">Social Shuffle Pune</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-blue-300 flex items-center justify-end gap-1 font-semibold">
                    <Lock className="w-2.5 h-2.5 text-emerald-400" />
                    <span>256-Bit SSL Secured</span>
                  </div>
                  <div className="text-lg font-black text-amber-400">
                    ₹{razorpayGatewayModal.totalAmount}
                  </div>
                </div>
              </div>
            </div>

            {/* Order snapshot */}
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">{razorpayGatewayModal.event.title}</span>
                <span className="text-[11px] text-slate-400">
                  {razorpayGatewayModal.totalParticipants} Participant{razorpayGatewayModal.totalParticipants > 1 ? 's' : ''} • {razorpayGatewayModal.event.time}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Order Ref:</span>
                <span className="font-mono text-[10px] text-purple-300 font-bold">{razorpayGatewayModal.orderId}</span>
              </div>
            </div>

            {/* Payment Method Selector & Interactive Gateway */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    selectedMethod === 'upi' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    selectedMethod === 'card' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('netbanking')}
                  className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    selectedMethod === 'netbanking' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>NetBanking</span>
                </button>
              </div>

              {/* UPI Tab */}
              {selectedMethod === 'upi' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map(app => (
                      <div
                        key={app}
                        onClick={() => setUpiIdInput(`${currentParticipant.phone || '9876543210'}@${app.toLowerCase().replace(/\s+/g, '')}`)}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 cursor-pointer transition-all hover:bg-slate-800/80 flex flex-col items-center"
                      >
                        <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1 text-xs">
                          ⚡
                        </div>
                        <span className="text-[10px] text-slate-300">{app}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">UPI ID / VPA</label>
                    <input
                      type="text"
                      value={upiIdInput}
                      onChange={e => setUpiIdInput(e.target.value)}
                      placeholder="e.g. shuffler@okhdfcbank"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-800/30 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center">
                      <QrCode className="w-10 h-10 text-slate-900" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs block">Instant Razorpay UPI QR</span>
                      <span className="text-[10px] text-slate-400">Accepts Google Pay, PhonePe, Paytm, CRED or any BHIM app</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cards Tab */}
              {selectedMethod === 'card' && (
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300">Card Number</label>
                    <input
                      type="text"
                      readOnly
                      value="•••• •••• •••• 4242  (Razorpay Test Card)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300">Expiry</label>
                      <input
                        type="text"
                        readOnly
                        value="12 / 28"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300">CVV</label>
                      <input
                        type="text"
                        readOnly
                        value="•••"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NetBanking Tab */}
              {selectedMethod === 'netbanking' && (
                <div className="grid grid-cols-3 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank', 'Punjab National'].map(b => (
                    <div key={b} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center hover:border-blue-500 cursor-pointer">
                      <span className="text-[11px] font-bold text-slate-300">{b}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Status processing message when authorizing */}
              {paymentProcessing && (
                <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-500/40 flex items-center gap-3 animate-pulse text-xs text-blue-200">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400 shrink-0" />
                  <div>
                    <span className="font-bold block text-white text-xs">
                      {paymentStep === 'authorizing' ? 'Verifying payment with Razorpay gateway...' : 'Payment Confirmed! Finalizing meetup registration...'}
                    </span>
                    <span className="text-[10px] text-blue-300">Secured 256-bit bank handshake in progress</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer action buttons */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex gap-2.5">
              <button
                type="button"
                onClick={handleCancelPayment}
                disabled={paymentProcessing}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-xs hover:bg-slate-800 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCompleteRazorpayPayment()}
                disabled={paymentProcessing}
                className="flex-[2] py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
              >
                {paymentProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Authorizing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay ₹{razorpayGatewayModal.totalAmount} & Register</span>
                  </>
                )}
              </button>
            </div>
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

      {/* Digital Ticket Pass & Quirky Confirmation Modal */}
      {showTicketModal && activeTicketReg && (() => {
        const ticketEvent = events.find(e => e.id === activeTicketReg.eventId);
        const qrToken = activeTicketReg.qrCodeToken || `SS-REG-${activeTicketReg.id}`;
        const qrUrl = activeTicketReg.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(qrToken)}`;

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#151722] border-2 border-purple-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowTicketModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>

              {/* Quirky Gratitude Header */}
              <div className="text-center space-y-2 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  VIP Board Gamer Pass Confirmed
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Holy Meeples, {activeTicketReg.participantName}! You're In! 🎉
                </h3>
              </div>

              {/* Quirky Fun Message Box */}
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs leading-relaxed space-y-2">
                <p className="font-bold text-purple-200 flex items-center gap-1.5 text-sm">
                  <span>💃🕺 Prepare your victory dance!</span>
                </p>
                <p className="text-slate-300">
                  We are downright stoked that you're joining the <strong>Social Shuffle Pune</strong> tribe.
                  Whether you're looking to trade sheep for ore in Catan, bluff your closest friends into oblivion during Avalon, or roll non-stop natural 20s, a table is officially reserved for you!
                </p>
                <p className="text-[11px] text-amber-300/90 font-medium italic">
                  ⚠️ Mild Warning: Side effects may include uncontrolled giggles, sudden cravings for 20 new board games, and making life-long friends in Pune!
                </p>
              </div>

              {/* High-def Scannable QR Code Pass */}
              <div className="p-5 rounded-2xl bg-[#0d0f18] border-2 border-dashed border-indigo-500/40 text-center space-y-3 shadow-inner">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-400">
                  <QrCode className="w-4 h-4" />
                  <span>Scan at Venue for Instant Check-In</span>
                </div>

                <div className="flex justify-center">
                  <div className="p-3 bg-white rounded-2xl shadow-xl inline-block">
                    <img
                      src={qrUrl}
                      alt="Attendee Ticket QR"
                      className="w-44 h-44 rounded-lg"
                      loading="eager"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="font-mono text-sm font-black text-purple-300 tracking-wider">
                    {qrToken}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Flash this pass on your phone or let Aman / Parimal scan it at the entrance.
                  </p>
                </div>
              </div>

              {/* Event Details Grid */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Meetup:</span>
                  <span className="text-white font-bold text-right">{ticketEvent?.title || 'Social Shuffle'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">When:</span>
                  <span className="text-white font-medium">{ticketEvent?.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Venue:</span>
                  <span className="text-white font-medium text-right">{ticketEvent?.venue} ({ticketEvent?.area})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Seats Reserved:</span>
                  <span className="text-emerald-400 font-bold">{activeTicketReg.paxCount} Shuffler(s)</span>
                </div>
                {activeTicketReg.guests && activeTicketReg.guests.length > 0 && (
                  <div className="flex justify-between items-start pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Additional Participants:</span>
                    <span className="text-purple-300 font-semibold text-right max-w-[65%]">
                      {activeTicketReg.guests.map(g => g.name || 'Friend').join(', ')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Payment:</span>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold block">
                      ₹{activeTicketReg.amountPaid || (activeTicketReg.paxCount * (ticketEvent?.ticketPrice || 0))} (Paid via Razorpay)
                    </span>
                    {activeTicketReg.razorpayPaymentId && (
                      <span className="text-[10px] font-mono text-purple-300 block">
                        Txn: {activeTicketReg.razorpayPaymentId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Email Sent Confirmation Banner */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-emerald-300 font-bold block">Quirky Email Dispatched!</span>
                    <span className="text-[10px] text-slate-400">Sent to {activeTicketReg.participantEmail}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEmailPreviewRegId(activeTicketReg.id);
                    setShowEmailModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => {
                    const printUrl = qrUrl;
                    const w = window.open(printUrl, '_blank');
                    if (w) w.focus();
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-purple-400" />
                  <span>Save QR Pass</span>
                </button>

                <button
                  onClick={() => setShowTicketModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all"
                >
                  Ready for Game Day! 🎲
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Email Preview Modal */}
      {showEmailModal && emailPreviewRegId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151722] border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-black text-white">Confirmation Email Preview</h4>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <div><strong>From:</strong> Social Shuffle Pune &lt;hello@socialshuffle.in&gt;</div>
              <div><strong>Subject:</strong> 🎲 Holy Meeples! You're in for Social Shuffle! Ticket Pass Attached</div>
            </div>

            {/* Rendered HTML Email Preview */}
            <div
              className="rounded-2xl border border-slate-800 overflow-hidden shadow-inner"
              dangerouslySetInnerHTML={{ __html: generateEmailPreviewHtml(emailPreviewRegId) }}
            />

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
