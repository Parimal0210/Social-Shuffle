import React, { useEffect } from 'react';
import { Home, Calendar, Users, IdCard } from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
  const { isAuthenticated } = useApp();

  // Redirect 'progress' tab to 'profile' (merged view), and guest away from 'community'
  useEffect(() => {
    if (activeTab === 'progress') {
      setActiveTab('profile');
    }
    if (!isAuthenticated && activeTab === 'community') {
      setActiveTab('home');
    }
  }, [isAuthenticated, activeTab, setActiveTab]);

  // Ensure scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeTab]);

  const handleTabClick = (tabId: ParticipantTab) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const allTabs = [
    { id: 'home' as ParticipantTab, label: 'Home', shortLabel: 'Home', icon: Home },
    { id: 'profile' as ParticipantTab, label: 'My Profile', shortLabel: 'My Profile', icon: IdCard },
    { id: 'events' as ParticipantTab, label: 'Events', shortLabel: 'Events', icon: Calendar, badge: upcomingCount },
    { id: 'community' as ParticipantTab, label: 'Community', shortLabel: 'Community', icon: Users }
  ];

  // Guest view: include My Profile tab to showcase features unlocked by joining
  const tabs = isAuthenticated
    ? allTabs
    : allTabs.filter(t => t.id !== 'community');

  return (
    <>
      {/* Desktop & Tablet Tab Bar */}
      <div className="hidden md:flex items-center justify-center py-3.5 px-6 border-b border-[#202B61] bg-[#10173E]/95 sticky top-[53px] z-30 backdrop-blur-md">
        <div className="flex items-center p-1 rounded-xl bg-[#151E4D] border border-[#283677] shadow-sm max-w-xl w-full justify-between">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-participant-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-all font-heading ${
                  isActive
                    ? 'bg-[#FF751F] text-white font-bold shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1A255C]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#4AB4A4]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (iOS / Android style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#10173E]/95 backdrop-blur-lg border-t border-[#202B61] px-3 py-2 pb-safe">
        <div className="flex items-center justify-around">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-tab-participant-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 py-1 px-2 relative transition-colors ${
                  isActive ? 'text-[#FF751F] font-bold' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-[#FF751F]' : ''} transition-transform`} />
                  {tab.badge && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#4AB4A4]" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight font-medium">{tab.shortLabel || tab.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF751F] -mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
