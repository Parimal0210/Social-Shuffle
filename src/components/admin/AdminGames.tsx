import React, { useState } from 'react';
import {
  Dices,
  Plus,
  Search,
  Filter,
  Users,
  Clock,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BoardGame, GameCategory, GameDifficulty } from '../../types';

interface AdminGamesProps {
  showAddModalInitially?: boolean;
  onCloseAddModalInitially?: () => void;
}

export const AdminGames: React.FC<AdminGamesProps> = ({
  showAddModalInitially = false,
  onCloseAddModalInitially
}) => {
  const { games, addGame, updateGame } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(showAddModalInitially);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GameCategory>('Strategy');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('Medium');
  const [players, setPlayers] = useState('3-4 players');
  const [duration, setDuration] = useState('60-90 min');
  const [description, setDescription] = useState('');

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

  const filteredGames = games.filter(g => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || g.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const openAddModal = () => {
    setIsEditing(false);
    setEditingGameId(null);
    setName('');
    setCategory('Strategy');
    setDifficulty('Medium');
    setPlayers('3-4 players');
    setDuration('45-60 min');
    setDescription('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (game: BoardGame) => {
    setIsEditing(true);
    setEditingGameId(game.id);
    setName(game.name);
    setCategory(game.category);
    setDifficulty(game.difficulty);
    setPlayers(game.players);
    setDuration(game.duration);
    setDescription(game.description);
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editingGameId) {
      updateGame(editingGameId, {
        name,
        category,
        difficulty,
        players,
        duration,
        description
      });
    } else {
      addGame({
        name,
        category,
        difficulty,
        players,
        duration,
        description,
        active: true
      });
    }
    setIsAddModalOpen(false);
    if (onCloseAddModalInitially) onCloseAddModalInitially();
  };

  const toggleGameStatus = (game: BoardGame) => {
    updateGame(game.id, { active: !game.active });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-bold text-[#F8FAFC] tracking-tight">
            Central Game Library ({games.length} Games)
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Manage titles brought to Pune Social Shuffle tables, categories, rules, and active rotation
          </p>
        </div>

        <button
          id="btn-add-new-game"
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF751F] hover:bg-[#E66310] text-white font-heading font-bold text-xs shadow-lg shadow-[#FF751F]/20 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Board Game</span>
        </button>
      </div>

      {/* Search & Category Pills */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search game library by title or keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#151E4D] border border-[#283677] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#FF751F]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#FF751F] text-white shadow-sm'
                  : 'bg-[#151E4D] border border-[#283677] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredGames.map(game => (
          <div
            key={game.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-lg ${
              game.active
                ? 'bg-[#151E4D] border-[#283677] hover:border-[#FF751F]/50'
                : 'bg-[#151E4D]/50 border-[#202B61] opacity-50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1A255C] text-[#FFD230] border border-[#283677]">
                  {game.category}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      game.difficulty === 'Beginner'
                        ? 'bg-[#4AB4A4]/15 text-[#4AB4A4]'
                        : game.difficulty === 'Medium'
                        ? 'bg-[#FFD230]/15 text-[#FFD230]'
                        : 'bg-rose-500/15 text-rose-400'
                    }`}
                  >
                    {game.difficulty}
                  </span>

                  <button
                    onClick={() => toggleGameStatus(game)}
                    title={game.active ? 'Active in meetups' : 'Inactive / In Storage'}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                      game.active
                        ? 'bg-[#4AB4A4]/15 text-[#4AB4A4] border border-[#4AB4A4]/30'
                        : 'bg-[#1A255C] text-[#64748B] border border-[#283677]'
                    }`}
                  >
                    {game.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              <h4 className="text-base font-heading font-bold text-[#F8FAFC] tracking-tight">{game.name}</h4>
              <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                {game.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-[#94A3B8] pt-1">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#4AB4A4]" />
                  <span>{game.players}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#FFD230]" />
                  <span>{game.duration}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#202B61] flex items-center justify-between">
              <span className="text-[10px] text-[#FF751F] font-semibold">
                Library ID #{game.id}
              </span>
              <button
                onClick={() => openEditModal(game)}
                className="text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Game Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151E4D] border border-[#283677] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#202B61]">
              <h3 className="text-base font-heading font-bold text-[#F8FAFC]">
                {isEditing ? 'Edit Board Game' : 'Add Board Game to Library'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  if (onCloseAddModalInitially) onCloseAddModalInitially();
                }}
                className="text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#94A3B8] font-semibold mb-1">Game Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Wingspan, Secret Hitler"
                  className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#FF751F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#94A3B8] font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as GameCategory)}
                    className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#FF751F]"
                  >
                    <option value="Party">Party</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Bluffing">Bluffing</option>
                    <option value="Social Deduction">Social Deduction</option>
                    <option value="Card Games">Card Games</option>
                    <option value="Family">Family</option>
                    <option value="Tournament">Tournament</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-semibold mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value as GameDifficulty)}
                    className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#FF751F]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Medium">Medium</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#94A3B8] font-semibold mb-1">Player Count</label>
                  <input
                    type="text"
                    required
                    value={players}
                    onChange={e => setPlayers(e.target.value)}
                    placeholder="3-6 players"
                    className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#FF751F]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    placeholder="30-45 min"
                    className="w-full bg-[#10173E] border border-[#283677] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#FF751F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] font-semibold mb-1">Description / Tagline</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Quick rules summary or flavor text..."
                  className="w-full bg-[#10173E] border border-[#283677] rounded-xl p-2.5 text-[#F8FAFC] focus:outline-none focus:border-[#FF751F]"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#202B61]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-[#283677] text-[#94A3B8] font-semibold hover:bg-[#1A255C] hover:text-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#FF751F] hover:bg-[#E66310] text-white font-heading font-bold shadow-md shadow-[#FF751F]/20"
                >
                  {isEditing ? 'Save Changes' : 'Add to Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
