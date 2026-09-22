import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="sticky top-0 z-40 bg-[#0A1128]/95 backdrop-blur-md border-b border-[#1F305E] px-3.5 sm:px-6 py-2.5">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <!-- Brand Logo & Pune Badge -->
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6036] via-[#FF8566] to-[#FFC226] p-0.5 shadow-lg shadow-[#FF6036]/20">
            <div class="w-full h-full bg-[#0A1128] rounded-[10px] flex items-center justify-center">
              <span class="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6036] to-[#FFC226]">SS</span>
            </div>
          </div>
          <div class="leading-none">
            <div class="flex items-center gap-1.5">
              <span class="font-extrabold text-base tracking-tight text-white">SOCIAL<span class="text-[#FF6036]">SHUFFLE</span></span>
              <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-[#FF6036]/15 text-[#FF8566] border border-[#FF6036]/30">Pune</span>
            </div>
            <p class="text-[10px] text-slate-400 font-medium tracking-wide">Board Game Community Platform</p>
          </div>
        </div>

        <!-- Right Side: Role Toggle (Admin only) & Account Actions -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- STRICT RBAC: Only Admin sees Role Switcher -->
          @if (auth.isAdminUser()) {
            <div class="flex items-center p-1 rounded-xl bg-[#090F22] border border-[#1F305E]">
              <button
                (click)="auth.setRole('admin')"
                [class]="auth.role() === 'admin' ? 'bg-[#35C8A8] text-[#0A1128] font-bold shadow-md shadow-[#35C8A8]/30' : 'text-slate-400 hover:text-slate-200'"
                class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <span>Admin Console</span>
              </button>
              <button
                (click)="auth.setRole('participant')"
                [class]="auth.role() === 'participant' ? 'bg-[#FF6036] text-white shadow-md shadow-[#FF6036]/30' : 'text-slate-400 hover:text-slate-200'"
                class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <span>Participant Preview</span>
              </button>
            </div>
          }

          <!-- Auth States -->
          @if (auth.isAuthenticated()) {
            <div class="flex items-center gap-2 bg-[#111C3B] border border-[#1F305E] pl-2 pr-3 py-1 rounded-xl">
              <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF6036] to-[#8F43EE] flex items-center justify-center font-bold text-xs text-white uppercase overflow-hidden">
                @if (auth.currentUser()?.avatar) {
                  <img [src]="auth.currentUser()?.avatar" alt="Avatar" class="w-full h-full object-cover" />
                } @else {
                  {{ auth.currentUser()?.name?.[0] }}
                }
              </div>
              <div class="text-left hidden sm:block">
                <div class="text-xs font-bold text-white truncate max-w-[110px]">{{ auth.currentUser()?.name }}</div>
                <div class="text-[10px] text-slate-400 -mt-0.5">{{ auth.isAdminUser() ? 'Host Admin' : auth.currentUser()?.area }}</div>
              </div>
              <button
                (click)="auth.logout()"
                title="Sign out"
                class="ml-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors"
              >
                Exit
              </button>
            </div>
          } @else {
            <div class="flex items-center gap-2">
              <button
                (click)="auth.openAuthModal('login')"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#111C3B] border border-[#1F305E] text-slate-200 hover:border-[#FF6036]/50 transition-all"
              >
                Sign In
              </button>
              <button
                (click)="auth.openAuthModal('register')"
                class="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#FF6036] to-[#FF8566] text-white hover:opacity-95 shadow-md shadow-[#FF6036]/20 transition-all"
              >
                Join Pune Club
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  auth = inject(AuthService);
}
