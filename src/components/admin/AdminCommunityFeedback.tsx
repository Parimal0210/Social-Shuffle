import React, { useState } from 'react';
import { MessageSquare, Star, Filter, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminCommunityFeedback: React.FC = () => {
  const { feedbackList, events } = useApp();
  const [selectedEventId, setSelectedEventId] = useState<string>('all');

  const filtered = feedbackList.filter(fb =>
    selectedEventId === 'all' ? true : fb.eventId === selectedEventId
  );

  // Compute averages
  const totalCount = feedbackList.length || 1;
  const avgOverall = (
    feedbackList.reduce((acc, curr) => acc + curr.overallRating, 0) / totalCount
  ).toFixed(1);
  const avgVenue = (
    feedbackList.reduce((acc, curr) => acc + curr.venueRating, 0) / totalCount
  ).toFixed(1);
  const avgGame = (
    feedbackList.reduce((acc, curr) => acc + curr.gameRating, 0) / totalCount
  ).toFixed(1);
  const avgHost = (
    feedbackList.reduce((acc, curr) => acc + curr.hostRating, 0) / totalCount
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-bold text-[#F8FAFC] tracking-tight">Participant Feedback ({feedbackList.length})</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Post-meetup ratings and suggestions submitted by Pune Shufflers
          </p>
        </div>

        <select
          value={selectedEventId}
          onChange={e => setSelectedEventId(e.target.value)}
          className="bg-[#151E4D] border border-[#283677] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FF751F]"
        >
          <option value="all">All Meetups</option>
          {events.map(ev => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      {/* Average Ratings Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#151E4D] border border-[#283677] text-center">
          <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block font-bold">Overall Rating</span>
          <div className="flex items-center justify-center gap-1 text-2xl font-heading font-bold text-[#FFD230] mt-1">
            <Star className="w-5 h-5 fill-[#FFD230]" />
            <span>{avgOverall}</span>
          </div>
          <span className="text-[10px] text-[#64748B]">out of 5.0</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151E4D] border border-[#283677] text-center">
          <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block font-bold">Venue & Vibe</span>
          <div className="flex items-center justify-center gap-1 text-2xl font-heading font-bold text-[#FFD230] mt-1">
            <Star className="w-5 h-5 fill-[#FFD230]" />
            <span>{avgVenue}</span>
          </div>
          <span className="text-[10px] text-[#64748B]">Comfort & lighting</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151E4D] border border-[#283677] text-center">
          <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block font-bold">Game Selection</span>
          <div className="flex items-center justify-center gap-1 text-2xl font-heading font-bold text-[#FFD230] mt-1">
            <Star className="w-5 h-5 fill-[#FFD230]" />
            <span>{avgGame}</span>
          </div>
          <span className="text-[10px] text-[#64748B]">Variety & difficulty</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151E4D] border border-[#283677] text-center">
          <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block font-bold">Host & Explanations</span>
          <div className="flex items-center justify-center gap-1 text-2xl font-heading font-bold text-[#FFD230] mt-1">
            <Star className="w-5 h-5 fill-[#FFD230]" />
            <span>{avgHost}</span>
          </div>
          <span className="text-[10px] text-[#64748B]">Welcoming & rules</span>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#151E4D] border border-[#283677] text-center text-xs text-[#94A3B8]">
            No feedback submissions recorded for this selection yet.
          </div>
        ) : (
          filtered.map(fb => (
            <div
              key={fb.id}
              className="p-5 rounded-2xl bg-[#151E4D] border border-[#283677] shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <span className="text-xs font-heading font-bold text-[#F8FAFC]">
                    {fb.isAnonymous ? '🕵️ Anonymous Shuffler' : fb.participantName}
                  </span>
                  <span className="text-xs text-[#94A3B8] ml-2">• {fb.eventTitle}</span>
                </div>
                <span className="text-[11px] text-[#64748B]">{fb.submittedAt}</span>
              </div>

              {/* Rating Badges */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-[#1A255C] border border-[#283677] text-[#FFD230] font-bold flex items-center gap-1">
                  ★ Overall: {fb.overallRating}/5
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#1A255C] border border-[#283677] text-[#94A3B8]">
                  Venue: {fb.venueRating}/5
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#1A255C] border border-[#283677] text-[#94A3B8]">
                  Games: {fb.gameRating}/5
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#1A255C] border border-[#283677] text-[#94A3B8]">
                  Hosts: {fb.hostRating}/5
                </span>
              </div>

              {/* Feedback text */}
              {fb.suggestions && (
                <p className="text-xs text-[#F8FAFC] bg-[#1A255C] p-3 rounded-xl border border-[#283677] leading-relaxed italic">
                  "{fb.suggestions}"
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
