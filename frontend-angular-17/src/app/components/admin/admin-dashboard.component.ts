import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-black text-white">Pune Community Organizer Dashboard</h2>
          <p class="text-xs text-slate-400">Real-time attendance, ticket revenue, and community growth</p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-[#35C8A8]/15 text-[#35C8A8] border border-[#35C8A8]/30">
          ● Live Session Active
        </span>
      </div>

      <!-- Metrics Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-5 rounded-2xl bg-[#0D1527] border border-[#1F305E] space-y-1">
          <div class="text-[11px] font-semibold text-slate-400 uppercase">Total Pune Shufflers</div>
          <div class="text-2xl font-black text-white">352</div>
          <div class="text-[10px] text-[#35C8A8]">+28 joined this month</div>
        </div>

        <div class="p-5 rounded-2xl bg-[#0D1527] border border-[#1F305E] space-y-1">
          <div class="text-[11px] font-semibold text-slate-400 uppercase">Active Pune RSVPs</div>
          <div class="text-2xl font-black text-[#FF6036]">{{ eventService.registrations().length }}</div>
          <div class="text-[10px] text-slate-400">Across 3 venues</div>
        </div>

        <div class="p-5 rounded-2xl bg-[#0D1527] border border-[#1F305E] space-y-1">
          <div class="text-[11px] font-semibold text-slate-400 uppercase">Board Games Catalog</div>
          <div class="text-2xl font-black text-[#FFC226]">{{ eventService.games().length }}</div>
          <div class="text-[10px] text-slate-400">In physical library</div>
        </div>

        <div class="p-5 rounded-2xl bg-[#0D1527] border border-[#1F305E] space-y-1">
          <div class="text-[11px] font-semibold text-slate-400 uppercase">Attendance Rate</div>
          <div class="text-2xl font-black text-[#35C8A8]">94.2%</div>
          <div class="text-[10px] text-slate-400">Lowest no-show rate</div>
        </div>
      </div>

      <!-- Recent Registrations Table -->
      <div class="rounded-2xl bg-[#0D1527] border border-[#1F305E] p-5 space-y-4">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Recent Meetup Registrations</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-[#111C3B] text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th class="p-3 rounded-l-lg">Participant</th>
                <th class="p-3">Event</th>
                <th class="p-3">PAX</th>
                <th class="p-3">Payment</th>
                <th class="p-3 rounded-r-lg">Attendance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1F305E]">
              @for (reg of eventService.registrations(); track reg.id) {
                <tr class="hover:bg-[#111C3B]/50 transition-colors">
                  <td class="p-3 font-semibold text-white">
                    {{ reg.participantName }}
                    <span class="block text-[10px] text-slate-400 font-normal">{{ reg.participantPhone }}</span>
                  </td>
                  <td class="p-3 text-slate-300">Koregaon Park #42</td>
                  <td class="p-3 font-bold">{{ reg.paxCount }} Seats</td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#35C8A8]/15 text-[#35C8A8]">
                      {{ reg.paymentStatus }}
                    </span>
                  </td>
                  <td class="p-3">
                    <span [class]="reg.attendanceStatus === 'Checked-In' ? 'bg-[#35C8A8]/20 text-[#35C8A8]' : 'bg-[#FFC226]/15 text-[#FFC226]'" class="px-2 py-0.5 rounded text-[10px] font-bold">
                      {{ reg.attendanceStatus }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  eventService = inject(EventService);
}
