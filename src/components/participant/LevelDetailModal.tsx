import React from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Lock,
  Award,
  Calendar,
  Dices,
  Flame,
  Check,
  Star,
  ShieldCheck
} from 'lucide-react';
import { BadgeLevelDefinition } from '../../services/badgeBackendService';

interface LevelDetailModalProps {
  levelDef: BadgeLevelDefinition | null;
  currentLevel: number;
  gamesPlayedCount: number;
  totalGamesCount: number;
  gamePercentage: number;
  eventsAttendedCount: number;
  onClose: () => void;
  onLogGamesClick?: () => void;
}

export const LevelDetailModal: React.FC<LevelDetailModalProps> = ({
  levelDef,
  currentLevel,
  gamesPlayedCount,
  totalGamesCount,
  gamePercentage,
  eventsAttendedCount,
  onClose,
  onLogGamesClick
}) => {
  if (!levelDef) return null;

  const isUnlocked = levelDef.level <= currentLevel;
  const isCurrent = levelDef.level === currentLevel;

  const targetGames = Math.ceil((levelDef.minGamePercentage / 100) * totalGamesCount);
  const gamesRemaining = Math.max(0, targetGames - gamesPlayedCount);
  const eventsRemaining = Math.max(0, levelDef.minEventsAttended - eventsAttendedCount);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className={`bg-[#121626] border-2 ${
          isCurrent
            ? 'border-amber-400 shadow-2xl shadow-amber-500/20'
            : isUnlocked
            ? levelDef.borderColor
            : 'border-slate-800'
        } rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Level Header Banner */}
        <div
          className={`p-6 sm:p-7 bg-gradient-to-b ${levelDef.gradient} border-b border-slate-800/80 text-center relative overflow-hidden`}
        >
          {isCurrent && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              <span>Your Current Level</span>
            </div>
          )}

          {/* Level Icon */}
          <div className="relative inline-block mt-2 mb-3">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl transition-transform ${
                isUnlocked
                  ? `bg-slate-900 border-2 ${levelDef.borderColor} shadow-lg ${levelDef.glowEffect} scale-105`
                  : 'bg-slate-900/90 border border-slate-700/60 grayscale opacity-60'
              }`}
            >
              {levelDef.icon}
            </div>

            {/* Level Pill */}
            <div
              className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full font-black text-[11px] shadow border ${
                isUnlocked
                  ? 'bg-purple-600 text-white border-purple-400'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Lv.{levelDef.level}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${levelDef.badgeTagColor}`}
              >
                {levelDef.rarity} Tier
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {levelDef.subtitle}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1">
              {levelDef.fancyName}
            </h3>

            <p className="text-xs font-semibold text-purple-300">
              "{levelDef.shortTitle}"
            </p>

            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed pt-1">
              {levelDef.description}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Unlock Requirements Box */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Level {levelDef.level} Criteria:
              </span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  isUnlocked ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unlocked & Verified</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked</span>
                  </>
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">Games Required</span>
                <span className="text-sm font-black text-white block">
                  {levelDef.minGamePercentage}%+ ({targetGames} games)
                </span>
                <span className="text-[10px] text-purple-300 block">
                  You: {gamePercentage}% ({gamesPlayedCount} games)
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">Events Required</span>
                <span className="text-sm font-black text-white block">
                  {levelDef.minEventsAttended}+ Meetups
                </span>
                <span className="text-[10px] text-cyan-300 block">
                  You: {eventsAttendedCount} meetups
                </span>
              </div>
            </div>

            {/* Special rule highlight for Level 10 */}
            {levelDef.level === 10 && (
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-medium">
                ⚡ <strong>Apex Rule:</strong> Achieving 90%+ games played in our events directly awards this Level 10 Mythic Archon badge!
              </div>
            )}
          </div>

          {/* Perks & Privileges */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Level {levelDef.level} Unlocks & Perks:
            </span>
            <div className="space-y-1.5">
              {levelDef.perks.map((perk, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-slate-200 text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[3]" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps for locked level */}
          {!isUnlocked && (
            <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-800/30 text-slate-300 space-y-1">
              <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Remaining to Unlock Level {levelDef.level}
              </span>
              <p className="text-[11px] text-slate-300">
                Play & tag <strong>{gamesRemaining} more board game(s)</strong> and attend <strong>{eventsRemaining} more meetup(s)</strong>.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors"
            >
              Close
            </button>
            {!isUnlocked && onLogGamesClick && (
              <button
                onClick={() => {
                  onClose();
                  onLogGamesClick();
                }}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/30"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Log Games to Level Up</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
