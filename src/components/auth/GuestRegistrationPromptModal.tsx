import React from 'react';
import {
  X,
  UserPlus,
  LogIn,
  Ticket,
  Sparkles,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { ShuffleEvent } from '../../types';
import { useApp } from '../../context/AppContext';
import { SocialShuffleIcon } from '../SocialShuffleLogo';

interface GuestRegistrationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: ShuffleEvent | null;
  featureName?: string; // e.g. "Event Seat Booking", "Participant Profile", "Game Tracker"
}

export const GuestRegistrationPromptModal: React.FC<GuestRegistrationPromptModalProps> = ({
  isOpen,
  onClose,
  event,
  featureName = 'Event Seat Booking'
}) => {
  const { openAuthModal } = useApp();

  if (!isOpen) return null;

  const handleRegister = () => {
    onClose();
    openAuthModal('register', event?.id);
  };

  const handleLogin = () => {
    onClose();
    openAuthModal('login', event?.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0E1630] border-2 border-[#FF6036]/50 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6036] via-[#8F43EE] to-[#35C8A8] p-0.5 shadow-lg shadow-[#FF6036]/25 shrink-0">
            <div className="w-full h-full bg-[#0A1128] rounded-[14px] flex items-center justify-center">
              <SocialShuffleIcon size={24} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF6036]/20 text-[#FF8566] border border-[#FF6036]/30">
                Join Community First
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
              Participant Registration Required
            </h3>
          </div>
        </div>

        {/* Event Card preview if triggered by event booking */}
        {event ? (
          <div className="p-4 rounded-2xl bg-[#121D40] border border-[#1F305E] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-300">
                Event #{event.number}
              </span>
              <span className="text-xs font-bold text-[#FFC226]">
                ₹{event.ticketPrice} / pass
              </span>
            </div>
            <div className="text-sm font-bold text-white">
              {event.title}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#FF6036]" />
                {event.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#35C8A8]" />
                {event.venue} ({event.area})
              </span>
            </div>
          </div>
        ) : null}

        {/* Explanation text creating curiosity & value */}
        <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            To {event ? 'reserve your seat and receive your digital QR entry pass' : `access ${featureName}`}, please register as a Social Shuffle community participant first.
          </p>

          <div className="p-3 rounded-xl bg-[#090F22] border border-[#1F305E] space-y-1.5 text-xs text-slate-200">
            <div className="font-bold text-[#35C8A8] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>What you get by registering (Free):</span>
            </div>
            <div className="space-y-1 pl-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#35C8A8] shrink-0" />
                <span>Instant 1-tap table check-in pass on your phone</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#35C8A8] shrink-0" />
                <span>Track 120+ games played and level up your Shuffler rank</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#35C8A8] shrink-0" />
                <span>Priority booking alerts before weekend meetups sell out</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            id="btn-prompt-register"
            onClick={handleRegister}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF6036] to-[#ff7d59] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-[#FF6036]/25 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Join our community (Takes 30 Seconds)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-between gap-3">
            <button
              id="btn-prompt-login"
              onClick={handleLogin}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#111C3B] hover:bg-[#162349] border border-[#1F305E] text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-[#FF6036]" />
              <span>Already a member? Sign In</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Keep Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
