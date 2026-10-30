/**
 * Social Shuffle — Dynamic API Service
 * Connects React frontend with Spring Boot + MySQL REST API.
 * Includes automatic local fallback so the app works seamlessly in preview mode,
 * and dynamically hits Spring Boot when launched locally or on GoDaddy/Cloud.
 */

import {
  ShuffleEvent,
  Game,
  Participant,
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
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  EventEmailBroadcastRequest
} from '../types';
import {
  BadgeCalculationResult,
  BadgeLevelDefinition,
  calculateBadgeLevel as calculateBadgeLevelLocal,
  BADGE_LEVELS
} from './badgeBackendService';

const API_STORAGE_KEY = 'social_shuffle_api_url';
export const DEFAULT_API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_API_URL)
    ? import.meta.env.VITE_BACKEND_API_URL
    : 'https://social-shuffle-backend.onrender.com/api';

export function getStoredApiUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_API_URL;
  return localStorage.getItem(API_STORAGE_KEY) || DEFAULT_API_URL;
}

export function setStoredApiUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(API_STORAGE_KEY, url.trim().replace(/\/+$/, ''));
  }
}

export interface BackendHealthResponse {
  status: 'UP' | 'DOWN';
  service: string;
  version: string;
  database: string;
  databaseName?: string;
  timestamp?: string;
  counts?: {
    events: number;
    games: number;
    participants: number;
    registrations: number;
    feedback: number;
    safetyReports: number;
    volunteers: number;
  };
}

class ApiService {
  private timeoutMs = 3000;
  private cache = new Map<string, { data: any; expiry: number }>();
  private inFlight = new Map<string, Promise<any>>();

