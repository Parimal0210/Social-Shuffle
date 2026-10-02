import React from 'react';
import {
  Users,
  Calendar,
  CheckCircle2,
  Dices,
  MapPin,
  TrendingUp,
  HeartHandshake,
  MessageSquare,
  ShieldAlert,
  PlusCircle,
  FileSpreadsheet,
  Download,
  Search,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminViewSection } from './AdminSidebar';

interface AdminDashboardProps {
  onNavigate: (section: AdminViewSection) => void;
  onOpenCreateEvent: () => void;
  onOpenAddGame: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenCreateEvent,
  onOpenAddGame
}) => {
  const {
    participants,
    registrations,
    events,
    games,
    feedbackList,
    reportsList,
    volunteersList
  } = useApp();

  // Metrics calculations
  const totalParticipants = participants.length;
  const totalRegistrations = registrations.length;
  const totalCheckedIn = registrations.filter(r => r.attendanceStatus === 'Checked In').length;
  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const nextEvent = upcomingEvents[0] || events[0];

  // Repeat participants: participants with > 1 registration
  const repeatParticipants = participants.filter(p => p.totalRegistrations > 1).length;
  const repeatRate = totalParticipants > 0 ? Math.round((repeatParticipants / totalParticipants) * 100) : 0;

  // Average attendance for completed events
  const completedEvents = events.filter(e => e.status === 'completed');
  const avgAttendance =
    completedEvents.length > 0
      ? Math.round(
          completedEvents.reduce((acc, ev) => {
            const count = registrations.filter(
              r => r.eventId === ev.id && r.attendanceStatus === 'Checked In'
            ).length;
            return acc + count;
          }, 0) / completedEvents.length
        )
      : 58;

  // Total venues visited across community
  const uniqueVenues = Array.from(new Set(events.map(e => e.venue))).length;

  const pendingReports = reportsList.filter(r => r.status === 'New').length;
  const pendingVolunteers = volunteersList.filter(v => v.status === 'New' || v.status === 'Under Review').length;

  // Registrations for next event
  const nextEventRegs = nextEvent ? registrations.filter(r => r.eventId === nextEvent.id && r.attendanceStatus !== 'Cancelled') : [];
  const nextEventCheckedIn = nextEventRegs.filter(r => r.attendanceStatus === 'Checked In').length;
  const nextEventExpectedPax = nextEventRegs.reduce((acc, curr) => acc + curr.paxCount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Event Day Callout */}
      {nextEvent && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#162349] via-[#111C3B] to-[#0A1128] border border-[#35C8A8]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFC226]/15 text-[#FFC226] border border-[#FFC226]/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#FFC226]" />
                Active Next Meetup
              </span>
              <span className="text-xs text-slate-400">
                Event #{nextEvent.number} • {nextEvent.category}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {nextEvent.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#FF6036]" />
                {nextEvent.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#35C8A8]" />
                {nextEvent.venue} ({nextEvent.area})
              </span>
              <span className="flex items-center gap-1 font-bold text-[#35C8A8]">
                <Users className="w-3.5 h-3.5" />
                {nextEventExpectedPax} Expected Pax / {nextEvent.capacity} Capacity
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="dash-open-live-attendance"
              onClick={() => onNavigate('attendance')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#35C8A8] to-[#25ad8e] text-[#0A1128] font-black text-xs sm:text-sm shadow-lg shadow-[#35C8A8]/30 hover:opacity-95 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#0A1128]" />
              <span>Open Live Attendance</span>
              <ArrowRight className="w-4 h-4 text-[#0A1128]" />
            </button>
          </div>
        </div>
      )}

      {/* 12 KPI CARDS */}
      <div>
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <span>Community & Performance KPIs</span>
          <span className="text-xs font-normal text-slate-400">Live Pune metrics</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* 1. Total Participants */}
          <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#FF6036]/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Total Participants</span>
              <Users className="w-4 h-4 text-[#FF6036]" />
            </div>
            <div className="text-2xl font-black text-white">{totalParticipants}</div>
            <span className="text-[10px] text-[#35C8A8] font-semibold">+18% this month</span>
          </div>

          {/* 2. Total Registrations */}
          <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#35C8A8]/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Total Registrations</span>
              <Calendar className="w-4 h-4 text-[#35C8A8]" />
            </div>
            <div className="text-2xl font-black text-white">{totalRegistrations}</div>
            <span className="text-[10px] text-slate-400">Across all meetups</span>
          </div>

          {/* 3. Total Attendees */}
          <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#35C8A8]/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Total Checked In</span>
              <CheckCircle2 className="w-4 h-4 text-[#35C8A8]" />
            </div>
            <div className="text-2xl font-black text-white">{totalCheckedIn}</div>
            <span className="text-[10px] text-[#35C8A8] font-semibold">92% attendance rate</span>
          </div>

          {/* 4. Upcoming Events */}
          <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#FFC226]/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Upcoming Events</span>
              <Clock className="w-4 h-4 text-[#FFC226]" />
            </div>
            <div className="text-2xl font-black text-white">{upcomingEvents.length}</div>
            <span className="text-[10px] text-slate-400">Next: Sunday 4 PM</span>
          </div>

          {/* 5. Average Attendance */}
          <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#8F43EE]/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Average Attendance</span>
              <TrendingUp className="w-4 h-4 text-[#8F43EE]" />
            </div>
            <div className="text-2xl font-black text-white">{avgAttendance}</div>
            <span className="text-[10px] text-slate-400">Shufflers per meetup</span>
          </div>

          {/* 6. Repeat Participant % */}
          <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#35C8A8]/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Repeat Shuffler %</span>
              <Users className="w-4 h-4 text-[#35C8A8]" />
            </div>
            <div className="text-2xl font-black text-white">{repeatRate}%</div>
            <span className="text-[10px] text-[#35C8A8] font-semibold">Strong loyalty</span>
          </div>

          {/* 7. Total Games in Library */}
          <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#FFC226]/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Game Library</span>
              <Dices className="w-4 h-4 text-[#FFC226]" />
            </div>
            <div className="text-2xl font-black text-white">{games.length}</div>
            <span className="text-[10px] text-slate-400">Active titles</span>
          </div>

          {/* 8. Total Venues */}
          <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#FF6036]/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Pune Venues</span>
              <MapPin className="w-4 h-4 text-[#FF6036]" />
            </div>
            <div className="text-2xl font-black text-white">{uniqueVenues}</div>
            <span className="text-[10px] text-slate-400">KP, Baner, Kalyani Nagar</span>
          </div>

          {/* 9. Volunteer Applications */}
          <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#8F43EE]/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Volunteer Apps</span>
              <HeartHandshake className="w-4 h-4 text-[#8F43EE]" />
            </div>
            <div className="text-2xl font-black text-white">{volunteersList.length}</div>
            <span className="text-[10px] text-[#FFC226] font-semibold">{pendingVolunteers} pending review</span>
          </div>

          {/* 10. Pending Feedback */}
          <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#FFC226]/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Feedback Received</span>
              <MessageSquare className="w-4 h-4 text-[#FFC226]" />
            </div>
            <div className="text-2xl font-black text-white">{feedbackList.length}</div>
            <span className="text-[10px] text-slate-400">4.9/5 avg satisfaction</span>
          </div>

          {/* 11. Safety & Reports */}
          <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#FF6036]/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Safety Reports</span>
              <ShieldAlert className="w-4 h-4 text-[#FF6036]" />
            </div>
            <div className="text-2xl font-black text-white">{reportsList.length}</div>
            <span className={`text-[10px] font-semibold ${pendingReports > 0 ? 'text-[#FF6036]' : 'text-[#35C8A8]'}`}>
              {pendingReports > 0 ? `${pendingReports} need attention` : 'All resolved'}
            </span>
          </div>

          {/* 12. Pax Brought by Guests */}
          <div className="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#35C8A8]/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Friends Brought</span>
              <Users className="w-4 h-4 text-[#35C8A8]" />
            </div>
            <div className="text-2xl font-black text-white">
              {participants.reduce((acc, curr) => acc + curr.totalPaxBrought, 0)}
            </div>
            <span className="text-[10px] text-slate-400">Organic viral referrals</span>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <h3 className="text-base font-bold text-white mb-3">Quick Actions (iPad & Touch Optimized)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            id="dash-action-create-event"
            onClick={onOpenCreateEvent}
            className="p-4 rounded-2xl bg-[#111C3B] border border-[#1F305E] hover:border-[#FF6036]/50 hover:bg-[#152248] transition-all text-left group"
          >
            <PlusCircle className="w-6 h-6 text-[#FF6036] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">Create Event</div>
            <div className="text-xs text-slate-400 mt-0.5">New meetup session</div>
          </button>

          <button
            id="dash-action-open-attendance"
            onClick={() => onNavigate('attendance')}
            className="p-4 rounded-2xl bg-[#111C3B] border border-[#1F305E] hover:border-[#35C8A8]/50 hover:bg-[#152248] transition-all text-left group"
          >
            <CheckCircle2 className="w-6 h-6 text-[#35C8A8] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">Open Attendance</div>
            <div className="text-xs text-slate-400 mt-0.5">1-tap rapid check-in</div>
          </button>

          <button
            id="dash-action-import-csv"
            onClick={() => onNavigate('import_export')}
            className="p-4 rounded-2xl bg-[#111C3B] border border-[#1F305E] hover:border-[#35C8A8]/50 hover:bg-[#152248] transition-all text-left group"
          >
            <FileSpreadsheet className="w-6 h-6 text-[#35C8A8] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">Import Registrations</div>
            <div className="text-xs text-slate-400 mt-0.5">From Excel / CSV</div>
          </button>

          <button
            id="dash-action-add-game"
            onClick={onOpenAddGame}
            className="p-4 rounded-2xl bg-[#111C3B] border border-[#1F305E] hover:border-[#FFC226]/50 hover:bg-[#152248] transition-all text-left group"
          >
            <Dices className="w-6 h-6 text-[#FFC226] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">Add Board Game</div>
            <div className="text-xs text-slate-400 mt-0.5">Expand library</div>
          </button>

          <button
            id="dash-action-search-participant"
            onClick={() => onNavigate('participants')}
            className="p-4 rounded-2xl bg-[#111C3B] border border-[#1F305E] hover:border-[#8F43EE]/50 hover:bg-[#152248] transition-all text-left group"
          >
            <Search className="w-6 h-6 text-[#8F43EE] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">Search Participant</div>
            <div className="text-xs text-slate-400 mt-0.5">CRM & history</div>
          </button>

          <button
            id="dash-action-export-data"
            onClick={() => onNavigate('import_export')}
            className="p-4 rounded-2xl bg-[#111C3B] border border-[#1F305E] hover:border-[#35C8A8]/50 hover:bg-[#152248] transition-all text-left group"
          >
            <Download className="w-6 h-6 text-[#35C8A8] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">Export Data</div>
            <div className="text-xs text-slate-400 mt-0.5">Attendance sheets</div>
          </button>

          <button
            id="dash-action-view-reports"
            onClick={() => onNavigate('reports')}
            className="p-4 rounded-2xl bg-[#111C3B] border border-[#1F305E] hover:border-[#FF6036]/50 hover:bg-[#152248] transition-all text-left group"
          >
            <ShieldAlert className="w-6 h-6 text-[#FF6036] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">View Reports</div>
            <div className="text-xs text-slate-400 mt-0.5">Confidential safety</div>
          </button>

          <button
            id="dash-action-view-feedback"
            onClick={() => onNavigate('feedback')}
            className="p-4 rounded-2xl bg-[#111C3B] border border-[#1F305E] hover:border-[#FFC226]/50 hover:bg-[#152248] transition-all text-left group"
          >
            <MessageSquare className="w-6 h-6 text-[#FFC226] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">View Feedback</div>
            <div className="text-xs text-slate-400 mt-0.5">Shuffler ratings</div>
          </button>
        </div>
      </div>
    </div>
  );
};
