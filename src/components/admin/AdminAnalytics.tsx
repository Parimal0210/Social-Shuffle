import React from 'react';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Users,
  Dices,
  IndianRupee,
  PieChart,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminAnalytics: React.FC = () => {
  const { participants, registrations, events, games } = useApp();

  // 1. Area Breakdown
  const areaCounts: Record<string, number> = {};
  participants.forEach(p => {
    areaCounts[p.area] = (areaCounts[p.area] || 0) + 1;
  });
  const sortedAreas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]);

  // 2. Solo vs Group Pax Breakdown
  const totalBookings = registrations.length || 1;
  const soloBookings = registrations.filter(r => r.paxCount === 1).length;
  const groupBookings = registrations.filter(r => r.paxCount > 1).length;
  const soloPercent = Math.round((soloBookings / totalBookings) * 100);
  const groupPercent = 100 - soloPercent;

  // 3. Most Popular Games (times tagged on table)
  const gamePlayCounts: Record<string, number> = {};
  registrations.forEach(r => {
    r.gamesPlayed.forEach(gid => {
      gamePlayCounts[gid] = (gamePlayCounts[gid] || 0) + 1;
    });
  });
  const sortedGames = Object.entries(gamePlayCounts)
    .map(([gid, count]) => {
      const g = games.find(item => item.id === gid);
      return { id: gid, name: g?.name || gid, count, category: g?.category || 'General' };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // 4. Revenue Calculation
  const totalRevenue = registrations
    .filter(r => r.attendanceStatus !== 'Cancelled' && r.paymentStatus === 'Confirmed')
    .reduce((acc, curr) => {
      const ev = events.find(e => e.id === curr.eventId);
      const price = ev?.ticketPrice || 250;
      return acc + curr.paxCount * price;
    }, 0);

  // 5. Retention: New vs Returning
  const returningCount = participants.filter(p => p.totalRegistrations > 1).length;
  const newCount = participants.filter(p => p.totalRegistrations <= 1).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">Community & Meetup Analytics</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Data-driven insights on Pune board game trends, attendance velocity, and venue performance
        </p>
      </div>

      {/* Top 4 Core Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#161822] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Revenue (Gross)</span>
            <IndianRupee className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">₹{totalRevenue.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-400 font-semibold">Confirmed ticket sales</span>
        </div>

        <div className="p-4 rounded-xl bg-[#161822] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Solo Shuffler Ratio</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300">{soloPercent}%</div>
          <span className="text-[10px] text-slate-400">People who join alone</span>
        </div>

        <div className="p-4 rounded-xl bg-[#161822] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Repeat Retention</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300">
            {Math.round((returningCount / (participants.length || 1)) * 100)}%
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">{returningCount} repeat shufflers</span>
        </div>

        <div className="p-4 rounded-xl bg-[#161822] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Games Tagged</span>
            <Dices className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300">
            {Object.values(gamePlayCounts).reduce((a, b) => a + b, 0)}
          </div>
          <span className="text-[10px] text-slate-400">Recorded sessions</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pune Locality Distribution */}
        <div className="p-5 rounded-2xl bg-[#161822] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Pune Locality Distribution</h3>
            </div>
            <span className="text-xs text-slate-400">Where shufflers live</span>
          </div>

          <div className="space-y-3">
            {sortedAreas.map(([area, count]) => {
              const pct = Math.round((count / (participants.length || 1)) * 100);
              return (
                <div key={area} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{area}</span>
                    <span className="text-slate-400">
                      {count} shufflers ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Played Games at Meetups */}
        <div className="p-5 rounded-2xl bg-[#161822] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dices className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Most Popular Games at Meetups</h3>
            </div>
            <span className="text-xs text-slate-400">Tag frequency</span>
          </div>

          <div className="space-y-2.5">
            {sortedGames.map((g, index) => (
              <div
                key={g.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-purple-950/80 border border-purple-800/60 text-purple-300 font-extrabold flex items-center justify-center text-[10px]">
                    #{index + 1}
                  </span>
                  <div>
                    <h5 className="font-bold text-white">{g.name}</h5>
                    <span className="text-[10px] text-slate-400">{g.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-cyan-400 text-sm">{g.count}</span>
                  <span className="text-[10px] text-slate-500 block">times played</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Organizer Insights Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 via-slate-900 to-indigo-950/20 border border-purple-800/30 shadow-xl space-y-2 text-xs">
        <div className="flex items-center gap-2 text-purple-400 font-bold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Organizer Growth Takeaways</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          • <strong>Solo-friendly vibe works:</strong> Over {soloPercent}% of registrations are solo Shufflers. Emphasize warm host welcome tables at the door.
        </p>
        <p className="text-slate-300 leading-relaxed">
          • <strong>Geographic hotspot:</strong> Koregaon Park and Baner represent our strongest participant clusters. Expanding weekend meetups in these hubs will minimize travel friction.
        </p>
      </div>
    </div>
  );
};
