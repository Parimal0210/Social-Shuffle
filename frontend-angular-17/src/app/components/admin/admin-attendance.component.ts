import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { Registration } from '../../models/types';

@Component({
  selector: 'app-admin-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-white">iPad 1-Tap Attendance Check-In</h2>
          <p class="text-xs text-slate-400">Door check-in for Koregaon Park Weekend Meetup #42</p>
        </div>

        <div class="flex items-center gap-2">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search name or mobile..."
            class="bg-[#111C3B] border border-[#1F305E] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none w-56"
          />
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-3 gap-3">
        <div class="p-4 rounded-xl bg-[#0D1527] border border-[#1F305E]">
          <div class="text-xs text-slate-400">Total Booked PAX</div>
          <div class="text-2xl font-bold text-white">{{ totalPax() }}</div>
        </div>
        <div class="p-4 rounded-xl bg-[#0D1527] border border-[#1F305E]">
          <div class="text-xs text-slate-400">Checked-In So Far</div>
          <div class="text-2xl font-bold text-[#35C8A8]">{{ checkedInCount() }}</div>
        </div>
        <div class="p-4 rounded-xl bg-[#0D1527] border border-[#1F305E]">
          <div class="text-xs text-slate-400">Remaining to Arrive</div>
          <div class="text-2xl font-bold text-[#FFC226]">{{ remainingCount() }}</div>
        </div>
      </div>

      <!-- Attendees Card List -->
      <div class="space-y-3">
        @for (reg of filteredAttendees(); track reg.id) {
          <div class="p-4 rounded-2xl bg-[#0D1527] border border-[#1F305E] flex items-center justify-between gap-4 hover:border-[#35C8A8]/40 transition-colors">
            <div class="flex items-center gap-3">
              <div [class]="reg.attendanceStatus === 'Checked-In' ? 'bg-[#35C8A8]' : 'bg-[#FF6036]'" class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[#0A1128] text-sm">
                {{ reg.participantName[0] }}
              </div>
              <div>
                <h4 class="text-sm font-bold text-white flex items-center gap-2">
                  <span>{{ reg.participantName }}</span>
                  <span class="text-xs font-normal text-slate-400">({{ reg.paxCount }} Seats)</span>
                </h4>
                <div class="text-xs text-slate-400">
                  📱 {{ reg.participantPhone }} • {{ reg.paymentStatus }}
                  @if (reg.checkInTimestamp) {
                    • <span class="text-[#35C8A8] font-semibold">Checked in at {{ reg.checkInTimestamp }}</span>
                  }
                </div>
              </div>
            </div>

            <button
              (click)="eventService.toggleCheckIn(reg.id)"
              [class]="reg.attendanceStatus === 'Checked-In' ? 'bg-[#35C8A8]/20 border border-[#35C8A8]/40 text-[#35C8A8]' : 'bg-[#35C8A8] text-[#0A1128] font-bold shadow-lg shadow-[#35C8A8]/20'"
              class="px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
              {{ reg.attendanceStatus === 'Checked-In' ? '✓ Checked In' : 'Tap to Check In' }}
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class AdminAttendanceComponent {
  eventService = inject(EventService);
  searchQuery = '';

  filteredAttendees(): Registration[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.eventService.registrations().filter((r: Registration) =>
      !q || r.participantName.toLowerCase().includes(q) || r.participantPhone.includes(q)
    );
  }

  totalPax(): number {
    return this.eventService.registrations().reduce((acc: number, r: Registration) => acc + r.paxCount, 0);
  }

  checkedInCount(): number {
    return this.eventService.registrations()
      .filter((r: Registration) => r.attendanceStatus === 'Checked-In')
      .reduce((acc: number, r: Registration) => acc + r.paxCount, 0);
  }

  remainingCount(): number {
    return this.totalPax() - this.checkedInCount();
  }
}