  /**
   * Invalidates specific cache entries by endpoint prefix or completely clears cache if no prefix passed.
   */
  public invalidateCache(...prefixes: string[]): void {
    if (prefixes.length === 0) {
      this.cache.clear();
      return;
    }
    for (const key of Array.from(this.cache.keys())) {
      if (prefixes.some(p => key.startsWith(p) || key.includes(p))) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * High-performance cached GET with In-Flight Request Deduplication.
   * Avoids duplicate simultaneous network requests and eliminates redundant database queries.
   */
  private async cachedFetchJson<T>(endpoint: string, ttlMs: number = 15000): Promise<T | null> {
    const now = Date.now();
    const cached = this.cache.get(endpoint);
    if (cached && cached.expiry > now) {
      return cached.data as T;
    }

    // In-flight deduplication: return same active promise if already pending
    if (this.inFlight.has(endpoint)) {
      return (await this.inFlight.get(endpoint)) as T | null;
    }

    const promise = (async () => {
      try {
        const res = await this.fetchWithTimeout(endpoint);
        if (res.ok) {
          const json = await res.json();
          this.cache.set(endpoint, { data: json, expiry: Date.now() + ttlMs });
          return json as T;
        }
        return null;
      } catch {
        return null;
      } finally {
        this.inFlight.delete(endpoint);
      }
    })();

    this.inFlight.set(endpoint, promise);
    return await promise;
  }

  private async fetchWithTimeout(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const baseUrl = getStoredApiUrl();
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(options.headers || {})
        }
      });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  }

  // --- Health & Ping ---
  async checkHealth(): Promise<BackendHealthResponse | null> {
    return this.cachedFetchJson<BackendHealthResponse>('/system/health', 10000);
  }

  // --- Authentication ---
  async login(credentials: LoginCredentials): Promise<AuthResponse | null> {
    try {
      const res = await this.fetchWithTimeout('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      if (res.ok) {
        return (await res.json()) as AuthResponse;
      }
      return null;
    } catch {
      return null;
    }
  }

  async register(data: RegisterCredentials): Promise<AuthResponse | null> {
    try {
      const res = await this.fetchWithTimeout('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (res.ok) {
        this.invalidateCache('/participants');
        return (await res.json()) as AuthResponse;
      }
      return null;
    } catch {
      return null;
    }
  }

  async googleLogin(profile: {
    email: string;
    name: string;
    avatar?: string;
    phone?: string;
    area?: string;
    googleId?: string;
  }): Promise<AuthResponse | null> {
    try {
      const res = await this.fetchWithTimeout('/auth/google', {
        method: 'POST',
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        this.invalidateCache('/participants');
        return (await res.json()) as AuthResponse;
      }
      return null;
    } catch {
      return null;
    }
  }

  async getCurrentUser(token: string): Promise<AuthResponse | null> {
    try {
      const res = await this.fetchWithTimeout('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        return (await res.json()) as AuthResponse;
      }
      return null;
    } catch {
      return null;
    }
  }

  // --- Events ---
  async getEvents(): Promise<ShuffleEvent[] | null> {
    return this.cachedFetchJson<ShuffleEvent[]>('/events', 20000);
  }

  async createEvent(event: ShuffleEvent): Promise<ShuffleEvent | null> {
    try {
      const res = await this.fetchWithTimeout('/events', {
        method: 'POST',
        body: JSON.stringify(event)
      });
      if (res.ok) {
        this.invalidateCache('/events');
        return (await res.json()) as ShuffleEvent;
      }
      return null;
    } catch {
      return null;
    }
  }

  async updateEvent(id: string, updates: Partial<ShuffleEvent>): Promise<ShuffleEvent | null> {
    try {
      const res = await this.fetchWithTimeout(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        this.invalidateCache('/events');
        return (await res.json()) as ShuffleEvent;
      }
      return null;
    } catch {
      return null;
    }
  }

  async duplicateEvent(id: string): Promise<ShuffleEvent | null> {
    try {
      const res = await this.fetchWithTimeout(`/events/${id}/duplicate`, {
        method: 'POST'
      });
      if (res.ok) {
        this.invalidateCache('/events');
        return (await res.json()) as ShuffleEvent;
      }
      return null;
    } catch {
      return null;
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout(`/events/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        this.invalidateCache('/events');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // --- Games ---
  async getGames(): Promise<Game[] | null> {
    return this.cachedFetchJson<Game[]>('/games', 30000);
  }

  async createGame(game: Game): Promise<Game | null> {
    try {
      const res = await this.fetchWithTimeout('/games', {
        method: 'POST',
        body: JSON.stringify(game)
      });
      if (res.ok) {
        this.invalidateCache('/games');
        return (await res.json()) as Game;
      }
      return null;
    } catch {
      return null;
    }
  }

  async updateGame(id: string, updates: Partial<Game>): Promise<Game | null> {
    try {
      const res = await this.fetchWithTimeout(`/games/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        this.invalidateCache('/games');
        return (await res.json()) as Game;
      }
      return null;
    } catch {
      return null;
    }
  }

  async toggleGameActive(id: string): Promise<Game | null> {
    try {
      const res = await this.fetchWithTimeout(`/games/${id}/toggle-active`, {
        method: 'PATCH'
      });
      if (res.ok) {
        this.invalidateCache('/games');
        return (await res.json()) as Game;
      }
      return null;
    } catch {
      return null;
    }
  }

  // --- Participants ---
  async getParticipants(search?: string): Promise<Participant[] | null> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.cachedFetchJson<Participant[]>(`/participants${query}`, 20000);
  }

  async createParticipant(participant: Participant): Promise<Participant | null> {
    try {
      const res = await this.fetchWithTimeout('/participants', {
        method: 'POST',
        body: JSON.stringify(participant)
      });
      if (res.ok) {
        this.invalidateCache('/participants');
        return (await res.json()) as Participant;
      }
      return null;
    } catch {
      return null;
    }
  }

  async updateParticipant(id: string, updates: Partial<Participant>): Promise<Participant | null> {
    try {
      const res = await this.fetchWithTimeout(`/participants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        this.invalidateCache('/participants');
        return (await res.json()) as Participant;
      }
      return null;
    } catch {
      return null;
    }
  }

  async checkDuplicateParticipant(email?: string, phone?: string): Promise<Participant | null> {
    try {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (phone) params.append('phone', phone);
      const res = await this.fetchWithTimeout(`/participants/check-duplicate?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data.duplicate || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  async mergeParticipants(sourceId: string, targetId: string): Promise<Participant | null> {
    try {
      const res = await this.fetchWithTimeout(`/participants/merge?sourceId=${sourceId}&targetId=${targetId}`, {
        method: 'POST'
      });
      if (res.ok) {
        this.invalidateCache('/participants', '/registrations');
        return (await res.json()) as Participant;
      }
      return null;
    } catch {
      return null;
    }
  }

  // --- Registrations ---
  async getRegistrations(eventId?: string): Promise<Registration[] | null> {
    const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : '';
    return this.cachedFetchJson<Registration[]>(`/registrations${query}`, 10000);
  }

  async createRegistration(reg: Registration): Promise<Registration | null> {
    try {
      const res = await this.fetchWithTimeout('/registrations', {
        method: 'POST',
        body: JSON.stringify(reg)
      });
      if (res.ok) {
        this.invalidateCache('/registrations', '/participants');
        return (await res.json()) as Registration;
      }
      return null;
    } catch {
      return null;
    }
  }

  async bulkImportRegistrations(registrations: Registration[]): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout('/registrations/bulk-import', {
        method: 'POST',
        body: JSON.stringify(registrations)
      });
      if (res.ok) {
        this.invalidateCache('/registrations', '/participants');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async updateAttendance(registrationId: string, status: AttendanceStatus): Promise<Registration | null> {
    try {
      const res = await this.fetchWithTimeout(`/registrations/${registrationId}/attendance?status=${encodeURIComponent(status)}`, {
        method: 'PATCH'
      });
      if (res.ok) {
        this.invalidateCache('/registrations', '/participants');
        return (await res.json()) as Registration;
      }
      return null;
    } catch {
      return null;
    }
  }

  async updatePayment(registrationId: string, status: PaymentStatus): Promise<Registration | null> {
    try {
      const res = await this.fetchWithTimeout(`/registrations/${registrationId}/payment?status=${encodeURIComponent(status)}`, {
        method: 'PATCH'
      });
      if (res.ok) {
        this.invalidateCache('/registrations');
        return (await res.json()) as Registration;
      }
      return null;
    } catch {
      return null;
    }
  }

  async toggleGamePlayed(registrationId: string, gameId: string): Promise<Registration | null> {
    try {
      const res = await this.fetchWithTimeout(`/registrations/${registrationId}/toggle-game?gameId=${encodeURIComponent(gameId)}`, {
        method: 'POST'
      });
      if (res.ok) {
        this.invalidateCache('/registrations', '/games', '/participants');
        return (await res.json()) as Registration;
      }
      return null;
    } catch {
      return null;
    }
  }

  async addWalkIn(eventId: string, data: { name: string; phone: string; email: string; area: string; paxCount: number; paymentStatus: PaymentStatus; notes?: string }): Promise<Registration | null> {
    try {
      const res = await this.fetchWithTimeout(`/registrations/walk-in?eventId=${encodeURIComponent(eventId)}`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (res.ok) {
        this.invalidateCache('/registrations', '/participants');
        return (await res.json()) as Registration;
      }
      return null;
    } catch {
      return null;
    }
  }

  async cancelRegistration(id: string): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout(`/registrations/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        this.invalidateCache('/registrations', '/participants');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // --- Community: Feedback, Reports, Volunteers ---
  async getFeedback(): Promise<EventFeedback[] | null> {
    return this.cachedFetchJson<EventFeedback[]>('/community/feedback', 20000);
  }

  async submitFeedback(feedback: EventFeedback): Promise<EventFeedback | null> {
    try {
      const res = await this.fetchWithTimeout('/community/feedback', {
        method: 'POST',
        body: JSON.stringify(feedback)
      });
      if (res.ok) {
        this.invalidateCache('/community/feedback');
        return (await res.json()) as EventFeedback;
      }
      return null;
    } catch {
      return null;
    }
  }

  async getReports(): Promise<SafetyReport[] | null> {
    return this.cachedFetchJson<SafetyReport[]>('/community/reports', 20000);
  }

  async submitReport(report: SafetyReport): Promise<SafetyReport | null> {
    try {
      const res = await this.fetchWithTimeout('/community/reports', {
        method: 'POST',
        body: JSON.stringify(report)
      });
      if (res.ok) {
        this.invalidateCache('/community/reports');
        return (await res.json()) as SafetyReport;
      }
      return null;
    } catch {
      return null;
    }
  }

  async updateReportStatus(id: string, status: string, notes?: string): Promise<SafetyReport | null> {
    try {
      const params = new URLSearchParams({ status });
      if (notes) params.append('notes', notes);
      const res = await this.fetchWithTimeout(`/community/reports/${id}/status?${params.toString()}`, {
        method: 'PATCH'
      });
      if (res.ok) {
        this.invalidateCache('/community/reports');
        return (await res.json()) as SafetyReport;
      }
      return null;
    } catch {
      return null;
    }
  }

  async getVolunteers(): Promise<VolunteerApplication[] | null> {
    return this.cachedFetchJson<VolunteerApplication[]>('/community/volunteers', 20000);
  }

  async submitVolunteer(app: VolunteerApplication): Promise<VolunteerApplication | null> {
    try {
      const res = await this.fetchWithTimeout('/community/volunteers', {
        method: 'POST',
        body: JSON.stringify(app)
      });
      if (res.ok) {
        this.invalidateCache('/community/volunteers');
        return (await res.json()) as VolunteerApplication;
      }
      return null;
    } catch {
      return null;
    }
  }

  async updateVolunteerStatus(id: string, status: VolunteerStatus): Promise<VolunteerApplication | null> {
    try {
      const res = await this.fetchWithTimeout(`/community/volunteers/${id}/status?status=${encodeURIComponent(status)}`, {
        method: 'PATCH'
      });
      if (res.ok) {
        this.invalidateCache('/community/volunteers');
        return (await res.json()) as VolunteerApplication;
      }
      return null;
    } catch {
      return null;
    }
  }

  // --- Audit Logs & Notifications ---
  async getAuditLogs(): Promise<AuditLog[] | null> {
    return this.cachedFetchJson<AuditLog[]>('/audit-logs', 15000);
  }

  async createAuditLog(log: AuditLog): Promise<AuditLog | null> {
    try {
      const res = await this.fetchWithTimeout('/audit-logs', {
        method: 'POST',
        body: JSON.stringify(log)
      });
      if (res.ok) {
        this.invalidateCache('/audit-logs');
        return (await res.json()) as AuditLog;
      }
      return null;
    } catch {
      return null;
    }
  }

  async getNotifications(): Promise<NotificationItem[] | null> {
    return this.cachedFetchJson<NotificationItem[]>('/notifications', 15000);
  }

  async markNotificationRead(id: string): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout(`/notifications/${id}/read`, {
        method: 'PATCH'
      });
      if (res.ok) {
        this.invalidateCache('/notifications');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async markAllNotificationsRead(): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout('/notifications/mark-all-read', {
        method: 'POST'
      });
      if (res.ok) {
        this.invalidateCache('/notifications');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async sendEventEmailBroadcast(req: EventEmailBroadcastRequest): Promise<{ success: boolean; sentCount?: number; message?: string } | null> {
    try {
      const res = await this.fetchWithTimeout('/notifications/event-broadcast', {
        method: 'POST',
        body: JSON.stringify(req)
      });
      if (res.ok) {
        this.invalidateCache('/notifications', '/registrations');
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  }

  async pushEventNotification(eventId: string, req: EventEmailBroadcastRequest): Promise<{ success: boolean; message?: string } | null> {
    try {
      const res = await this.fetchWithTimeout(`/events/${encodeURIComponent(eventId)}/push-notification`, {
        method: 'POST',
        body: JSON.stringify(req)
      });
      if (res.ok) {
        this.invalidateCache('/notifications', '/registrations');
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  }

  async sendEventReminder(eventId: string, note?: string): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout(`/notifications/send-reminder/${eventId}${note ? `?note=${encodeURIComponent(note)}` : ''}`, {
        method: 'POST'
      });
      if (res.ok) {
        this.invalidateCache('/notifications');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async sendRegistrationConfirmationEmail(registrationId: string): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout(`/notifications/registration-confirmation/${registrationId}`, {
        method: 'POST'
      });
      if (res.ok) {
        this.invalidateCache('/notifications', '/registrations');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async sendCommunityAnnouncement(title: string, message: string): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout('/notifications/community-announcement', {
        method: 'POST',
        body: JSON.stringify({ title, message })
      });
      if (res.ok) {
        this.invalidateCache('/notifications');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // --- Backend 10-Level Badge System ---
  async getBadgeLevels(): Promise<BadgeLevelDefinition[]> {
    try {
      const res = await fetch('/api/badges/levels');
      if (res.ok) {
        const json = await res.json();
        if (json.levels) return json.levels;
      }
    } catch {
      // Local fallback
    }
    return BADGE_LEVELS;
  }

  async calculateBadgeLevel(params: {
    gamesPlayedCount: number;
    totalGamesCount?: number;
    eventsAttendedCount: number;
  }): Promise<BadgeCalculationResult> {
    try {
      const res = await fetch('/api/badges/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Local fallback
    }
    return calculateBadgeLevelLocal(params);
  }

  // --- Backend Google Multi-Account & Registration Verification ---
  async getGoogleDeviceAccounts(): Promise<{ accounts: any[]; registeredEmails: string[] }> {
    try {
      const res = await fetch('/api/auth/google/device-accounts');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback handled in caller
    }
    return { accounts: [], registeredEmails: [] };
  }

  async addGoogleDeviceAccount(account: {
    email: string;
    name: string;
    avatar?: string;
    phone?: string;
    area?: string;
  }): Promise<{ accounts: any[]; registeredEmails: string[] }> {
    try {
      const res = await fetch('/api/auth/google/device-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return { accounts: [], registeredEmails: [] };
  }

  async googleSignUp(profile: {
    email: string;
    name: string;
    avatar?: string;
    phone?: string;
    area?: string;
    bio?: string;
    googleId?: string;
  }): Promise<{ success: boolean; message: string; user?: any; participant?: any }> {
    try {
      const res = await fetch('/api/auth/google/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      return { success: false, message: e?.message || 'Failed to sign up with Google' };
    }
  }

  async googleLoginCheck(email: string): Promise<{
    success: boolean;
    message: string;
    code?: string;
    user?: any;
    participant?: any;
  }> {
    try {
      const res = await fetch('/api/auth/google/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      return { success: false, message: e?.message || 'Login failed', code: 'NETWORK_ERROR' };
    }
  }

  // --- Email OTP Verification API ---
  async sendOtp(email: string, name?: string): Promise<{
    success: boolean;
    message: string;
    email?: string;
    otpPreview?: string;
    expiresInSeconds?: number;
  }> {
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      return { success: false, message: e?.message || 'Failed to send verification email' };
    }
  }

  async verifyOtp(email: string, otp: string): Promise<{
    success: boolean;
    message: string;
    verified?: boolean;
    email?: string;
  }> {
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      return { success: false, message: e?.message || 'Failed to verify OTP code' };
    }
  }

  async checkOtpStatus(email: string): Promise<{ success: boolean; verified: boolean }> {
    try {
      const res = await fetch(`/api/auth/otp/status?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return { success: true, verified: false };
  }

  // --- Database Admins Table Verification ---
  async getAdmins(): Promise<any[]> {
    try {
      const res = await fetch('/api/admins');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) return json;
        if (json && Array.isArray(json.admins)) return json.admins;
      }
    } catch {}
    return [];
  }

  async checkAdmin(emailOrPhone: string): Promise<{ isAdmin: boolean; admin?: any }> {
    try {
      const res = await fetch(`/api/admins/check?email=${encodeURIComponent(emailOrPhone)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { isAdmin: false };
  }

  // --- Identify Current Logged In Individual ---
  async identifyCurrentUser(identifier?: string): Promise<{ success: boolean; user?: any; participant?: any; role?: string; isAdmin?: boolean }> {
    try {
      const url = identifier ? `/api/auth/me?email=${encodeURIComponent(identifier)}` : '/api/auth/me';
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { success: false };
  }
}

export const api = new ApiService();

