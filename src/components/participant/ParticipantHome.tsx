import React from 'react';
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
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ParticipantTab } from './ParticipantNav';
import { SocialShuffleIcon } from '../SocialShuffleLogo';

interface ParticipantHomeProps {
  onNavigateTab: (tab: ParticipantTab) => void;
  onSelectEventForRegistration: (eventId: string) => void;
}

export const ParticipantHome: React.FC<ParticipantHomeProps> = ({
  onNavigateTab,
  onSelectEventForRegistration
}) => {
  const { currentParticipant, events, games, registrations } = useApp();

  // Find next upcoming event
  const nextEvent = events.find(e => e.status === 'upcoming') || events[0];

  // Check if current participant is registered for nextEvent
  const isRegisteredForNext = registrations.some(
    r => r.eventId === nextEvent?.id && r.participantId === currentParticipant.id && r.attendanceStatus !== 'Cancelled'
  );

  // Compute game progress metrics
  const totalGamesCount = games.length;
  const gamesPlayedCount = currentParticipant.gamesPlayedIds.length;
  const gamesRemainingCount = Math.max(0, totalGamesCount - gamesPlayedCount);
  const progressPercent = Math.min(100, Math.round((gamesPlayedCount / (totalGamesCount || 1)) * 100));

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Personalized Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111C3B] p-5 rounded-2xl border border-[#1F305E] shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6036] via-[#8F43EE] to-[#35C8A8] p-0.5 shadow-lg shadow-[#FF6036]/20">
            <div className="w-full h-full bg-[#0A1128] rounded-[14px] flex items-center justify-center text-white font-extrabold text-2xl">
              {currentParticipant.name[0]}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Hey, {currentParticipant.name.split(' ')[0]}! 👋
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#35C8A8]/15 text-[#35C8A8] border border-[#35C8A8]/30 font-semibold">
                {currentParticipant.area} Shuffler
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-0.5">
              Welcome back to your Pune board game haven. Ready to roll?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="px-3.5 py-2 rounded-xl bg-[#090F22] border border-[#1F305E] text-right flex items-center gap-2.5">
            <SocialShuffleIcon size={24} />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Shuffler Level</span>
              <span className="text-xs font-bold text-[#FFC226]">
                {gamesPlayedCount >= 20 ? '🎖️ Board Game Master' : gamesPlayedCount >= 10 ? '🎲 Table Veteran' : '🌱 Rising Shuffler'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Upcoming Event Hero Banner */}
      {nextEvent && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#162349] via-[#111C3B] to-[#0A1128] border border-[#FF6036]/40 p-5 sm:p-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF6036]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFC226]/15 text-[#FFC226] border border-[#FFC226]/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFC226]" />
                  Next Social Shuffle
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#8F43EE]/20 text-[#a870f7] border border-[#8F43EE]/30">
                  {nextEvent.category}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  ₹{nextEvent.ticketPrice} / person
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {nextEvent.title}
                </h2>
                <p className="text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {nextEvent.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#FF6036] shrink-0" />
                  <span>{nextEvent.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#35C8A8] shrink-0" />
                  <span className="truncate">{nextEvent.venue}, {nextEvent.area}</span>
                </div>
              </div>
            </div>

            {/* Action Callout */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
              {isRegisteredForNext ? (
                <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#35C8A8]/20 border border-[#35C8A8]/40 text-[#35C8A8] text-sm font-bold shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-[#35C8A8]" />
                  <span>You're Registered!</span>
                </div>
              ) : (
                <button
                  id="btn-register-next-event"
                  onClick={() => onSelectEventForRegistration(nextEvent.id)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF6036] to-[#ff7d59] text-white font-extrabold text-sm shadow-xl shadow-[#FF6036]/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Book Your Spot</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                id="btn-view-event-details"
                onClick={() => onNavigateTab('events')}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#152248] rounded-lg transition-colors text-center"
              >
                View Event & Games →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Your Shuffle Journey Stats */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Your Shuffle Journey</span>
            <span className="text-xs font-normal text-slate-400">Personal stats</span>
          </h3>
          <button
            onClick={() => onNavigateTab('progress')}
            className="text-xs font-semibold text-[#FF6036] hover:text-[#ff8566] transition-colors"
          >
            Full Journey →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#FF6036]/40 transition-all group">
            <div className="w-8 h-8 rounded-lg bg-[#FF6036]/15 text-[#FF6036] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {currentParticipant.totalEventsAttended}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Events Attended</div>
          </div>

          <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#35C8A8]/40 transition-all group">
            <div className="w-8 h-8 rounded-lg bg-[#35C8A8]/15 text-[#35C8A8] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Dices className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {gamesPlayedCount}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Games Played</div>
          </div>

          <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#FFC226]/40 transition-all group">
            <div className="w-8 h-8 rounded-lg bg-[#FFC226]/15 text-[#FFC226] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {gamesRemainingCount}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Left to Explore</div>
          </div>

          <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#8F43EE]/40 transition-all group">
            <div className="w-8 h-8 rounded-lg bg-[#8F43EE]/15 text-[#8F43EE] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {currentParticipant.venuesVisited.length || 1}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Venues Visited</div>
          </div>

          <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#35C8A8]/40 transition-all col-span-2 sm:col-span-1 group">
            <div className="w-8 h-8 rounded-lg bg-[#35C8A8]/15 text-[#35C8A8] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {currentParticipant.totalPaxBrought}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Friends Brought</div>
          </div>
        </div>
      </div>

      {/* Visual Game Progress Card */}
      <div className="p-5 rounded-2xl bg-[#111C3B] border border-[#1F305E] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dices className="w-5 h-5 text-[#35C8A8]" />
            <span className="font-bold text-white text-sm sm:text-base">Game Library Mastery</span>
          </div>
          <span className="text-xs font-extrabold text-[#35C8A8]">
            {gamesPlayedCount} / {totalGamesCount} Games Played ({progressPercent}%)
          </span>
        </div>

        {/* Progress bar with the 4 brand colors */}
        <div className="w-full h-3 bg-[#0A1128] rounded-full overflow-hidden p-0.5 border border-[#1F305E]">
          <div
            className="h-full bg-gradient-to-r from-[#FF6036] via-[#FFC226] to-[#35C8A8] rounded-full transition-all duration-700 shadow-sm shadow-[#FF6036]/50"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>{gamesRemainingCount} board games left to unlock in Pune!</span>
          <button
            onClick={() => onNavigateTab('progress')}
            className="text-[#FF6036] hover:text-[#ff8566] font-semibold"
          >
            View Unplayed Games →
          </button>
        </div>
      </div>

      {/* Explore & Community Quick Action Grid */}
      <div>
        <h3 className="text-base font-bold text-white tracking-tight mb-3">Explore Social Shuffle</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            id="action-upcoming-events"
            onClick={() => onNavigateTab('events')}
            className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#FF6036]/50 hover:bg-[#152248] transition-all text-left group"
          >
            <Calendar className="w-5 h-5 text-[#FF6036] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">Upcoming Events</div>
            <div className="text-xs text-slate-400 mt-0.5">Meetups across Pune</div>
          </button>

          <button
            id="action-games-to-play"
            onClick={() => onNavigateTab('progress')}
            className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#35C8A8]/50 hover:bg-[#152248] transition-all text-left group"
          >
            <Dices className="w-5 h-5 text-[#35C8A8] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">Games Yet to Play</div>
            <div className="text-xs text-slate-400 mt-0.5">Find next adventure</div>
          </button>

          <button
            id="action-give-feedback"
            onClick={() => onNavigateTab('community')}
            className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#FFC226]/50 hover:bg-[#152248] transition-all text-left group"
          >
            <MessageSquare className="w-5 h-5 text-[#FFC226] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">Give Feedback</div>
            <div className="text-xs text-slate-400 mt-0.5">Help us improve</div>
          </button>

          <button
            id="action-report-issue"
            onClick={() => onNavigateTab('community')}
            className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-rose-500/50 hover:bg-[#152248] transition-all text-left group"
          >
            <AlertTriangle className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">Report an Issue</div>
            <div className="text-xs text-slate-400 mt-0.5">Confidential & safe</div>
          </button>

          <button
            id="action-volunteer"
            onClick={() => onNavigateTab('community')}
            className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#35C8A8]/50 hover:bg-[#152248] transition-all text-left group"
          >
            <HeartHandshake className="w-5 h-5 text-[#35C8A8] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">Join as Volunteer</div>
            <div className="text-xs text-slate-400 mt-0.5">Help teach & host</div>
          </button>

          <button
            id="action-contact-hosts"
            onClick={() => onNavigateTab('community')}
            className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#8F43EE]/50 hover:bg-[#152248] transition-all text-left group"
          >
            <PhoneCall className="w-5 h-5 text-[#8F43EE] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">Contact Hosts</div>
            <div className="text-xs text-slate-400 mt-0.5">WhatsApp & Instagram</div>
          </button>
        </div>
      </div>
    </div>
  );
};

