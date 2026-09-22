import React from 'react';
import { Home, Calendar, Trophy, Users, User } from 'lucide-react';

export type ParticipantTab = 'home' | 'events' | 'progress' | 'community' | 'profile';

interface ParticipantNavProps {
  activeTab: ParticipantTab;
  setActiveTab: (tab: ParticipantTab) => void;
  upcomingCount?: number;
}

export const ParticipantNav: React.FC<ParticipantNavProps> = ({
  activeTab,
  setActiveTab,
  upcomingCount = 1
}) => {
  const tabs = [
    { id: 'home' as ParticipantTab, label: 'Home', icon: Home },
    { id: 'events' as ParticipantTab, label: 'Events', icon: Calendar, badge: upcomingCount },
    { id: 'progress' as ParticipantTab, label: 'My Progress', icon: Trophy },
    { id: 'community' as ParticipantTab, label: 'Community', icon: Users },
    { id: 'profile' as ParticipantTab, label: 'Profile', icon: User }
  ];

  return (
    <>
      {/* Desktop & iPad Tab Bar */}
      <div className="hidden md:flex items-center justify-center py-4 px-6 border-b border-[#1F305E] bg-[#0A1128]/80 sticky top-[57px] z-30 backdrop-blur-md">
        <div className="flex items-center p-1.5 rounded-2xl bg-[#090F22] border border-[#1F305E] shadow-xl max-w-xl w-full justify-between">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-participant-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#FF6036] text-white shadow-lg shadow-[#FF6036]/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111C3B]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#35C8A8]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (iOS / Android style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A1128]/95 backdrop-blur-lg border-t border-[#1F305E] px-3 py-2 pb-safe">
        <div className="flex items-center justify-around">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-tab-participant-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 py-1 px-2 relative transition-colors ${
                  isActive ? 'text-[#FF6036] font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-[#FF6036]' : ''} transition-transform`} />
                  {tab.badge && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#35C8A8]" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight">{tab.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6036] -mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
