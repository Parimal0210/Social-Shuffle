import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserRole,
  Participant,
  Game,
  ShuffleEvent,
  Registration,
  EventFeedback,
  SafetyReport,
  VolunteerApplication,
  AuditLog,
  NotificationItem,
  AttendanceStatus,
  PaymentStatus,
  GuestInfo,
  VolunteerStatus,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  GoogleUserProfile
} from '../types';
import {
  INITIAL_GAMES,
  INITIAL_EVENTS,
  INITIAL_PARTICIPANTS,
  INITIAL_REGISTRATIONS,
  INITIAL_FEEDBACK,
  INITIAL_REPORTS,
  INITIAL_VOLUNTEERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS
} from '../data/initialData';
import {
  api,
  getStoredApiUrl,
  setStoredApiUrl,
  DEFAULT_API_URL
} from '../services/api';

interface OfflineSyncItem {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  data: any;
}

interface AppContextType {
  // Roles & active user
  role: UserRole;
  userRole: UserRole;
  setRole: (role: UserRole) => void;
  setUserRole: (role: UserRole) => void;
  currentParticipantId: string;
  setCurrentParticipantId: (id: string) => void;
  currentParticipant: Participant;
  adminName: string;

  // Authentication & Session
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isAdminUser: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>;
  registerParticipant: (data: RegisterCredentials) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (profile?: GoogleUserProfile) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  lastActiveTimestamp: number;
  sessionRemainingDays: number;
  simulateInactivityTimeout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;

  // Spring Boot & MySQL Integration
  backendStatus: 'connected' | 'offline' | 'checking';
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  checkBackendConnection: () => Promise<boolean>;
  syncWithBackend: () => Promise<{ success: boolean; message: string }>;

  // Data
  events: ShuffleEvent[];
  games: Game[];
  participants: Participant[];
  registrations: Registration[];
  feedbackList: EventFeedback[];
  reportsList: SafetyReport[];
  volunteersList: VolunteerApplication[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];

  // Offline Attendance
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
  offlineSyncQueue: OfflineSyncItem[];
  syncOfflineQueue: () => void;
  syncOfflineData: () => void;

  // Participant Registration workflow
  registerForEvent: (eventId: string, paxCount: number, guests: GuestInfo[], notes?: string) => { success: boolean; message: string; registration?: Registration };
  cancelRegistration: (registrationId: string) => void;
  verifyAttendeeQrCode: (code: string, eventId?: string) => { success: boolean; message: string; alreadyCheckedIn?: boolean; registration?: Registration };
  generateEmailPreviewHtml: (registrationId: string) => string;

  // Attendance management (Admin)
  updateAttendanceStatus: (registrationId: string, status: AttendanceStatus) => void;
  markAttendance: (registrationId: string, status: AttendanceStatus) => void;
  addWalkInRegistration: (eventId: string, data: { name: string; phone: string; email: string; area: string; paxCount: number; paymentStatus: PaymentStatus; notes?: string }) => void;
  toggleGamePlayedForAttendee: (registrationId: string, gameId: string) => void;
  updateRegistrationNotes: (registrationId: string, notes: string) => void;
  updatePaymentStatus: (registrationId: string, paymentStatus: PaymentStatus) => void;
  addGuestToRegistration: (registrationId: string, guest: GuestInfo) => void;

  // Event Management (Admin)
  createEvent: (eventData: Omit<ShuffleEvent, 'id'> & { id?: string; number?: number }) => ShuffleEvent;
  editEvent: (id: string, updates: Partial<ShuffleEvent>) => void;
  updateEvent: (id: string, updates: Partial<ShuffleEvent>) => void;
  archiveEvent: (id: string) => void;
  duplicateEvent: (id: string) => ShuffleEvent;

  // Game Management (Admin)
  addGame: (gameData: Omit<Game, 'id' | 'playsCount'>) => void;
  editGame: (id: string, updates: Partial<Game>) => void;
  updateGame: (id: string, updates: Partial<Game>) => void;
  toggleGameActive: (id: string) => void;

  // Participant CRM (Admin)
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  addParticipant: (participant: Omit<Participant, 'id' | 'joinedDate' | 'totalEventsAttended' | 'totalRegistrations' | 'gamesPlayedIds' | 'venuesVisited' | 'totalPaxBrought'>) => Participant;
  detectDuplicate: (email: string, phone: string, name?: string) => Participant | null;
  mergeParticipants: (sourceId: string, targetId: string) => void;

  // Community forms
  submitFeedback: (feedback: Omit<EventFeedback, 'id' | 'createdAt'>) => void;
  submitSafetyReport: (report: Omit<SafetyReport, 'id' | 'createdAt' | 'status'>) => void;
  submitVolunteerApplication: (app: Omit<VolunteerApplication, 'id' | 'status' | 'submittedAt'>) => void;
  updateVolunteerStatus: (id: string, status: VolunteerStatus) => void;
  updateReportStatus: (id: string, status: 'New' | 'Investigating' | 'Resolved', notes?: string) => void;

