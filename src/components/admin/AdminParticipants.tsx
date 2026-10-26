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
          <h2 className="text-xl font-heading font-bold text-[#F5F2EB] tracking-tight">Participant Directory & CRM</h2>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Manage customer records, lifetime attendance, game mastery, and deduplication
          </p>
        </div>

        {duplicateIds.size > 0 && (
          <button
            onClick={() => setShowDuplicatesOnly(!showDuplicatesOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              showDuplicatesOnly
                ? 'bg-[#FFC226] text-[#141312] shadow-md shadow-[#FFC226]/30'
                : 'bg-[#FFC226]/15 border border-[#FFC226]/30 text-[#FFC226] hover:bg-[#FFC226]/25'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-[#FFC226]" />
            <span>{showDuplicatesOnly ? 'Showing Duplicates' : `Detect Duplicates (${duplicateIds.size})`}</span>
          </button>
        )}
      </div>

      {/* Search & Area Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#78716C]" />
          <input
            type="text"
            placeholder="Search by participant name, phone, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#1C1B18] border border-[#36332D] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5F2EB] placeholder-[#78716C] focus:outline-none focus:border-[#FF6036]"
          />
        </div>

        <select
          value={selectedArea}
          onChange={e => setSelectedArea(e.target.value)}
          className="bg-[#1C1B18] border border-[#36332D] rounded-xl px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none focus:border-[#FF6036]"
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
                  ? 'bg-[#1C1B18] border-[#FFC226]/50 hover:border-[#FFC226]'
                  : 'bg-[#1C1B18] border-[#36332D] hover:border-[#FF6036]/50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FF6036] flex items-center justify-center font-heading font-bold text-sm text-white shadow-sm">
                      {participant.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-heading font-bold text-[#F5F2EB] tracking-tight">
                        {participant.name}
                      </h4>
                      <span className="text-[10px] text-[#A8A29E] block">{participant.area}</span>
                    </div>
                  </div>

                  {isDuplicate && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFC226]/15 text-[#FFC226] border border-[#FFC226]/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Potential Dup
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-[#A8A29E] pt-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-[#35C8A8] shrink-0" />
                    <span>{participant.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#FF6036] shrink-0" />
                    <span className="truncate">{participant.email}</span>
                  </div>
                </div>

                {/* Stats chips */}
                <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px]">
                  <div className="p-1.5 rounded-lg bg-[#24221E] border border-[#36332D]">
                    <span className="text-[#78716C] block">Attended</span>
                    <span className="font-heading font-bold text-[#FF6036] text-xs">{participant.totalEventsAttended}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#24221E] border border-[#36332D]">
                    <span className="text-[#78716C] block">Games</span>
                    <span className="font-heading font-bold text-[#35C8A8] text-xs">{participant.gamesPlayedIds.length}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#24221E] border border-[#36332D]">
                    <span className="text-[#78716C] block">Guests</span>
                    <span className="font-heading font-bold text-[#FFC226] text-xs">{participant.totalPaxBrought}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2C2924] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#78716C]">Joined {participant.joinedDate}</span>
                {isDuplicate ? (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      openMergeModal(participant);
                    }}
                    className="text-[#FFC226] font-bold hover:underline flex items-center gap-1"
                  >
                    <Merge className="w-3.5 h-3.5" />
                    <span>Merge</span>
                  </button>
                ) : (
                  <span className="text-[#FF6036] font-semibold group-hover:underline">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1B18] border border-[#36332D] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C2924]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6036]">
                Participant History & Profile
              </span>
              <button onClick={() => setSelectedParticipant(null)} className="text-[#A8A29E] hover:text-[#F5F2EB]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FF6036] flex items-center justify-center text-white font-heading font-black text-lg">
                {selectedParticipant.name[0]}
              </div>
              <div>
                <h3 className="text-base font-heading font-bold text-[#F5F2EB]">{selectedParticipant.name}</h3>
                <p className="text-xs text-[#A8A29E]">
                  {selectedParticipant.phone} • {selectedParticipant.email}
                </p>
                <span className="text-xs text-[#FFC226] font-semibold">{selectedParticipant.area}, Pune</span>
              </div>
            </div>

            {/* Lifetime stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-[#24221E] border border-[#36332D]">
                <span className="text-[#78716C] text-[10px] block">Attended</span>
                <span className="text-base font-heading font-bold text-[#FF6036]">
                  {selectedParticipant.totalEventsAttended}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#24221E] border border-[#36332D]">
                <span className="text-[#78716C] text-[10px] block">Total Bookings</span>
                <span className="text-base font-heading font-bold text-[#35C8A8]">
                  {selectedParticipant.totalRegistrations}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#24221E] border border-[#36332D]">
                <span className="text-[#78716C] text-[10px] block">Pax Brought</span>
                <span className="text-base font-heading font-bold text-[#FFC226]">
                  {selectedParticipant.totalPaxBrought}
                </span>
              </div>
            </div>

            {/* Games Mastered */}
            <div>
              <span className="text-xs font-bold text-[#F5F2EB] block mb-1.5">
                Games Played ({selectedParticipant.gamesPlayedIds.length})
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-[#24221E] border border-[#36332D]">
                {selectedParticipant.gamesPlayedIds.length === 0 ? (
                  <span className="text-xs text-[#78716C] italic">No games logged yet</span>
                ) : (
                  selectedParticipant.gamesPlayedIds.map(gid => {
                    const g = games.find(item => item.id === gid);
                    return (
                      <span
                        key={gid}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#1C1B18] text-[#FFC226] border border-[#36332D]"
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
              <span className="text-xs font-bold text-[#F5F2EB] block mb-1">Venues Visited in Pune</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedParticipant.venuesVisited.map((v, i) => (
                  <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-[#24221E] text-[#A8A29E] border border-[#36332D]">
                    📍 {v}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-[#2C2924]">
              <button
                onClick={() => openMergeModal(selectedParticipant)}
                className="flex-1 py-2 rounded-xl border border-[#FFC226]/40 text-[#FFC226] font-bold text-xs hover:bg-[#FFC226]/10 flex items-center justify-center gap-1.5"
              >
                <Merge className="w-3.5 h-3.5" />
                <span>Merge with Duplicate</span>
              </button>
              <button
                onClick={() => setSelectedParticipant(null)}
                className="flex-1 py-2 rounded-xl bg-[#FF6036] hover:bg-[#E85127] text-white font-heading font-bold text-xs shadow-md shadow-[#FF6036]/20"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE MERGE DUPLICATE TOOL MODAL */}
      {mergeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1B18] border border-[#36332D] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#2C2924]">
              <div className="flex items-center gap-2">
                <Merge className="w-5 h-5 text-[#FFC226]" />
                <h3 className="text-base font-heading font-bold text-[#F5F2EB]">Merge Duplicate Shufflers</h3>
              </div>
              <button onClick={() => setMergeModalOpen(false)} className="text-[#A8A29E] hover:text-[#F5F2EB]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#A8A29E]">
              Select the primary customer record to keep. All event attendances, games played, guest referrals, and history will be safely consolidated into the primary profile, and the duplicate will be cleanly removed.
            </p>

            {mergeSuccessMsg && (
              <div className="p-3 rounded-xl bg-[#35C8A8]/15 border border-[#35C8A8]/30 text-[#35C8A8] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{mergeSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A8A29E] font-semibold mb-1">
                  1. Keep this as Primary Profile (Master Record)
                </label>
                <select
                  value={primaryMergeId}
                  onChange={e => setPrimaryMergeId(e.target.value)}
                  className="w-full bg-[#141312] border border-[#36332D] rounded-xl px-3 py-2 text-[#F5F2EB] focus:outline-none focus:border-[#FF6036]"
                >
                  {participants.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone} • {p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#A8A29E] font-semibold mb-1">
                  2. Merge & Delete this Duplicate Record
                </label>
                <select
                  value={duplicateMergeId}
                  onChange={e => setDuplicateMergeId(e.target.value)}
                  className="w-full bg-[#141312] border border-[#36332D] rounded-xl px-3 py-2 text-[#F5F2EB] focus:outline-none focus:border-[#FF6036]"
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

            <div className="flex gap-2 pt-3 border-t border-[#2C2924]">
              <button
                type="button"
                onClick={() => setMergeModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#36332D] text-[#A8A29E] font-semibold text-xs hover:bg-[#24221E] hover:text-[#F5F2EB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteMerge}
                disabled={!duplicateMergeId || duplicateMergeId === primaryMergeId}
                className="flex-1 py-2.5 rounded-xl bg-[#FF6036] hover:bg-[#E85127] text-white font-heading font-bold text-xs shadow-lg shadow-[#FF6036]/20 disabled:opacity-50"
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
