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
        <h2 className="text-xl font-heading font-bold text-[#F5F2EB] tracking-tight">Community & Meetup Analytics</h2>
        <p className="text-xs text-[#A8A29E] mt-0.5">
          Data-driven insights on Pune board game trends, attendance velocity, and venue performance
        </p>
      </div>

      {/* Top 4 Core Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#1C1B18] border border-[#36332D]">
          <div className="flex items-center justify-between text-[#A8A29E] mb-1">
            <span className="text-xs font-semibold">Total Revenue (Gross)</span>
            <IndianRupee className="w-4 h-4 text-[#FFC226]" />
          </div>
          <div className="text-2xl font-heading font-bold text-[#F5F2EB]">₹{totalRevenue.toLocaleString()}</div>
          <span className="text-[10px] text-[#35C8A8] font-semibold">Confirmed ticket sales</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1C1B18] border border-[#36332D]">
          <div className="flex items-center justify-between text-[#A8A29E] mb-1">
            <span className="text-xs font-semibold">Solo Shuffler Ratio</span>
            <Users className="w-4 h-4 text-[#FF6036]" />
          </div>
          <div className="text-2xl font-heading font-bold text-[#FF6036]">{soloPercent}%</div>
          <span className="text-[10px] text-[#A8A29E]">People who join alone</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1C1B18] border border-[#36332D]">
          <div className="flex items-center justify-between text-[#A8A29E] mb-1">
            <span className="text-xs font-semibold">Repeat Retention</span>
            <TrendingUp className="w-4 h-4 text-[#35C8A8]" />
          </div>
          <div className="text-2xl font-heading font-bold text-[#35C8A8]">
            {Math.round((returningCount / (participants.length || 1)) * 100)}%
          </div>
          <span className="text-[10px] text-[#35C8A8] font-semibold">{returningCount} repeat shufflers</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1C1B18] border border-[#36332D]">
          <div className="flex items-center justify-between text-[#A8A29E] mb-1">
            <span className="text-xs font-semibold">Games Tagged</span>
            <Dices className="w-4 h-4 text-[#FFC226]" />
          </div>
          <div className="text-2xl font-heading font-bold text-[#FFC226]">
            {Object.values(gamePlayCounts).reduce((a, b) => a + b, 0)}
          </div>
          <span className="text-[10px] text-[#A8A29E]">Recorded sessions</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pune Locality Distribution */}
        <div className="p-5 rounded-2xl bg-[#1C1B18] border border-[#36332D] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF6036]" />
              <h3 className="text-sm font-heading font-bold text-[#F5F2EB]">Pune Locality Distribution</h3>
            </div>
            <span className="text-xs text-[#A8A29E]">Where shufflers live</span>
          </div>

          <div className="space-y-3">
            {sortedAreas.map(([area, count]) => {
              const pct = Math.round((count / (participants.length || 1)) * 100);
              return (
                <div key={area} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#F5F2EB]">{area}</span>
                    <span className="text-[#A8A29E]">
                      {count} shufflers ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#141312] rounded-full overflow-hidden border border-[#2C2924]">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6036] to-[#FFC226] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Played Games at Meetups */}
        <div className="p-5 rounded-2xl bg-[#1C1B18] border border-[#36332D] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dices className="w-4 h-4 text-[#35C8A8]" />
              <h3 className="text-sm font-heading font-bold text-[#F5F2EB]">Most Popular Games at Meetups</h3>
            </div>
            <span className="text-xs text-[#A8A29E]">Tag frequency</span>
          </div>

          <div className="space-y-2.5">
            {sortedGames.map((g, index) => (
              <div
                key={g.id}
                className="p-3 rounded-xl bg-[#24221E] border border-[#36332D] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-[#1C1B18] border border-[#36332D] text-[#FF6036] font-bold flex items-center justify-center text-[10px]">
                    #{index + 1}
                  </span>
                  <div>
                    <h5 className="font-heading font-bold text-[#F5F2EB]">{g.name}</h5>
                    <span className="text-[10px] text-[#A8A29E]">{g.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-heading font-bold text-[#35C8A8] text-sm">{g.count}</span>
                  <span className="text-[10px] text-[#78716C] block">times played</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Organizer Insights Card */}
      <div className="p-5 rounded-2xl bg-[#24221E] border border-[#36332D] shadow-xl space-y-2 text-xs">
        <div className="flex items-center gap-2 text-[#FF6036] font-heading font-bold">
          <Sparkles className="w-4 h-4 text-[#FFC226]" />
          <span>Organizer Growth Takeaways</span>
        </div>
        <p className="text-[#A8A29E] leading-relaxed">
          • <strong className="text-[#F5F2EB]">Solo-friendly vibe works:</strong> Over {soloPercent}% of registrations are solo Shufflers. Emphasize warm host welcome tables at the door.
        </p>
        <p className="text-[#A8A29E] leading-relaxed">
          • <strong className="text-[#F5F2EB]">Geographic hotspot:</strong> Koregaon Park and Baner represent our strongest participant clusters. Expanding weekend meetups in these hubs will minimize travel friction.
        </p>
      </div>
    </div>
  );
};
