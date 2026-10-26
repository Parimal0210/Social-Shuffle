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
      <div className="bg-[#1C1B18] border border-[#36332D] rounded-3xl max-w-2xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#24221E] border-b border-[#2C2924] relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-[#2C2924] hover:bg-[#36332D] text-[#A8A29E] hover:text-[#F5F2EB] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-[#FF6036]/15 text-[#FF6036]">
              <Dices className="w-4 h-4 text-[#FF6036]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6036]">
              Attended Meetup Game Log
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-heading font-bold text-[#F5F2EB] tracking-tight">
            Log Games Played at {event.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#A8A29E] mt-2">
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
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-[#35C8A8]/15 border border-[#35C8A8]/30 text-[#35C8A8] flex items-center gap-2.5 text-xs animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-[#35C8A8] shrink-0" />
            <div>
              <p className="font-bold">Games successfully logged!</p>
              <p className="text-[11px] text-[#35C8A8]/80">
                Your Tabletop Mastery %, badges, and game library progress have been synchronized.
              </p>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-[#2C2924] space-y-3 bg-[#161513]">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search games (e.g. Catan, Coup, Just One)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#141312] border border-[#36332D] rounded-xl text-xs text-[#F5F2EB] placeholder-[#78716C] focus:outline-none focus:border-[#FF6036] transition-colors"
              />
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#24221E] border border-[#36332D] text-[#FF6036] font-bold text-xs shrink-0 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC226]" />
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
                    ? 'bg-[#FF6036] text-white shadow-sm'
                    : 'bg-[#141312] text-[#A8A29E] hover:text-[#F5F2EB] border border-[#2C2924]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Info */}
          <p className="text-[11px] text-[#A8A29E]">
            Select all board games you rolled dice, deduced, or strategized with during this meetup:
          </p>
        </div>

        {/* Games Selection List / Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {filteredGames.length === 0 ? (
            <div className="p-8 text-center bg-[#161513] rounded-2xl border border-[#2C2924] space-y-2">
              <Dices className="w-8 h-8 text-[#78716C] mx-auto" />
              <p className="text-xs text-[#A8A29E] font-medium">No games match "{searchQuery}"</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs text-[#FF6036] font-semibold hover:underline"
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
                      ? 'bg-[#FF6036]/10 border-[#FF6036]/60 shadow-md shadow-[#FF6036]/5'
                      : 'bg-[#24221E] border-[#36332D] hover:border-[#FF6036]/40 hover:bg-[#2C2924]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors border ${
                        isSelected
                          ? 'bg-[#FF6036] border-[#FF6036] text-white'
                          : 'border-[#36332D] bg-[#1C1B18] text-transparent group-hover:border-[#78716C]'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-[#F5F2EB] text-xs sm:text-sm group-hover:text-[#FF6036] transition-colors">
                          {game.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#1C1B18] text-[#FFC226] border border-[#36332D]">
                          {game.category}
                        </span>
                        {isFeaturedAtEvent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FFC226]/15 text-[#FFC226] border border-[#FFC226]/30 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#FFC226]" />
                            Featured Table
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#A8A29E] line-clamp-1">
                        {game.description}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-[#78716C] pt-0.5">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-[#35C8A8]" />
                          {game.players}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#FFC226]" />
                          {game.duration}
                        </span>
                        <span className="text-[#8F43EE] font-medium">
                          {game.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-xl shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#35C8A8]/20 text-[#35C8A8] border border-[#35C8A8]/30'
                        : 'text-[#78716C] bg-[#1C1B18] border border-[#2C2924]'
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
        <div className="p-4 sm:p-5 bg-[#161513] border-t border-[#2C2924] flex items-center justify-between gap-3">
          <div className="text-xs text-[#A8A29E] font-medium hidden sm:block">
            <span className="font-bold text-[#F5F2EB]">{selectedGameIds.length}</span> games tagged for this meetup
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#36332D] hover:bg-[#24221E] text-[#A8A29E] hover:text-[#F5F2EB] text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-save-played-games"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#FF6036] hover:bg-[#E85127] text-white font-heading font-bold text-xs shadow-lg shadow-[#FF6036]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#FFC226]" />
              <span>Save & Update Progress</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