  // CSV Import / Export
  importRegistrations: (eventId: string, rows: Array<{ name: string; email: string; phone: string; area?: string; paxCount?: number; notes?: string }>) => { imported: number; duplicatesFound: number };
  bulkImportRegistrations: (eventId: string, csvText: string) => { importedCount: number; errors: string[] };
  exportCSV: (dataType: 'attendance' | 'participants' | 'games' | 'feedback', eventId?: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Reset database
  resetDatabase: () => void;
}

const STORAGE_KEY = 'social_shuffle_v1_store';
// Inactivity timeout: 1 month (30 days in milliseconds)
const INACTIVITY_TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000;

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication & Session State with 30-day inactivity check
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_auth_user`);
    const isLoggedOut = localStorage.getItem(`${STORAGE_KEY}_logged_out`) === 'true';
    const lastActiveStr = localStorage.getItem(`${STORAGE_KEY}_last_active_at`);
    const now = Date.now();

    if (isLoggedOut) {
      return null;
    }

    if (saved) {
      try {
        const user: AuthUser = JSON.parse(saved);
        if (lastActiveStr) {
          const lastActive = parseInt(lastActiveStr, 10);
          if (!isNaN(lastActive) && (now - lastActive > INACTIVITY_TIMEOUT_MS)) {
            // User inactive for over a month -> log out automatically
            localStorage.removeItem(`${STORAGE_KEY}_auth_user`);
            localStorage.removeItem(`${STORAGE_KEY}_last_active_at`);
            return null;
          }
        }
        // Active within the month: user remains logged in!
        localStorage.setItem(`${STORAGE_KEY}_last_active_at`, String(now));
        return user;
      } catch (e) {
        return null;
      }
    }

    // Default active demo participant for first-time presentation
    const initialUser: AuthUser = {
      id: 'u-rohan',
      name: 'Rohan Kulkarni',
      email: 'rohan.kulkarni@example.com',
      phone: '+91 98220 12345',
      role: 'participant',
      area: 'Koregaon Park',
      participantId: 'p-rahul',
      bio: 'Board game lover, strategy nerd, Catan enthusiast.',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      authProvider: 'local',
      loginAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };
    localStorage.setItem(`${STORAGE_KEY}_last_active_at`, String(now));
    return initialUser;
  });

  const [lastActiveTimestamp, setLastActiveTimestamp] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_last_active_at`);
    return saved ? parseInt(saved, 10) : Date.now();
  });

  // Calculate remaining days before inactivity expiration
  const sessionRemainingDays = Math.max(
    0,
    Math.ceil((INACTIVITY_TIMEOUT_MS - (Date.now() - lastActiveTimestamp)) / (1000 * 60 * 60 * 24))
  );

  const [role, setRoleState] = useState<UserRole>(() => {
    return currentUser?.role || 'participant';
  });

  const [currentParticipantId, setCurrentParticipantId] = useState<string>(() => {
    return currentUser?.participantId || 'p-rahul';
  });

  const adminName = 'Aman Joshi (Host)';

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const isAuthenticated = Boolean(currentUser);
  const isAdminUser = currentUser?.role === 'admin';

  // STRICT ACCESS CONTROL:
  // When currentUser changes, enforce role and sync participant profile
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY}_auth_user`, JSON.stringify(currentUser));
      if (currentUser.role === 'participant') {
        setRoleState('participant'); // strictly participant!
      } else if (currentUser.role === 'admin') {
        setRoleState('admin');
      }
      if (currentUser.participantId) {
        setCurrentParticipantId(currentUser.participantId);
      }
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_auth_user`);
      setRoleState('participant');
    }
  }, [currentUser]);

  // AUTOMATIC 30-DAY INACTIVITY RENEWAL & EXPIRATION CHECK:
  // As long as the user is active, their 30-day session continuously extends.
  // If no activity occurs for 30 consecutive days, they are logged out.
  useEffect(() => {
    if (!currentUser) return;

    let lastThrottle = Date.now();

    const recordUserActivity = () => {
      const now = Date.now();
      // Throttle localStorage writes to at most once per 30 seconds
      if (now - lastThrottle > 30000) {
        lastThrottle = now;
        setLastActiveTimestamp(now);
        localStorage.setItem(`${STORAGE_KEY}_last_active_at`, String(now));
      }
    };

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(evt => window.addEventListener(evt, recordUserActivity, { passive: true }));

    // Periodic check every 60 seconds
    const intervalId = setInterval(() => {
      const now = Date.now();
      const lastActiveStr = localStorage.getItem(`${STORAGE_KEY}_last_active_at`);
      const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : lastThrottle;
      if (now - lastActive > INACTIVITY_TIMEOUT_MS) {
        // Exceeded 30 days of inactivity!
        setCurrentUser(null);
        localStorage.removeItem(`${STORAGE_KEY}_auth_user`);
        localStorage.removeItem(`${STORAGE_KEY}_last_active_at`);
        localStorage.setItem(`${STORAGE_KEY}_logged_out`, 'true');
        setRoleState('participant');
        setNotifications(prev => [
          {
            id: `notif-expired-${now}`,
            title: 'Session Expired ⏱️',
            message: 'You were automatically logged out after 30 days of inactivity. Please sign in again.',
            type: 'system',
            timestamp: 'Just now',
            read: false
          },
          ...prev
        ]);
      }
    }, 60000);

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, recordUserActivity));
      clearInterval(intervalId);
    };
  }, [currentUser]);

  // STRICT ROLE ENFORCEMENT:
  // If the user is registered as a participant, they CANNOT switch to admin sections!
  const setRole = (newRole: UserRole) => {
    if (currentUser?.role === 'participant' && newRole === 'admin') {
      // DENIED: Registered participants must only see participant sections!
      return;
    }
    setRoleState(newRole);
  };

  // Core Data loaded from localStorage or defaults
  const [events, setEvents] = useState<ShuffleEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_events`);
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_games`);
    return saved ? JSON.parse(saved) : INITIAL_GAMES;
  });

  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_participants`);
    return saved ? JSON.parse(saved) : INITIAL_PARTICIPANTS;
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_registrations`);
    return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
  });

  const [feedbackList, setFeedbackList] = useState<EventFeedback[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_feedback`);
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACK;
  });

  const [reportsList, setReportsList] = useState<SafetyReport[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_reports`);
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [volunteersList, setVolunteersList] = useState<VolunteerApplication[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_volunteers`);
    return saved ? JSON.parse(saved) : INITIAL_VOLUNTEERS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Offline Mode state
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [offlineSyncQueue, setOfflineSyncQueue] = useState<OfflineSyncItem[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_events`, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_games`, JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_participants`, JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_registrations`, JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_feedback`, JSON.stringify(feedbackList));
  }, [feedbackList]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_reports`, JSON.stringify(reportsList));
  }, [reportsList]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_volunteers`, JSON.stringify(volunteersList));
  }, [volunteersList]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  // Current participant object
  const currentParticipant = participants.find(p => p.id === currentParticipantId) || participants[0];

  // Spring Boot + MySQL Connectivity
  const [backendStatus, setBackendStatus] = useState<'connected' | 'offline' | 'checking'>('checking');
  const [backendUrl, setBackendUrlState] = useState<string>(() => getStoredApiUrl());

  const checkBackendConnection = async (): Promise<boolean> => {
    setBackendStatus('checking');
    try {
      const health = await api.checkHealth();
      if (health && health.status === 'UP') {
        setBackendStatus('connected');
        return true;
      } else {
        setBackendStatus('offline');
        return false;
      }
    } catch {
      setBackendStatus('offline');
      return false;
    }
  };

  const setBackendUrl = (url: string) => {
    setStoredApiUrl(url);
    setBackendUrlState(url);
    checkBackendConnection();
  };

  // On mount: check health and pull live data from MySQL if available
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const health = await api.checkHealth();
        if (active) {
          if (health && health.status === 'UP') {
            setBackendStatus('connected');
            const [beEvents, beGames, beParticipants, beRegistrations] = await Promise.all([
              api.getEvents(),
              api.getGames(),
              api.getParticipants(),
              api.getRegistrations()
            ]);
            if (active) {
              if (beEvents && beEvents.length > 0) setEvents(beEvents);
              if (beGames && beGames.length > 0) setGames(beGames);
              if (beParticipants && beParticipants.length > 0) setParticipants(beParticipants);
              if (beRegistrations && beRegistrations.length > 0) setRegistrations(beRegistrations);
            }
          } else {
            setBackendStatus('offline');
          }
        }
      } catch {
        if (active) setBackendStatus('offline');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const syncWithBackend = async (): Promise<{ success: boolean; message: string }> => {
    setBackendStatus('checking');
    try {
      const health = await api.checkHealth();
      if (!health || health.status !== 'UP') {
        setBackendStatus('offline');
        return { success: false, message: 'Spring Boot REST API is not reachable at ' + backendUrl };
      }
      setBackendStatus('connected');
      for (const ev of events) {
        await api.createEvent(ev).catch(() => {});
      }
      for (const gm of games) {
        await api.createGame(gm).catch(() => {});
      }
      for (const pt of participants) {
        await api.createParticipant(pt).catch(() => {});
      }
      for (const rg of registrations) {
        await api.createRegistration(rg).catch(() => {});
      }
      return { success: true, message: 'Successfully synced local data to MySQL via Spring Boot!' };
    } catch (e: any) {
      setBackendStatus('offline');
      return { success: false, message: e?.message || 'Sync failed' };
    }
  };

  // --- Participant & Admin Authentication ---
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message: string }> => {
    try {
      // Connect to Spring Boot REST API
      const backendRes = await api.login(credentials);
      if (backendRes && backendRes.user) {
        const now = Date.now();
        localStorage.removeItem(`${STORAGE_KEY}_logged_out`);
        localStorage.setItem(`${STORAGE_KEY}_last_active_at`, String(now));
        setLastActiveTimestamp(now);
        setCurrentUser(backendRes.user);
        if (backendRes.participant) {
          setCurrentParticipantId(backendRes.participant.id);
          setParticipants(prev => {
            if (!prev.find(p => p.id === backendRes.participant!.id)) {
              return [backendRes.participant!, ...prev];
            }
            return prev;
          });
        }
        setShowAuthModal(false);
        return { success: true, message: `Welcome back, ${backendRes.user.name}!` };
      }
    } catch {
      // Fallback to local authentication
    }

    const ident = credentials.emailOrPhone.trim().toLowerCase();

    // Check if admin credentials
    if (ident === 'admin@socialshuffle.com' || ident === '+91 98220 11223' || ident === 'admin') {
      const now = Date.now();
      localStorage.removeItem(`${STORAGE_KEY}_logged_out`);
      localStorage.setItem(`${STORAGE_KEY}_last_active_at`, String(now));
      setLastActiveTimestamp(now);
      const adminUser: AuthUser = {
        id: 'u-admin',
        name: 'Aman Joshi',
        email: 'admin@socialshuffle.com',
        phone: '+91 98220 11223',
        role: 'admin',
        area: 'Pune',
        bio: 'Social Shuffle Founder & Super Admin',
        authProvider: 'local',
        loginAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      };
      setCurrentUser(adminUser);
      setRoleState('admin');
      setShowAuthModal(false);
      return { success: true, message: 'Welcome back, Admin Aman Joshi!' };
    }

    // Match participant by email or phone
    const cleanPhone = ident.replace(/[^0-9]/g, '');
    const matched = participants.find(p => {
      const pEmail = p.email.trim().toLowerCase();
      const pPhone = p.phone.replace(/[^0-9]/g, '');
      return (pEmail && pEmail === ident) || (cleanPhone && pPhone && pPhone === cleanPhone);
    });

    if (matched) {
      const now = Date.now();
      localStorage.removeItem(`${STORAGE_KEY}_logged_out`);
      localStorage.setItem(`${STORAGE_KEY}_last_active_at`, String(now));
      setLastActiveTimestamp(now);
      const authUser: AuthUser = {
        id: `u-${matched.id}`,
        name: matched.name,
        email: matched.email,
        phone: matched.phone,
        role: 'participant', // STRICT PARTICIPANT ROLE
        area: matched.area,
        participantId: matched.id,
        avatar: matched.avatar,
        bio: matched.bio,
        authProvider: 'local',
        loginAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      };
      setCurrentUser(authUser);
      setRoleState('participant');
      setCurrentParticipantId(matched.id);
      setShowAuthModal(false);
      return { success: true, message: `Welcome back, ${matched.name}!` };
    }

    return { success: false, message: 'No registered participant found with this email or phone. Please sign up.' };
  };

  const registerParticipant = async (data: RegisterCredentials): Promise<{ success: boolean; message: string }> => {
    if (!data.name.trim() || !data.email.trim() || !data.phone.trim()) {
      return { success: false, message: 'Please provide your full name, email, and phone number.' };
    }

    const emailClean = data.email.trim().toLowerCase();
    const phoneClean = data.phone.trim();

    if (participants.some(p => p.email.toLowerCase() === emailClean || p.phone.replace(/[^0-9]/g, '') === phoneClean.replace(/[^0-9]/g, ''))) {
      return { success: false, message: 'An account with this email or phone already exists. Please log in.' };
    }

    const newParticipantId = `p-${Date.now().toString(36)}`;
    const newUserId = `u-${Date.now().toString(36)}`;

    const newParticipant: Participant = {
      id: newParticipantId,
      name: data.name.trim(),
      email: emailClean,
      phone: phoneClean,
      area: data.area || 'Koregaon Park',
      avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`,
      bio: data.bio || 'Board game lover eager to play!',
      joinedDate: new Date().toISOString().slice(0, 10),
      totalEventsAttended: 0,
      totalRegistrations: 0,
      gamesPlayedIds: [],
      venuesVisited: [],
      totalPaxBrought: 0
    };

    const newAuthUser: AuthUser = {
      id: newUserId,
      name: data.name.trim(),
      email: emailClean,
      phone: phoneClean,
      role: 'participant', // STRICT PARTICIPANT ROLE
      area: data.area || 'Koregaon Park',
      participantId: newParticipantId,
      avatar: newParticipant.avatar,
      bio: newParticipant.bio,
      authProvider: 'local',
      loginAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };

    // Save to local participants collection
    setParticipants(prev => [newParticipant, ...prev]);

    // Send to Spring Boot REST API
    api.register(data).catch(() => {});
    api.createParticipant(newParticipant).catch(() => {});

    // Active session initiation
    const now = Date.now();
    localStorage.removeItem(`${STORAGE_KEY}_logged_out`);
    localStorage.setItem(`${STORAGE_KEY}_last_active_at`, String(now));
    setLastActiveTimestamp(now);

    // Set current active user to this new participant
    setCurrentUser(newAuthUser);
    setRoleState('participant'); // strictly participant view!
    setCurrentParticipantId(newParticipantId);
    setShowAuthModal(false);

    // Welcome notification
    const welcomeNotif: NotificationItem = {
      id: `notif-welcome-${Date.now()}`,
      title: `Welcome to Social Shuffle, ${data.name}! 🎲`,
      message: 'Your Shuffler profile is ready. Session stays active for 30 days of inactivity.',
      type: 'system',
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [welcomeNotif, ...prev]);

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}

    return { success: true, message: `Welcome to Social Shuffle Pune, ${data.name}!` };
  };

  // Google Account Sign-In / Registration
  const loginWithGoogle = async (googleProfile?: GoogleUserProfile): Promise<{ success: boolean; message: string }> => {
    const profile = googleProfile || {
      email: 'parimalmshete@gmail.com',
      name: 'Parimal Shete',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      area: 'Koregaon Park',
      phone: '+91 98220 99887'
    };

    const emailClean = profile.email.trim().toLowerCase();

    // Check if participant already exists by email
    let matchedParticipant = participants.find(p => p.email.trim().toLowerCase() === emailClean);

    if (!matchedParticipant) {
      // Automatically register new participant profile from Google Account
      const newParticipantId = `p-${Date.now().toString(36)}`;
      matchedParticipant = {
        id: newParticipantId,
        name: profile.name,
        email: emailClean,
        phone: profile.phone || '+91 98220 ' + Math.floor(10000 + Math.random() * 90000),
        area: profile.area || 'Koregaon Park',
        avatar: profile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(profile.name)}`,
        bio: 'Pune board gamer • Connected via Google Account',
        joinedDate: new Date().toISOString().slice(0, 10),
        totalEventsAttended: 0,
        totalRegistrations: 0,
        gamesPlayedIds: [],
        venuesVisited: [],
        totalPaxBrought: 0
      };
      setParticipants(prev => [matchedParticipant!, ...prev]);
      api.createParticipant(matchedParticipant).catch(() => {});
    }

    const authUser: AuthUser = {
      id: `u-${matchedParticipant.id}`,
      name: matchedParticipant.name,
      email: matchedParticipant.email,
      phone: matchedParticipant.phone,
      role: 'participant', // STRICT PARTICIPANT ROLE
      area: matchedParticipant.area,
      participantId: matchedParticipant.id,
      avatar: profile.avatar || matchedParticipant.avatar,
      bio: matchedParticipant.bio,
      authProvider: 'google',
      loginAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };

    const now = Date.now();
    localStorage.removeItem(`${STORAGE_KEY}_logged_out`);
    localStorage.setItem(`${STORAGE_KEY}_last_active_at`, String(now));
    setLastActiveTimestamp(now);

    setCurrentUser(authUser);
    setRoleState('participant');
    setCurrentParticipantId(matchedParticipant.id);
    setShowAuthModal(false);

    // Sync to Spring Boot REST backend
    api.googleLogin({
      email: authUser.email,
      name: authUser.name,
      avatar: authUser.avatar,
      phone: authUser.phone,
      area: authUser.area,
      googleId: profile.googleId || 'g_' + Math.random().toString(36).substring(2)
    }).catch(() => {});

    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch {}

    setNotifications(prev => [
      {
        id: `notif-google-login-${Date.now()}`,
        title: `Signed in with Google: ${authUser.name} ✨`,
        message: 'Welcome to Social Shuffle Pune! Your session will remain active for 30 days of inactivity.',
        type: 'system',
        timestamp: 'Just now',
        read: false
      },
      ...prev
    ]);

    return {
      success: true,
      message: `Signed in successfully with Google as ${authUser.name}!`
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(`${STORAGE_KEY}_auth_user`);
    localStorage.removeItem(`${STORAGE_KEY}_last_active_at`);
    localStorage.setItem(`${STORAGE_KEY}_logged_out`, 'true');
    setRoleState('participant');
  };

  // Helper for testing/demoing the 30-day inactivity timeout
  const simulateInactivityTimeout = () => {
    const expiredTime = Date.now() - (INACTIVITY_TIMEOUT_MS + 1000);
    localStorage.setItem(`${STORAGE_KEY}_last_active_at`, String(expiredTime));
    setLastActiveTimestamp(expiredTime);
    logout();
    setNotifications(prev => [
      {
        id: `notif-sim-expired-${Date.now()}`,
        title: '30-Day Inactivity Timeout Triggered ⏱️',
        message: 'Simulation: Over 30 days of inactivity passed. You were automatically logged out as per session policy.',
        type: 'system',
        timestamp: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  // Helper to add audit log
  const logAudit = (action: string, target: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      adminName,
      action,
      target,
      details,
      timestamp: new Date().toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Toggle offline attendance mode
  const toggleOfflineMode = () => {
    setIsOfflineMode(prev => !prev);
  };

  const syncOfflineQueue = () => {
    if (offlineSyncQueue.length === 0) return;
    logAudit('Offline Sync Completed', 'Attendance Records', `Synchronized ${offlineSyncQueue.length} offline attendance items.`);
    setOfflineSyncQueue([]);
  };

  // Duplicate detection
  const detectDuplicate = (email: string, phone: string, name?: string): Participant | null => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanName = name ? name.trim().toLowerCase() : '';

    return (
      participants.find(p => {
        const pEmail = p.email.trim().toLowerCase();
        const pPhone = p.phone.replace(/[^0-9]/g, '');
        const pName = p.name.trim().toLowerCase();

        if (cleanEmail && pEmail === cleanEmail) return true;
        if (cleanPhone && pPhone === cleanPhone && cleanPhone.length >= 8) return true;
        if (cleanName && cleanPhone && pName === cleanName && pPhone === cleanPhone) return true;
        return false;
      }) || null
    );
  };

  // Register for Event (Participant view workflow -> Critical: directly adds to event attendance list)
  const registerForEvent = (
    eventId: string,
    paxCount: number,
    guests: GuestInfo[],
    notes?: string
  ): { success: boolean; message: string; registration?: Registration } => {
    const event = events.find(e => e.id === eventId);
    if (!event) return { success: false, message: 'Event not found' };

    // Check if already registered
    const existing = registrations.find(
      r => r.eventId === eventId && r.participantId === currentParticipant.id && r.attendanceStatus !== 'Cancelled'
    );
    if (existing) {
      return { success: false, message: 'You are already registered for this event!', registration: existing };
    }

    const regId = `reg-${event.number}-${Date.now().toString().slice(-4)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const qrToken = `SS-REG-${regId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrToken)}`;

    const newRegistration: Registration = {
      id: regId,
      eventId,
      participantId: currentParticipant.id,
      participantName: currentParticipant.name,
      participantEmail: currentParticipant.email,
      participantPhone: currentParticipant.phone,
      participantArea: currentParticipant.area,
      paxCount: paxCount || 1,
      guests: guests || [],
      paymentStatus: 'Confirmed',
      attendanceStatus: 'Pending',
      gamesPlayed: [],
      notes: notes || '',
      registeredAt: nowStr,
      qrCodeToken: qrToken,
      qrCodeUrl: qrUrl,
      emailSent: true,
      emailSentAt: new Date().toISOString()
    };

    setRegistrations(prev => [newRegistration, ...prev]);

    // Update participant stats
    setParticipants(prev =>
      prev.map(p => {
        if (p.id === currentParticipant.id) {
          return {
            ...p,
            totalRegistrations: p.totalRegistrations + 1,
            totalPaxBrought: p.totalPaxBrought + (guests.length || 0)
          };
        }
        return p;
      })
    );

    // Add confirmation notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Registered for ${event.title}! 🎲`,
      message: `See you at ${event.venue} on ${event.date}! Your registration with ${paxCount} pax is confirmed. Confirmation email & QR pass sent!`,
      type: 'registration',
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore in test environments
    }

    return {
      success: true,
      message: `Successfully registered for ${event.title}! Confirmation email & QR ticket sent.`,
      registration: newRegistration
    };
  };

  // Verify Attendee QR code or Ticket ID (Door Scanner)
  const verifyAttendeeQrCode = (
    code: string,
    eventId?: string
  ): {
    success: boolean;
    message: string;
    alreadyCheckedIn?: boolean;
    registration?: Registration;
  } => {
    if (!code || !code.trim()) {
      return { success: false, message: 'Please provide or scan a valid QR ticket code.' };
    }
    const clean = code.trim();
    const cleanNoPrefix = clean.startsWith('SS-REG-') ? clean.replace('SS-REG-', '') : clean;

    const reg = registrations.find(
      r =>
        r.id === clean ||
        r.id === cleanNoPrefix ||
        r.qrCodeToken === clean ||
        (r.id && clean.toLowerCase().includes(r.id.toLowerCase()))
    );

    if (!reg) {
      return {
        success: false,
        message: `Ticket Not Found: No registration matching token "${clean}".`
      };
    }

    if (eventId && reg.eventId !== eventId) {
      const wrongEvent = events.find(e => e.id === reg.eventId);
      return {
        success: false,
        message: `Ticket Mismatch: This pass is for "${wrongEvent ? wrongEvent.title : reg.eventId}", not the current event!`,
        registration: reg
      };
    }

    if (reg.attendanceStatus === 'Checked In') {
      return {
        success: true,
        alreadyCheckedIn: true,
        message: `Already Checked-In earlier at ${reg.checkInTime || 'entrance'} (${reg.participantName})`,
        registration: reg
      };
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedReg: Registration = {
      ...reg,
      attendanceStatus: 'Checked In',
      checkInTime: nowTime
    };

    setRegistrations(prev => prev.map(r => (r.id === reg.id ? updatedReg : r)));

    // Update participant stats
    setParticipants(prev =>
      prev.map(p => {
        if (p.id === reg.participantId) {
          return {
            ...p,
            totalEventsAttended: p.totalEventsAttended + 1,
            lastAttendedEventId: reg.eventId
          };
        }
        return p;
      })
    );

    logAudit(
      'QR Check-In Verified',
      reg.participantName,
      `Scanned and checked in attendee ${reg.participantName} (${reg.paxCount} PAX) via QR code.`
    );

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 }
      });
    } catch {}

    return {
      success: true,
      alreadyCheckedIn: false,
      message: `Verified! Welcome ${reg.participantName} (${reg.paxCount} PAX)`,
      registration: updatedReg
    };
  };

  // Generate Email Preview HTML
  const generateEmailPreviewHtml = (registrationId: string): string => {
    const reg = registrations.find(r => r.id === registrationId);
    if (!reg) return '';
    const event = events.find(e => e.id === reg.eventId);
    const eventTitle = event?.title || 'Social Shuffle Pune Meetup';
    const eventVenue = event?.venue || 'Pune Meetup Hub';
    const eventAddress = event?.address || 'Pune, Maharashtra';
    const eventTime = event?.time || 'Check app schedule';
    const qrToken = reg.qrCodeToken || `SS-REG-${reg.id}`;
    const qrUrl = reg.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(qrToken)}`;

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f111a; color: #f1f5f9; padding: 24px; border-radius: 16px; max-width: 580px; margin: 0 auto; border: 1px solid #334155;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <span style="background-color: #fbbf24; color: #1e1b4b; font-weight: 800; font-size: 11px; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase;">🎲 VIP Pass Confirmed</span>
          <h2 style="margin: 10px 0 0 0; color: #ffffff; font-size: 22px; font-weight: 900;">Holy Meeples, ${reg.participantName}! You're In! 🎉</h2>
        </div>
        <div style="background-color: rgba(124, 58, 237, 0.12); border-left: 4px solid #a855f7; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.6; color: #cbd5e1;">
          <strong>Prepare your victory dance! 💃🕺</strong><br/>
          We are downright stoked that you're joining the <strong>Social Shuffle Pune</strong> tribe.
          Whether you're looking to trade sheep for wheat in Catan, bluff your closest friends into oblivion during Avalon, or roll high-stakes dice, your table is officially secured.
          <br/><br/>
          <em>⚠️ Mild Warning: Side effects may include uncontrolled giggles, sudden cravings for 20 new board games, and making life-long friends in Pune!</em>
        </div>
        <div style="background-color: #1e2235; border: 1px solid #333a52; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #94a3b8;">Meetup:</span><strong style="color: #ffffff;">${eventTitle}</strong></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #94a3b8;">When:</span><strong style="color: #ffffff;">${eventTime}</strong></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #94a3b8;">Where:</span><strong style="color: #ffffff;">${eventVenue} (${eventAddress})</strong></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #94a3b8;">Seats (PAX):</span><strong style="color: #ffffff;">${reg.paxCount} Shuffler(s)</strong></div>
          <div style="display: flex; justify-content: space-between;"><span style="color: #94a3b8;">Ticket Token:</span><span style="font-family: monospace; color: #38bdf8;">${qrToken}</span></div>
        </div>
        <div style="text-align: center; background-color: #0b0d14; border: 2px dashed #6366f1; border-radius: 14px; padding: 20px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 6px 0; color: #ffffff; font-size: 14px;">📱 Scan at the Door for Instant Entry</h4>
          <p style="margin: 0 0 14px 0; font-size: 11px; color: #94a3b8;">Flash this QR code on your phone when arriving at the venue.</p>
          <img src="${qrUrl}" alt="QR Ticket" style="width: 190px; height: 190px; border-radius: 8px; border: 4px solid #ffffff; background: #ffffff; padding: 4px; display: inline-block;" />
          <div style="margin-top: 10px; font-family: monospace; font-size: 13px; font-weight: 700; color: #a855f7;">${qrToken}</div>
        </div>
        <div style="text-align: center; font-size: 11px; color: #64748b; line-height: 1.4;">
          Social Shuffle Pune • Koregaon Park • Baner • Viman Nagar<br/>
          Made with ❤️, dice rolls, and zero boring evenings.
        </div>
      </div>
    `;
  };

  // Cancel registration
  const cancelRegistration = (registrationId: string) => {
    const reg = registrations.find(r => r.id === registrationId);
    if (!reg) return;

    setRegistrations(prev =>
      prev.map(r => (r.id === registrationId ? { ...r, attendanceStatus: 'Cancelled' } : r))
    );

    logAudit('Registration Cancelled', reg.participantName, `Cancelled registration ${reg.id} for event ${reg.eventId}`);
  };

  // Attendance Check-in & Status Management (Admin)
  const updateAttendanceStatus = (registrationId: string, status: AttendanceStatus) => {
    const reg = registrations.find(r => r.id === registrationId);
    if (!reg) return;

    const previousStatus = reg.attendanceStatus;
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // Update registration
    setRegistrations(prev =>
      prev.map(r => {
        if (r.id === registrationId) {
          return {
            ...r,
            attendanceStatus: status,
            checkInTime: status === 'Checked In' ? nowTime : r.checkInTime
          };
        }
        return r;
      })
    );

    // Automatically update Participant profile & stats
    const event = events.find(e => e.id === reg.eventId);
    setParticipants(prev =>
      prev.map(p => {
        if (p.id === reg.participantId) {
          let updatedAttended = p.totalEventsAttended;
          let updatedVenues = [...p.venuesVisited];

          if (status === 'Checked In' && previousStatus !== 'Checked In') {
            updatedAttended += 1;
            if (event && !updatedVenues.includes(event.venue)) {
              updatedVenues.push(event.venue);
            }
          } else if (status !== 'Checked In' && previousStatus === 'Checked In') {
            updatedAttended = Math.max(0, updatedAttended - 1);
          }

          return {
            ...p,
            totalEventsAttended: updatedAttended,
            venuesVisited: updatedVenues,
            lastAttendedEventId: status === 'Checked In' && event ? event.id : p.lastAttendedEventId,
            lastAttendedEventTitle: status === 'Checked In' && event ? event.title : p.lastAttendedEventTitle
          };
        }
        return p;
      })
    );

    // Handle offline queue
    if (isOfflineMode) {
      setOfflineSyncQueue(prev => [
        ...prev,
        {
          id: `sync-${Date.now()}`,
          action: 'Attendance Status Update',
          target: reg.participantName,
          timestamp: nowTime,
          data: { registrationId, status }
        }
      ]);
    } else {
      logAudit(
        'Attendance Updated',
        reg.participantName,
        `Marked status as "${status}" for ${event?.title || reg.eventId}`
      );
    }
  };

  // Toggle Game Played for an attendee during an event
  const toggleGamePlayedForAttendee = (registrationId: string, gameId: string) => {
    const reg = registrations.find(r => r.id === registrationId);
    if (!reg) return;

    const game = games.find(g => g.id === gameId);
    const hasPlayed = reg.gamesPlayed.includes(gameId);

    const updatedGamesPlayed = hasPlayed
      ? reg.gamesPlayed.filter(id => id !== gameId)
      : [...reg.gamesPlayed, gameId];

    // Update registration's games played
    setRegistrations(prev =>
      prev.map(r => (r.id === registrationId ? { ...r, gamesPlayed: updatedGamesPlayed } : r))
    );

    // Automatically update Participant CRM gamesPlayedIds!
    setParticipants(prev =>
      prev.map(p => {
        if (p.id === reg.participantId) {
          const currentPlayed = new Set(p.gamesPlayedIds);
          if (!hasPlayed) {
            currentPlayed.add(gameId);
          } else {
            // Check if played in any other registration
            const otherPlays = registrations.some(
              other => other.id !== registrationId && other.participantId === p.id && other.gamesPlayed.includes(gameId)
            );
            if (!otherPlays) {
              currentPlayed.delete(gameId);
            }
          }
          return {
            ...p,
            gamesPlayedIds: Array.from(currentPlayed)
          };
        }
        return p;
      })
    );

    // Increment game total play count
    if (!hasPlayed && game) {
      setGames(prev =>
        prev.map(g => (g.id === gameId ? { ...g, playsCount: g.playsCount + 1 } : g))
      );
    }

    logAudit(
      'Game Play Recorded',
      reg.participantName,
      `${hasPlayed ? 'Removed' : 'Added'} game ${game?.name || gameId}`
    );
  };

  const updateRegistrationNotes = (registrationId: string, notes: string) => {
    setRegistrations(prev =>
      prev.map(r => (r.id === registrationId ? { ...r, notes } : r))
    );
  };

  const updatePaymentStatus = (registrationId: string, paymentStatus: PaymentStatus) => {
    setRegistrations(prev =>
      prev.map(r => (r.id === registrationId ? { ...r, paymentStatus } : r))
    );
    const reg = registrations.find(r => r.id === registrationId);
    if (reg) {
      logAudit('Payment Status Changed', reg.participantName, `Changed to ${paymentStatus}`);
    }
  };

  const addGuestToRegistration = (registrationId: string, guest: GuestInfo) => {
    setRegistrations(prev =>
      prev.map(r => {
        if (r.id === registrationId) {
          const newGuests = [...r.guests, guest];
          return {
            ...r,
            guests: newGuests,
            paxCount: newGuests.length + 1
          };
        }
        return r;
      })
    );

    const reg = registrations.find(r => r.id === registrationId);
    if (reg) {
      setParticipants(prev =>
        prev.map(p => {
          if (p.id === reg.participantId) {
            return {
              ...p,
              totalPaxBrought: p.totalPaxBrought + 1
            };
          }
          return p;
        })
      );
      logAudit('Guest Added', reg.participantName, `Added guest ${guest.name}`);
    }
  };

  const addWalkInRegistration = (
    eventId: string,
    data: {
      name: string;
      phone: string;
      email: string;
      area: string;
      paxCount: number;
      paymentStatus: PaymentStatus;
      notes?: string;
    }
  ) => {
    let participant = detectDuplicate(data.email, data.phone, data.name);
    if (!participant) {
      participant = addParticipant({
        name: data.name,
        email: data.email,
        phone: data.phone,
        area: data.area,
        bio: 'Pune Shuffler'
      });
    }

    const newReg: Registration = {
      id: `reg-walkin-${Date.now()}`,
      eventId,
      participantId: participant.id,
      participantName: data.name,
      participantEmail: data.email,
      participantPhone: data.phone,
      participantArea: data.area,
      paxCount: data.paxCount,
      guests: [],
      paymentStatus: data.paymentStatus,
      attendanceStatus: 'Checked In',
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      gamesPlayed: [],
      notes: data.notes || 'Walk-in registration at venue',
      registeredAt: new Date().toISOString()
    };

    setRegistrations(prev => [newReg, ...prev]);

    setParticipants(prev =>
      prev.map(p => {
        if (p.id === participant.id) {
          return {
            ...p,
            totalEventsAttended: p.totalEventsAttended + 1,
            totalRegistrations: p.totalRegistrations + 1,
            totalPaxBrought: p.totalPaxBrought + (data.paxCount - 1)
          };
        }
        return p;
      })
    );

    logAudit('Walk-in Registered', data.name, `Walk-in (${data.paxCount} pax) for event ${eventId}`);
  };

  // Events CRUD
  const createEvent = (eventData: Omit<ShuffleEvent, 'id'> & { id?: string; number?: number }): ShuffleEvent => {
    const nextNumber = eventData.number ?? (Math.max(...events.map(e => e.number), 0) + 1);
    const newEvent: ShuffleEvent = {
      ...eventData,
      id: eventData.id || `ev-${nextNumber}`,
      number: nextNumber
    };

    setEvents(prev => [newEvent, ...prev]);
    logAudit('Event Created', newEvent.title, `Venue: ${newEvent.venue}, Capacity: ${newEvent.capacity}`);
    return newEvent;
  };

  const editEvent = (id: string, updates: Partial<ShuffleEvent>) => {
    setEvents(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
    const ev = events.find(e => e.id === id);
    if (ev) {
      logAudit('Event Edited', ev.title, `Updated fields`);
    }
  };

  const archiveEvent = (id: string) => {
    setEvents(prev => prev.map(e => (e.id === id ? { ...e, status: 'archived' } : e)));
    const ev = events.find(e => e.id === id);
    if (ev) {
      logAudit('Event Archived', ev.title, `Status set to archived`);
    }
  };

  const duplicateEvent = (id: string): ShuffleEvent => {
    const source = events.find(e => e.id === id);
    if (!source) throw new Error('Source event not found');

    const nextNumber = Math.max(...events.map(e => e.number), 0) + 1;
    const duplicated: ShuffleEvent = {
      ...source,
      id: `ev-${nextNumber}`,
      number: nextNumber,
      title: source.title.replace(/#\d+/, `#${nextNumber}`),
      status: 'upcoming'
    };

    setEvents(prev => [duplicated, ...prev]);
    logAudit('Event Duplicated', duplicated.title, `Cloned from #${source.number}`);
    return duplicated;
  };

  // Games Management
  const addGame = (gameData: Omit<Game, 'id' | 'playsCount'>) => {
    const newGame: Game = {
      ...gameData,
      id: `g-${gameData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`,
      playsCount: 0
    };
    setGames(prev => [newGame, ...prev]);
    logAudit('Game Added', newGame.name, `Category: ${newGame.category}, Difficulty: ${newGame.difficulty}`);
  };

  const editGame = (id: string, updates: Partial<Game>) => {
    setGames(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)));
    const g = games.find(item => item.id === id);
    if (g) {
      logAudit('Game Edited', g.name, `Updated game details`);
    }
  };

  const toggleGameActive = (id: string) => {
    setGames(prev =>
      prev.map(g => (g.id === id ? { ...g, active: !g.active } : g))
    );
  };

  // Participant CRM
  const updateParticipant = (id: string, updates: Partial<Participant>) => {
    setParticipants(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    const p = participants.find(item => item.id === id);
    if (p) {
      logAudit('Participant Profile Updated', p.name, `Updated profile details`);
    }
  };

  const addParticipant = (
    data: Omit<
      Participant,
      'id' | 'joinedDate' | 'totalEventsAttended' | 'totalRegistrations' | 'gamesPlayedIds' | 'venuesVisited' | 'totalPaxBrought'
    >
  ): Participant => {
    const newP: Participant = {
      ...data,
      id: `p-${Date.now().toString().slice(-6)}`,
      joinedDate: new Date().toISOString().slice(0, 10),
      totalEventsAttended: 0,
      totalRegistrations: 0,
      gamesPlayedIds: [],
      venuesVisited: [],
      totalPaxBrought: 0
    };
    setParticipants(prev => [newP, ...prev]);
    logAudit('Participant Added', newP.name, `Created new shuffler record (${newP.area})`);
    return newP;
  };

  const mergeParticipants = (sourceId: string, targetId: string) => {
    const source = participants.find(p => p.id === sourceId);
    const target = participants.find(p => p.id === targetId);
    if (!source || !target) return;

    // Merge games played and venues
    const mergedGames = Array.from(new Set([...target.gamesPlayedIds, ...source.gamesPlayedIds]));
    const mergedVenues = Array.from(new Set([...target.venuesVisited, ...source.venuesVisited]));

    // Update target
    setParticipants(prev =>
      prev
        .map(p => {
          if (p.id === targetId) {
            return {
              ...p,
              totalEventsAttended: target.totalEventsAttended + source.totalEventsAttended,
              totalRegistrations: target.totalRegistrations + source.totalRegistrations,
              totalPaxBrought: target.totalPaxBrought + source.totalPaxBrought,
              gamesPlayedIds: mergedGames,
              venuesVisited: mergedVenues
            };
          }
          return p;
        })
        .filter(p => p.id !== sourceId)
    );

    // Re-link registrations
    setRegistrations(prev =>
      prev.map(r =>
        r.participantId === sourceId
          ? {
              ...r,
              participantId: targetId,
              participantName: target.name,
              participantEmail: target.email,
              participantPhone: target.phone
            }
          : r
      )
    );

    logAudit('Participants Merged', `${source.name} → ${target.name}`, `Merged records and transferred history`);
  };

  // Community Submissions
  const submitFeedback = (fbData: Omit<EventFeedback, 'id' | 'createdAt'>) => {
    const newFb: EventFeedback = {
      ...fbData,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setFeedbackList(prev => [newFb, ...prev]);

    // Notification for admin
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Feedback Received! 💬',
      message: `Rating: ${newFb.overallRating}/5 for ${newFb.eventTitle}`,
      type: 'community',
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const submitSafetyReport = (repData: Omit<SafetyReport, 'id' | 'createdAt' | 'status'>) => {
    const newRep: SafetyReport = {
      ...repData,
      id: `rep-${Date.now()}`,
      status: 'New',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setReportsList(prev => [newRep, ...prev]);

    // Admin alert notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Confidential Report Submitted 🚨',
      message: `Type: ${newRep.type}. Requires organizer review.`,
      type: 'system',
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const submitVolunteerApplication = (appData: Omit<VolunteerApplication, 'id' | 'status' | 'submittedAt'>) => {
    const newVol: VolunteerApplication = {
      ...appData,
      id: `vol-${Date.now()}`,
      status: 'New',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setVolunteersList(prev => [newVol, ...prev]);

    // Admin notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Volunteer Application! 🙋',
      message: `${newVol.name} applied to volunteer with skills: ${newVol.skills}`,
      type: 'community',
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const updateVolunteerStatus = (id: string, status: VolunteerStatus) => {
    setVolunteersList(prev => prev.map(v => (v.id === id ? { ...v, status } : v)));
    const vol = volunteersList.find(v => v.id === id);
    if (vol) {
      logAudit('Volunteer Status Updated', vol.name, `Status: ${status}`);
    }
  };

  const updateReportStatus = (id: string, status: 'New' | 'Investigating' | 'Resolved', notes?: string) => {
    setReportsList(prev =>
      prev.map(r => (r.id === id ? { ...r, status, resolutionNotes: notes || r.resolutionNotes } : r))
    );
    logAudit('Report Status Updated', id, `Status: ${status}`);
  };

  // CSV Import
  const importRegistrations = (
    eventId: string,
    rows: Array<{ name: string; email: string; phone: string; area?: string; paxCount?: number; notes?: string }>
  ) => {
    let imported = 0;
    let duplicatesFound = 0;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newRegs: Registration[] = [];
    const updatedParticipants = [...participants];

    rows.forEach((row, idx) => {
      if (!row.name || !row.email) return;

      // Check duplicate participant
      let participant = detectDuplicate(row.email, row.phone || '', row.name);
      if (participant) {
        duplicatesFound++;
      } else {
        participant = {
          id: `p-imp-${Date.now()}-${idx}`,
          name: row.name,
          email: row.email,
          phone: row.phone || '',
          area: row.area || 'Pune',
          joinedDate: nowStr.slice(0, 10),
          totalEventsAttended: 0,
          totalRegistrations: 1,
          gamesPlayedIds: [],
          venuesVisited: [],
          totalPaxBrought: 0
        };
        updatedParticipants.push(participant);
      }

      // Check if already registered for this event
      const alreadyRegistered = registrations.some(
        r => r.eventId === eventId && r.participantEmail.toLowerCase() === row.email.toLowerCase()
      );
      if (!alreadyRegistered) {
        newRegs.push({
          id: `reg-imp-${Date.now()}-${idx}`,
          eventId,
          participantId: participant.id,
          participantName: participant.name,
          participantEmail: participant.email,
          participantPhone: participant.phone,
          participantArea: participant.area,
          paxCount: row.paxCount || 1,
          guests: [],
          paymentStatus: 'Confirmed',
          attendanceStatus: 'Pending',
          gamesPlayed: [],
          notes: row.notes || 'Imported via CSV/Excel',
          registeredAt: nowStr
        });
        imported++;
      }
    });

    setParticipants(updatedParticipants);
    setRegistrations(prev => [...newRegs, ...prev]);

    logAudit('Excel/CSV Import', `Event ${eventId}`, `Imported ${imported} registrations (${duplicatesFound} existing profiles found)`);
    return { imported, duplicatesFound };
  };

  const bulkImportRegistrations = (eventId: string, csvText: string): { importedCount: number; errors: string[] } => {
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return { importedCount: 0, errors: ['CSV has no data rows'] };

    const dataRows: Array<{ name: string; email: string; phone: string; area?: string; paxCount?: number; notes?: string }> = [];
    const errors: string[] = [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    const nameIdx = headers.findIndex(h => h.includes('name'));
    const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile'));
    const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'));
    const areaIdx = headers.findIndex(h => h.includes('area') || h.includes('location') || h.includes('city'));
    const paxIdx = headers.findIndex(h => h.includes('pax') || h.includes('guest') || h.includes('ticket') || h.includes('count'));
    const notesIdx = headers.findIndex(h => h.includes('note') || h.includes('comment'));

    for (let i = 1; i < lines.length; i++) {
      const rawCols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      const name = nameIdx >= 0 ? rawCols[nameIdx] : rawCols[0];
      const phone = phoneIdx >= 0 ? rawCols[phoneIdx] : rawCols[1] || '';
      const email = emailIdx >= 0 ? rawCols[emailIdx] : rawCols[2] || `${(name || 'user').toLowerCase().replace(/\s+/g, '')}@example.com`;
      const area = areaIdx >= 0 ? rawCols[areaIdx] : rawCols[3] || 'Koregaon Park';
      const paxCount = paxIdx >= 0 ? parseInt(rawCols[paxIdx], 10) || 1 : 1;
      const notes = notesIdx >= 0 ? rawCols[notesIdx] : rawCols[5] || '';

      if (name) {
        dataRows.push({ name, phone, email, area, paxCount, notes });
      } else {
        errors.push(`Row ${i + 1} skipped: Missing name`);
      }
    }

    const { imported } = importRegistrations(eventId, dataRows);
    return { importedCount: imported, errors };
  };

  // CSV Export utility
  const exportCSV = (dataType: 'attendance' | 'participants' | 'games' | 'feedback', eventId?: string) => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `social_shuffle_${dataType}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (dataType === 'attendance') {
      const targetRegs = eventId ? registrations.filter(r => r.eventId === eventId) : registrations;
      headers = ['Registration ID', 'Event ID', 'Participant Name', 'Email', 'Phone', 'Area', 'Pax', 'Payment Status', 'Attendance Status', 'Check-in Time', 'Notes'];
      rows = targetRegs.map(r => [
        r.id,
        r.eventId,
        `"${r.participantName}"`,
        r.participantEmail,
        r.participantPhone,
        `"${r.participantArea}"`,
        r.paxCount.toString(),
        r.paymentStatus,
        r.attendanceStatus,
        r.checkInTime || '',
        `"${r.notes || ''}"`
      ]);
    } else if (dataType === 'participants') {
      headers = ['ID', 'Name', 'Email', 'Phone', 'Area', 'Events Attended', 'Total Registrations', 'Games Played Count', 'Venues Visited', 'Pax Brought', 'Joined Date'];
      rows = participants.map(p => [
        p.id,
        `"${p.name}"`,
        p.email,
        p.phone,
        `"${p.area}"`,
        p.totalEventsAttended.toString(),
        p.totalRegistrations.toString(),
        p.gamesPlayedIds.length.toString(),
        p.venuesVisited.length.toString(),
        p.totalPaxBrought.toString(),
        p.joinedDate
      ]);
    } else if (dataType === 'games') {
      headers = ['ID', 'Name', 'Category', 'Difficulty', 'Players', 'Duration', 'Plays Count', 'Active'];
      rows = games.map(g => [
        g.id,
        `"${g.name}"`,
        g.category,
        g.difficulty,
        `"${g.players}"`,
        `"${g.duration}"`,
        g.playsCount.toString(),
        g.active ? 'Yes' : 'No'
      ]);
    } else if (dataType === 'feedback') {
      headers = ['ID', 'Event Title', 'Participant', 'Overall Rating', 'Venue Rating', 'Game Rating', 'Host Rating', 'Suggestions', 'Date'];
      rows = feedbackList.map(f => [
        f.id,
        `"${f.eventTitle}"`,
        f.isAnonymous ? 'Anonymous' : `"${f.participantName || 'Shuffler'}"`,
        f.overallRating.toString(),
        f.venueRating.toString(),
        f.gameRating.toString(),
        f.hostRating.toString(),
        `"${f.suggestions.replace(/"/g, '""')}"`,
        f.createdAt
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logAudit('Export CSV', dataType, `Exported ${rows.length} rows`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetDatabase = () => {
    localStorage.clear();
    setEvents(INITIAL_EVENTS);
    setGames(INITIAL_GAMES);
    setParticipants(INITIAL_PARTICIPANTS);
    setRegistrations(INITIAL_REGISTRATIONS);
    setFeedbackList(INITIAL_FEEDBACK);
    setReportsList(INITIAL_REPORTS);
    setVolunteersList(INITIAL_VOLUNTEERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentParticipantId('p-rahul');
    setIsOfflineMode(false);
    setOfflineSyncQueue([]);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        userRole: role,
        setRole,
        setUserRole: setRole,
        currentParticipantId,
        setCurrentParticipantId,
        currentParticipant,
        adminName,

        // Authentication & Session
        currentUser,
        isAuthenticated,
        isAdminUser,
        login,
        registerParticipant,
        loginWithGoogle,
        logout,
        lastActiveTimestamp,
        sessionRemainingDays,
        simulateInactivityTimeout,
        showAuthModal,
        setShowAuthModal,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,

        events,
        games,
        participants,
        registrations,
        feedbackList,
        reportsList,
        volunteersList,
        auditLogs,
        notifications,

        backendStatus,
        backendUrl,
        setBackendUrl,
        checkBackendConnection,
        syncWithBackend,

        isOfflineMode,
        toggleOfflineMode,
        offlineSyncQueue,
        syncOfflineQueue,
        syncOfflineData: syncOfflineQueue,

        registerForEvent,
        cancelRegistration,
        verifyAttendeeQrCode,
        generateEmailPreviewHtml,

        updateAttendanceStatus,
        markAttendance: updateAttendanceStatus,
        addWalkInRegistration,
        toggleGamePlayedForAttendee,
        updateRegistrationNotes,
        updatePaymentStatus,
        addGuestToRegistration,

        createEvent,
        editEvent,
        updateEvent: editEvent,
        archiveEvent,
        duplicateEvent,

        addGame,
        editGame,
        updateGame: editGame,
        toggleGameActive,

        updateParticipant,
        addParticipant,
        detectDuplicate,
        mergeParticipants,

        submitFeedback,
        submitSafetyReport,
        submitVolunteerApplication,
        updateVolunteerStatus,
        updateReportStatus,

        importRegistrations,
        bulkImportRegistrations,
        exportCSV,

        markNotificationRead,
        markAllNotificationsRead,
        resetDatabase
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
