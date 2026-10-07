import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Lock,
  Share2,
  Check,
  Calendar,
  Dices,
  Flame,
  ArrowRight
} from 'lucide-react';
import { ParticipantBadge } from '../../utils/badgeSystem';

interface BadgeDetailModalProps {
  badge: ParticipantBadge | null;
  onClose: () => void;
  onNavigateToAttendedEvents?: () => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  badge,
  onClose,
  onNavigateToAttendedEvents
}) => {
  const [copied, setCopied] = useState(false);

  if (!badge) return null;

  const handleShare = () => {
    const text = badge.unlocked
      ? `🏆 I just earned the "${badge.title}" badge at Social Shuffle Pune! 🎲 #SocialShufflePune #BoardGames`
      : `🎯 I'm working towards the "${badge.title}" badge at Social Shuffle Pune! 🎲 #SocialShufflePune`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className={`bg-[#131626] border ${
          badge.unlocked ? badge.borderColor : 'border-slate-800'
        } rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Card */}
        <div
          className={`p-6 bg-gradient-to-b ${badge.gradient} border-b border-slate-800/80 text-center relative overflow-hidden`}
        >
          {/* Animated Glow Backdrop */}
          {badge.unlocked && (
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-500/10 to-transparent pointer-events-none animate-pulse" />
          )}

          {/* Badge Icon Circle */}
          <div className="relative inline-block mb-3">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl transition-transform ${
                badge.unlocked
                  ? `bg-slate-900 border-2 ${badge.borderColor} shadow-lg ${badge.glowColor} scale-105`
                  : 'bg-slate-900/90 border border-slate-700/60 grayscale opacity-70'
              }`}
            >
              {badge.icon}
            </div>

            {/* Lock / Check Mini Pill */}
            <div
              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
                badge.unlocked
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {badge.unlocked ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <Lock className="w-3 h-3 text-slate-400" />
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badge.badgeTagColor}`}
              >
                {badge.rarity} Badge
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {badge.category.replace('_', ' ')}
              </span>
            </div>

            <h3 className="text-xl font-black text-white tracking-tight pt-1">
              {badge.title}
            </h3>

            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              {badge.description}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Status & Criteria */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Unlock Requirement:</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  badge.unlocked ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {badge.unlocked ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unlocked</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>In Progress</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-white font-semibold leading-relaxed">
              {badge.criteriaText}
            </p>
          </div>

          {/* Progress Tracker */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-400">Current Progress</span>
              <span className={badge.unlocked ? 'text-emerald-400 font-bold' : 'text-purple-300 font-bold'}>
                {badge.progress.current} / {badge.progress.target} {badge.progress.unit} ({badge.progress.percentage}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  badge.unlocked
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/40'
                    : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400'
                }`}
                style={{ width: `${badge.progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Contributing Items (Games or Categories already played) */}
          {badge.contributingItems && badge.contributingItems.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 block">
                {badge.unlocked ? 'Contributed to this Badge:' : 'Your Contributing Plays so far:'}
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {badge.contributingItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg bg-purple-950/40 text-purple-200 border border-purple-800/40 font-medium flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hint / How to unlock */}
          {!badge.unlocked && (
            <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-800/30 text-slate-300 space-y-1">
              <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Next Step Hint</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {badge.hint}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Share Achievement</span>
                </>
              )}
            </button>

            {!badge.unlocked && onNavigateToAttendedEvents && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToAttendedEvents();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/30"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Log Attended Games</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
