import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';
import { ParticipantTab } from './participant-nav.component';

@Component({
  selector: 'app-participant-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 max-w-6xl mx-auto">
      <!-- Hero Banner -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111C3B] via-[#0D1527] to-[#0A1128] border border-[#1F305E] p-6 sm:p-10 shadow-2xl">
        <div class="absolute -right-12 -bottom-12 w-64 h-64 bg-[#FF6036]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute right-10 top-6 text-6xl sm:text-8xl opacity-15 select-none pointer-events-none">🎲</div>

        <div class="max-w-2xl relative z-10 space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6036]/15 border border-[#FF6036]/30 text-[#FF8566] text-xs font-bold">
            <span>✨ Welcome to Pune's #1 Board Game Social</span>
          </div>

          <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Play Modern Games. <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6036] via-[#FF8566] to-[#FFC226]">
              Make Real Friends in Pune.
            </span>
          </h1>

          <p class="text-sm sm:text-base text-slate-300 leading-relaxed">
            Weekly board game meetups across Koregaon Park, Baner, and Viman Nagar. No experience needed—our community hosts teach every single game rule at your table!
          </p>

          <div class="pt-2 flex flex-wrap items-center gap-3">
            <button
              (click)="navigate.emit('events')"
              class="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#FF6036] to-[#FF8566] text-white hover:opacity-95 shadow-xl shadow-[#FF6036]/25 transition-all"
            >
              Browse Upcoming Meetups →
            </button>
            <button
              (click)="navigate.emit('games')"
              class="px-5 py-3 rounded-xl font-semibold text-sm bg-[#111C3B] hover:bg-[#162349] border border-[#1F305E] text-slate-200 transition-all"
            >
              Explore 120+ Games Library
            </button>
          </div>
        </div>
      </div>

      <!-- Next Meetup Spotlight Card -->
      @if (nextEvent()) {
        <div class="p-6 rounded-2xl bg-[#0D1527] border border-[#1F305E] shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#35C8A8] animate-pulse"></span>
              <span class="text-xs font-bold uppercase tracking-wider text-[#35C8A8]">Next Pune Meetup</span>
            </div>
            <span class="text-xs font-mono bg-[#111C3B] px-2.5 py-1 rounded-md text-slate-300 border border-[#1F305E]">
              Meetup #{{ nextEvent()?.meetupNumber }}
            </span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div class="lg:col-span-2 space-y-3">
              <h3 class="text-xl sm:text-2xl font-bold text-white">{{ nextEvent()?.title }}</h3>
              <p class="text-xs sm:text-sm text-slate-300">{{ nextEvent()?.description }}</p>

              <div class="flex flex-wrap gap-4 pt-1 text-xs text-slate-400">
                <div class="flex items-center gap-1.5">
                  <span>📅</span>
                  <span class="text-slate-200 font-semibold">{{ nextEvent()?.date }} • {{ nextEvent()?.startTime }} - {{ nextEvent()?.endTime }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span>📍</span>
                  <span class="text-slate-200 font-semibold">{{ nextEvent()?.venueName }} ({{ nextEvent()?.venueArea }})</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span>🎟️</span>
                  <span class="text-[#35C8A8] font-bold">₹{{ nextEvent()?.pricePerPerson }} / seat</span>
                </div>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-[#111C3B] border border-[#1F305E] text-center space-y-3">
              <div class="text-xs text-slate-400">Limited Capacity</div>
              <div class="text-2xl font-black text-white">{{ nextEvent()?.capacity }} Seats Max</div>
              <button
                (click)="navigate.emit('events')"
                class="w-full py-2.5 rounded-lg text-xs font-bold bg-[#35C8A8] text-[#0A1128] hover:opacity-95 shadow-md shadow-[#35C8A8]/20 transition-all"
              >
                RSVP & View Details
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Why Join Social Shuffle Pune -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-5 rounded-2xl bg-[#0D1527] border border-[#1F305E] space-y-2">
          <div class="text-2xl">🤝</div>
          <h4 class="text-sm font-bold text-white">Zero Gatekeeping</h4>
          <p class="text-xs text-slate-400 leading-relaxed">
            Solo? First timer? 90% of our attendees come alone on their first meetup. You'll be warmly introduced to a table right at the door.
          </p>
        </div>

        <div class="p-5 rounded-2xl bg-[#0D1527] border border-[#1F305E] space-y-2">
          <div class="text-2xl">🎓</div>
          <h4 class="text-sm font-bold text-white">We Teach Every Rule</h4>
          <p class="text-xs text-slate-400 leading-relaxed">
            Never read a 20-page manual. Our dedicated Pune game masters explain mechanics clearly and guide your first couple turns.
          </p>
        </div>

        <div class="p-5 rounded-2xl bg-[#0D1527] border border-[#1F305E] space-y-2">
          <div class="text-2xl">🛡️</div>
          <h4 class="text-sm font-bold text-white">Safe & Welcoming</h4>
          <p class="text-xs text-slate-400 leading-relaxed">
            Strict code of conduct, inclusive tables, and verified hosts at every venue in Koregaon Park, Baner, and Viman Nagar.
          </p>
        </div>
      </div>
    </div>
  `
})
export class ParticipantHomeComponent {
  @Output() navigate = new EventEmitter<ParticipantTab>();

  auth = inject(AuthService);
  eventService = inject(EventService);

  nextEvent() {
    return this.eventService.events()[0];
  }
}
