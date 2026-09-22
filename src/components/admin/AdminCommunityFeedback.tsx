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
          <h2 className="text-xl font-black text-white tracking-tight">Participant Feedback ({feedbackList.length})</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Post-meetup ratings and suggestions submitted by Pune Shufflers
          </p>
        </div>

        <select
          value={selectedEventId}
          onChange={e => setSelectedEventId(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
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
        <div className="p-4 rounded-xl bg-[#161822] border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Overall Rating</span>
          <div className="flex items-center justify-center gap-1 text-2xl font-black text-amber-400 mt-1">
            <Star className="w-5 h-5 fill-amber-400" />
            <span>{avgOverall}</span>
          </div>
          <span className="text-[10px] text-slate-500">out of 5.0</span>
        </div>

        <div className="p-4 rounded-xl bg-[#161822] border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Venue & Vibe</span>
          <div className="flex items-center justify-center gap-1 text-2xl font-black text-amber-400 mt-1">
            <Star className="w-5 h-5 fill-amber-400" />
            <span>{avgVenue}</span>
          </div>
          <span className="text-[10px] text-slate-500">Comfort & lighting</span>
        </div>

        <div className="p-4 rounded-xl bg-[#161822] border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Game Selection</span>
          <div className="flex items-center justify-center gap-1 text-2xl font-black text-amber-400 mt-1">
            <Star className="w-5 h-5 fill-amber-400" />
            <span>{avgGame}</span>
          </div>
          <span className="text-[10px] text-slate-500">Variety & difficulty</span>
        </div>

        <div className="p-4 rounded-xl bg-[#161822] border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Host & Explanations</span>
          <div className="flex items-center justify-center gap-1 text-2xl font-black text-amber-400 mt-1">
            <Star className="w-5 h-5 fill-amber-400" />
            <span>{avgHost}</span>
          </div>
          <span className="text-[10px] text-slate-500">Welcoming & rules</span>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#161822] border border-slate-800 text-center text-xs text-slate-400">
            No feedback submissions recorded for this selection yet.
          </div>
        ) : (
          filtered.map(fb => (
            <div
              key={fb.id}
              className="p-5 rounded-2xl bg-[#161822] border border-slate-800 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <span className="text-xs font-bold text-white">
                    {fb.isAnonymous ? '🕵️ Anonymous Shuffler' : fb.participantName}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">• {fb.eventTitle}</span>
                </div>
                <span className="text-[11px] text-slate-500">{fb.submittedAt}</span>
              </div>

              {/* Rating Badges */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 font-bold flex items-center gap-1">
                  ★ Overall: {fb.overallRating}/5
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  Venue: {fb.venueRating}/5
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  Games: {fb.gameRating}/5
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  Hosts: {fb.hostRating}/5
                </span>
              </div>

              {/* Feedback text */}
              {fb.suggestions && (
                <p className="text-xs text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed italic">
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
