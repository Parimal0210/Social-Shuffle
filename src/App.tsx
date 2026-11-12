import React, { useState, useEffect, useRef } from 'react';
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
  const { userRole, role, isAdminUser, isAuthenticated, currentUser, reportsList, volunteersList, recordTabVisit } = useApp();

  // Admin Navigation State
  const [adminSection, setAdminSection] = useState<AdminViewSection>('dashboard');
  const [targetAttendanceEventId, setTargetAttendanceEventId] = useState<string | undefined>();
  const [targetImportEventId, setTargetImportEventId] = useState<string | undefined>();
  const [triggerCreateEvent, setTriggerCreateEvent] = useState(false);
  const [triggerAddGame, setTriggerAddGame] = useState(false);

  // Participant Navigation State
  const [participantTab, setParticipantTab] = useState<ParticipantTab>('home');
  const [preselectedEventId, setPreselectedEventId] = useState<string | undefined>();

  // After login: Home tab is the default landing page
  useEffect(() => {
    if (isAuthenticated) {
      setParticipantTab('home');
      setAdminSection('dashboard');
    }
  }, [isAuthenticated, currentUser?.id]);

  // Ensure guest view cannot access community tab (profile tab displays guest showcase)
  useEffect(() => {
    if (!isAuthenticated && participantTab === 'community') {
      setParticipantTab('home');
    }
  }, [isAuthenticated, participantTab]);

  // STRICT ACCESS RULE:
  // - If individual's role is admin in the database admins table: show Admin View
  // - Otherwise (participant): show Participant View
  const showAdminView = isAuthenticated && isAdminUser;

  // Real-Time Tab Navigation Telemetry
  useEffect(() => {
    if (showAdminView) {
      const adminTabNames: Record<AdminViewSection, string> = {
        dashboard: 'Meetup Operations',
        events: 'Meetup Operations',
        attendance: 'Live Attendance Scanner',
        participants: 'Participants CRM',
        games: 'Games Vault',
        analytics: 'Growth Analytics & Forecast',
        communications: 'Mail Communications Hub',
        feedback: 'Feedback Wall',
        reports: 'Safety & Grievance Desk',
        volunteers: 'Volunteer Desk',
        import_export: 'Database Import/Export',
        audit: 'Tamper-Proof Audit Trail'
      };
      recordTabVisit(adminTabNames[adminSection] || 'Meetup Operations');
    } else {
      const participantTabNames: Record<ParticipantTab, string> = {
        home: 'Community Home',
        events: 'Events RSVP Hub',
        progress: 'Player Profile',
        community: 'Pune WhatsApp Community',
        profile: 'Player Profile'
      };
      recordTabVisit(participantTabNames[participantTab] || 'Community Home');
    }
  }, [participantTab, adminSection, showAdminView]);

  // Scroll to top on actual tab/view changes without locking document scroll
  const prevTabRef = useRef(participantTab);
  const prevSectionRef = useRef(adminSection);

  useEffect(() => {
    if (prevTabRef.current !== participantTab || prevSectionRef.current !== adminSection) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      prevTabRef.current = participantTab;
      prevSectionRef.current = adminSection;
    }
  }, [participantTab, adminSection]);

  const pendingReportsCount = reportsList.filter(r => r.status === 'New').length;
  const newVolunteersCount = volunteersList.filter(v => v.status === 'New' || v.status === 'Under Review').length;

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
    <div className="min-h-screen bg-[#10173E] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#FF751F] selection:text-white">
      {/* Top Global Header with Role Switcher, Offline status, Persona selector */}
      <Header />

      {/* Main App Body */}
      {showAdminView ? (
        <div className="flex-1 flex flex-col w-full">
          <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto">
          {/* Admin Sidebar Navigation (Responsive & Desktop optimized) */}
          <AdminSidebar
            currentSection={adminSection}
            onSelectSection={sec => setAdminSection(sec)}
            pendingReportsCount={pendingReportsCount}
            newVolunteersCount={newVolunteersCount}
          />

          {/* Admin Screen Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
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
