import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { Game } from '../../models/types';

@Component({
  selector: 'app-participant-games',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 class="text-2xl font-black text-white">Pune Board Game Library</h2>
        <p class="text-xs text-slate-400">Over 120+ games ready to play at our weekly meetups. Game masters teach every rule!</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        @for (game of eventService.games(); track game.id) {
          <div class="rounded-2xl bg-[#0D1527] border border-[#1F305E] overflow-hidden flex flex-col shadow-xl hover:border-[#35C8A8]/50 transition-all">
            <div class="relative h-40 bg-[#111C3B] overflow-hidden">
              <img [src]="game.imageUrl" [alt]="game.title" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0D1527] via-transparent to-transparent"></div>
              <div class="absolute top-2 right-2 bg-[#0A1128]/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-[#35C8A8] border border-[#35C8A8]/30">
                ★ {{ game.bggRating }} BGG
              </div>
            </div>

            <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#FF6036]">{{ game.category }}</span>
                <h3 class="text-sm font-bold text-white line-clamp-1">{{ game.title }}</h3>
                <p class="text-xs text-slate-400 line-clamp-2 mt-1">{{ game.description }}</p>
              </div>

              <div class="pt-2 border-t border-[#1F305E] flex items-center justify-between text-[11px] text-slate-300">
                <span>👥 {{ game.minPlayers }}-{{ game.maxPlayers }} Players</span>
                <span>⏱️ {{ game.playTimeMinutes }}m</span>
                <span class="px-1.5 py-0.5 rounded bg-[#111C3B] text-slate-400 font-mono text-[10px]">{{ game.complexity }}</span>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ParticipantGamesComponent {
  eventService = inject(EventService);
}
