import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';

// Admin Components
import { AdminSidebar, AdminViewSection } from './components/admin/AdminSidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminEvents } from './components/admin/AdminEvents';
import { AdminAttendance } from './components/admin/AdminAttendance';
import { AdminParticipants } from './components/admin/AdminParticipants';
import { AdminGames } from './components/admin/AdminGames';
import { AdminAnalytics } from './components/admin/AdminAnalytics';
import { AdminCommunityFeedback } from './components/admin/AdminCommunityFeedback';
import { AdminSafetyReports } from './components/admin/AdminSafetyReports';
import { AdminVolunteers } from './components/admin/AdminVolunteers';
import { AdminImportExport } from './components/admin/AdminImportExport';
import { AdminAuditLog } from './components/admin/AdminAuditLog';

// Participant Components
import { ParticipantNav, ParticipantTab } from './components/participant/ParticipantNav';
import { ParticipantHome } from './components/participant/ParticipantHome';
import { ParticipantEvents } from './components/participant/ParticipantEvents';
import { ParticipantCommunity } from './components/participant/ParticipantCommunity';
import { ParticipantProfile } from './components/participant/ParticipantProfile';
import { ParticipantFooter } from './components/participant/ParticipantFooter';
import { AuthModal } from './components/auth/AuthModal';

const AppContent: React.FC = () => {
  const { userRole, role, isAdminUser, isAuthenticated, reportsList, volunteersList } = useApp();

  // Admin Navigation State
  const [adminSection, setAdminSection] = useState<AdminViewSection>('dashboard');
  const [targetAttendanceEventId, setTargetAttendanceEventId] = useState<string | undefined>();
  const [targetImportEventId, setTargetImportEventId] = useState<string | undefined>();
  const [triggerCreateEvent, setTriggerCreateEvent] = useState(false);
  const [triggerAddGame, setTriggerAddGame] = useState(false);

  // Participant Navigation State
  const [participantTab, setParticipantTab] = useState<ParticipantTab>('home');
  const [preselectedEventId, setPreselectedEventId] = useState<string | undefined>();

  // Ensure guest view cannot access community tab (profile tab displays guest showcase)
  useEffect(() => {
    if (!isAuthenticated && participantTab === 'community') {
      setParticipantTab('home');
    }
  }, [isAuthenticated, participantTab]);

  const pendingReportsCount = reportsList.filter(r => r.status === 'New').length;
  const newVolunteersCount = volunteersList.filter(v => v.status === 'New' || v.status === 'Under Review').length;

  // STRICT ACCESS RULE:
  // - If user is not logged in: default view is Guest View
  // - If user is logged in as participant: default view is Participant View
  // - If user is logged in as admin: default view is Admin View
  const showAdminView = isAuthenticated && isAdminUser;

  const handleOpenAttendanceForEvent = (eventId: string) => {
    setTargetAttendanceEventId(eventId);
    setAdminSection('attendance');
  };

  const handleOpenImportForEvent = (eventId: string) => {
    setTargetImportEventId(eventId);
    setAdminSection('import_export');
  };

  const handleSelectEventForRegistration = (eventId: string) => {
    setPreselectedEventId(eventId);
    setParticipantTab('events');
  };

  return (
    <div className="min-h-screen bg-[#0A1128] text-slate-100 flex flex-col font-sans selection:bg-[#FF6036] selection:text-white">
      {/* Top Global Header with Role Switcher, Offline status, Persona selector */}
      <Header />

      {/* Main App Body */}
      {showAdminView ? (
        <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto">
          {/* Admin Sidebar Navigation (Responsive & Desktop optimized) */}
          <AdminSidebar
            currentSection={adminSection}
            onSelectSection={sec => setAdminSection(sec)}
            pendingReportsCount={pendingReportsCount}
            newVolunteersCount={newVolunteersCount}
          />

          {/* Admin Screen Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {adminSection === 'dashboard' && (
              <AdminDashboard
                onNavigate={sec => setAdminSection(sec)}
                onOpenCreateEvent={() => {
                  setAdminSection('events');
                  setTriggerCreateEvent(true);
                }}
                onOpenAddGame={() => {
                  setAdminSection('games');
                  setTriggerAddGame(true);
                }}
              />
            )}

            {adminSection === 'events' && (
              <AdminEvents
                onOpenAttendanceForEvent={handleOpenAttendanceForEvent}
                onOpenImportForEvent={handleOpenImportForEvent}
                showCreateModalInitially={triggerCreateEvent}
                onCloseCreateModalInitially={() => setTriggerCreateEvent(false)}
              />
            )}

            {adminSection === 'attendance' && (
              <AdminAttendance initialEventId={targetAttendanceEventId} />
            )}

            {adminSection === 'participants' && <AdminParticipants />}

            {adminSection === 'games' && (
              <AdminGames
                showAddModalInitially={triggerAddGame}
                onCloseAddModalInitially={() => setTriggerAddGame(false)}
              />
            )}

            {adminSection === 'analytics' && <AdminAnalytics />}

            {adminSection === 'feedback' && <AdminCommunityFeedback />}

            {adminSection === 'reports' && <AdminSafetyReports />}

            {adminSection === 'volunteers' && <AdminVolunteers />}

            {adminSection === 'import_export' && (
              <AdminImportExport initialEventId={targetImportEventId} />
            )}

            {adminSection === 'audit' && <AdminAuditLog />}
          </main>
        </div>
      ) : (
        <div className="flex-1 flex flex-col w-full">
          <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto">
            {/* Participant Tab Navigation (Desktop top pills + mobile bottom bar) */}
            <ParticipantNav
              activeTab={participantTab}
              setActiveTab={tab => setParticipantTab(tab)}
            />

            {/* Participant Screens */}
            <main className="flex-1 p-4 sm:p-6 md:p-8">
              {participantTab === 'home' && (
                <ParticipantHome
                  onNavigateTab={tab => setParticipantTab(tab)}
                  onSelectEventForRegistration={handleSelectEventForRegistration}
                />
              )}

              {participantTab === 'events' && (
                <ParticipantEvents preselectedEventId={preselectedEventId} />
              )}

              {participantTab === 'community' && <ParticipantCommunity />}

              {(participantTab === 'profile' || participantTab === 'progress') && (
                <ParticipantProfile />
              )}
            </main>
          </div>

          {/* Common Footer across all participant pages (with bottom clearance for mobile nav) */}
          <div className="pb-16 md:pb-0">
            <ParticipantFooter onNavigateTab={tab => setParticipantTab(tab)} />
          </div>
        </div>
      )}

      {/* Global Participant Login & Registration Modal */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
