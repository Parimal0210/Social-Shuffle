import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { ShuffleEvent } from '../../models/types';

@Component({
  selector: 'app-participant-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 max-w-6xl mx-auto">
      <!-- Title & Filters -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-white">Upcoming Meetups in Pune</h2>
          <p class="text-xs text-slate-400">Join a table, learn new games, and meet fellow Pune gamers</p>
        </div>

        <!-- Filter pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            (click)="selectedArea.set('all')"
            [class]="selectedArea() === 'all' ? 'bg-[#FF6036] text-white' : 'bg-[#111C3B] text-slate-300 border border-[#1F305E]'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
          >
            All Pune
          </button>
          <button
            (click)="selectedArea.set('Koregaon Park')"
            [class]="selectedArea() === 'Koregaon Park' ? 'bg-[#FF6036] text-white' : 'bg-[#111C3B] text-slate-300 border border-[#1F305E]'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
          >
            Koregaon Park
          </button>
          <button
            (click)="selectedArea.set('Baner')"
            [class]="selectedArea() === 'Baner' ? 'bg-[#FF6036] text-white' : 'bg-[#111C3B] text-slate-300 border border-[#1F305E]'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
          >
            Baner
          </button>
          <button
            (click)="selectedArea.set('Viman Nagar')"
            [class]="selectedArea() === 'Viman Nagar' ? 'bg-[#FF6036] text-white' : 'bg-[#111C3B] text-slate-300 border border-[#1F305E]'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
          >
            Viman Nagar
          </button>
        </div>
      </div>

      <!-- Events List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (evt of filteredEvents(); track evt.id) {
          <div class="rounded-2xl bg-[#0D1527] border border-[#1F305E] overflow-hidden flex flex-col shadow-xl hover:border-[#FF6036]/50 transition-all">
            <!-- Cover image -->
            <div class="relative h-44 w-full bg-[#111C3B]">
              <img [src]="evt.coverImage" [alt]="evt.title" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0D1527] via-transparent to-transparent"></div>
              <div class="absolute top-3 left-3 bg-[#0A1128]/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-white border border-[#1F305E]">
                Meetup #{{ evt.meetupNumber }}
              </div>
              <div class="absolute top-3 right-3 bg-[#35C8A8]/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#35C8A8] border border-[#35C8A8]/40">
                ₹{{ evt.pricePerPerson }} / person
              </div>
            </div>

            <!-- Body -->
            <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div class="space-y-2">
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#FF6036]">{{ evt.venueArea }}</span>
                <h3 class="text-base font-bold text-white line-clamp-1">{{ evt.title }}</h3>
                <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">{{ evt.description }}</p>

                <div class="pt-2 space-y-1 text-xs text-slate-300">
                  <div class="flex items-center gap-2">
                    <span>📅</span>
                    <span>{{ evt.date }} • {{ evt.startTime }} - {{ evt.endTime }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span>📍</span>
                    <span class="truncate">{{ evt.venueName }}</span>
                  </div>
                </div>
              </div>

              <!-- Action -->
              <div class="pt-3 border-t border-[#1F305E] flex items-center justify-between gap-3">
                <div class="text-[11px] text-slate-400">
                  Host: <span class="text-white font-medium">{{ evt.hostName }}</span>
                </div>
                <button
                  (click)="openRsvp(evt)"
                  class="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF6036] to-[#FF8566] text-white hover:opacity-95 shadow-md shadow-[#FF6036]/20 transition-all"
                >
                  Book Seat →
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Quick RSVP Dialog -->
      @if (activeRsvpEvent()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div class="w-full max-w-md bg-[#0D1527] border border-[#1F305E] rounded-2xl shadow-2xl p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white">Book Seat at Pune Meetup</h3>
              <button (click)="activeRsvpEvent.set(null)" class="text-slate-400 hover:text-white">✕</button>
            </div>

            <div class="p-3 rounded-xl bg-[#111C3B] border border-[#1F305E] text-xs space-y-1">
              <div class="font-bold text-white">{{ activeRsvpEvent()?.title }}</div>
              <div class="text-slate-400">{{ activeRsvpEvent()?.date }} • {{ activeRsvpEvent()?.venueName }}</div>
              <div class="text-[#35C8A8] font-semibold">₹{{ activeRsvpEvent()?.pricePerPerson }} per seat (Pay at Venue or UPI)</div>
            </div>

            @if (rsvpSuccess()) {
              <div class="p-4 rounded-xl bg-[#35C8A8]/10 border border-[#35C8A8]/30 text-center space-y-2">
                <div class="text-2xl">🎉</div>
                <div class="text-sm font-bold text-[#35C8A8]">Seat Reserved Successfully!</div>
                <p class="text-xs text-slate-300">See you at {{ activeRsvpEvent()?.venueName }} on {{ activeRsvpEvent()?.date }}. Your spot is confirmed!</p>
                <button
                  (click)="activeRsvpEvent.set(null); rsvpSuccess.set(false)"
                  class="w-full py-2 bg-[#111C3B] border border-[#1F305E] text-xs font-semibold rounded-lg text-slate-200 mt-2"
                >
                  Done
                </button>
              </div>
            } @else {
              <div class="space-y-3">
                <div class="p-3 rounded-xl bg-[#111C3B] border border-[#1F305E] flex items-center justify-between">
                  <div>
                    <label class="block text-xs font-bold text-white">Total Number of Participants</label>
                    <span class="text-[10px] text-slate-400">Default & minimum: 1 (Includes you as Participant #1)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="setTotalParticipants(totalParticipants() - 1)"
                      [disabled]="totalParticipants() <= 1"
                      class="w-7 h-7 rounded-lg bg-[#0D1527] border border-[#1F305E] text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm"
                    >
                      -
                    </button>
                    <span class="w-8 text-center text-sm font-bold text-white">
                      {{ totalParticipants() }}
                    </span>
                    <button
                      type="button"
                      (click)="setTotalParticipants(totalParticipants() + 1)"
                      class="w-7 h-7 rounded-lg bg-[#FF6036] text-white flex items-center justify-center font-bold text-sm shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                @if (validationError()) {
                  <div class="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                    {{ validationError() }}
                  </div>
                }

                <!-- Participant #1 (You) -->
                <div class="p-2.5 rounded-xl bg-[#0D1527] border border-[#1F305E] text-xs text-slate-300">
                  <div class="flex justify-between items-center text-white font-semibold">
                    <span>Participant #1 (You): {{ auth.currentUser()?.name }}</span>
                    <span class="text-emerald-400 text-[11px]">✓ Confirmed</span>
                  </div>
                </div>

                @if (totalParticipants() > 1) {
                  <div class="space-y-2 pt-1 border-t border-[#1F305E]">
                    <div class="text-xs font-semibold text-slate-200">
                      Names for Additional Participants ({{ totalParticipants() - 1 }}):
                    </div>
                    @for (p of additionalList(); track $index) {
                      <div class="space-y-1">
                        <label class="block text-[11px] text-slate-400">Participant #{{ $index + 2 }} Full Name *</label>
                        <input
                          type="text"
                          [value]="p.name"
                          (input)="updateAdditionalName($index, $any($event.target).value)"
                          placeholder="Enter additional participant's full name"
                          class="w-full bg-[#111C3B] border border-[#1F305E] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF6036] focus:outline-none"
                        />
                      </div>
                    }
                  </div>
                }

                <div class="text-xs text-slate-400 flex items-center justify-between pt-1">
                  <span>Seats: <strong class="text-white">{{ totalParticipants() }} PAX</strong></span>
                  <span class="text-slate-300 font-medium">₹{{ (activeRsvpEvent()?.pricePerPerson || 0) * totalParticipants() }} Total</span>
                </div>

                <button
                  (click)="confirmRsvp()"
                  class="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#FF6036] to-[#FF8566] text-white hover:opacity-95 shadow-lg shadow-[#FF6036]/20 transition-all"
                >
                  Confirm Reservation (₹{{ (activeRsvpEvent()?.pricePerPerson || 0) * totalParticipants() }})
                </button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class ParticipantEventsComponent {
  eventService = inject(EventService);
  auth = inject(AuthService);

  selectedArea = signal<string>('all');
  activeRsvpEvent = signal<ShuffleEvent | null>(null);
  totalParticipants = signal<number>(1);
  additionalList = signal<{ name: string; phone?: string }[]>([]);
  validationError = signal<string | null>(null);
  rsvpSuccess = signal<boolean>(false);

  filteredEvents(): ShuffleEvent[] {
    const area = this.selectedArea();
    if (area === 'all') return this.eventService.events();
    return this.eventService.events().filter((e: ShuffleEvent) => e.venueArea === area);
  }

  openRsvp(evt: ShuffleEvent) {
    if (!this.auth.isAuthenticated()) {
      this.auth.openAuthModal('register');
      return;
    }
    this.activeRsvpEvent.set(evt);
    this.setTotalParticipants(1);
    this.validationError.set(null);
    this.rsvpSuccess.set(false);
  }

  setTotalParticipants(count: number) {
    // Default and minimum value is 1
    const validCount = Math.max(1, count || 1);
    this.totalParticipants.set(validCount);
    this.validationError.set(null);
    const needed = validCount - 1;
    const current = this.additionalList();
    if (needed > current.length) {
      const added = [];
      for (let i = current.length; i < needed; i++) {
        added.push({ name: '', phone: '' });
      }
      this.additionalList.set([...current, ...added]);
    } else {
      this.additionalList.set(current.slice(0, needed));
    }
  }

  updateAdditionalName(index: number, name: string) {
    this.validationError.set(null);
    const updated = [...this.additionalList()];
    if (updated[index]) {
      updated[index] = { ...updated[index], name };
      this.additionalList.set(updated);
    }
  }

  confirmRsvp() {
    const evt = this.activeRsvpEvent();
    const user = this.auth.currentUser();
    if (!evt || !user) return;

    const total = this.totalParticipants();
    const needed = total - 1;
    const additional = this.additionalList().slice(0, needed);

    if (total > 1) {
      for (let i = 0; i < needed; i++) {
        if (!additional[i]?.name?.trim()) {
          this.validationError.set(`Please enter the full name for Participant #${i + 2}`);
          return;
        }
      }
    }

    this.eventService.rsvpForEvent(
      evt.id,
      {
        id: user.participantId || user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      total,
      additional
    );

    this.rsvpSuccess.set(true);
  }
}
