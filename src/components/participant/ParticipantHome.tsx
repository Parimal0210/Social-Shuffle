import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Dices,
  Sparkles,
  Award,
  Users,
  MessageSquare,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  UserPlus,
  LogIn,
  ShieldCheck,
  Flame,
  Coffee,
  Ticket
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ParticipantTab } from './ParticipantNav';
import { SocialShuffleIcon } from '../SocialShuffleLogo';
import { WhyJoinCommunitySection } from './WhyJoinCommunitySection';
import { GuestRegistrationPromptModal } from '../auth/GuestRegistrationPromptModal';
import { ShuffleEvent } from '../../types';

interface ParticipantHomeProps {
  onNavigateTab: (tab: ParticipantTab) => void;
  onSelectEventForRegistration: (eventId: string) => void;
}

export const ParticipantHome: React.FC<ParticipantHomeProps> = ({
  onNavigateTab,
  onSelectEventForRegistration
}) => {
  const {
    currentParticipant,
    events,
    games,
    registrations,
    isAuthenticated,
    isGuest,
    openAuthModal
  } = useApp();

  const [promptEvent, setPromptEvent] = useState<ShuffleEvent | null>(null);
  const [showPromptModal, setShowPromptModal] = useState<boolean>(false);

  // Find next upcoming event
  const nextEvent = events.find(e => e.status === 'upcoming') || events[0];

  const nextEventRegsCount = registrations
    .filter(r => r.eventId === nextEvent?.id && r.attendanceStatus !== 'Cancelled')
    .reduce((acc, r) => acc + (r.paxCount || 1), 0);
  const spotsRemaining = Math.max(0, (nextEvent?.capacity || 30) - nextEventRegsCount);

  // Check if current participant is registered for nextEvent
  const isRegisteredForNext =
    isAuthenticated &&
    registrations.some(
      r =>
        r.eventId === nextEvent?.id &&
        r.participantId === currentParticipant.id &&
        r.attendanceStatus !== 'Cancelled'
    );

  // Compute game progress metrics (for authenticated participant level display)
  const gamesPlayedCount = currentParticipant?.gamesPlayedIds?.length || 0;

  const handleBookEventClick = (event: ShuffleEvent) => {
    if (!isAuthenticated) {
      setPromptEvent(event);
      setShowPromptModal(true);
    } else {
      onSelectEventForRegistration(event.id);
    }
  };

  return (
    <div className="space-y-8 pb-20 md:pb-12">
      {/* 1. TOP HEADER / HERO (Guest vs Authenticated) */}
      {!isAuthenticated ? (
        /* OUTSIDE GUEST USER HERO: Warm, Friendly & Deeply Professional */
        <div className="relative overflow-hidden rounded-2xl bg-[#1C1B18] border border-[#36332D] p-6 sm:p-9 shadow-sm space-y-6">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
              <span className="text-[#FF7A59] font-heading font-bold uppercase tracking-wider">
                Pune's Premier Board Game Meetup
              </span>
              <span className="text-[#57534E]" aria-hidden="true">·</span>
              <span className="text-[#35C8A8]">
                Every Sunday 3 PM – 8 PM
              </span>
              <span className="text-[#57534E]" aria-hidden="true">·</span>
              <span className="text-[#A8A29E]">
                Beginners & Solo Players Welcome
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight font-heading">
              Unplug, Roll Dice & Make Real Friends in Pune
            </h1>

            <p className="text-sm sm:text-base text-[#D6D3D1] leading-relaxed max-w-2xl">
              Social Shuffle brings together over <strong className="text-white font-semibold">2,400+ board gamers</strong> across Koregaon Park, Baner, and Kalyani Nagar. Never played modern tabletop games before? Friendly community hosts explain every rule step-by-step!
            </p>

            {/* Social Proof Real Community Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
              <div className="p-3.5 rounded-xl bg-[#24221E] border border-[#36332D]">
                <div className="text-2xl font-black text-white font-heading tabular-nums">2,400+</div>
                <div className="text-xs text-[#A8A29E] font-medium mt-0.5">Pune Shufflers</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#24221E] border border-[#36332D]">
                <div className="text-2xl font-black text-[#35C8A8] font-heading tabular-nums">120+</div>
                <div className="text-xs text-[#A8A29E] font-medium mt-0.5">Games Taught</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#24221E] border border-[#36332D]">
                <div className="text-2xl font-black text-[#FFC226] font-heading tabular-nums">60%</div>
                <div className="text-xs text-[#A8A29E] font-medium mt-0.5">Come Solo</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#24221E] border border-[#36332D]">
                <div className="text-2xl font-black text-[#FF7A59] font-heading tabular-nums">34</div>
                <div className="text-xs text-[#A8A29E] font-medium mt-0.5">Sold-out Editions</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                id="hero-btn-register"
                onClick={() => openAuthModal('register')}
                className="px-6 py-3.5 rounded-xl bg-[#FF6036] hover:bg-[#E85127] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 group active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Join Community (Register Free)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-btn-explore-events"
                onClick={() => onNavigateTab('events')}
                className="px-5 py-3.5 rounded-xl bg-[#24221E] hover:bg-[#2C2A25] border border-[#36332D] text-[#F5F2EB] font-semibold text-xs sm:text-sm transition-colors text-center"
              >
                Browse Upcoming Meetups
              </button>

              <button
                id="hero-btn-signin"
                onClick={() => openAuthModal('login')}
                className="px-4 py-3.5 text-xs text-[#A8A29E] hover:text-[#F5F2EB] font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-[#FF6036]" />
                <span>Existing Member? Sign In</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* AUTHENTICATED PARTICIPANT GREETING */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1C1B18] p-5 rounded-2xl border border-[#36332D] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FF6036] flex items-center justify-center text-white font-extrabold text-2xl font-heading shadow-sm">
              {currentParticipant?.name?.[0] || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                  Hey, {currentParticipant?.name?.split(' ')[0] || 'Shuffler'}! 👋
                </h1>
                <span className="text-xs font-semibold text-[#35C8A8]">
                  · {currentParticipant?.area || 'Pune'} Shuffler
                </span>
              </div>
              <p className="text-sm text-[#A8A29E] mt-0.5">
                Welcome back to your Pune board game haven. Ready to roll?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="px-3.5 py-2 rounded-xl bg-[#24221E] border border-[#36332D] text-right flex items-center gap-2.5">
              <SocialShuffleIcon size={24} />
              <div>
                <span className="text-[10px] text-[#A8A29E] uppercase tracking-wider block font-bold font-heading">
                  Community Standing
                </span>
                <span className="text-xs font-bold text-[#FFC226]">
                  {gamesPlayedCount >= 20
                    ? 'Board Game Master'
                    : gamesPlayedCount >= 10
                    ? 'Table Veteran'
                    : 'Rising Shuffler'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. 'WHY JOIN?' SECTION FOR GUESTS ONLY */}
      {!isAuthenticated && (
        <WhyJoinCommunitySection
          onRegisterClick={() => openAuthModal('register')}
          showCta={true}
        />
      )}

      {/* 3. NEXT UPCOMING EVENT SHOWCASE */}
      {nextEvent && (
        <div className="relative overflow-hidden rounded-2xl bg-[#1C1B18] border border-[#36332D] p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-bold text-[#FFC226] flex items-center gap-1.5 font-heading">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFC226]" />
                  Next Social Shuffle #{nextEvent.number}
                </span>
                <span className="text-[#57534E]" aria-hidden="true">·</span>
                <span className="text-[#8F43EE] font-semibold">
                  {nextEvent.category}
                </span>
                {spotsRemaining <= 5 && (
                  <>
                    <span className="text-[#57534E]" aria-hidden="true">·</span>
                    <span className="text-[#FF7A59] font-medium">Only {spotsRemaining} seats left</span>
                  </>
                )}
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                  {nextEvent.title}
                </h2>
                <p className="text-sm text-[#A8A29E] mt-1 line-clamp-2 leading-relaxed">
                  {nextEvent.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#D6D3D1] pt-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#FF6036] shrink-0" />
                  <span>{nextEvent.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#35C8A8] shrink-0" />
                  <span className="truncate">
                    {nextEvent.venue}, {nextEvent.area}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Callout */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
              {!isAuthenticated ? (
                <button
                  id="btn-register-participant-first-next"
                  onClick={() => openAuthModal('register', nextEvent.id)}
                  className="px-6 py-3 rounded-xl bg-[#FF6036] hover:bg-[#E85127] text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 group active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Join Our Community</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : isRegisteredForNext ? (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#35C8A8]/15 border border-[#35C8A8]/30 text-[#35C8A8] text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#35C8A8]" />
                  <span>You're Registered</span>
                </div>
              ) : (
                <button
                  id="btn-register-next-event"
                  onClick={() => handleBookEventClick(nextEvent)}
                  className="px-6 py-3 rounded-xl bg-[#FF6036] hover:bg-[#E85127] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Register Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                id="btn-view-event-details"
                onClick={() => onNavigateTab('events')}
                className="px-4 py-2 text-xs font-semibold text-[#A8A29E] hover:text-white hover:bg-[#24221E] rounded-lg transition-colors text-center"
              >
                View All Events & Games →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. EXPLORE SOCIAL SHUFFLE */}
      <div>
        <h3 className="text-base font-bold text-white tracking-tight mb-3 font-heading">Explore Social Shuffle</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            id="action-upcoming-events"
            onClick={() => onNavigateTab('events')}
            className="p-4 rounded-xl bg-[#1C1B18] border border-[#36332D] hover:border-[#FF6036]/50 hover:bg-[#24221E] transition-all text-left group"
          >
            <Calendar className="w-5 h-5 text-[#FF6036] mb-2 group-hover:scale-105 transition-transform" />
            <div className="text-sm font-bold text-white font-heading">Upcoming Events</div>
            <div className="text-xs text-[#A8A29E] mt-0.5">Meetups across Pune</div>
          </button>

          <button
            id="action-my-profile"
            onClick={() => onNavigateTab('profile')}
            className="p-4 rounded-xl bg-[#1C1B18] border border-[#36332D] hover:border-[#35C8A8]/50 hover:bg-[#24221E] transition-all text-left group"
          >
            <Dices className="w-5 h-5 text-[#35C8A8] mb-2 group-hover:scale-105 transition-transform" />
            <div className="text-sm font-bold text-white font-heading">My Profile</div>
            <div className="text-xs text-[#A8A29E] mt-0.5">Passport, badges & games</div>
          </button>

          <button
            id="action-give-feedback"
            onClick={() => onNavigateTab('community')}
            className="p-4 rounded-xl bg-[#1C1B18] border border-[#36332D] hover:border-[#FFC226]/50 hover:bg-[#24221E] transition-all text-left group"
          >
            <MessageSquare className="w-5 h-5 text-[#FFC226] mb-2 group-hover:scale-105 transition-transform" />
            <div className="text-sm font-bold text-white font-heading">Community & FAQ</div>
            <div className="text-xs text-[#A8A29E] mt-0.5">Venues, guidelines, info</div>
          </button>

          <button
            id="action-volunteer"
            onClick={() => onNavigateTab('community')}
            className="p-4 rounded-xl bg-[#1C1B18] border border-[#36332D] hover:border-[#8F43EE]/50 hover:bg-[#24221E] transition-all text-left group"
          >
            <HeartHandshake className="w-5 h-5 text-[#8F43EE] mb-2 group-hover:scale-105 transition-transform" />
            <div className="text-sm font-bold text-white font-heading">Join as Volunteer</div>
            <div className="text-xs text-[#A8A29E] mt-0.5">Help teach & host</div>
          </button>

          <button
            id="action-report-issue"
            onClick={() => onNavigateTab('community')}
            className="p-4 rounded-xl bg-[#1C1B18] border border-[#36332D] hover:border-rose-500/50 hover:bg-[#24221E] transition-all text-left group col-span-2 sm:col-span-1"
          >
            <AlertTriangle className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-105 transition-transform" />
            <div className="text-sm font-bold text-white font-heading">Report an Issue</div>
            <div className="text-xs text-[#A8A29E] mt-0.5">Confidential & safe</div>
          </button>
        </div>
      </div>

      {/* Guest Registration Intercept Modal */}
      <GuestRegistrationPromptModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        event={promptEvent}
        featureName="Event Seat Booking"
      />
    </div>
  );
};
