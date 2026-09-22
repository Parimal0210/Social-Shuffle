/**
 * Social Shuffle — Dynamic API Service
 * Connects React frontend with Spring Boot + MongoDB REST API.
 * Includes automatic local fallback so the app works seamlessly in preview mode,
 * and dynamically hits Spring Boot when launched locally or remotely.
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
  AuthResponse
} from '../types';

const API_STORAGE_KEY = 'social_shuffle_api_url';
export const DEFAULT_API_URL = 'http://localhost:8080/api';

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
    try {
      const res = await this.fetchWithTimeout('/system/health');
      if (res.ok) {
        return (await res.json()) as BackendHealthResponse;
      }
      return null;
    } catch (e) {
      return null;
    }
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
    try {
      const res = await this.fetchWithTimeout('/events');
      if (res.ok) return (await res.json()) as ShuffleEvent[];
      return null;
    } catch {
      return null;
    }
  }

  async createEvent(event: ShuffleEvent): Promise<ShuffleEvent | null> {
    try {
      const res = await this.fetchWithTimeout('/events', {
        method: 'POST',
        body: JSON.stringify(event)
      });
      if (res.ok) return (await res.json()) as ShuffleEvent;
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
      if (res.ok) return (await res.json()) as ShuffleEvent;
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
      if (res.ok) return (await res.json()) as ShuffleEvent;
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
      return res.ok;
    } catch {
      return false;
    }
  }

  // --- Games ---
  async getGames(): Promise<Game[] | null> {
    try {
      const res = await this.fetchWithTimeout('/games');
      if (res.ok) return (await res.json()) as Game[];
      return null;
    } catch {
      return null;
    }
  }

  async createGame(game: Game): Promise<Game | null> {
    try {
      const res = await this.fetchWithTimeout('/games', {
        method: 'POST',
        body: JSON.stringify(game)
      });
      if (res.ok) return (await res.json()) as Game;
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
      if (res.ok) return (await res.json()) as Game;
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
      if (res.ok) return (await res.json()) as Game;
      return null;
    } catch {
      return null;
    }
  }

  // --- Participants ---
  async getParticipants(search?: string): Promise<Participant[] | null> {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await this.fetchWithTimeout(`/participants${query}`);
      if (res.ok) return (await res.json()) as Participant[];
      return null;
    } catch {
      return null;
    }
  }

  async createParticipant(participant: Participant): Promise<Participant | null> {
    try {
      const res = await this.fetchWithTimeout('/participants', {
        method: 'POST',
        body: JSON.stringify(participant)
      });
      if (res.ok) return (await res.json()) as Participant;
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
      if (res.ok) return (await res.json()) as Participant;
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
      if (res.ok) return (await res.json()) as Participant;
      return null;
    } catch {
      return null;
    }
  }

  // --- Registrations ---
  async getRegistrations(eventId?: string): Promise<Registration[] | null> {
    try {
      const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : '';
      const res = await this.fetchWithTimeout(`/registrations${query}`);
      if (res.ok) return (await res.json()) as Registration[];
      return null;
    } catch {
      return null;
    }
  }

  async createRegistration(reg: Registration): Promise<Registration | null> {
    try {
      const res = await this.fetchWithTimeout('/registrations', {
        method: 'POST',
        body: JSON.stringify(reg)
      });
      if (res.ok) return (await res.json()) as Registration;
      return null;
    } catch {
      return null;
    }
  }

  async updateAttendance(registrationId: string, status: AttendanceStatus): Promise<Registration | null> {
    try {
      const res = await this.fetchWithTimeout(`/registrations/${registrationId}/attendance?status=${encodeURIComponent(status)}`, {
        method: 'PATCH'
      });
      if (res.ok) return (await res.json()) as Registration;
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
      if (res.ok) return (await res.json()) as Registration;
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
      if (res.ok) return (await res.json()) as Registration;
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
      if (res.ok) return (await res.json()) as Registration;
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
      return res.ok;
    } catch {
      return false;
    }
  }

  // --- Community: Feedback, Reports, Volunteers ---
  async getFeedback(): Promise<EventFeedback[] | null> {
    try {
      const res = await this.fetchWithTimeout('/community/feedback');
      if (res.ok) return (await res.json()) as EventFeedback[];
      return null;
    } catch {
      return null;
    }
  }

  async submitFeedback(feedback: EventFeedback): Promise<EventFeedback | null> {
    try {
      const res = await this.fetchWithTimeout('/community/feedback', {
        method: 'POST',
        body: JSON.stringify(feedback)
      });
      if (res.ok) return (await res.json()) as EventFeedback;
      return null;
    } catch {
      return null;
    }
  }

  async getReports(): Promise<SafetyReport[] | null> {
    try {
      const res = await this.fetchWithTimeout('/community/reports');
      if (res.ok) return (await res.json()) as SafetyReport[];
      return null;
    } catch {
      return null;
    }
  }

  async submitReport(report: SafetyReport): Promise<SafetyReport | null> {
    try {
      const res = await this.fetchWithTimeout('/community/reports', {
        method: 'POST',
        body: JSON.stringify(report)
      });
      if (res.ok) return (await res.json()) as SafetyReport;
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
      if (res.ok) return (await res.json()) as SafetyReport;
      return null;
    } catch {
      return null;
    }
  }

  async getVolunteers(): Promise<VolunteerApplication[] | null> {
    try {
      const res = await this.fetchWithTimeout('/community/volunteers');
      if (res.ok) return (await res.json()) as VolunteerApplication[];
      return null;
    } catch {
      return null;
    }
  }

  async submitVolunteer(app: VolunteerApplication): Promise<VolunteerApplication | null> {
    try {
      const res = await this.fetchWithTimeout('/community/volunteers', {
        method: 'POST',
        body: JSON.stringify(app)
      });
      if (res.ok) return (await res.json()) as VolunteerApplication;
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
      if (res.ok) return (await res.json()) as VolunteerApplication;
      return null;
    } catch {
      return null;
    }
  }

  // --- Audit Logs & Notifications ---
  async getAuditLogs(): Promise<AuditLog[] | null> {
    try {
      const res = await this.fetchWithTimeout('/audit-logs');
      if (res.ok) return (await res.json()) as AuditLog[];
      return null;
    } catch {
      return null;
    }
  }

  async createAuditLog(log: AuditLog): Promise<AuditLog | null> {
    try {
      const res = await this.fetchWithTimeout('/audit-logs', {
        method: 'POST',
        body: JSON.stringify(log)
      });
      if (res.ok) return (await res.json()) as AuditLog;
      return null;
    } catch {
      return null;
    }
  }

  async getNotifications(): Promise<NotificationItem[] | null> {
    try {
      const res = await this.fetchWithTimeout('/notifications');
      if (res.ok) return (await res.json()) as NotificationItem[];
      return null;
    } catch {
      return null;
    }
  }

  async markNotificationRead(id: string): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout(`/notifications/${id}/read`, {
        method: 'PATCH'
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async markAllNotificationsRead(): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout('/notifications/mark-all-read', {
        method: 'POST'
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const api = new ApiService();
