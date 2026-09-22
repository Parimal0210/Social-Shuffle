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
  VolunteerStatus
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

  // Spring Boot & MongoDB Integration
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
  registerForEvent: (eventId: string, paxCount: number, guests: GuestInfo[], notes?: string) => { success: boolean; message: string };
  cancelRegistration: (registrationId: string) => void;

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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Role & Session State
  const [role, setRole] = useState<UserRole>('participant');
  const [currentParticipantId, setCurrentParticipantId] = useState<string>('p-rahul');
  const adminName = 'Aman Joshi (Host)';

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

  // Spring Boot + MongoDB Connectivity
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

  // On mount: check health and pull live data from MongoDB if available
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
      return { success: true, message: 'Successfully synced local data to MongoDB via Spring Boot!' };
    } catch (e: any) {
      setBackendStatus('offline');
      return { success: false, message: e?.message || 'Sync failed' };
    }
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
  ): { success: boolean; message: string } => {
    const event = events.find(e => e.id === eventId);
    if (!event) return { success: false, message: 'Event not found' };

    // Check if already registered
    const existing = registrations.find(
      r => r.eventId === eventId && r.participantId === currentParticipant.id && r.attendanceStatus !== 'Cancelled'
    );
    if (existing) {
      return { success: false, message: 'You are already registered for this event!' };
    }

    const regId = `reg-${event.number}-${Date.now().toString().slice(-4)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

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
      registeredAt: nowStr
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
      message: `See you at ${event.venue} on ${event.date}! Your registration with ${paxCount} pax is confirmed.`,
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

    return { success: true, message: `Successfully registered for ${event.title}!` };
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
