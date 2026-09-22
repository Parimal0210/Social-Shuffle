import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ParticipantTab = 'home' | 'events' | 'games' | 'profile';

@Component({
  selector: 'app-participant-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Desktop / Tablet Top Pills Navigation -->
    <nav class="hidden md:block bg-[#0A1128]/80 backdrop-blur-md border-b border-[#1F305E] px-4 py-2 sticky top-[57px] z-30">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-1.5 p-1 rounded-xl bg-[#0D1527] border border-[#1F305E]">
          <button
            (click)="selectTab('home')"
            [class]="activeTab === 'home' ? 'bg-gradient-to-r from-[#FF6036] to-[#FF8566] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
            class="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2"
          >
            <span>🏠 Home</span>
          </button>
          <button
            (click)="selectTab('events')"
            [class]="activeTab === 'events' ? 'bg-gradient-to-r from-[#FF6036] to-[#FF8566] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
            class="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2"
          >
            <span>📅 Pune Meetups</span>
          </button>
          <button
            (click)="selectTab('games')"
            [class]="activeTab === 'games' ? 'bg-gradient-to-r from-[#FF6036] to-[#FF8566] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
            class="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2"
          >
            <span>🎲 Board Games</span>
          </button>
          <button
            (click)="selectTab('profile')"
            [class]="activeTab === 'profile' ? 'bg-gradient-to-r from-[#FF6036] to-[#FF8566] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
            class="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2"
          >
            <span>👤 My Shuffler Pass</span>
          </button>
        </div>

        <div class="text-[11px] text-slate-400 font-medium">
          Pune City • 350+ Shufflers
        </div>
      </div>
    </nav>

    <!-- Mobile App Bottom Navigation Bar -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D1527]/95 backdrop-blur-lg border-t border-[#1F305E] px-2 py-1.5 shadow-2xl safe-area-bottom">
      <div class="grid grid-cols-4 gap-1">
        <button
          (click)="selectTab('home')"
          [class]="activeTab === 'home' ? 'text-[#FF6036]' : 'text-slate-400'"
          class="flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-bold"
        >
          <span class="text-base mb-0.5">🏠</span>
          <span>Home</span>
        </button>
        <button
          (click)="selectTab('events')"
          [class]="activeTab === 'events' ? 'text-[#FF6036]' : 'text-slate-400'"
          class="flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-bold"
        >
          <span class="text-base mb-0.5">📅</span>
          <span>Meetups</span>
        </button>
        <button
          (click)="selectTab('games')"
          [class]="activeTab === 'games' ? 'text-[#FF6036]' : 'text-slate-400'"
          class="flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-bold"
        >
          <span class="text-base mb-0.5">🎲</span>
          <span>Games</span>
        </button>
        <button
          (click)="selectTab('profile')"
          [class]="activeTab === 'profile' ? 'text-[#FF6036]' : 'text-slate-400'"
          class="flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-bold"
        >
          <span class="text-base mb-0.5">👤</span>
          <span>Profile</span>
        </button>
      </div>
    </nav>
  `
})
export class ParticipantNavComponent {
  @Input() activeTab: ParticipantTab = 'home';
  @Output() tabChange = new EventEmitter<ParticipantTab>();

  selectTab(tab: ParticipantTab) {
    this.tabChange.emit(tab);
  }
}
