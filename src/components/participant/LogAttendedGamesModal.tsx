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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#151E4D] border border-[#283677] rounded-3xl max-w-2xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#1A255C] border-b border-[#202B61] relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-[#202B61] hover:bg-[#283677] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-[#FF751F]/15 text-[#FF751F]">
              <Dices className="w-4 h-4 text-[#FF751F]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF751F]">
              Attended Meetup Game Log
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-heading font-bold text-[#F8FAFC] tracking-tight">
            Log Games Played at {event.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#94A3B8] mt-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#FF751F]" />
              {event.time}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#4AB4A4]" />
              {event.venue}, {event.area}
            </span>
          </div>
        </div>

        {/* Success Banner */}
        {savedSuccess && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-[#4AB4A4]/15 border border-[#4AB4A4]/30 text-[#4AB4A4] flex items-center gap-2.5 text-xs animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-[#4AB4A4] shrink-0" />
            <div>
              <p className="font-bold">Games successfully logged!</p>
              <p className="text-[11px] text-[#4AB4A4]/80">
                Your Tabletop Mastery %, badges, and game library progress have been synchronized.
              </p>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-[#202B61] space-y-3 bg-[#10173E]">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search games (e.g. Catan, Coup, Just One)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#10173E] border border-[#283677] rounded-xl text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#FF751F] transition-colors"
              />
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#1A255C] border border-[#283677] text-[#FF751F] font-bold text-xs shrink-0 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD230]" />
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
                    ? 'bg-[#FF751F] text-white shadow-sm'
                    : 'bg-[#10173E] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#202B61]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Info */}
          <p className="text-[11px] text-[#94A3B8]">
            Select all board games you rolled dice, deduced, or strategized with during this meetup:
          </p>
        </div>

        {/* Games Selection List / Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {filteredGames.length === 0 ? (
            <div className="p-8 text-center bg-[#10173E] rounded-2xl border border-[#202B61] space-y-2">
              <Dices className="w-8 h-8 text-[#64748B] mx-auto" />
              <p className="text-xs text-[#94A3B8] font-medium">No games match "{searchQuery}"</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs text-[#FF751F] font-semibold hover:underline"
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
                      ? 'bg-[#FF751F]/10 border-[#FF751F]/60 shadow-md shadow-[#FF751F]/5'
                      : 'bg-[#1A255C] border-[#283677] hover:border-[#FF751F]/40 hover:bg-[#202B61]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors border ${
                        isSelected
                          ? 'bg-[#FF751F] border-[#FF751F] text-white'
                          : 'border-[#283677] bg-[#151E4D] text-transparent group-hover:border-[#64748B]'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-[#F8FAFC] text-xs sm:text-sm group-hover:text-[#FF751F] transition-colors">
                          {game.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#151E4D] text-[#FFD230] border border-[#283677]">
                          {game.category}
                        </span>
                        {isFeaturedAtEvent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FFD230]/15 text-[#FFD230] border border-[#FFD230]/30 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#FFD230]" />
                            Featured Table
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#94A3B8] line-clamp-1">
                        {game.description}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-[#64748B] pt-0.5">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-[#4AB4A4]" />
                          {game.players}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#FFD230]" />
                          {game.duration}
                        </span>
                        <span className="text-[#9440DD] font-medium">
                          {game.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-xl shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#4AB4A4]/20 text-[#4AB4A4] border border-[#4AB4A4]/30'
                        : 'text-[#64748B] bg-[#151E4D] border border-[#202B61]'
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
        <div className="p-4 sm:p-5 bg-[#10173E] border-t border-[#202B61] flex items-center justify-between gap-3">
          <div className="text-xs text-[#94A3B8] font-medium hidden sm:block">
            <span className="font-bold text-[#F8FAFC]">{selectedGameIds.length}</span> games tagged for this meetup
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#283677] hover:bg-[#1A255C] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-save-played-games"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#FF751F] hover:bg-[#E66310] text-white font-heading font-bold text-xs shadow-lg shadow-[#FF751F]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#FFD230]" />
              <span>Save & Update Progress</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
