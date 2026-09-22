import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (auth.showAuthModal()) {
      <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
        <div class="w-full sm:max-w-md bg-[#0D1527] border border-[#1F305E] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          <!-- Header -->
          <div class="relative p-5 pb-4 bg-gradient-to-b from-[#111C3B] to-[#0D1527] border-b border-[#1F305E]">
            <button
              (click)="auth.closeAuthModal()"
              class="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              ✕
            </button>
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-[#FF6036] flex items-center justify-center font-black text-white text-sm">
                SS
              </div>
              <div>
                <h2 class="text-base font-bold text-white">
                  {{ activeTab() === 'login' ? 'Sign In to Social Shuffle' : 'Join Pune Board Game Community' }}
                </h2>
                <p class="text-xs text-slate-400">
                  {{ activeTab() === 'login' ? 'Access your meetups, RSVPs, and games' : 'Register free as a participant in seconds' }}
                </p>
              </div>
            </div>

            <!-- Tab Switcher -->
            <div class="flex bg-[#0A1128] p-1 rounded-xl mt-4 border border-[#1F305E]">
              <button
                type="button"
                (click)="activeTab.set('login')"
                [class]="activeTab() === 'login' ? 'bg-gradient-to-r from-[#FF6036] to-[#FF8566] text-white shadow-sm' : 'text-slate-400'"
                class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all"
              >
                Sign In
              </button>
              <button
                type="button"
                (click)="activeTab.set('register')"
                [class]="activeTab() === 'register' ? 'bg-gradient-to-r from-[#35C8A8] to-[#20B2AA] text-[#0A1128] font-bold shadow-sm' : 'text-slate-400'"
                class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all"
              >
                Register Participant
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-5 overflow-y-auto space-y-4">
            @if (errorMessage()) {
              <div class="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                {{ errorMessage() }}
              </div>
            }

            @if (activeTab() === 'login') {
              <form (ngSubmit)="handleLogin()" class="space-y-4">
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Email or Mobile Number</label>
                  <input
                    type="text"
                    required
                    [(ngModel)]="loginIdentifier"
                    name="loginIdentifier"
                    placeholder="e.g. rohan.kulkarni@example.com or 9822012345"
                    class="w-full bg-[#111C3B] border border-[#1F305E] focus:border-[#FF6036] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    [(ngModel)]="loginPassword"
                    name="loginPassword"
                    placeholder="Enter password"
                    class="w-full bg-[#111C3B] border border-[#1F305E] focus:border-[#FF6036] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  [disabled]="loading()"
                  class="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#FF6036] to-[#FF8566] text-white hover:opacity-95 shadow-lg shadow-[#FF6036]/20 disabled:opacity-50"
                >
                  {{ loading() ? 'Signing in...' : 'Sign In as Participant' }}
                </button>

                <!-- 1-Tap Demo Access -->
                <div class="pt-3 border-t border-[#1F305E]">
                  <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">1-Tap Demo Access:</p>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      (click)="quickLogin('rohan.kulkarni@example.com')"
                      class="p-2 text-left rounded-lg bg-[#111C3B] border border-[#1F305E] hover:border-[#35C8A8]/60 text-xs"
                    >
                      <div class="font-semibold text-white flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-[#35C8A8]"></span>
                        Rohan K.
                      </div>
                      <div class="text-[10px] text-slate-400">Participant (KP)</div>
                    </button>

                    <button
                      type="button"
                      (click)="quickLogin('ananya.d@example.com')"
                      class="p-2 text-left rounded-lg bg-[#111C3B] border border-[#1F305E] hover:border-[#35C8A8]/60 text-xs"
                    >
                      <div class="font-semibold text-white flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-[#FFC226]"></span>
                        Ananya D.
                      </div>
                      <div class="text-[10px] text-slate-400">Participant (Baner)</div>
                    </button>
                  </div>

                  <button
                    type="button"
                    (click)="quickLogin('admin@socialshuffle.com')"
                    class="w-full mt-2 p-2 text-left rounded-lg bg-[#111C3B]/60 border border-[#1F305E] hover:border-[#FF6036]/60 text-xs flex items-center justify-between"
                  >
                    <div class="font-semibold text-slate-200">Aman Joshi (Host)</div>
                    <span class="text-[10px] bg-[#FF6036]/20 text-[#FF8566] px-1.5 py-0.5 rounded font-mono">Super Admin</span>
                  </button>
                </div>
              </form>
            } @else {
              <form (ngSubmit)="handleRegister()" class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    [(ngModel)]="regName"
                    name="regName"
                    placeholder="e.g. Pooja Deshpande"
                    class="w-full bg-[#111C3B] border border-[#1F305E] focus:border-[#35C8A8] rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-slate-300 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      [(ngModel)]="regEmail"
                      name="regEmail"
                      placeholder="pooja@example.com"
                      class="w-full bg-[#111C3B] border border-[#1F305E] focus:border-[#35C8A8] rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-300 mb-1">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      [(ngModel)]="regPhone"
                      name="regPhone"
                      placeholder="+91 98220 54321"
                      class="w-full bg-[#111C3B] border border-[#1F305E] focus:border-[#35C8A8] rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-slate-300 mb-1">Pune Locality</label>
                    <select
                      [(ngModel)]="regArea"
                      name="regArea"
                      class="w-full bg-[#111C3B] border border-[#1F305E] focus:border-[#35C8A8] rounded-xl px-3.5 py-2 text-sm text-white outline-none"
                    >
                      @for (area of puneAreas; track area) {
                        <option [value]="area" class="bg-[#0D1527] text-white">{{ area }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      [(ngModel)]="regPassword"
                      name="regPassword"
                      placeholder="Create password"
                      class="w-full bg-[#111C3B] border border-[#1F305E] focus:border-[#35C8A8] rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Favorite Games / Bio</label>
                  <input
                    type="text"
                    [(ngModel)]="regBio"
                    name="regBio"
                    placeholder="e.g. Love Catan, Codenames, and party games!"
                    class="w-full bg-[#111C3B] border border-[#1F305E] focus:border-[#35C8A8] rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  [disabled]="loading()"
                  class="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#35C8A8] to-[#20B2AA] text-[#0A1128] hover:opacity-95 shadow-lg shadow-[#35C8A8]/20 disabled:opacity-50 mt-2"
                >
                  {{ loading() ? 'Registering...' : 'Complete Registration & Join' }}
                </button>
              </form>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class AuthModalComponent {
  auth = inject(AuthService);

  activeTab = signal<'login' | 'register'>('login');
  errorMessage = signal<string | null>(null);
  loading = signal<boolean>(false);

  loginIdentifier = '';
  loginPassword = '';

  regName = '';
  regEmail = '';
  regPhone = '';
  regPassword = '';
  regArea = 'Koregaon Park';
  regBio = '';

  puneAreas = [
    'Koregaon Park',
    'Baner',
    'Viman Nagar',
    'Kothrud',
    'FC Road / Deccan',
    'Aundh',
    'Wakad / Hinjewadi',
    'Kalyani Nagar',
    'Magarpatta / Hadapsar'
  ];

  async handleLogin() {
    this.loading.set(true);
    this.errorMessage.set(null);
    const res = await this.auth.login({
      emailOrPhone: this.loginIdentifier,
      password: this.loginPassword
    });
    this.loading.set(false);
    if (!res.success) this.errorMessage.set(res.message);
  }

  async quickLogin(ident: string) {
    this.loading.set(true);
    this.errorMessage.set(null);
    await this.auth.login({ emailOrPhone: ident });
    this.loading.set(false);
  }

  async handleRegister() {
    this.loading.set(true);
    this.errorMessage.set(null);
    const res = await this.auth.registerParticipant({
      name: this.regName,
      email: this.regEmail,
      phone: this.regPhone,
      password: this.regPassword,
      area: this.regArea,
      bio: this.regBio
    });
    this.loading.set(false);
    if (!res.success) this.errorMessage.set(res.message);
  }
}
