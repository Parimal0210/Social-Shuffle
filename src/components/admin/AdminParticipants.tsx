import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Dices,
  AlertTriangle,
  Merge,
  CheckCircle2,
  ChevronRight,
  X,
  Plus,
  Save,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Participant } from '../../types';

export const AdminParticipants: React.FC = () => {
  const { participants, updateParticipant, mergeParticipants, registrations, games } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // Duplicate detection & merge state
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [primaryMergeId, setPrimaryMergeId] = useState<string>('');
  const [duplicateMergeId, setDuplicateMergeId] = useState<string>('');
  const [mergeSuccessMsg, setMergeSuccessMsg] = useState('');

  // Find duplicates by matching phone or email
  const duplicateMap = new Map<string, Participant[]>();
  participants.forEach(p => {
    // Normalizing phone and email keys
    const phoneKey = p.phone.replace(/\D/g, '').slice(-10);
    const emailKey = p.email.toLowerCase().trim();

    if (phoneKey) {
      const existing = duplicateMap.get(`p_${phoneKey}`) || [];
      existing.push(p);
      duplicateMap.set(`p_${phoneKey}`, existing);
    }
    if (emailKey) {
      const existing = duplicateMap.get(`e_${emailKey}`) || [];
      existing.push(p);
      duplicateMap.set(`e_${emailKey}`, existing);
    }
  });

  const duplicateIds = new Set<string>();
  duplicateMap.forEach(group => {
    if (group.length > 1) {
      group.forEach(p => duplicateIds.add(p.id));
    }
  });

  // Filter participants
  const filteredParticipants = participants.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);

    const matchesArea = selectedArea === 'All' || p.area === selectedArea;
    const matchesDup = !showDuplicatesOnly || duplicateIds.has(p.id);

    return matchesSearch && matchesArea && matchesDup;
  });

  const areas = ['All', 'Koregaon Park', 'Baner', 'Viman Nagar', 'Kothrud', 'Aundh', 'Kalyani Nagar', 'Wakad'];

  const openMergeModal = (p1: Participant, p2?: Participant) => {
    setPrimaryMergeId(p1.id);
    if (p2) {
      setDuplicateMergeId(p2.id);
    } else {
      // Pick another duplicate if available
      const other = participants.find(p => p.id !== p1.id && duplicateIds.has(p.id));
      setDuplicateMergeId(other?.id || '');
    }
    setMergeModalOpen(true);
  };

  const handleExecuteMerge = () => {
    if (!primaryMergeId || !duplicateMergeId || primaryMergeId === duplicateMergeId) return;

    mergeParticipants(primaryMergeId, duplicateMergeId);
    setMergeSuccessMsg('Participants merged successfully! Registrations and games synced.');
    setTimeout(() => {
      setMergeSuccessMsg('');
      setMergeModalOpen(false);
      setSelectedParticipant(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Participant Directory & CRM</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage customer records, lifetime attendance, game mastery, and deduplication
          </p>
        </div>

        {duplicateIds.size > 0 && (
          <button
            onClick={() => setShowDuplicatesOnly(!showDuplicatesOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              showDuplicatesOnly
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                : 'bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{showDuplicatesOnly ? 'Showing Duplicates' : `Detect Duplicates (${duplicateIds.size})`}</span>
          </button>
        )}
      </div>

      {/* Search & Area Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by participant name, phone, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <select
          value={selectedArea}
          onChange={e => setSelectedArea(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
        >
          {areas.map(a => (
            <option key={a} value={a}>
              {a === 'All' ? 'All Pune Localities' : a}
            </option>
          ))}
        </select>
      </div>

      {/* Participants Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredParticipants.map(participant => {
          const isDuplicate = duplicateIds.has(participant.id);
          const partRegs = registrations.filter(r => r.participantId === participant.id);

          return (
            <div
              key={participant.id}
              onClick={() => setSelectedParticipant(participant)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-lg ${
                isDuplicate
                  ? 'bg-[#1b171c] border-amber-500/40 hover:border-amber-500'
                  : 'bg-[#161822] border-slate-800/80 hover:border-purple-500/40'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center font-bold text-sm text-purple-200">
                      {participant.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {participant.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 block">{participant.area}</span>
                    </div>
                  </div>

                  {isDuplicate && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Potential Dup
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{participant.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">{participant.email}</span>
                  </div>
                </div>

                {/* Stats chips */}
                <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px]">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">Attended</span>
                    <span className="font-bold text-purple-300 text-xs">{participant.totalEventsAttended}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">Games</span>
                    <span className="font-bold text-cyan-300 text-xs">{participant.gamesPlayedIds.length}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">Guests</span>
                    <span className="font-bold text-emerald-300 text-xs">{participant.totalPaxBrought}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">Joined {participant.joinedDate}</span>
                {isDuplicate ? (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      openMergeModal(participant);
                    }}
                    className="text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Merge className="w-3.5 h-3.5" />
                    <span>Merge</span>
                  </button>
                ) : (
                  <span className="text-purple-400 font-semibold group-hover:underline">
                    View CRM →
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PARTICIPANT DETAIL MODAL / DRAWER */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161822] border border-purple-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Participant History & Profile
              </span>
              <button onClick={() => setSelectedParticipant(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-lg">
                {selectedParticipant.name[0]}
              </div>
              <div>
                <h3 className="text-base font-black text-white">{selectedParticipant.name}</h3>
                <p className="text-xs text-slate-400">
                  {selectedParticipant.phone} • {selectedParticipant.email}
                </p>
                <span className="text-xs text-purple-300 font-semibold">{selectedParticipant.area}, Pune</span>
              </div>
            </div>

            {/* Lifetime stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Attended</span>
                <span className="text-base font-black text-purple-400">
                  {selectedParticipant.totalEventsAttended}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Total Bookings</span>
                <span className="text-base font-black text-cyan-400">
                  {selectedParticipant.totalRegistrations}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Pax Brought</span>
                <span className="text-base font-black text-emerald-400">
                  {selectedParticipant.totalPaxBrought}
                </span>
              </div>
            </div>

            {/* Games Mastered */}
            <div>
              <span className="text-xs font-bold text-slate-300 block mb-1.5">
                Games Played ({selectedParticipant.gamesPlayedIds.length})
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-slate-900 border border-slate-800">
                {selectedParticipant.gamesPlayedIds.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No games logged yet</span>
                ) : (
                  selectedParticipant.gamesPlayedIds.map(gid => {
                    const g = games.find(item => item.id === gid);
                    return (
                      <span
                        key={gid}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/40 text-purple-200 border border-purple-800/40"
                      >
                        {g ? g.name : gid}
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Venues Visited */}
            <div>
              <span className="text-xs font-bold text-slate-300 block mb-1">Venues Visited in Pune</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedParticipant.venuesVisited.map((v, i) => (
                  <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    📍 {v}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => openMergeModal(selectedParticipant)}
                className="flex-1 py-2 rounded-xl border border-amber-500/40 text-amber-400 font-bold text-xs hover:bg-amber-500/10 flex items-center justify-center gap-1.5"
              >
                <Merge className="w-3.5 h-3.5" />
                <span>Merge with Duplicate</span>
              </button>
              <button
                onClick={() => setSelectedParticipant(null)}
                className="flex-1 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE MERGE DUPLICATE TOOL MODAL */}
      {mergeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161822] border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Merge className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Merge Duplicate Shufflers</h3>
              </div>
              <button onClick={() => setMergeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select the primary customer record to keep. All event attendances, games played, guest referrals, and history will be safely consolidated into the primary profile, and the duplicate will be cleanly removed.
            </p>

            {mergeSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{mergeSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  1. Keep this as Primary Profile (Master Record)
                </label>
                <select
                  value={primaryMergeId}
                  onChange={e => setPrimaryMergeId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {participants.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone} • {p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  2. Merge & Delete this Duplicate Record
                </label>
                <select
                  value={duplicateMergeId}
                  onChange={e => setDuplicateMergeId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose duplicate to merge --</option>
                  {participants
                    .filter(p => p.id !== primaryMergeId)
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.phone} • {p.email})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setMergeModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold text-xs hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteMerge}
                disabled={!duplicateMergeId || duplicateMergeId === primaryMergeId}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                Confirm & Merge Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
