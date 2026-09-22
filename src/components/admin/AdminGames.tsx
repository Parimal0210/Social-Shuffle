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
          <h2 className="text-xl font-black text-white tracking-tight">
            Central Game Library ({games.length} Games)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage titles brought to Pune Social Shuffle tables, categories, rules, and active rotation
          </p>
        </div>

        <button
          id="btn-add-new-game"
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Board Game</span>
        </button>
      </div>

      {/* Search & Category Pills */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search game library by title or keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
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
                ? 'bg-[#161822] border-slate-800/80 hover:border-purple-500/40'
                : 'bg-[#14151e] border-slate-800/40 opacity-50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                  {game.category}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      game.difficulty === 'Beginner'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : game.difficulty === 'Medium'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {game.difficulty}
                  </span>

                  <button
                    onClick={() => toggleGameStatus(game)}
                    title={game.active ? 'Active in meetups' : 'Inactive / In Storage'}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                      game.active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {game.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              <h4 className="text-base font-black text-white tracking-tight">{game.name}</h4>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {game.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{game.players}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{game.duration}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-purple-400 font-semibold">
                Library ID #{game.id}
              </span>
              <button
                onClick={() => openEditModal(game)}
                className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161822] border border-purple-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">
                {isEditing ? 'Edit Board Game' : 'Add Board Game to Library'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  if (onCloseAddModalInitially) onCloseAddModalInitially();
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Game Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Wingspan, Secret Hitler"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as GameCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
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
                  <label className="block text-slate-400 font-semibold mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value as GameDifficulty)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Medium">Medium</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Player Count</label>
                  <input
                    type="text"
                    required
                    value={players}
                    onChange={e => setPlayers(e.target.value)}
                    placeholder="3-6 players"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    placeholder="30-45 min"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description / Tagline</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Quick rules summary or flavor text..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow"
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
