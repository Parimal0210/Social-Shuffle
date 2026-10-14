import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AdminSection = 'dashboard' | 'attendance' | 'events' | 'games';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="w-full lg:w-64 bg-[#0D1527] border-b lg:border-b-0 lg:border-r border-[#1F305E] p-4 flex flex-row lg:flex-col justify-between shrink-0">
      <div class="space-y-4 w-full">
        <!-- Badge -->
        <div class="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#35C8A8]/15 border border-[#35C8A8]/30 text-[#35C8A8] text-xs font-bold">
          <span>🛡️ Host Admin Console</span>
        </div>

        <!-- Navigation Links -->
        <nav class="flex flex-row lg:flex-col gap-1 w-full overflow-x-auto">
          <button
            (click)="sectionChange.emit('dashboard')"
            [class]="activeSection === 'dashboard' ? 'bg-[#35C8A8] text-[#0A1128] font-bold shadow-md' : 'text-slate-300 hover:bg-[#111C3B]'"
            class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all flex-1 lg:flex-initial"
          >
            <span>📊</span>
            <span>Dashboard & Metrics</span>
          </button>

          <button
            (click)="sectionChange.emit('attendance')"
            [class]="activeSection === 'attendance' ? 'bg-[#35C8A8] text-[#0A1128] font-bold shadow-md' : 'text-slate-300 hover:bg-[#111C3B]'"
            class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all flex-1 lg:flex-initial"
          >
            <span>📱</span>
            <span>Live Attendance Check-in</span>
          </button>
        </nav>
      </div>

      <div class="hidden lg:block pt-4 border-t border-[#1F305E] text-[11px] text-slate-500">
        Social Shuffle Pune v2.4 <br />
        Angular 17 + Spring Boot 4
      </div>
    </aside>
  `
})
export class AdminSidebarComponent {
  @Input() activeSection: AdminSection = 'dashboard';
  @Output() sectionChange = new EventEmitter<AdminSection>();
}
