import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Dices,
  CheckCircle2,
  Calendar,
  MapPin,
  Sparkles,
  Users,
  Clock,
  Award,
  Flame,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Registration, ShuffleEvent, GameCategory } from '../../types';

interface LogAttendedGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration;
  event: ShuffleEvent;
  onSaved?: () => void;
}

export const LogAttendedGamesModal: React.FC<LogAttendedGamesModalProps> = ({
  isOpen,
  onClose,
  registration,
  event,
  onSaved
}) => {
  const { games, updateGamesPlayedForRegistration, currentParticipant } = useApp();

  const [selectedGameIds, setSelectedGameIds] = useState<string[]>(() => {
    return registration.gamesPlayed || [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state if registration changes
  React.useEffect(() => {
    setSelectedGameIds(registration.gamesPlayed || []);
    setSavedSuccess(false);
  }, [registration.id, registration.gamesPlayed]);

  const categories: (string | GameCategory)[] = [
    'All',
    'Party',
    'Strategy',
    'Bluffing',
    'Social Deduction',
    'Card Games',
    'Family',
    'Tournament'
  ];

  // Featured games at this event
  const featuredGameIds = useMemo(() => new Set(event.plannedGames || []), [event.plannedGames]);

  // Filtered games
  const filteredGames = useMemo(() => {
    return games.filter(g => {
      if (!g.active) return false;
      const matchesCat = selectedCategory === 'All' || g.category === selectedCategory;
      const matchesSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [games, selectedCategory, searchQuery]);

  const handleToggleGame = (gameId: string) => {
    setSelectedGameIds(prev =>
      prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
    );
  };

  const handleSave = () => {
    updateGamesPlayedForRegistration(registration.id, selectedGameIds);
    setSavedSuccess(true);

    try {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Confetti fallback
    }

    if (onSaved) {
      onSaved();
    }

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#121626] border border-purple-500/40 rounded-3xl max-w-2xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#1B1E38] to-[#141728] border-b border-slate-800/90 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
              <Dices className="w-4 h-4 text-purple-400" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Attended Meetup Game Log
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Log Games Played at {event.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#FF6036]" />
              {event.time}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#35C8A8]" />
              {event.venue}, {event.area}
            </span>
          </div>
        </div>

        {/* Success Banner */}
        {savedSuccess && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2.5 text-xs animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">Games successfully logged!</p>
              <p className="text-[11px] text-emerald-200/80">
                Your Tabletop Mastery %, badges, and game library progress have been synchronized.
              </p>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 space-y-3 bg-[#0E1220]/60">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search games (e.g. Catan, Coup, Just One)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-300 font-extrabold text-xs shrink-0 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{selectedGameIds.length} Selected</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Info */}
          <p className="text-[11px] text-slate-400">
            Select all board games you rolled dice, deduced, or strategized with during this meetup:
          </p>
        </div>

        {/* Games Selection List / Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {filteredGames.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/70 space-y-2">
              <Dices className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">No games match "{searchQuery}"</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs text-purple-400 font-semibold hover:underline"
              >
                Clear search filters
              </button>
            </div>
          ) : (
            filteredGames.map(game => {
              const isSelected = selectedGameIds.includes(game.id);
              const isFeaturedAtEvent = featuredGameIds.has(game.id);

              return (
                <div
                  key={game.id}
                  onClick={() => handleToggleGame(game.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group select-none ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500/80 shadow-md shadow-purple-900/20'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors border ${
                        isSelected
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'border-slate-700 bg-slate-800 text-transparent group-hover:border-slate-600'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs sm:text-sm group-hover:text-purple-200 transition-colors">
                          {game.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-purple-300 border border-slate-700/60">
                          {game.category}
                        </span>
                        {isFeaturedAtEvent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            Featured Table
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {game.description}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-cyan-400" />
                          {game.players}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {game.duration}
                        </span>
                        <span className="text-purple-400 font-medium">
                          {game.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-xl shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-500 bg-slate-800/40'
                    }`}
                  >
                    {isSelected ? '✓ Played' : '+ Add'}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="p-4 sm:p-5 bg-[#0E1220] border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-300 font-medium hidden sm:block">
            <span className="font-bold text-white">{selectedGameIds.length}</span> games tagged for this meetup
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-save-played-games"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Save & Update Progress</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
