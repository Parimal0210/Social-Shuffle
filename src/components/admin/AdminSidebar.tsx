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

export type AdminViewSection =
  | 'dashboard'
  | 'events'
  | 'attendance'
  | 'participants'
  | 'games'
  | 'analytics'
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
    </aside>
  );
};

