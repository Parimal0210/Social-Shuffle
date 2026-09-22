import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-participant-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 max-w-4xl mx-auto">
      <!-- Profile Header Card -->
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#111C3B] to-[#0D1527] border border-[#1F305E] shadow-2xl relative overflow-hidden">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div class="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#FF6036] via-[#FF8566] to-[#8F43EE] p-1 shadow-xl">
            <div class="w-full h-full bg-[#0A1128] rounded-[14px] overflow-hidden flex items-center justify-center">
              @if (auth.currentUser()?.avatar) {
                <img [src]="auth.currentUser()?.avatar" alt="Avatar" class="w-full h-full object-cover" />
              } @else {
                <span class="text-3xl font-black text-[#FF6036]">{{ auth.currentUser()?.name?.[0] }}</span>
              }
            </div>
          </div>

          <div class="flex-1 text-center sm:text-left space-y-2">
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 class="text-2xl font-black text-white">{{ auth.currentUser()?.name || 'Pune Shuffler' }}</h2>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#35C8A8]/20 text-[#35C8A8] border border-[#35C8A8]/40">
                Verified Shuffler
              </span>
            </div>

            <p class="text-xs text-slate-400">
              📍 {{ auth.currentUser()?.area || 'Pune' }} • 📧 {{ auth.currentUser()?.email }} • 📱 {{ auth.currentUser()?.phone }}
            </p>

            <p class="text-xs sm:text-sm text-slate-300 italic pt-1">
              "{{ auth.currentUser()?.bio || 'Board game lover, strategy nerd, Catan enthusiast!' }}"
            </p>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#1F305E]/80 text-center">
          <div class="p-3 rounded-xl bg-[#0A1128] border border-[#1F305E]">
            <div class="text-xl sm:text-2xl font-black text-white">4</div>
            <div class="text-[10px] sm:text-xs text-slate-400 uppercase font-semibold">Meetups Attended</div>
          </div>
          <div class="p-3 rounded-xl bg-[#0A1128] border border-[#1F305E]">
            <div class="text-xl sm:text-2xl font-black text-[#FF6036]">12</div>
            <div class="text-[10px] sm:text-xs text-slate-400 uppercase font-semibold">Games Mastered</div>
          </div>
          <div class="p-3 rounded-xl bg-[#0A1128] border border-[#1F305E]">
            <div class="text-xl sm:text-2xl font-black text-[#35C8A8]">2</div>
            <div class="text-[10px] sm:text-xs text-slate-400 uppercase font-semibold">Venues Visited</div>
          </div>
        </div>
      </div>

      <!-- Earned Badges -->
      <div class="p-6 rounded-2xl bg-[#0D1527] border border-[#1F305E] space-y-4">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Pune Community Badges</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 rounded-xl bg-[#111C3B] border border-[#1F305E] flex items-center gap-3">
            <span class="text-2xl">🌱</span>
            <div>
              <div class="text-xs font-bold text-white">First Roll</div>
              <div class="text-[10px] text-slate-400">Attended first meetup</div>
            </div>
          </div>
          <div class="p-3 rounded-xl bg-[#111C3B] border border-[#1F305E] flex items-center gap-3">
            <span class="text-2xl">🌾</span>
            <div>
              <div class="text-xs font-bold text-white">Sheep for Wood</div>
              <div class="text-[10px] text-slate-400">Played Catan 3x</div>
            </div>
          </div>
          <div class="p-3 rounded-xl bg-[#111C3B] border border-[#1F305E] flex items-center gap-3">
            <span class="text-2xl">🤝</span>
            <div>
              <div class="text-xs font-bold text-white">Table Diplomat</div>
              <div class="text-[10px] text-slate-400">Brought 3+ friends</div>
            </div>
          </div>
          <div class="p-3 rounded-xl bg-[#111C3B] border border-[#1F305E] flex items-center gap-3">
            <span class="text-2xl">☕</span>
            <div>
              <div class="text-xs font-bold text-white">Chai & Dice</div>
              <div class="text-[10px] text-slate-400">Visited Pagdandi Baner</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Settings / Switch -->
      <div class="p-6 rounded-2xl bg-[#0D1527] border border-[#1F305E] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 class="text-sm font-bold text-white">Account & Session</h4>
          <p class="text-xs text-slate-400">Manage your participant profile or switch users</p>
        </div>

        <div class="flex items-center gap-3">
          <button
            (click)="auth.openAuthModal('register')"
            class="px-4 py-2 bg-[#111C3B] hover:bg-[#162349] border border-[#1F305E] text-xs font-bold text-slate-200 rounded-xl"
          >
            Register Another Profile
          </button>
          <button
            (click)="auth.logout()"
            class="px-4 py-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-xs font-bold text-red-400 rounded-xl"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  `
})
export class ParticipantProfileComponent {
  auth = inject(AuthService);
  eventService = inject(EventService);
}
