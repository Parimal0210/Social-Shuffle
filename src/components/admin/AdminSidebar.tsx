import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Users,
  Dices,
  BarChart3,
  MessageSquare,
  ShieldAlert,
  HeartHandshake,
  FileSpreadsheet,
  ScrollText,
  ChevronRight
} from 'lucide-react';
import { SocialShuffleIcon } from '../SocialShuffleLogo';
import { useApp } from '../../context/AppContext';

export type AdminViewSection =
  | 'dashboard'
  | 'events'
  | 'attendance'
  | 'participants'
  | 'games'
  | 'analytics'
  | 'communications'
  | 'feedback'
  | 'reports'
  | 'volunteers'
  | 'import_export'
  | 'audit';

interface AdminSidebarProps {
  currentSection: AdminViewSection;
  onSelectSection: (section: AdminViewSection) => void;
  pendingReportsCount?: number;
  newVolunteersCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentSection,
  onSelectSection,
  pendingReportsCount = 0,
  newVolunteersCount = 0
}) => {
  const { currentUser } = useApp();

  const menuItems = [
    { id: 'dashboard' as AdminViewSection, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events' as AdminViewSection, label: 'Events & Meetups', icon: Calendar },
    { id: 'attendance' as AdminViewSection, label: 'Live Attendance', icon: CheckSquare, badge: '1-Tap Live' },
    { id: 'participants' as AdminViewSection, label: 'Participants CRM', icon: Users },
    { id: 'games' as AdminViewSection, label: 'Game Library', icon: Dices },
    { id: 'analytics' as AdminViewSection, label: 'Community Analytics', icon: BarChart3 },
    { id: 'feedback' as AdminViewSection, label: 'Feedback Submissions', icon: MessageSquare },
    {
      id: 'reports' as AdminViewSection,
      label: 'Safety & Reports',
      icon: ShieldAlert,
      alertCount: pendingReportsCount
    },
    {
      id: 'volunteers' as AdminViewSection,
      label: 'Volunteer Applications',
      icon: HeartHandshake,
      alertCount: newVolunteersCount
    },
    { id: 'import_export' as AdminViewSection, label: 'Excel Import / Export', icon: FileSpreadsheet },
    { id: 'audit' as AdminViewSection, label: 'Admin Audit Log', icon: ScrollText }
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#10173E] border-b lg:border-b-0 lg:border-r border-[#202B61] p-3 lg:p-4 shrink-0">
      <div className="mb-3 px-2 hidden lg:flex items-center gap-2.5">
        <SocialShuffleIcon size={22} />
        <div>
          <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#4AB4A4] block">
            Admin Console
          </span>
          <span className="text-[11px] text-[#94A3B8]">Social Shuffle Pune</span>
        </div>
      </div>

      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;

          return (
            <button
              key={item.id}
              id={`admin-nav-${item.id}`}
              onClick={() => onSelectSection(item.id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-heading font-bold whitespace-nowrap transition-all text-left ${
                isActive
                  ? 'bg-[#FF751F] text-white shadow-sm shadow-[#FF751F]/20'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#1A255C]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 ml-2">
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#4AB4A4]/10 text-[#4AB4A4] border border-[#4AB4A4]/30'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {item.alertCount ? (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.alertCount}
                  </span>
                ) : null}

                <ChevronRight className={`w-3 h-3 hidden lg:block opacity-40 ${isActive ? 'opacity-90' : ''}`} />
              </div>
            </button>
          );
        })}
      </nav>

      {/* Logged-in Administrator Identity Card: Shows ALL Admin Details */}
      <div className="hidden lg:block mt-6 pt-4 border-t border-[#202B61]">
        <div className="p-3 bg-[#151E4D] border border-[#283677] rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4AB4A4] flex items-center gap-1 font-heading">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4AB4A4] animate-pulse"></span>
              Super Admin Account
            </span>
            <span className="text-[9px] font-mono text-[#94A3B8]">
              {currentUser?.id || 'u-admin-parimal'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full border-2 border-[#4AB4A4] object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#4AB4A4]/20 border border-[#4AB4A4]/40 flex items-center justify-center font-bold text-sm text-[#4AB4A4] shrink-0">
                {currentUser?.name?.[0] || 'P'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate font-heading">
                {currentUser?.name || 'Parimal Shete'}
              </span>
              <span className="text-[10px] font-medium text-[#FFD230] block truncate">
                {currentUser?.designation || 'Co-Founder & Community Architect'}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-[#94A3B8] space-y-0.5 pt-1 border-t border-[#202B61]/60">
            <div className="truncate">{currentUser?.email || 'parimalmshete@gmail.com'}</div>
            <div className="truncate font-mono text-slate-300">{currentUser?.phone || '+91 98220 99887'}</div>
            <div className="truncate text-slate-400">{currentUser?.area || 'Koregaon Park, Pune'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

