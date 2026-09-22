import { Injectable, signal, computed } from '@angular/core';
import { AuthUser, LoginCredentials, RegisterCredentials, Participant } from '../models/types';
import { ApiService } from './api.service';

const AUTH_STORAGE_KEY = 'social_shuffle_angular_auth_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Angular 17 Signals for reactive state
  readonly currentUser = signal<AuthUser | null>(this.loadStoredUser());
  readonly role = signal<'participant' | 'admin'>(this.loadInitialRole());
  readonly showAuthModal = signal<boolean>(false);
  readonly authModalMode = signal<'login' | 'register'>('login');

  // Computed signals
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isAdminUser = computed(() => this.currentUser()?.role === 'admin');

  constructor(private api: ApiService) {}

  private loadStoredUser(): AuthUser | null {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default active participant demo profile
    return {
      id: 'u-rohan',
      name: 'Rohan Kulkarni',
      email: 'rohan.kulkarni@example.com',
      phone: '+91 98220 12345',
      role: 'participant',
      area: 'Koregaon Park',
      participantId: 'p-rahul',
      bio: 'Board game lover, strategy nerd, Catan enthusiast.',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'
    };
  }

  private loadInitialRole(): 'participant' | 'admin' {
    const user = this.loadStoredUser();
    return user?.role === 'admin' ? 'admin' : 'participant';
  }

  openAuthModal(mode: 'login' | 'register' = 'login') {
    this.authModalMode.set(mode);
    this.showAuthModal.set(true);
  }

  closeAuthModal() {
    this.showAuthModal.set(false);
  }

  // STRICT ACCESS CONTROL:
  // If registered as participant, role is LOCKED to 'participant'.
  setRole(newRole: 'participant' | 'admin') {
    if (this.currentUser()?.role === 'participant' && newRole === 'admin') {
      console.warn('Access Denied: Registered participants are restricted to participant sections.');
      return;
    }
    this.role.set(newRole);
  }

  login(credentials: LoginCredentials): Promise<{ success: boolean; message: string }> {
    const ident = credentials.emailOrPhone.trim().toLowerCase();

    // Check if admin login
    if (ident === 'admin@socialshuffle.com' || ident === '+91 98220 11223' || ident === 'admin') {
      const adminUser: AuthUser = {
        id: 'u-admin',
        name: 'Aman Joshi',
        email: 'admin@socialshuffle.com',
        phone: '+91 98220 11223',
        role: 'admin',
        area: 'Pune',
        bio: 'Social Shuffle Founder & Super Admin'
      };
      this.saveSession(adminUser);
      this.role.set('admin');
      this.closeAuthModal();
      return Promise.resolve({ success: true, message: 'Welcome back, Admin Aman Joshi!' });
    }

    // Attempt Spring Boot REST login or fallback to participant demo
    return new Promise((resolve) => {
      this.api.login(credentials).subscribe({
        next: (res: any) => {
          if (res && res.user) {
            this.saveSession(res.user);
            this.role.set(res.user.role);
            this.closeAuthModal();
            resolve({ success: true, message: `Welcome back, ${res.user.name}!` });
          } else {
            this.fallbackLogin(ident, resolve);
          }
        },
        error: () => this.fallbackLogin(ident, resolve)
      });
    });
  }

  private fallbackLogin(ident: string, resolve: (res: any) => void) {
    if (ident.includes('ananya') || ident.includes('97654')) {
      const ananyaUser: AuthUser = {
        id: 'u-ananya',
        name: 'Ananya Deshmukh',
        email: 'ananya.d@example.com',
        phone: '+91 97654 32100',
        role: 'participant',
        area: 'Baner',
        participantId: 'p-ananya',
        bio: 'Casual gamer & Azul fan. Love meeting new people in Pune!'
      };
      this.saveSession(ananyaUser);
      this.role.set('participant');
      this.closeAuthModal();
      resolve({ success: true, message: 'Welcome back, Ananya Deshmukh!' });
    } else {
      const genericUser: AuthUser = {
        id: 'u-rohan',
        name: 'Rohan Kulkarni',
        email: 'rohan.kulkarni@example.com',
        phone: '+91 98220 12345',
        role: 'participant',
        area: 'Koregaon Park',
        participantId: 'p-rahul',
        bio: 'Board game lover, strategy nerd, Catan enthusiast.'
      };
      this.saveSession(genericUser);
      this.role.set('participant');
      this.closeAuthModal();
      resolve({ success: true, message: 'Welcome back, Rohan!' });
    }
  }

  registerParticipant(data: RegisterCredentials): Promise<{ success: boolean; message: string }> {
    if (!data.name.trim() || !data.email.trim() || !data.phone.trim()) {
      return Promise.resolve({ success: false, message: 'Please fill out all required fields' });
    }

    const newUserId = 'u-' + Math.random().toString(36).substring(2, 9);
    const newParticipantId = 'p-' + Math.random().toString(36).substring(2, 9);

    const newUser: AuthUser = {
      id: newUserId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      role: 'participant', // STRICT PARTICIPANT ROLE
      area: data.area || 'Koregaon Park',
      participantId: newParticipantId,
      bio: data.bio || 'Board game lover eager to play in Pune!',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`
    };

    // Send to Spring Boot 4 REST API
    this.api.register(data).subscribe();

    this.saveSession(newUser);
    this.role.set('participant'); // strictly participant view!
    this.closeAuthModal();

    return Promise.resolve({ success: true, message: `Welcome to Social Shuffle Pune, ${data.name}!` });
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.role.set('participant');
  }

  private saveSession(user: AuthUser) {
    this.currentUser.set(user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {}
  }
}
